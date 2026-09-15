import { describe, expect, it } from "vitest";
import {
  activityCount,
  classCompletionViewModelSchema,
  completedActivityCount,
  completionBelongsToClass,
  completionUiPolicy,
  matchesLearnerCompletion,
} from "@/features/completion/model";
import { classCompletions, classes } from "@/mocks/fixtures";

describe("FE05 completion model", () => {
  const learner = classCompletions.student[classes.published.id].learnerProgress!;

  it("validates an actor-scoped projection and rejects ambiguous projections", () => {
    expect(classCompletionViewModelSchema.parse(classCompletions.student[classes.published.id]).learnerProgress?.progressPercent).toBe(68);
    expect(() => classCompletionViewModelSchema.parse({ ...classCompletions.student[classes.published.id], teacherRoster: [] })).toThrow();
  });

  it("rejects malformed evidence totals and browser-computed percentages outside bounds", () => {
    expect(() => classCompletionViewModelSchema.parse({ ...classCompletions.student[classes.published.id], learnerProgress: { ...learner, satisfiedEvidence: 8, requiredEvidence: 7 } })).toThrow();
    expect(() => classCompletionViewModelSchema.parse({ ...classCompletions.student[classes.published.id], learnerProgress: { ...learner, progressPercent: 101 } })).toThrow();
  });

  it("derives provisional UI policy from capability, never contextual role", () => {
    expect(completionUiPolicy(["progress.read"])).toEqual({ canRead: true, canManageOutcome: false, canOverride: false, canReopen: false });
    expect(completionUiPolicy(["progress.read", "content.manage"]).canOverride).toBe(true);
    expect(completionUiPolicy([]).canRead).toBe(false);
  });

  it("keeps exact Class ancestry and search filters", () => {
    expect(completionBelongsToClass(classCompletions.student[classes.published.id], classes.published.id)).toBe(true);
    expect(completionBelongsToClass(classCompletions.student[classes.published.id], classes.draft.id)).toBe(false);
    expect(matchesLearnerCompletion(learner, "student", "IN_PROGRESS")).toBe(true);
    expect(matchesLearnerCompletion(learner, "student", "PASSED")).toBe(false);
  });

  it("counts waived Activity as resolved without converting it into a grade", () => {
    expect(activityCount(learner)).toBe(4);
    expect(completedActivityCount(learner)).toBe(2);
  });
});
