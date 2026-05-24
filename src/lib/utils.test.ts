import { describe, expect, it } from "vitest";
import { cn, slugify, withSuffix } from "./utils";

describe("cn", () => {
  it("joins truthy strings", () => {
    expect(cn("a", false, "b", null, "c")).toBe("a b c");
  });
});

describe("slugify", () => {
  it("lowercases and dasherises", () => {
    expect(slugify("Ayush Raj")).toBe("ayush-raj");
  });
  it("strips junk chars", () => {
    expect(slugify("  A!B@C#  ")).toBe("a-b-c");
  });
  it("caps length at 40", () => {
    expect(slugify("a".repeat(80)).length).toBe(40);
  });
});

describe("withSuffix", () => {
  it("returns base when n=1", () => {
    expect(withSuffix("ayush", 1)).toBe("ayush");
  });
  it("appends -n when n>1", () => {
    expect(withSuffix("ayush", 3)).toBe("ayush-3");
  });
});
