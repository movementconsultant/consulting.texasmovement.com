import type { APIRoute } from "astro";
import { PUBLIC_PREVIEW } from "../lib/site";
import { PROPERTIES } from "@tmi/constants";

export const GET: APIRoute = () => {
  const body = PUBLIC_PREVIEW
    ? // Preview build: disallow everything, no sitemap reference. This build
      // is noindex by design — see docs/LAUNCH_BLOCKERS.md and the PR
      // description's "preview / noindex convention" note.
      ["User-agent: *", "Disallow: /", ""].join("\n")
    : ["User-agent: *", "Allow: /", `Sitemap: ${PROPERTIES.consulting.url}/sitemap.xml`, ""].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
