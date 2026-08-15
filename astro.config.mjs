// @ts-check
import { defineConfig } from "astro/config";
import { PROPERTIES } from "@tmi/constants";

// This property (`consulting`) is declared `platform: "astro-cloudflare"` in
// the @tmi/constants registry. It is a fully static content site, so it
// targets Astro's static output — no Cloudflare adapter is wired in because
// static output does not require one; Cloudflare Pages serves the built
// `dist/` directory directly. `wrangler.toml` at the repo root is the
// Cloudflare Pages scaffold (see docs/LAUNCH_BLOCKERS.md for the hosting
// connection that still needs a human with dashboard access).
export default defineConfig({
  site: PROPERTIES.consulting.url,
  output: "static",
  trailingSlash: "never",
  build: {
    format: "directory",
  },
});
