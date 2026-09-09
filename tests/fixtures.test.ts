import { describe, expect, it } from "vitest";
import { actors, classes } from "@/mocks/fixtures";
import { actorFixtureSchema, assertFixture, classFixtureSchema } from "@/features/contracts/schemas";

describe("contract fixtures", () => {
  it("accepts valid actor and lifecycle fixtures", () => {
    expect(assertFixture(actorFixtureSchema, actors.teacher).id).toBe("actor-teacher");
    expect(assertFixture(classFixtureSchema, classes.archived).state).toBe("ARCHIVED");
  });
  it("rejects invalid lifecycle state", () => {
    expect(() => assertFixture(classFixtureSchema, { ...classes.draft, state: "REMOVED" })).toThrow();
  });
});
