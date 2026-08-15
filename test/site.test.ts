import { describe, expect, it } from "vitest";
import {
  liveFooterFor,
  isVerifiedInbox,
  verifiedGeneralContact,
  VERIFIED_INBOXES,
  PROPERTIES,
} from "../src/lib/site";

describe("liveFooterFor", () => {
  it("excludes non-live properties even though they are in the global footer", () => {
    const items = liveFooterFor("consulting");
    const keys = items.map((i) => i.key);

    // distribution, reparations, social are status: "building" in the registry
    expect(keys).not.toContain("distribution");
    expect(keys).not.toContain("reparations");
    expect(keys).not.toContain("social");

    // sanity: live properties are still present
    expect(keys).toContain("tmi");
    expect(keys).toContain("consulting");
    expect(keys).toContain("performance");
  });

  it("marks the current property as current, not as a self-link", () => {
    const items = liveFooterFor("consulting");
    const self = items.find((i) => i.key === "consulting");
    expect(self?.isCurrent).toBe(true);
    const other = items.find((i) => i.key === "tmi");
    expect(other?.isCurrent).toBe(false);
  });
});

describe("VERIFIED_INBOXES / isVerifiedInbox", () => {
  it("starts empty — nothing is verified until a human confirms it", () => {
    expect(VERIFIED_INBOXES).toHaveLength(0);
  });

  it("treats every inbox as unverified while the list is empty", () => {
    expect(isVerifiedInbox("consulting@texasmovement.com")).toBe(false);
    expect(isVerifiedInbox("hello@texasmovement.com")).toBe(false);
    expect(isVerifiedInbox(undefined)).toBe(false);
    expect(isVerifiedInbox(null)).toBe(false);
  });
});

describe("verifiedGeneralContact", () => {
  it("returns null when no inbox is verified", () => {
    expect(verifiedGeneralContact()).toBeNull();
  });
});

describe("PROPERTIES.consulting", () => {
  it("has exactly the primaryCta the site's /start route implements", () => {
    expect(PROPERTIES.consulting.primaryCta).toEqual({
      label: "Start a diagnostic",
      href: "/start",
      event: "form_start",
    });
  });

  it("is declared status: live", () => {
    expect(PROPERTIES.consulting.status).toBe("live");
  });
});
