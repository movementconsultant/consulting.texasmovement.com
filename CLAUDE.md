# CLAUDE.md — consulting.texasmovement.com

## Scope / property role

This is the **consulting lane** of the Texas Movement ecosystem
(`consulting.texasmovement.com`) — an Astro static site rebuilt from four
legacy static HTML files (still preserved at repo root, untouched, per the
"never delete" rule). Routes: `/`, `/start`, `/early-childhood-ai-toolkit`,
`/testimonials`, `/privacy`, `/terms`, `/accessibility`, plus dynamic
`/robots.txt` and `/sitemap.xml`.

`/start` is the property's diagnostic-intake CTA. It is a **safe, honest
placeholder** — no working form, no email destination — because the lane
inbox (`consulting@texasmovement.com`) is unverified. **Do not activate it**
(no form backend, no `mailto:`, no lead capture) until a human confirms the
inbox and updates `VERIFIED_INBOXES` in `src/lib/site.ts`.

## Public-output safety rules (non-negotiable)

These apply to every page this site renders, checked automatically by
`scripts/check-public-output.mjs` as a `postbuild` step and manually via
`grep` against `dist/`:

- **No email addresses in any form**, anywhere in rendered output — not
  `mailto:` links, not plain text, not "you'll be able to reach us at X"
  copy. Lane inboxes live in `packages/constants/src/org.ts` as data only;
  none may be rendered until verified.
- **No contact/newsletter/booking form or submission endpoint** without a
  verified destination on Alexander's side. This includes third-party
  embeds (e.g. Google Forms) — a live iframe pointing at a real submission
  URL counts as a live endpoint even if TMI doesn't host the backend. See
  the open testimonials-form question in `docs/LAUNCH_BLOCKERS.md`.
- No literal `TBD` in rendered output.
- No fabricated legal, social, or contact data.
- No unresolved social link, and no non-live TMI property linked as a
  clickable link anywhere (footer/nav only link `status: "live"`
  properties — see `liveFooterFor()` in `src/lib/site.ts`).
- Rendering inert form markup (`<form>`, `<input>`) is **also** disallowed
  now, even with a non-functional submit action — it reads as "a contact
  form" regardless of whether it works. Use plain descriptive copy instead
  (see `/start` for the pattern).

## Build / test / check commands

```
npm install
npx astro check                          # type/template check
PUBLIC_PREVIEW=true npm run build         # astro build + postbuild guard (check-public-output.mjs)
npx vitest run                            # unit tests
PUBLIC_PREVIEW=true node scripts/a11y-check.mjs   # axe-core scan via Playwright Chromium against astro preview
npm run ci                                # typecheck && check:constants && build && test:unit && test:a11y
```

`PUBLIC_PREVIEW=true` (the safe default even if unset) makes every page ship
`noindex, nofollow`, empties the sitemap, and skips canonical URLs pointing
at the live domain — this is a preview build until a human flips it.

## Deployment / rollback assumptions

No Cloudflare Pages project is connected yet (`wrangler.toml` is configured,
`pages_build_output_dir = "dist"`, static site, no adapter needed) — a human
with dashboard access must connect the repo. `main` has never been touched
by this rebuild and the live GitHub Pages deploy (if any) was never
repointed at this branch, so rollback is a no-op unless/until the rebuild PR
merges: `git checkout main` returns to the original four-file static site.

## Known launch blockers

Full detail, kept up to date, lives in `docs/LAUNCH_BLOCKERS.md` — don't
duplicate it here. Headline items: `consulting@texasmovement.com` (and
`hello@texasmovement.com`) unverified; `/privacy` and `/terms` are honest
stubs with no real legal text; no Cloudflare dashboard access; the
`/testimonials` embedded Google Form's approval status is unconfirmed (see
below).

## What needs owner approval

- Verifying `consulting@texasmovement.com` (or an alternate inbox) before
  `/start` can go live with a real submission path.
- Real `/privacy` and `/terms` legal text (needs counsel, not engineering).
- Cloudflare Pages project connection / DNS.
- Whether the `/testimonials` embedded Google Form
  (`docs.google.com/forms/d/e/...`) is an approved, intentional exception to
  the "no submission endpoint without a verified destination" rule, or
  whether it should come down like the old `mailto:` CTAs did. It was
  carried forward from the legacy static HTML on the assumption that a
  third-party form isn't gated by *inbox* verification, but that's a
  judgment call, not a documented owner sign-off — flagged in
  `docs/LAUNCH_BLOCKERS.md`, unresolved.
- The one design-consistency judgment call already flagged in
  `docs/LAUNCH_BLOCKERS.md` (unifying the toolkit/testimonials pages onto
  the shared design tokens instead of preserving their original bespoke
  palettes).

## Current implementation status

All legacy content is migrated with zero functional or content loss; the
site builds clean (`astro check`, `npm run build` + postbuild guard, unit
tests, and an axe-core a11y scan across all 7 pages all pass with zero
errors/violations as of the last validation pass). PR #1
(`claude/texas-movement-rebuild-pq14fo` → `main`) is open and in draft,
gated on the owner decisions above before it can leave preview.
