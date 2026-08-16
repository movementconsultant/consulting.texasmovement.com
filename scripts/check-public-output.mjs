#!/usr/bin/env node
/**
 * check-public-output.mjs — guard rail for the BUILT SITE (dist/), run after
 * `astro build` (wired as `postbuild`). Zero dependencies.
 *
 * Fails (`process.exit(1)`) if, anywhere under `dist/`:
 *   1. The literal string `TBD` (or `__TBD__`) appears in any .html/.xml/.json/.txt file.
 *   2. Any `<a href="mailto:...">` or form `action="mailto:..."` references an
 *      address not in VERIFIED_INBOXES (src/lib/site.ts).
 *   3. Any sitemap*.xml <loc> or `<link rel="canonical">` references a
 *      property whose PROPERTIES[key].status !== "live" (packages/constants).
 *   4. Global nav/footer markup links to a non-live property's origin.
 *   5. A build made with PUBLIC_PREVIEW=true is missing the noindex robots
 *      meta tag on any page.
 *   6. Any <iframe> (or href) pointing at a docs.google.com/forms endpoint —
 *      or another known third-party form-hosting domain — unless that exact
 *      URL is listed in VERIFIED_THIRD_PARTY_EMBEDS (src/lib/site.ts).
 *
 * This script intentionally does NOT `import` the TypeScript constants
 * package (avoids requiring a TS loader for a zero-dependency script) — it
 * parses the same source files with regex instead, the same technique
 * packages/constants/scripts/check.mjs itself uses.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const HERE = new URL(".", import.meta.url).pathname;
const REPO = join(HERE, "..");
const DIST = join(REPO, "dist");

const errors = [];
const err = (m) => errors.push(m);

if (!existsSync(DIST)) {
  console.error(`check-public-output: dist/ not found at ${DIST} — run "astro build" first.`);
  process.exit(1);
}

/* ---------- parse the constants source for property status/url --------- */
const ecosystemSrc = readFileSync(join(REPO, "packages", "constants", "src", "ecosystem.ts"), "utf8");
const blocks = ecosystemSrc.split(/\n\s{2}[a-z]+:\s*\{/).slice(1);
const properties = blocks
  .map((b) => {
    const key = b.match(/key:\s*"([a-z]+)"/)?.[1];
    const url = b.match(/url:\s*`([^`]+)`/)?.[1];
    const status = b.match(/status:\s*"([a-z]+)"/)?.[1];
    if (!key) return null;
    let resolvedUrl = url;
    if (url && url.includes("${")) {
      // e.g. `https://${sub("consulting")}` — resolve the one pattern this file uses.
      const domainMatch = b.match(/domain:\s*sub\("([a-z]+)"\)/);
      const apexMatch = ecosystemSrc.match(/const APEX = "([^"]+)"/);
      if (domainMatch && apexMatch) resolvedUrl = `https://${domainMatch[1]}.${apexMatch[1]}`;
      else if (b.match(/domain:\s*APEX/) && apexMatch) resolvedUrl = `https://${apexMatch[1]}`;
    }
    return { key, url: resolvedUrl, status };
  })
  .filter(Boolean);

if (!properties.length) {
  err("Could not parse any properties out of packages/constants/src/ecosystem.ts — check the parser above.");
}

const liveOrigins = new Set(
  properties.filter((p) => p.status === "live" && p.url).map((p) => new URL(p.url).host),
);
const nonLiveOrigins = new Map(
  properties.filter((p) => p.status !== "live" && p.url).map((p) => [new URL(p.url).host, p]),
);

/* ---------- parse src/lib/site.ts for VERIFIED_INBOXES ------------------ */
const siteTs = readFileSync(join(REPO, "src", "lib", "site.ts"), "utf8");
const verifiedBlockMatch = siteTs.match(/VERIFIED_INBOXES:[^=]*=\s*\[([\s\S]*?)\];/);
const verifiedInboxes = new Set(
  verifiedBlockMatch
    ? [...verifiedBlockMatch[1].matchAll(/^\s*"([^"]+)"/gm)].map((m) => m[1])
    : [],
);

const verifiedEmbedsBlockMatch = siteTs.match(/VERIFIED_THIRD_PARTY_EMBEDS:[^=]*=\s*\[([\s\S]*?)\];/);
const verifiedThirdPartyEmbeds = new Set(
  verifiedEmbedsBlockMatch
    ? [...verifiedEmbedsBlockMatch[1].matchAll(/^\s*"([^"]+)"/gm)].map((m) => m[1])
    : [],
);

/* ---------- walk dist/ ---------------------------------------------------*/
const CHECK_EXT = new Set([".html", ".xml", ".json", ".txt"]);
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => extname(f) === ".html");
const checkableFiles = files.filter((f) => CHECK_EXT.has(extname(f)));

/* 1. TBD literal check --------------------------------------------------- */
for (const file of checkableFiles) {
  const text = readFileSync(file, "utf8");
  if (/\bTBD\b/.test(text) || text.includes("__TBD__")) {
    err(`${file.replace(REPO + "/", "")}: contains a literal TBD marker in public output`);
  }
}

/* 2. mailto / form action verification ------------------------------------*/
const MAILTO_RE = /(?:href|action)\s*=\s*["']mailto:([^"'?]+)/gi;
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(MAILTO_RE)) {
    const address = m[1].trim();
    if (!verifiedInboxes.has(address)) {
      err(`${file.replace(REPO + "/", "")}: mailto to unverified address "${address}" (not in VERIFIED_INBOXES)`);
    }
  }
}

/* 3. sitemap / canonical -> live properties only ---------------------------*/
const LOC_RE = /<loc>([^<]+)<\/loc>/gi;
const CANONICAL_RE = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/gi;
for (const file of checkableFiles) {
  const text = readFileSync(file, "utf8");
  const isSitemap = /sitemap.*\.xml$/i.test(file);
  if (isSitemap) {
    for (const m of text.matchAll(LOC_RE)) {
      const host = safeHost(m[1]);
      if (host && nonLiveOrigins.has(host)) {
        err(`${file.replace(REPO + "/", "")}: sitemap references non-live property "${nonLiveOrigins.get(host).key}" (${m[1]})`);
      }
    }
  }
  for (const m of text.matchAll(CANONICAL_RE)) {
    const host = safeHost(m[1]);
    if (host && nonLiveOrigins.has(host)) {
      err(`${file.replace(REPO + "/", "")}: canonical references non-live property "${nonLiveOrigins.get(host).key}" (${m[1]})`);
    }
  }
}

/* 4. nav/footer links -> live properties only ------------------------------*/
const HREF_RE = /href=["'](https?:\/\/[^"']+)["']/gi;
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(HREF_RE)) {
    const host = safeHost(m[1]);
    if (host && nonLiveOrigins.has(host)) {
      err(`${file.replace(REPO + "/", "")}: links to non-live property "${nonLiveOrigins.get(host).key}" (${m[1]})`);
    }
  }
}

/* 5. preview noindex marker -------------------------------------------------*/
const PUBLIC_PREVIEW = process.env.PUBLIC_PREVIEW !== "false"; // matches src/lib/site.ts default
if (PUBLIC_PREVIEW) {
  const NOINDEX_RE = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex[^"']*["']/i;
  for (const file of htmlFiles) {
    const text = readFileSync(file, "utf8");
    if (!NOINDEX_RE.test(text)) {
      err(`${file.replace(REPO + "/", "")}: PUBLIC_PREVIEW build is missing a noindex robots meta tag`);
    }
  }
}

/* 6. third-party form embeds -> must be explicitly verified ---------------*/
const THIRD_PARTY_FORM_RE = /docs\.google\.com\/forms|forms\.google\.com|typeform\.com|jotform\.com/i;
const EMBED_SRC_RE = /(?:<iframe[^>]+src|href)\s*=\s*["']([^"']+)["']/gi;
for (const file of htmlFiles) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(EMBED_SRC_RE)) {
    const src = m[1];
    if (THIRD_PARTY_FORM_RE.test(src) && !verifiedThirdPartyEmbeds.has(src)) {
      err(`${file.replace(REPO + "/", "")}: unverified third-party form embed "${src}" (not in VERIFIED_THIRD_PARTY_EMBEDS)`);
    }
  }
}

function safeHost(u) {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}

/* ---------- report ---------------------------------------------------- */
console.log("\ncheck-public-output");
console.log("-".repeat(64));
console.log(`files scanned: ${checkableFiles.length} (${htmlFiles.length} html)`);
console.log(`live properties: ${[...liveOrigins].join(", ")}`);
console.log(`PUBLIC_PREVIEW: ${PUBLIC_PREVIEW}`);
console.log(`\nErrors: ${errors.length}`);
errors.forEach((e) => console.log(`  X ${e}`));
console.log("-".repeat(64));

if (errors.length) {
  console.log("FAILED\n");
  process.exit(1);
}
console.log("PASS\n");
