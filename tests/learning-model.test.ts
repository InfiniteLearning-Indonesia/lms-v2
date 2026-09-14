import { describe, expect, it } from "vitest";
import {
  canPublishContent,
  canUploadFiles,
  classLearningViewModelSchema,
  contentBlockSchema,
  formatFileSize,
  isContentAuthor,
  learningBelongsToClass,
  learningUiPolicy,
  learnerSections,
  moveActivity,
  moveSection,
  safeContentUrl,
  validateFileSelection,
} from "@/features/learning/model";
import { classLearning, classes } from "@/mocks/fixtures";

describe("FE03 learning view model", () => {
  it("validates every development read model against the UI schema", () => {
    expect(Object.values(classLearning).every((learning) => classLearningViewModelSchema.safeParse(learning).success)).toBe(true);
  });

  it("keeps learner data published and private-file safe", () => {
    const teacherSections = classLearning[classes.draft.id].sections;
    const visible = learnerSections(teacherSections);

    expect(visible.flatMap((section) => section.activities).map((activity) => activity.id)).toEqual(["activity-welcome"]);
    expect(visible[0].activities[0].attachments.map((attachment) => attachment.state)).toEqual(["READY"]);
  });

  it("derives authoring controls only from explicit capabilities", () => {
    expect(isContentAuthor(classes.draft.capabilities)).toBe(true);
    expect(canPublishContent(classes.draft.capabilities)).toBe(true);
    expect(canUploadFiles(classes.draft.capabilities)).toBe(true);
    expect(isContentAuthor(["site.admin", "content.read"])).toBe(false);
    expect(canPublishContent(classes.published.capabilities)).toBe(false);
    expect(canUploadFiles(undefined)).toBe(false);
    expect(learningUiPolicy(classes.draft.capabilities)).toMatchObject({
      canManageStructure: true,
      canReorder: true,
      canEditActivity: true,
      canChangeLifecycle: true,
      canUpload: true,
    });
    expect(learningBelongsToClass(classLearning[classes.draft.id], classes.draft.id)).toBe(true);
    expect(learningBelongsToClass(classLearning[classes.published.id], classes.draft.id)).toBe(false);
  });

  it("reorders only inside the owning Section without mutating the fixture", () => {
    const original = classLearning[classes.draft.id].sections;
    const moved = moveActivity(original, "activity-design-system", "up");

    expect(moved[0].activities.map((activity) => activity.id)).toEqual([
      "activity-design-system",
      "activity-welcome",
      "activity-project-brief",
    ]);
    expect(original[0].activities[0].id).toBe("activity-welcome");
    expect(moveActivity(original, "activity-welcome", "up")).toEqual(original);
    expect(moveSection(original, "section-orientation", "down").map((section) => section.id)).toEqual(["section-discovery", "section-orientation"]);
  });

  it("allows only HTTPS links in canonical structured content", () => {
    expect(safeContentUrl("https://example.com/material")).toBe("https://example.com/material");
    expect(safeContentUrl("http://example.com/material")).toBeUndefined();
    expect(safeContentUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeContentUrl("https://user:secret@example.com/material")).toBeUndefined();
    expect(safeContentUrl("not a url")).toBeUndefined();
    expect(contentBlockSchema.safeParse({ type: "script", text: "alert(1)" }).success).toBe(false);
  });

  it("treats browser file checks as advisory policy only", () => {
    const policy = classLearning[classes.draft.id].filePolicy!;
    expect(validateFileSelection({ name: "brief.pdf", size: 500_000, type: "application/pdf" }, policy)).toEqual({ valid: true });
    expect(validateFileSelection({ name: "brief.pdf", size: 11_000_000, type: "application/pdf" }, policy)).toEqual({ valid: false, reason: "SIZE" });
    expect(validateFileSelection({ name: "brief.pdf", size: 500_000, type: "text/html" }, policy)).toEqual({ valid: false, reason: "TYPE" });
    expect(validateFileSelection({ name: "brief.exe", size: 500_000, type: "application/pdf" }, policy)).toEqual({ valid: false, reason: "EXTENSION" });
    expect(formatFileSize(2_480_000)).toContain("MB");
  });
});
