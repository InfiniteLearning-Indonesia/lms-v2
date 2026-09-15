import { describe, expect, it } from "vitest";
import { actors, classes, classCompletions, classCredentials, classGradebooks, classLearning, classOverviews, classParticipants, classSubmissions, identityCandidates, publicCredentialVerifications } from "@/mocks/fixtures";
import { actorFixtureSchema, assertFixture, classFixtureSchema, classOverviewFixtureSchema, classParticipantFixtureSchema, identityCandidateFixtureSchema } from "@/features/contracts/schemas";
import { classLearningViewModelSchema } from "@/features/learning/model";
import { classSubmissionViewModelSchema } from "@/features/submission/model";
import { classGradebookViewModelSchema } from "@/features/gradebook/model";
import { classCompletionViewModelSchema } from "@/features/completion/model";
import { classCredentialViewModelSchema, publicCredentialVerificationSchema } from "@/features/credential/model";

describe("contract fixtures", () => {
  it("accepts valid actor and lifecycle fixtures", () => {
    expect(assertFixture(actorFixtureSchema, actors.teacher).id).toBe("actor-teacher");
    expect(assertFixture(classFixtureSchema, classes.archived).state).toBe("ARCHIVED");
    expect(assertFixture(classOverviewFixtureSchema, classOverviews[classes.published.id]).upcomingAssignments).toHaveLength(2);
    expect(assertFixture(classParticipantFixtureSchema, classParticipants[classes.published.id][0]).roles).toContain("teacher");
    expect(assertFixture(identityCandidateFixtureSchema, identityCandidates[0]).displayName).toBe("Alya Rahman");
    expect(assertFixture(classLearningViewModelSchema, classLearning[classes.published.id]).sections).toHaveLength(2);
    expect(assertFixture(classSubmissionViewModelSchema, classSubmissions.student[classes.published.id]).learnerAssignments).toHaveLength(2);
    expect(assertFixture(classGradebookViewModelSchema, classGradebooks.teacher[classes.draft.id]).assignments).toHaveLength(1);
    expect(assertFixture(classCompletionViewModelSchema, classCompletions.student[classes.published.id]).learnerProgress?.sections).toHaveLength(2);
    expect(assertFixture(classCredentialViewModelSchema, classCredentials.student[classes.published.id]).subjects).toHaveLength(1);
    expect(assertFixture(publicCredentialVerificationSchema, publicCredentialVerifications["IL-PE26-SALSA-0012"]).state).toBe("VALID");
  });
  it("rejects invalid lifecycle state", () => {
    expect(() => assertFixture(classFixtureSchema, { ...classes.draft, state: "REMOVED" })).toThrow();
  });
});
