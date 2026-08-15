# Migration inventory — consulting.texasmovement.com

Captured before any scaffolding was touched, at the start of this rebuild.

## Branches at time of survey

Repo `movementconsultant/consulting.texasmovement.com` had exactly one branch.

| Branch | Head commit SHA |
|---|---|
| `main` | `c94526fab4b04ea3342bfaf90299e3d2b141a43e` |

No other branches existed (no `origin/*` refs besides `main`/`HEAD`). This repo
does not have a `media`-style parallel redesign branch, so the "diff a
redesign branch against main" section required for media.texasmovement.com
does not apply here.

The rebuild branch `claude/texas-movement-rebuild-pq14fo` was created fresh
from `origin/main` at the SHA above.

## Every file in the repo at survey time

| Path | Purpose | Referenced by? |
|---|---|---|
| `index.html` | Main marketing page — hero, who-it's-for, how-it-works, engagements/pricing, keynote, ecosystem connections, early-childhood teaser, FAQ, contact | Entry point (`/`); linked from every other page's nav and from the ecosystem footer on other TMI properties |
| `early-childhood-ai-toolkit.html` | Standalone lead-magnet / resource page: a free "Early Childhood AI Toolkit" (pilot edition) with three copy-paste AI prompts for daycare/preschool teachers, a pilot-enrollment CTA, and a director-facing CTA | Linked from `index.html`'s early-childhood section and footer, and from its own page nav |
| `testimonials.html` | "Client Results & Testimonials" — one published client testimonial (Diamond Kouture Beauty) plus an embedded Google Form for new submissions | Linked from `early-childhood-ai-toolkit.html`'s page nav; not linked from `index.html`'s nav (only reachable via toolkit page or direct URL) |
| `meta-tags.html` | NOT a page — a `<head>`-snippet reference file documenting the OG/Twitter meta tags meant to be pasted into `index.html`. Never rendered as a route. | Referenced only by `README.md`'s install instructions |
| `CNAME` | GitHub Pages custom-domain file | Read by GitHub Pages at deploy time |
| `README.md` | Documents the "OG kit" drop-in (how to install `meta-tags.html` + the two OG PNGs) | Human-facing only |
| `og-image.png` | 1200×630 PNG — OG/link-preview image | Referenced by `meta-tags.html`'s `og:image`/`twitter:image` |
| `og-square.png` | 1200×1200 PNG — square social variant | Not directly referenced by any HTML in this repo (feed/profile use per README) |
| `File1_Primary_Horizontal.png` | 3000×1000 PNG — brand lockup, primary horizontal | Not referenced by any HTML in this repo (brand-kit asset) |
| `File2_Stacked_Square.png` | 2048×2048 PNG — brand lockup, stacked square | Not referenced by any HTML in this repo |
| `File3_Badge_Icon.png` | 2048×2048 PNG — badge/icon mark | Not referenced by any HTML in this repo |
| `File4_With_URL.png` | 3000×1100 PNG — brand lockup with URL | Not referenced by any HTML in this repo |

Note: `index.html`'s actual nav brand mark and `og:image`/`twitter:image` in its
own `<head>` (as opposed to `meta-tags.html`) point to **externally hosted**
assets on `texasmovement.com` (`01_primary_stacked_transparent.png`,
`05_banner_header.png`) — not to any file in this repo. The four `File*.png`
brand-kit files and `og-square.png` in this repo are effectively orphaned
(no live page references them), kept here as source assets.

## Static asset dimensions

| Asset | Dimensions | Format |
|---|---|---|
| `File1_Primary_Horizontal.png` | 3000×1000 | PNG, 8-bit RGB |
| `File2_Stacked_Square.png` | 2048×2048 | PNG, 8-bit RGB |
| `File3_Badge_Icon.png` | 2048×2048 | PNG, 8-bit RGB |
| `File4_With_URL.png` | 3000×1100 | PNG, 8-bit RGB |
| `og-image.png` | 1200×630 | PNG, 8-bit RGB |
| `og-square.png` | 1200×1200 | PNG, 8-bit RGB |

## CNAME content (exact)

```
consulting.texasmovement.com
```

(No trailing newline in the checked-out file content beyond the domain line.)

## Rollback plan

To roll back, `git checkout main` — `main` is untouched; delete the feature
branch. The live GitHub Pages deploy was never repointed at
`claude/texas-movement-rebuild-pq14fo`. Nothing in this migration touches
`main` or the Pages deploy source, so rollback is a no-op unless/until someone
merges the PR opened from this branch.

## What changed structurally in this rebuild

- Added an Astro project (`package.json`, `astro.config.mjs`, `tsconfig.json`,
  `src/`, `public/`) alongside the existing static files. **No existing file
  was deleted** — `index.html`, `early-childhood-ai-toolkit.html`,
  `testimonials.html`, `meta-tags.html`, `CNAME`, `README.md`, and all six
  PNGs remain at the repo root exactly as they were.
- The Astro build's `public/` directory contains **copies** of the assets it
  needs to serve (`CNAME`, and an OG image renamed to the
  `@tmi/constants` `ogImage()` convention, `og-consulting.png`) — these are
  duplicates made for the build pipeline, not replacements; the originals at
  the repo root are unchanged.
- Vendored `packages/constants/` (a verbatim copy of the shared `@tmi/constants`
  control-plane package — see "known follow-up" below).

## Final route mapping (old static HTML -> new Astro routes)

| Old | New | Notes |
|---|---|---|
| `index.html` (`/`) | `/` (`src/pages/index.astro`) | All copy migrated. Two CTAs changed: hero's "Start a scoped brief" and the three engagement-tier CTAs now point to `/start` instead of `#contact`/`mailto:`. The old `#contact` section is now a "Start with a diagnostic" section pointing to `/start`. |
| `early-childhood-ai-toolkit.html` | `/early-childhood-ai-toolkit` (`src/pages/early-childhood-ai-toolkit.astro`) | All three prompts, safety section, external guidance links, print button, copy-to-clipboard, and back-to-top button migrated verbatim/functionally. The two `mailto:Consulting@TexasMovement.com` CTAs (pilot-claim button, director CTA) replaced with copy pointing to `/start` — see `docs/LAUNCH_BLOCKERS.md`. Restyled onto the shared design-system tokens (was previously a bespoke blue-accent palette). |
| `testimonials.html` | `/testimonials` (`src/pages/testimonials.astro`) | All copy, the one published testimonial, and the embedded Google Form iframe migrated unchanged (the Google Form is a third-party mechanism, not a texasmovement.com inbox, so it isn't gated by the inbox-verification rule). Restyled onto the shared design-system tokens (was previously a bespoke dark gold-accent palette). |
| `meta-tags.html` | *(not a route — superseded)* | Never rendered as a page in the old site either (a `<head>`-snippet reference file). Its OG/Twitter tag values are superseded by the `@tmi/constants` `seo.ts`-driven metadata framework in `src/layouts/BaseLayout.astro`. Kept at the repo root, unmodified, per "never delete existing files." |
| *(new)* | `/start` | New honest holding page for the property's `primaryCta` destination (`PROPERTIES.consulting.primaryCta.href`). No working form — see `docs/LAUNCH_BLOCKERS.md`. |
| *(new)* | `/privacy`, `/terms`, `/accessibility` | From `LEGAL_LINKS`. Privacy/terms are honest stubs; accessibility is a real statement. See `docs/LAUNCH_BLOCKERS.md`. |
| *(new)* | `/robots.txt`, `/sitemap.xml` | Dynamic endpoints (`src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`) that respect `PUBLIC_PREVIEW`. |

Old-path redirects for anything that could be bookmarked/indexed are in
`public/_redirects` (`/early-childhood-ai-toolkit.html`, `/testimonials.html`,
`/meta-tags.html`, `/index.html` → their new equivalents).

## Known follow-up

`packages/constants` is vendored locally via `"@tmi/constants": "file:./packages/constants"`
in `package.json` because `movementconsultant/tmi-constants` does not exist yet
(`create_repository` for it failed with a GitHub App permission error upstream
of this build). Once that package is published as a real GitHub Package,
swap the dependency line to
`"@tmi/constants": "npm:@movementconsultant/constants@^0.1.0"` and delete
`packages/constants/` — no import rewrites needed, every import site uses
`from "@tmi/constants"`.
