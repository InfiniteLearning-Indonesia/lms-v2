import { z } from "zod";

export const CONTENT_AUTHOR_CAPABILITY = "content.manage";
export const CONTENT_PUBLISH_CAPABILITY = "content.publish";
export const FILE_UPLOAD_CAPABILITY = "files.upload";

export interface LearningUiPolicy {
  canPreviewAuthorContent: boolean;
  canManageStructure: boolean;
  canReorder: boolean;
  canEditActivity: boolean;
  canChangeLifecycle: boolean;
  canUpload: boolean;
}

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), level: z.union([z.literal(2), z.literal(3)]), text: z.string().max(500) }),
  z.object({ type: z.literal("paragraph"), text: z.string().max(10_000) }),
  z.object({ type: z.literal("list"), items: z.array(z.string().max(2_000)).max(50) }),
  z.object({ type: z.literal("callout"), tone: z.enum(["info", "warning"]), title: z.string().max(200), text: z.string().max(2_000) }),
  z.object({ type: z.literal("link"), label: z.string().max(300), url: z.string().max(2_048) }),
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export const creatableActivityTypeSchema = z.enum(["MATERIAL", "ASSIGNMENT"]);
export type CreatableActivityType = z.infer<typeof creatableActivityTypeSchema>;
export type ActivityLifecycle = "DRAFT" | "PUBLISHED" | "WITHDRAWN";
export type AvailabilityState = "AVAILABLE" | "LOCKED" | "SCHEDULED" | "UNAVAILABLE";
export type FileAssetState = "READY" | "SCANNING" | "QUARANTINED" | "REJECTED" | "EXPIRED";
export type RevisionSyncState = "CURRENT" | "STALE";

export interface ActivityAvailabilityViewModel {
  state: AvailabilityState;
  reason?: string;
  availableAt?: string;
  prerequisiteLabel?: string;
}

export interface LearningAttachmentViewModel {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  state: FileAssetState;
  statusReason?: string;
}

export interface LearningActivityViewModel {
  id: string;
  type: string;
  title: string;
  summary?: string;
  lifecycle: ActivityLifecycle;
  revision: number;
  syncState?: RevisionSyncState;
  latestRevision?: number;
  availability: ActivityAvailabilityViewModel;
  durationMinutes?: number;
  dueAt?: string;
  cutoffAt?: string;
  content: ContentBlock[];
  attachments: LearningAttachmentViewModel[];
}

export interface LearningSectionViewModel {
  id: string;
  title: string;
  description?: string;
  version: number;
  activities: LearningActivityViewModel[];
}

export interface FileSelectionPolicyViewModel {
  maxBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export interface ClassLearningViewModel {
  classId: string;
  timeZone: string;
  updatedAt: string;
  sections: LearningSectionViewModel[];
  filePolicy?: FileSelectionPolicyViewModel;
}

const availabilitySchema = z.object({
  state: z.enum(["AVAILABLE", "LOCKED", "SCHEDULED", "UNAVAILABLE"]),
  reason: z.string().max(2_000).optional(),
  availableAt: z.string().datetime({ offset: true }).optional(),
  prerequisiteLabel: z.string().max(500).optional(),
});

const attachmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(500),
  sizeBytes: z.number().int().nonnegative(),
  mimeType: z.string().min(1).max(200),
  state: z.enum(["READY", "SCANNING", "QUARANTINED", "REJECTED", "EXPIRED"]),
  statusReason: z.string().max(2_000).optional(),
});

const activitySchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  summary: z.string().max(2_000).optional(),
  lifecycle: z.enum(["DRAFT", "PUBLISHED", "WITHDRAWN"]),
  revision: z.number().int().positive(),
  syncState: z.enum(["CURRENT", "STALE"]).optional(),
  latestRevision: z.number().int().positive().optional(),
  availability: availabilitySchema,
  durationMinutes: z.number().int().positive().optional(),
  dueAt: z.string().datetime({ offset: true }).optional(),
  cutoffAt: z.string().datetime({ offset: true }).optional(),
  content: z.array(contentBlockSchema).max(500),
  attachments: z.array(attachmentSchema).max(100),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(500),
  description: z.string().max(2_000).optional(),
  version: z.number().int().positive(),
  activities: z.array(activitySchema).max(500),
});

export const classLearningViewModelSchema = z.object({
  classId: z.string().min(1),
  timeZone: z.string().min(1).max(100),
  updatedAt: z.string().datetime({ offset: true }),
  sections: z.array(sectionSchema).max(200),
  filePolicy: z.object({
    maxBytes: z.number().int().positive(),
    allowedMimeTypes: z.array(z.string().min(1)).min(1),
    allowedExtensions: z.array(z.string().regex(/^\.[a-z0-9]+$/)).min(1),
  }).optional(),
});

export type FileSelectionResult =
  | { valid: true }
  | { valid: false; reason: "SIZE" | "TYPE" | "EXTENSION" };

export function learningBelongsToClass(learning: ClassLearningViewModel | undefined, classId: string | undefined): boolean {
  return Boolean(learning && classId && learning.classId === classId);
}

export function learningUiPolicy(capabilities?: readonly string[]): LearningUiPolicy {
  const allowed = new Set(capabilities ?? []);
  const canManageContent = allowed.has(CONTENT_AUTHOR_CAPABILITY);
  return {
    canPreviewAuthorContent: canManageContent,
    canManageStructure: canManageContent,
    canReorder: canManageContent,
    canEditActivity: canManageContent,
    canChangeLifecycle: allowed.has(CONTENT_PUBLISH_CAPABILITY),
    canUpload: allowed.has(FILE_UPLOAD_CAPABILITY),
  };
}

export function isContentAuthor(capabilities?: string[]): boolean {
  return learningUiPolicy(capabilities).canPreviewAuthorContent;
}

export function canPublishContent(capabilities?: string[]): boolean {
  return learningUiPolicy(capabilities).canChangeLifecycle;
}

export function canUploadFiles(capabilities?: string[]): boolean {
  return learningUiPolicy(capabilities).canUpload;
}

export function learnerSections(sections: LearningSectionViewModel[]): LearningSectionViewModel[] {
  return sections
    .map((section) => ({
      ...section,
      activities: section.activities
        .filter((activity) => activity.lifecycle === "PUBLISHED")
        .map((activity) => ({
          ...activity,
          attachments: activity.attachments.filter((attachment) => attachment.state === "READY" || attachment.state === "EXPIRED"),
        })),
    }))
    .filter((section) => section.activities.length > 0);
}

export function moveActivity(
  sections: LearningSectionViewModel[],
  activityId: string,
  direction: "up" | "down",
): LearningSectionViewModel[] {
  return sections.map((section) => {
    const currentIndex = section.activities.findIndex((activity) => activity.id === activityId);
    if (currentIndex < 0) return section;
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= section.activities.length) return section;
    const activities = [...section.activities];
    [activities[currentIndex], activities[nextIndex]] = [activities[nextIndex], activities[currentIndex]];
    return { ...section, activities };
  });
}

export function moveSection(
  sections: LearningSectionViewModel[],
  sectionId: string,
  direction: "up" | "down",
): LearningSectionViewModel[] {
  const currentIndex = sections.findIndex((section) => section.id === sectionId);
  if (currentIndex < 0) return sections;
  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= sections.length) return sections;
  const nextSections = [...sections];
  [nextSections[currentIndex], nextSections[nextIndex]] = [nextSections[nextIndex], nextSections[currentIndex]];
  return nextSections;
}

export function firstActivityId(sections: LearningSectionViewModel[]): string | undefined {
  return sections.find((section) => section.activities.length > 0)?.activities[0]?.id;
}

export function findActivity(sections: LearningSectionViewModel[], activityId?: string): LearningActivityViewModel | undefined {
  if (!activityId) return undefined;
  return sections.flatMap((section) => section.activities).find((activity) => activity.id === activityId);
}

export function safeContentUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function validateFileSelection(
  file: Pick<File, "name" | "size" | "type">,
  policy: FileSelectionPolicyViewModel,
): FileSelectionResult {
  if (file.size > policy.maxBytes) return { valid: false, reason: "SIZE" };
  const normalizedType = file.type.toLocaleLowerCase("en-US");
  if (!policy.allowedMimeTypes.map((type) => type.toLocaleLowerCase("en-US")).includes(normalizedType)) {
    return { valid: false, reason: "TYPE" };
  }
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLocaleLowerCase("en-US")}` : "";
  if (!policy.allowedExtensions.map((item) => item.toLocaleLowerCase("en-US")).includes(extension)) {
    return { valid: false, reason: "EXTENSION" };
  }
  return { valid: true };
}

export function formatLearningDate(value: string, timeZone: string, locale = "id-ID"): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

export function formatFileSize(bytes: number, locale = "id-ID"): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000)} KB`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / 1_000_000)} MB`;
}
