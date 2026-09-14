import { describe, expect, it } from "vitest";
import { classGradebooks, classes } from "@/mocks/fixtures";
import {
  applyAiSuggestion,
  clampCriterionScore,
  classGradebookViewModelSchema,
  gradebookBelongsToClass,
  gradebookUiPolicy,
} from "@/features/gradebook/model";

describe("FE04 gradebook model", () => {
  it("validates the rubric, grade, import, and AI preview fixture", () => {
    const model = classGradebookViewModelSchema.parse(classGradebooks.teacher[classes.draft.id]);
    expect(model.assignments[0].criteria).toHaveLength(3);
    expect(model.importPreview?.invalidRows).toBe(2);
  });

  it("rejects foreign Class ancestry and fails closed without capability", () => {
    const model = classGradebooks.teacher[classes.draft.id];
    expect(gradebookBelongsToClass(model, classes.draft.id)).toBe(true);
    expect(gradebookBelongsToClass(model, classes.published.id)).toBe(false);
    expect(gradebookUiPolicy(undefined).canRead).toBe(false);
    expect(gradebookUiPolicy(["gradebook.read"])).toMatchObject({ canRead: true, canGrade: false, canRelease: false });
    expect(gradebookUiPolicy(["gradebook.read", "content.manage"]).canGrade).toBe(true);
  });

  it("bounds local criterion values and treats AI as a draft suggestion", () => {
    expect(clampCriterionScore(-2, 35)).toBe(0);
    expect(clampCriterionScore(90, 35)).toBe(35);
    const assignment = classGradebooks.teacher[classes.draft.id].assignments[0];
    const scores = applyAiSuggestion(assignment.entries[0], assignment);
    expect(scores).toEqual({ "criterion-hierarchy": 30, "criterion-flow": 27, "criterion-evidence": 22 });
    expect(assignment.entries[0].criterionScores).toEqual({ "criterion-hierarchy": 0, "criterion-flow": 0, "criterion-evidence": 0 });
  });
});
