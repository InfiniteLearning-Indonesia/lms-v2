import { describe, expect, it } from "vitest";
import { actors, classes, classLearning, classOverviews, classParticipants, identityCandidates } from "@/mocks/fixtures";
import { actorFixtureSchema, assertFixture, classFixtureSchema, classOverviewFixtureSchema, classParticipantFixtureSchema, identityCandidateFixtureSchema } from "@/features/contracts/schemas";
import { classLearningViewModelSchema } from "@/features/learning/model";

describe("contract fixtures", () => {
  it("accepts valid actor and lifecycle fixtures", () => {
    expect(assertFixture(actorFixtureSchema, actors.teacher).id).toBe("actor-teacher");
    expect(assertFixture(classFixtureSchema, classes.archived).state).toBe("ARCHIVED");
    expect(assertFixture(classOverviewFixtureSchema, classOverviews[classes.published.id]).upcomingAssignments).toHaveLength(2);
    expect(assertFixture(classParticipantFixtureSchema, classParticipants[classes.published.id][0]).roles).toContain("teacher");
    expect(assertFixture(identityCandidateFixtureSchema, identityCandidates[0]).displayName).toBe("Alya Rahman");
    expect(assertFixture(classLearningViewModelSchema, classLearning[classes.published.id]).sections).toHaveLength(2);
  });
  it("rejects invalid lifecycle state", () => {
    expect(() => assertFixture(classFixtureSchema, { ...classes.draft, state: "REMOVED" })).toThrow();
  });
});
