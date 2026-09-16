import { describe, expect, it } from "vitest";
import { attendanceBelongsToClass, attendanceUiPolicy, classAttendanceViewModelSchema, findMeetingRoster, matchesPermit } from "@/features/attendance/model";
import { classAttendances, classes } from "@/mocks/fixtures";

describe("FE06 attendance model", () => {
  it("validates actor-scoped projections and Class binding", () => {
    const learner = classAttendances.student[classes.published.id];
    expect(classAttendanceViewModelSchema.parse(learner).learner?.records).toHaveLength(2);
    expect(classAttendanceViewModelSchema.parse(classAttendances.teacher[classes.draft.id]).manager?.monthlySummary?.students).toHaveLength(3);
    expect(attendanceBelongsToClass(learner, classes.published.id)).toBe(true);
    expect(attendanceBelongsToClass(learner, classes.draft.id)).toBe(false);
  });

  it("derives controls only from explicit capabilities", () => {
    expect(attendanceUiPolicy(["attendance.read", "permit.create"])).toEqual({ canRead: true, canManageRecords: false, canCreatePermit: true, canReviewPermit: false, canReadDiscipline: false, canManageDiscipline: false });
    expect(attendanceUiPolicy(["site.admin", "class.manage"])).toEqual({ canRead: false, canManageRecords: false, canCreatePermit: false, canReviewPermit: false, canReadDiscipline: false, canManageDiscipline: false });
  });

  it("scopes rosters and permit filters without inventing records", () => {
    const manager = classAttendances.teacher[classes.draft.id];
    expect(findMeetingRoster(manager, "meeting-draft-kickoff")).toHaveLength(3);
    expect(findMeetingRoster(manager, "unknown-meeting")).toEqual([]);
    expect(matchesPermit(manager.manager!.permitInbox[0], "nabila", "PENDING")).toBe(true);
    expect(matchesPermit(manager.manager!.permitInbox[0], "nabila", "APPROVED")).toBe(false);
  });
});
