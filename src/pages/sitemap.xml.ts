import type { APIRoute } from "astro";
import { PUBLIC_PREVIEW, canonical } from "../lib/site";
import { PROPERTIES } from "@tmi/constants";

// Only this property's own live, indexable pages. Legal stub pages are
// included (they're real, honest pages — just short) since they are meant
// to be reachable and indexable once this leaves preview.
const PAGES = ["/", "/start", "/early-childhood-ai-toolkit", "/testimonials", "/privacy", "/terms", "/accessibility"];

export const GET: APIRoute = () => {
  // Preview build: zero indexable URLs, per the preview/noindex convention.
  const urls = PUBLIC_PREVIEW || PROPERTIES.consulting.status !== "live" ? [] : PAGES;

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((path) => `  <url><loc>${canonical("consulting", path)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
