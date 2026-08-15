/**
 * src/lib/site.ts — the ONLY place `.astro` templates may import
 * `@tmi/constants` primitives through. Never import `@tmi/constants`
 * directly in a `.astro` file.
 *
 * This wraps the vendored control-plane package and enforces the
 * launch-safety rules the raw package does not enforce by itself:
 *  - raw `GLOBAL_FOOTER` / `footerFor()` includes `building` properties too;
 *    this file exposes only `live` ones via `liveFooterFor()`.
 *  - raw `INBOXES` has no "verified" concept; this file tracks which
 *    inboxes have actually been confirmed to exist and forward.
 */
import {
  PROPERTIES,
  PROPERTY_ORDER,
  footerFor,
  LEGAL_LINKS,
  publishableAccounts,
  url,
  canonical,
  mailto,
  INBOXES,
} from "@tmi/constants";
import type { PropertyKey } from "@tmi/constants";

/**
 * Inboxes confirmed live and forwarding as of this build.
 * EMPTY by default — nothing is verified until a human confirms it.
 * Edit this list only after manually confirming an inbox forwards.
 * This is intentionally NOT sourced from org.ts — org.ts lists every
 * inbox that SHOULD exist, not every inbox confirmed to exist.
 *
 * As of this build, `consulting@texasmovement.com` (this property's own
 * lane inbox, and the destination of its `primaryCta`) is UNVERIFIED.
 * See docs/LAUNCH_BLOCKERS.md.
 */
export const VERIFIED_INBOXES: readonly string[] = [
  // "hello@texasmovement.com",  <- uncomment only after confirming
];

export function isVerifiedInbox(address: string | undefined | null): boolean {
  return !!address && VERIFIED_INBOXES.includes(address);
}

/**
 * Third-party data-collection embeds (Google Forms, Typeform, etc.) explicitly
 * confirmed by the site owner as approved, live, and safe to embed.
 * EMPTY by default — nothing is verified until a human confirms it, same
 * pattern as VERIFIED_INBOXES. Exact URL match required, not a domain match.
 *
 * The legacy `/testimonials` Google Form was disabled and removed pending
 * this confirmation — see docs/LAUNCH_BLOCKERS.md for the original URL, the
 * reason it was disabled, and what's required before it can return.
 */
export const VERIFIED_THIRD_PARTY_EMBEDS: readonly string[] = [
  // "https://docs.google.com/forms/d/e/.../viewform", <- uncomment only after confirming ownership + destination
];

export function isVerifiedThirdPartyEmbed(src: string | undefined | null): boolean {
  return !!src && VERIFIED_THIRD_PARTY_EMBEDS.includes(src);
}

/** Live-only nav/footer — filters out "building"/"planned"/"retired" properties
 *  even though raw footerFor() would include them if inGlobalNav is true. */
export function liveFooterFor(current: PropertyKey) {
  return footerFor(current).filter((item) => PROPERTIES[item.key].status === "live");
}

/** Live-only social accounts, further filtered to ones with a resolved (non-TBD) url. */
export function liveSocialAccounts() {
  return publishableAccounts(); // already excludes TBD entries
}

/**
 * The ONE contact route this build is allowed to expose.
 * Returns null if nothing is verified — callers MUST render no CTA in that case,
 * never a placeholder, never a raw mailto to an unverified address.
 */
export function verifiedGeneralContact(): { href: string; label: string } | null {
  const general = INBOXES.general;
  if (!isVerifiedInbox(general)) return null;
  return { href: mailto(general), label: "Email us" };
}

/**
 * Preview / noindex convention for this build.
 *
 * Defaults to `true` (safe default) when `PUBLIC_PREVIEW` is unset, so a
 * misconfigured or missing env var never accidentally ships an indexable
 * build. Set `PUBLIC_PREVIEW=false` explicitly for a real production build.
 */
export const PUBLIC_PREVIEW: boolean = import.meta.env.PUBLIC_PREVIEW !== "false";

export { PROPERTIES, PROPERTY_ORDER, LEGAL_LINKS, url, canonical };
export type { PropertyKey };
