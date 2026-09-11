import { describe, expect, it } from "vitest";
import { assignableParticipantRoles, canManageParticipants, lifecycleActionsFor, matchesManagedClass, matchesParticipant, participationActionsFor } from "@/features/classes/model";
import { classDetailsFormSchema, participantFormSchema, toCreateClassInput, toEditClassInput } from "@/features/classes/schemas";
import { actors, classParticipants, classes } from "@/mocks/fixtures";

describe("Class management policy and forms", () => {
  it("offers only valid lifecycle transitions", () => {
    expect(lifecycleActionsFor("DRAFT")).toEqual(["publish", "archive"]);
    expect(lifecycleActionsFor("PUBLISHED")).toEqual(["close", "archive"]);
    expect(lifecycleActionsFor("CLOSED")).toEqual(["reopen", "archive"]);
    expect(lifecycleActionsFor("ARCHIVED")).toEqual([]);
  });

  it("filters Class and participant read models without changing them", () => {
    expect(matchesManagedClass(classes.published, "software", "PUBLISHED")).toBe(true);
    expect(matchesManagedClass(classes.published, "software", "DRAFT")).toBe(false);
    expect(matchesParticipant(classParticipants[classes.published.id][2], "dinda", "student", "SUSPENDED")).toBe(true);
    expect(matchesParticipant(classParticipants[classes.published.id][2], "dinda", "teacher", "SUSPENDED")).toBe(false);
  });

  it("keeps participant role assignment scoped to the actor", () => {
    expect(assignableParticipantRoles(actors.siteAdmin, { ...classes.published, capabilities: ["participants.manage"] })).toEqual(["teacher", "student"]);
    expect(canManageParticipants({ ...classes.published, capabilities: [] })).toBe(false);
    expect(assignableParticipantRoles(actors.teacher, classes.draft)).toEqual(["student"]);
    expect(assignableParticipantRoles(actors.student, classes.published)).toEqual([]);
    expect(participationActionsFor("ACTIVE")).toEqual(["suspend", "end"]);
    expect(participationActionsFor("ENDED")).toEqual([]);
  });

  it("normalizes optional labels and preserves version in contract inputs", () => {
    const values = { name: " Product Engineering ", programLabel: " ", cohortLabel: "Batch 01" };
    expect(toCreateClassInput(values)).toEqual({ name: "Product Engineering", cohort_label: "Batch 01" });
    expect(toEditClassInput(values, 7)).toEqual({ name: "Product Engineering", cohort_label: "Batch 01", version: 7 });
    expect(classDetailsFormSchema.safeParse({ ...values, name: "" }).success).toBe(false);
    expect(classDetailsFormSchema.safeParse({ ...values, name: "😀".repeat(51) }).success).toBe(false);
  });

  it("accepts only opaque identity IDs from the contract shape", () => {
    expect(participantFormSchema.safeParse({ userId: "a".repeat(32), role: "student" }).success).toBe(true);
    expect(participantFormSchema.safeParse({ userId: "raw-email@example.test", role: "student" }).success).toBe(false);
  });
});
