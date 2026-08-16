#!/usr/bin/env node
/**
 * a11y-check.mjs — runs axe-core against every page of the built site,
 * served locally by `astro preview`, using the pre-installed Playwright
 * Chromium at PLAYWRIGHT_BROWSERS_PATH (no `playwright install`, per repo
 * environment constraints — we launch with an explicit executablePath so an
 * exact revision match with the installed `playwright-core` isn't required).
 *
 * Usage: node scripts/a11y-check.mjs
 * Requires: `npm run build` already run (dist/ must exist).
 */
import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import { spawn, execSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const REPO = join(new URL(".", import.meta.url).pathname, "..");
// This container can run other sessions concurrently, each potentially
// binding astro's default preview port range — pick a wide, unlikely,
// pid-derived starting port and trust whatever port astro actually reports
// (parsed from its own stdout) rather than assuming our request was honored.
const REQUESTED_PORT = 5300 + (process.pid % 400);
const CHROME_PATH =
  process.env.CHROME_EXECUTABLE_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const PAGES = [
  "/",
  "/start",
  "/early-childhood-ai-toolkit",
  "/testimonials",
  "/privacy",
  "/terms",
  "/accessibility",
];

async function waitForServerReady(server, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => {
      reject(new Error(`Preview server did not report a ready URL within ${timeoutMs}ms.\nOutput so far:\n${buf}`));
    }, timeoutMs);

    const onData = (d) => {
      buf += d.toString();
      const m = buf.match(/https?:\/\/127\.0\.0\.1:(\d+)/);
      if (m) {
        clearTimeout(timer);
        server.stdout.off("data", onData);
        server.stderr.off("data", onData);
        resolve({ port: Number(m[1]), output: buf });
      }
    };
    server.stdout.on("data", onData);
    server.stderr.on("data", onData);
  });
}

async function waitForHttpOk(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      // not up yet
    }
    await sleep(200);
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

async function main() {
  if (!existsSync(join(REPO, "dist"))) {
    console.error("a11y-check: dist/ not found — run `npm run build` first.");
    process.exit(1);
  }
  if (!existsSync(CHROME_PATH)) {
    console.error(`a11y-check: chromium executable not found at ${CHROME_PATH}.`);
    console.error("Set CHROME_EXECUTABLE_PATH to override.");
    process.exit(1);
  }

  console.log(`Starting astro preview (requesting port ${REQUESTED_PORT})...`);
  const server = spawn(
    process.execPath,
    [join(REPO, "node_modules", "astro", "bin", "astro.mjs"), "preview", "--port", String(REQUESTED_PORT), "--host", "127.0.0.1"],
    { cwd: REPO, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, PUBLIC_PREVIEW: process.env.PUBLIC_PREVIEW ?? "true" } },
  );

  let serverOutput = "";
  server.stdout.on("data", (d) => (serverOutput += d.toString()));
  server.stderr.on("data", (d) => (serverOutput += d.toString()));

  let browser;
  let exitCode = 0;
  let base = null;
  try {
    const { port } = await waitForServerReady(server);
    base = `http://127.0.0.1:${port}`;
    await waitForHttpOk(`${base}/`);
    console.log(`Preview server ready at ${base}`);

    browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const allResults = [];
    for (const path of PAGES) {
      await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page }).analyze();
      allResults.push({ path, violations: results.violations });
    }

    console.log("\naxe-core accessibility results");
    console.log("-".repeat(64));
    let totalViolations = 0;
    for (const { path, violations } of allResults) {
      totalViolations += violations.length;
      console.log(`\n${path}: ${violations.length} violation(s)`);
      for (const v of violations) {
        console.log(`  [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length} node(s))`);
        console.log(`    ${v.helpUrl}`);
      }
    }
    console.log("\n" + "-".repeat(64));
    console.log(`Total violations across ${PAGES.length} pages: ${totalViolations}`);

    if (totalViolations > 0) {
      console.log("FAILED\n");
      exitCode = 1;
    } else {
      console.log("PASS\n");
    }
  } catch (e) {
    console.error("a11y-check error:", e);
    console.error("\n--- preview server output ---\n" + serverOutput);
    exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
    // astro preview forks a child process; make sure nothing lingers.
    try {
      if (base) {
        const port = new URL(base).port;
        execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
      }
    } catch {
      // best effort
    }
  }

  process.exit(exitCode);
}

main();
