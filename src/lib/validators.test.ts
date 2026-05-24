import { describe, expect, it } from "vitest";
import { emailLocalpartSchema, profileFormSchema } from "./validators";

describe("emailLocalpartSchema", () => {
  it("accepts standard localparts", () => {
    expect(emailLocalpartSchema.parse("Ayush.Raj")).toBe("ayush.raj");
  });
  it("rejects @ in input", () => {
    expect(emailLocalpartSchema.safeParse("ayush@bitmesra.ac.in").success).toBe(false);
  });
});

describe("profileFormSchema", () => {
  const validBase = {
    displayName: "Ayush Raj",
    oneLiner: "Hello.",
    knownFor: "Building things.",
    branchId: "00000000-0000-0000-0000-000000000001",
    joiningYear: 2018,
    graduatingYear: 2022,
    currentState: "Karnataka",
    currentCity: "Bengaluru",
    socials: {},
  };

  it("accepts valid data", () => {
    const r = profileFormSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("coerces year strings", () => {
    const r = profileFormSchema.safeParse({ ...validBase, joiningYear: "2018", graduatingYear: "2022" });
    expect(r.success).toBe(true);
  });

  it("rejects missing branch", () => {
    const r = profileFormSchema.safeParse({ ...validBase, branchId: "" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown state", () => {
    const r = profileFormSchema.safeParse({ ...validBase, currentState: "Atlantis" });
    expect(r.success).toBe(false);
  });
});
