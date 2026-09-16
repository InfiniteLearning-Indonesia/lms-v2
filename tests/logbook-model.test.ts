import { describe, expect, it } from "vitest";
import { classLogbookViewModelSchema, logbookBelongsToClass, logbookUiPolicy, matchesLogbookReview } from "@/features/logbook/model";
import { classLogbooks, classes } from "@/mocks/fixtures";

describe("FE06 logbook model", () => {
  it("accepts flexible periods and revision-aware projections", () => {
    const learner = classLogbooks.student[classes.published.id];
    expect(classLogbookViewModelSchema.parse(learner).periods.map((period) => period.label)).toContain("Fase Discovery");
    expect(logbookBelongsToClass(learner, classes.published.id)).toBe(true);
    expect(logbookBelongsToClass(learner, classes.draft.id)).toBe(false);
  });

  it("derives review and mentoring visibility only from capabilities", () => {
    expect(logbookUiPolicy(["logbook.read", "logbook.review"])).toEqual({ canRead: true, canWrite: false, canReview: true, canReadMentoring: false });
    expect(logbookUiPolicy(["site.admin", "class.manage"])).toEqual({ canRead: false, canWrite: false, canReview: false, canReadMentoring: false });
  });

  it("filters the review inbox by state and searchable projection fields", () => {
    const review = classLogbooks.teacher[classes.draft.id].reviewer!.reviewInbox[0];
    expect(matchesLogbookReview(review, "wawancara", "SUBMITTED")).toBe(true);
    expect(matchesLogbookReview(review, "nabila", "ACCEPTED")).toBe(false);
  });
});
