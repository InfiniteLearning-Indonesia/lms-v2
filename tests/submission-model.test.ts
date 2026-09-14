import { describe, expect, it } from "vitest";
import { classSubmissions, classes } from "@/mocks/fixtures";
import {
  classSubmissionViewModelSchema,
  formatSubmissionDate,
  matchesTeacherSubmission,
  submissionBelongsToClass,
  submissionUiPolicy,
} from "@/features/submission/model";

describe("FE04 submission model", () => {
  it("validates actor-scoped Student and Teacher fixtures", () => {
    expect(classSubmissionViewModelSchema.parse(classSubmissions.student[classes.published.id]).learnerAssignments).toHaveLength(2);
    expect(classSubmissionViewModelSchema.parse(classSubmissions.teacher[classes.draft.id]).teacherInbox).toHaveLength(3);
  });

  it("fails closed without a projection or matching Class ancestry", () => {
    const model = classSubmissions.student[classes.published.id];
    expect(submissionBelongsToClass(model, classes.published.id)).toBe(true);
    expect(submissionBelongsToClass(model, classes.draft.id)).toBe(false);
    expect(() => classSubmissionViewModelSchema.parse({ ...model, learnerAssignments: undefined })).toThrow();
  });

  it("keeps review permission behind the provisional author adapter", () => {
    expect(submissionUiPolicy(undefined)).toEqual({ canRead: false, canReview: false });
    expect(submissionUiPolicy(["submission.read"])).toEqual({ canRead: true, canReview: false });
    expect(submissionUiPolicy(["submission.read", "content.manage"])).toEqual({ canRead: true, canReview: true });
  });

  it("filters inbox and formats server timestamps in the Class timezone", () => {
    const inbox = classSubmissions.teacher[classes.draft.id].teacherInbox ?? [];
    expect(inbox.filter((item) => matchesTeacherSubmission(item, "nabila", "SUBMITTED", "ALL"))).toHaveLength(1);
    expect(inbox.filter((item) => matchesTeacherSubmission(item, "", "ALL", "assignment-dashboard-draft-class"))).toHaveLength(3);
    expect(formatSubmissionDate("2026-09-14T03:30:00Z", "Asia/Jakarta")).toContain("10.30 WIB");
  });
});
