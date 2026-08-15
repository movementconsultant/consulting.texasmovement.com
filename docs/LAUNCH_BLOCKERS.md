# Launch blockers — Texas Movement Consulting

Everything in this file must be resolved by a human with the relevant
authority (inbox access, legal counsel, hosting dashboard) before this site
leaves preview and becomes the live `consulting.texasmovement.com`. Nothing
here is fabricated to look resolved — omissions and honest placeholder
language are used instead, per the ecosystem's launch-safety rules.

## Inbox verification (blocks: primary CTA, contact routes) — the big one

- [ ] **`consulting@texasmovement.com`** — not in `VERIFIED_INBOXES`
      (`src/lib/site.ts`). This is this property's own lane inbox and the
      destination of its `primaryCta` (`PROPERTIES.consulting.primaryCta`:
      "Start a diagnostic" → `/start`). Until a human confirms this inbox
      exists and forwards:
      - `/start` stays a static, honest "intake opens soon" page — no form
        backend, no `mailto:` action.
      - The two former `mailto:Consulting@TexasMovement.com` CTAs on the old
        `early-childhood-ai-toolkit.html` (the pilot-claim button and the
        director CTA) have been replaced with plain copy pointing to `/start`.
      - The old `index.html` "Contact" section's `mailto:` link has been
        replaced with a "Start" section that points to `/start` instead of
        collecting a brief that would go nowhere.
      - **Decision + reasoning** (see PR description for the full writeup):
        the hero still surfaces "Start a diagnostic" as a real button (per
        the ecosystem's one-primary-CTA-per-property rule and because hiding
        it entirely would bury the property's actual purpose), but it links
        to the honest `/start` holding page rather than a working form, and
        it is visually secondary (ghost-style) to "See engagement tiers,"
        which needs no inbox and always works. This is the (a)-style option
        from `site-lib-spec.md` — page built, gated as a clearly-labeled
        "not live yet" state — chosen over omitting the CTA entirely because
        the alternative (a public nav/footer/hero with no path at all toward
        the property's stated purpose) seemed like the worse experience for
        a site whose entire point is "start a diagnostic." If the site owner
        would rather omit the CTA/route entirely until the inbox is
        verified, that's a one-file change (delete the `/start` link from
        `Nav.astro`'s CTA slot and the hero).
      - Once verified: uncomment `consulting@texasmovement.com` (or whichever
        address is confirmed) in `VERIFIED_INBOXES`, wire a real submission
        path on `/start` (form backend, or at minimum a live `mailto:` with
        prefilled subject/body like the old toolkit page had), and update
        `docs/MIGRATION_INVENTORY.md`.

- [x] **`/testimonials`'s embedded Google Form — resolved, disabled.** The
      live `docs.google.com/forms` iframe carried forward from the legacy
      `testimonials.html` has been removed from public output. It was an
      unverified third-party data-collection endpoint (no confirmed
      ownership or destination) and, under the current safety policy, no
      live submission endpoint may ship without explicit owner verification
      — the same rule already applied to `/start`.
      - **Original form URL (preserved for reference only, not rendered
        anywhere public):**
        `https://docs.google.com/forms/d/e/1FAIpQLScOE5a1cfs76S8cLXH_xvT27IW_QOH4iKNUhajD57oSUOEKiQ/viewform`
      - **Reason disabled:** unverified third-party data-collection
        endpoint; ownership/destination of submitted responses was never
        confirmed by the site owner.
      - **Replaced with:** an honest, non-submitting "Sharing your results"
        notice on `/testimonials` — no form, no email address, no external
        link, collects nothing.
      - **What's required before it can return:** explicit owner
        confirmation of (1) who owns/administers this Google Form and where
        responses go, (2) that it's approved to be publicly embedded again.
        Once both are confirmed, add the exact form URL to
        `VERIFIED_THIRD_PARTY_EMBEDS` in `src/lib/site.ts` — the postbuild
        guard (`scripts/check-public-output.mjs`, check 6) will fail the
        build on any `docs.google.com/forms` (or other known form-host)
        embed that isn't in that list, so re-adding the iframe without that
        step will fail CI.

- [ ] `hello@texasmovement.com` (INBOXES.general) — not in
      `VERIFIED_INBOXES` either. `verifiedGeneralContact()` in
      `src/lib/site.ts` currently always returns `null` because of this;
      nothing on this site currently calls it (no fallback general-contact
      CTA is shown anywhere), so there's no live output depending on it
      today, but flagging it since it's the documented fallback mechanism.

## Legal / organization data (blocks: policy page content, Organization JSON-LD elsewhere in the ecosystem)

- [ ] `/privacy` and `/terms` are honest stub pages ("policy content
      pending") — no real privacy policy or terms of service text exists
      yet for this property. Needs real legal text, reviewed by whoever the
      site owner uses for counsel, before this page can be considered a real
      policy.
- [ ] `/accessibility` is a real (not stubbed) statement describing what
      this rebuild actually did (skip link, accessible mobile nav,
      axe-core-checked contrast/structure) and what's still outstanding
      (no manual screen-reader pass). It currently has **no contact channel**
      for reporting a barrier, because no inbox is verified (see above) —
      that's the one placeholder-shaped gap on this page, and it's called
      out explicitly on the page itself rather than hidden.
- [ ] `ORG.stateOfFormation`, `ORG.formationYear`, `ORG.mailingAddress.street`,
      `ORG.mailingAddress.postalCode` are `TBD` in the vendored
      `packages/constants/src/org.ts` (upstream, ecosystem-wide — not
      specific to this property, and this property does not emit
      `organizationJsonLd()` at all, so none of these fields appear in this
      site's output regardless). Flagged here only because the vendored
      package still carries them as open TBDs; no action needed on this
      repo's side unless/until this property starts consuming `ORG` fields
      directly (it currently doesn't).

## Social handles (blocks: nothing on this property directly)

- [ ] TMM TikTok handle and TM Performance Instagram handle are `TBD` in
      `packages/constants/src/social.ts`. This property doesn't render a
      social-icon footer of its own (the ecosystem footer links to other
      *properties*, not to social accounts), so this doesn't block anything
      here — flagged for completeness since the vendored package carries it.

## Hosting / preview (blocks: a real, live preview URL)

- [ ] No Cloudflare account/dashboard credentials are available to this
      build. `wrangler.toml` (Cloudflare Pages, `pages_build_output_dir =
      "dist"`) is configured and ready — this is a static site, so no
      Pages Functions/adapter is required, just pointing a Cloudflare Pages
      project at this repo. Connecting the repo and producing a real preview
      URL requires a human with dashboard access. Locally verified instead:
      `npm run build` (zero errors) followed by `npm run preview`
      (`astro preview`, serves correctly) — see the PR description for the
      exact commands and output.

## Design consistency (not a blocker, but worth a human's sign-off)

- [ ] The old `early-childhood-ai-toolkit.html` and `testimonials.html` used
      their own bespoke color palettes (a blue-accent light theme and a
      dark gold-accent theme, respectively) that didn't match the ecosystem
      design system already established on this property's own `index.html`.
      This rebuild unified all pages under the one Texas Movement design
      system (tokens in `src/styles/tokens.css`, transcribed from the
      parent hub's production HTML) rather than preserving three different
      visual languages on one property. All copy, links, and functionality
      (copy-to-clipboard prompts, print button, the embedded Google Form)
      were preserved — only the visual styling changed. If the site owner
      specifically wanted those pages' original look kept, that's a
      deliberate call to revisit.

## Anything else discovered during this build

- [ ] `packages/constants` is vendored locally (`file:./packages/constants`)
      because `movementconsultant/tmi-constants` doesn't exist yet
      (`create_repository` failed upstream with a GitHub App permission
      error, per `site-lib-spec.md`). See "known follow-up" in
      `docs/MIGRATION_INVENTORY.md` for the exact swap-over steps once the
      real package exists.
- [ ] The four brand-kit PNGs (`File1_Primary_Horizontal.png` through
      `File4_With_URL.png`) and `og-square.png` at the repo root are not
      referenced by any page (old or new) — kept as source assets per the
      "never delete existing files" rule, but genuinely orphaned. Not a
      blocker, just noted so nobody assumes they're wired to something.
- [ ] `public/favicon.png` is `File3_Badge_Icon.png` (2048×2048) referenced
      directly with no downscaled variant — no image-processing tool was
      available in this environment (`convert`/`magick` not installed) to
      produce a proper 32×32/180×180 favicon set. Browsers render it fine
      scaled down, but it's a heavier download than a real favicon should
      be. Worth a follow-up with a proper favicon generator.
