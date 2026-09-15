"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileQuestion,
  FileText,
  Link2,
  ListOrdered,
  LockKeyhole,
  Paperclip,
  PencilLine,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { PageHeader } from "@/components/ui-v3/page-header";
import { EmptyState } from "@/components/ui-v3/states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClassContext } from "@/features/workspace/context";
import type {
  ClassLearningViewModel,
  CreatableActivityType,
  FileSelectionPolicyViewModel,
  FileSelectionResult,
  LearningActivityViewModel,
  LearningAttachmentViewModel,
  LearningSectionViewModel,
} from "../model";
import {
  findActivity,
  firstActivityId,
  formatFileSize,
  formatLearningDate,
  learningBelongsToClass,
  learningUiPolicy,
  learnerSections,
  moveActivity,
  moveSection,
  validateFileSelection,
} from "../model";
import { StructuredContent } from "./structured-content";

type LearningMode = "preview" | "learn";

const lifecycleStyles = {
  DRAFT: "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-200",
  PUBLISHED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  WITHDRAWN: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
} as const;

const fileStateStyles = {
  READY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  SCANNING: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  QUARANTINED: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
  EXPIRED: "border-border bg-muted text-muted-foreground",
} as const;

export function LearningContent({ initialLearning }: { initialLearning?: ClassLearningViewModel }) {
  const t = useTranslations("learning");
  const { activeClass } = useClassContext();
  const capabilities = activeClass?.capabilities;
  const policy = learningUiPolicy(capabilities);
  const author = policy.canPreviewAuthorContent;
  const mode: LearningMode = author ? "preview" : "learn";
  const learningMatchesClass = !initialLearning || learningBelongsToClass(initialLearning, activeClass?.id);
  const initialSections = learningMatchesClass ? initialLearning?.sections ?? [] : [];
  const [sections, setSections] = useState<LearningSectionViewModel[]>(() => initialSections);
  const [orderMode, setOrderMode] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);
  const initialVisibleSections = author ? sections : learnerSections(sections);
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(() => firstActivityId(initialVisibleSections));

  const visibleSections = author ? sections : learnerSections(sections);
  const selectedActivity = findActivity(visibleSections, selectedActivityId) ?? findActivity(visibleSections, firstActivityId(visibleSections));
  useUnsavedChangesWarning(orderDirty);

  if (!activeClass) return null;
  if (!learningMatchesClass) return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;

  const progressHref = activeClass?.capabilities?.includes("progress.read") ? `/app/classes/${activeClass.id}/progress` : undefined;
  const headerActions = author || progressHref ? (
    <div className="flex flex-wrap gap-2">
      {author ? <div role="status" className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 text-sm font-semibold text-primary"><BookOpen className="size-4" aria-hidden="true" />{t("studentPreviewMode")}</div> : null}
      {progressHref ? <Link href={progressHref} className={buttonVariants({ variant: "outline", className: "min-h-11" })}><ChartNoAxesColumnIncreasing className="size-4" aria-hidden="true" />{t("openProgress")}</Link> : null}
    </div>
  ) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} description={t("description", { className: activeClass.name })} actions={headerActions} />

      {!initialLearning ? (
        <DependencyState />
      ) : (
        <>
          <LearningSummary learning={initialLearning} sections={visibleSections} mode={mode} />
          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
            <CourseOutline
              sections={visibleSections}
              selectedActivityId={selectedActivity?.id}
              mode={mode}
              canManage={policy.canManageStructure}
              canReorder={policy.canReorder}
              orderMode={orderMode}
              orderDirty={orderDirty}
              onSelect={setSelectedActivityId}
              onStartOrder={() => setOrderMode(true)}
              onCancelOrder={() => {
                setSections(initialSections);
                setOrderDirty(false);
                setOrderMode(false);
              }}
              onMoveSection={(sectionId, direction) => {
                setSections((current) => moveSection(current, sectionId, direction));
                setOrderDirty(true);
              }}
              onMoveActivity={(activityId, direction) => {
                setSections((current) => moveActivity(current, activityId, direction));
                setOrderDirty(true);
              }}
            />
            {selectedActivity ? (
              <ActivityDetail
                activity={selectedActivity}
                mode={mode}
                timeZone={initialLearning.timeZone}
                editHref={policy.canEditActivity ? `/app/classes/${activeClass.id}/learning/activities/${encodeURIComponent(selectedActivity.id)}/edit` : undefined}
                submissionHref={mode === "learn" && selectedActivity.type.toLocaleUpperCase("en-US") === "ASSIGNMENT" && selectedActivity.availability.state === "AVAILABLE" ? `/app/classes/${activeClass.id}/submissions` : undefined}
              />
            ) : (
              <EmptyState
                title={author ? t("emptyManageTitle") : t("emptyLearnTitle")}
                description={author ? t("emptyManageBody") : t("emptyLearnBody")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function ActivityEditorContent({ initialLearning, activityId }: { initialLearning?: ClassLearningViewModel; activityId: string }) {
  const t = useTranslations("learning");
  const { activeClass } = useClassContext();
  const capabilities = activeClass?.capabilities;
  const policy = learningUiPolicy(capabilities);
  const learningMatchesClass = !initialLearning || learningBelongsToClass(initialLearning, activeClass?.id);
  const sections = learningMatchesClass ? initialLearning?.sections ?? [] : [];
  const activity = findActivity(sections, activityId);

  if (!activeClass) return null;
  if (!policy.canEditActivity) return <EmptyState title={t("editorForbiddenTitle")} description={t("editorForbiddenBody")} />;
  if (!learningMatchesClass) return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  if (!initialLearning) {
    return <div className="mx-auto max-w-5xl space-y-6"><PageHeader eyebrow={t("manageMode")} title={t("editorTitle")} description={t("editorBody")} /><DependencyState /></div>;
  }
  if (!activity) return <EmptyState title={t("editorNotFoundTitle")} description={t("editorNotFoundBody")} />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {activity.syncState === "STALE" ? <RevisionConflict activity={activity} /> : null}
      <AuthoringPanel
        activity={activity}
        attachments={activity.attachments}
        filePolicy={initialLearning.filePolicy}
        canPublish={policy.canChangeLifecycle}
        canUpload={policy.canUpload}
      />
    </div>
  );
}

export function ActivityCreateContent({
  initialLearning,
  sectionId,
  activityType,
}: {
  initialLearning?: ClassLearningViewModel;
  sectionId?: string;
  activityType?: CreatableActivityType;
}) {
  const t = useTranslations("learning");
  const { activeClass } = useClassContext();
  const policy = learningUiPolicy(activeClass?.capabilities);
  const learningMatchesClass = !initialLearning || learningBelongsToClass(initialLearning, activeClass?.id);
  const section = learningMatchesClass ? initialLearning?.sections.find((item) => item.id === sectionId) : undefined;

  if (!activeClass) return null;
  if (!policy.canEditActivity) return <EmptyState title={t("editorForbiddenTitle")} description={t("editorForbiddenBody")} />;
  if (!learningMatchesClass) return <EmptyState title={t("contextMismatchTitle")} description={t("contextMismatchBody")} />;
  if (!initialLearning) {
    return <div className="mx-auto max-w-5xl space-y-6"><PageHeader eyebrow={t("manageMode")} title={t("createEditorTitle")} description={t("createEditorBodyFallback")} /><DependencyState /></div>;
  }
  if (!section || !activityType) return <EmptyState title={t("createContextTitle")} description={t("createContextBody")} />;

  const draftActivity: LearningActivityViewModel = {
    id: `new-${activityType.toLocaleLowerCase("en-US")}`,
    type: activityType,
    title: "",
    summary: "",
    lifecycle: "DRAFT",
    revision: 1,
    availability: { state: "UNAVAILABLE" },
    content: [],
    attachments: [],
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AuthoringPanel
        activity={draftActivity}
        attachments={[]}
        filePolicy={initialLearning.filePolicy}
        canPublish={false}
        canUpload={policy.canUpload}
        intent="create"
        sectionTitle={section.title}
      />
    </div>
  );
}

function UnsavedOrderNotice() {
  const t = useTranslations("learning");
  return (
    <div role="status" className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-heading text-sm font-semibold">{t("orderUnsavedTitle")}</p><p id="learning-order-pending" className="mt-1 text-sm text-muted-foreground">{t("orderUnsavedBody")}</p></div></div>
      <Button type="button" className="min-h-11" disabled aria-describedby="learning-order-pending"><Save className="size-4" aria-hidden="true" />{t("saveOrder")}</Button>
    </div>
  );
}

function useUnsavedChangesWarning(active: boolean) {
  const t = useTranslations("learning");
  const message = t("unsavedNavigationWarning");

  useEffect(() => {
    if (!active) return;

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = true;
    }

    function confirmLinkNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.href === window.location.href || window.confirm(message)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", confirmLinkNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", confirmLinkNavigation, true);
    };
  }, [active, message]);
}

function DependencyState() {
  const t = useTranslations("learning");
  const dependencies = [
    { icon: BookOpen, title: t("dependencyContentTitle"), body: t("dependencyContentBody") },
    { icon: ShieldCheck, title: t("dependencyRevisionTitle"), body: t("dependencyRevisionBody") },
    { icon: Paperclip, title: t("dependencyFileTitle"), body: t("dependencyFileBody") },
  ];
  return (
    <section aria-labelledby="learning-dependency-title" className="grid gap-4">
      <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
          <div><h2 id="learning-dependency-title" className="font-heading font-semibold">{t("dependencyTitle")}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("dependencyBody")}</p></div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {dependencies.map(({ icon: Icon, title, body }) => (
          <article key={title} className="rounded-xl border bg-card p-5"><Icon className="size-5 text-primary" aria-hidden="true" /><h3 className="mt-3 font-heading text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></article>
        ))}
      </div>
    </section>
  );
}

function LearningSummary({ learning, sections, mode }: { learning: ClassLearningViewModel; sections: LearningSectionViewModel[]; mode: LearningMode }) {
  const t = useTranslations("learning");
  const activities = sections.flatMap((section) => section.activities);
  const published = activities.filter((activity) => activity.lifecycle === "PUBLISHED").length;
  return (
    <section aria-label={t("summaryLabel")} className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-3">
      <SummaryItem label={t("sectionCount")} value={String(sections.length)} />
      <SummaryItem label={mode === "preview" ? t("publishedCount") : t("activityCount")} value={String(mode === "preview" ? published : activities.length)} />
      <SummaryItem label={t("updatedLabel")} value={formatLearningDate(learning.updatedAt, learning.timeZone)} last />
    </section>
  );
}

function SummaryItem({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return <div className={`p-4 sm:px-5 ${last ? "" : "border-b sm:border-b-0 sm:border-r"}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 font-heading text-sm font-semibold">{value}</p></div>;
}

function CourseOutline({
  sections,
  selectedActivityId,
  mode,
  canManage,
  canReorder,
  orderMode,
  orderDirty,
  onSelect,
  onStartOrder,
  onCancelOrder,
  onMoveSection,
  onMoveActivity,
}: {
  sections: LearningSectionViewModel[];
  selectedActivityId?: string;
  mode: LearningMode;
  canManage: boolean;
  canReorder: boolean;
  orderMode: boolean;
  orderDirty: boolean;
  onSelect: (activityId: string) => void;
  onStartOrder: () => void;
  onCancelOrder: () => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onMoveActivity: (activityId: string, direction: "up" | "down") => void;
}) {
  const t = useTranslations("learning");
  return (
    <aside className="min-w-0 self-start rounded-xl border bg-card" aria-labelledby="course-outline-title">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h2 id="course-outline-title" className="font-heading font-semibold">{t("outlineTitle")}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{orderMode ? t("outlineOrderBody") : mode === "preview" ? t("outlinePreviewBody") : t("outlineLearnBody")}</p>
        </div>
        {canReorder && sections.length > 0 ? (
          <Button type="button" variant="outline" className="min-h-11 shrink-0 self-start" onClick={orderMode ? onCancelOrder : onStartOrder}>
            {orderMode ? <X className="size-4" aria-hidden="true" /> : <ListOrdered className="size-4" aria-hidden="true" />}
            {orderMode ? t("cancelOrder") : t("editOrder")}
          </Button>
        ) : null}
      </div>
      {sections.length === 0 ? <div className="p-4"><EmptyState title={t("outlineEmptyTitle")} description={t("outlineEmptyBody")} /></div> : (
        <ol className="divide-y">
          {sections.map((section, sectionIndex) => (
            <li key={section.id} className="p-4 sm:p-5">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{t("sectionPosition", { position: sectionIndex + 1 })}</p><h3 className="mt-1 break-words font-heading text-sm font-semibold">{section.title}</h3>{section.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.description}</p> : null}</div>
                {canReorder && orderMode ? (
                  <OrderButtons
                    groupLabel={t("sectionOrderGroup", { title: section.title })}
                    upLabel={t("moveSectionUp", { title: section.title })}
                    downLabel={t("moveSectionDown", { title: section.title })}
                    canMoveUp={sectionIndex > 0}
                    canMoveDown={sectionIndex < sections.length - 1}
                    onMove={(direction) => onMoveSection(section.id, direction)}
                  />
                ) : canManage ? (
                  <div className="flex shrink-0 flex-wrap gap-1">
                    <SectionDraftDialog section={section} />
                    <SectionDeleteConfirmation section={section} />
                  </div>
                ) : null}
              </div>
              {section.activities.length === 0 ? <p className="mt-4 rounded-lg border border-dashed bg-muted/20 p-3 text-center text-sm font-medium text-muted-foreground">{t("sectionEmpty")}</p> : (
                <ol className="mt-4 grid gap-2">
                  {section.activities.map((activity, activityIndex) => {
                    const selected = activity.id === selectedActivityId;
                    return (
                      <li key={activity.id} className="min-w-0">
                        {canReorder && orderMode ? (
                          <div className={`flex min-h-14 w-full min-w-0 items-center justify-between gap-2 rounded-lg border px-3 py-2 ${selected ? "border-primary/40 bg-primary/10" : "border-transparent bg-muted/35"}`}>
                            <ActivityOutlineLabel activity={activity} mode={mode} selected={selected} />
                            <OrderButtons
                              groupLabel={t("activityOrderGroup", { title: activity.title })}
                              upLabel={t("moveUp", { title: activity.title })}
                              downLabel={t("moveDown", { title: activity.title })}
                              canMoveUp={activityIndex > 0}
                              canMoveDown={activityIndex < section.activities.length - 1}
                              onMove={(direction) => onMoveActivity(activity.id, direction)}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelect(activity.id)}
                            aria-current={selected ? "true" : undefined}
                            className={`flex min-h-14 w-full min-w-0 items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${selected ? "border-primary/40 bg-primary/10" : "border-transparent bg-muted/35 hover:border-border hover:bg-muted"}`}
                          >
                            <ActivityOutlineLabel activity={activity} mode={mode} selected={selected} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
              {canManage && !orderMode ? <div className="mt-4"><ActivityDraftDialog section={section} /></div> : null}
            </li>
          ))}
        </ol>
      )}
      {canManage && !orderMode ? <div className="border-t p-4 sm:p-5"><SectionDraftDialog /></div> : null}
      {canReorder && orderMode && orderDirty ? <div className="border-t p-4 sm:p-5"><UnsavedOrderNotice /></div> : null}
    </aside>
  );
}

function ActivityOutlineLabel({ activity, mode, selected }: { activity: LearningActivityViewModel; mode: LearningMode; selected: boolean }) {
  const t = useTranslations("learning");
  return (
    <span className="flex min-w-0 items-start gap-3">
      <ActivityIcon type={activity.type} className={`mt-0.5 size-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
      <span className="min-w-0">
        <span className="block break-words text-sm font-semibold leading-5">{activity.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{activityTypeLabel(activity.type, t)}</span><span aria-hidden="true">·</span><span>{t(`lifecycle.${activity.lifecycle}`)}</span>
          {mode === "learn" && activity.availability.state !== "AVAILABLE" ? <><span aria-hidden="true">·</span><span>{t(`availability.${activity.availability.state}`)}</span></> : null}
        </span>
      </span>
    </span>
  );
}

function OrderButtons({ groupLabel, upLabel, downLabel, canMoveUp, canMoveDown, onMove }: { groupLabel: string; upLabel: string; downLabel: string; canMoveUp: boolean; canMoveDown: boolean; onMove: (direction: "up" | "down") => void }) {
  const upRef = useRef<HTMLButtonElement>(null);
  const downRef = useRef<HTMLButtonElement>(null);
  const pendingDirection = useRef<"up" | "down" | undefined>(undefined);

  useEffect(() => {
    if (!pendingDirection.current) return;
    const preferredButton = pendingDirection.current === "up"
      ? (canMoveUp ? upRef.current : downRef.current)
      : (canMoveDown ? downRef.current : upRef.current);
    preferredButton?.focus();
    pendingDirection.current = undefined;
  });

  function move(direction: "up" | "down") {
    pendingDirection.current = direction;
    onMove(direction);
  }

  return (
    <div className="flex shrink-0 gap-2" role="group" aria-label={groupLabel}>
      <button ref={upRef} type="button" onClick={() => move("up")} disabled={!canMoveUp} aria-label={upLabel} className="grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35"><ArrowUp className="size-4" aria-hidden="true" /></button>
      <button ref={downRef} type="button" onClick={() => move("down")} disabled={!canMoveDown} aria-label={downLabel} className="grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35"><ArrowDown className="size-4" aria-hidden="true" /></button>
    </div>
  );
}

function ActivityDraftDialog({ section }: { section: LearningSectionViewModel }) {
  const t = useTranslations("learning");
  const router = useRouter();
  const { activeClass } = useClassContext();
  const fieldId = useId();

  function openCreatePage(value: string | null) {
    if (!activeClass || (value !== "MATERIAL" && value !== "ASSIGNMENT")) return;
    router.push(`/app/classes/${encodeURIComponent(activeClass.id)}/learning/activities/new?sectionId=${encodeURIComponent(section.id)}&type=${value}`);
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-auto min-h-14 w-full border-dashed py-3 text-primary" aria-label={t("addActivityTo", { title: section.title })} />}>
        <Plus className="size-4" aria-hidden="true" />{t("addActivity")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-12">
          <DialogTitle>{t("createActivityTitle")}</DialogTitle>
          <DialogDescription>{t("createActivityBody", { section: section.title })}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={t("closeActivityDialog")} />}>
          <X className="size-4" aria-hidden="true" />
        </DialogClose>
        <div className="grid gap-4">
          <div role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div><p className="font-heading text-sm font-semibold">{t("activityTypePromptTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("activityTypePromptBody")}</p></div>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor={fieldId} className="text-sm font-medium">{t("activityTypeLabel")}</label>
            <select
              id={fieldId}
              defaultValue=""
              onChange={(event) => openCreatePage(event.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>{t("activityTypePlaceholder")}</option>
              <option value="MATERIAL">{t("types.MATERIAL")}</option>
              <option value="ASSIGNMENT">{t("types.ASSIGNMENT")}</option>
            </select>
            <p className="text-xs leading-5 text-muted-foreground">{t("activityTypeHelp")}</p>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" className="min-h-11" />}>{t("cancel")}</DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionDraftDialog({ section }: { section?: LearningSectionViewModel }) {
  const t = useTranslations("learning");
  const fieldId = useId();
  const descriptionId = useId();
  const pendingId = useId();
  const [title, setTitle] = useState(section?.title ?? "");
  const [description, setDescription] = useState(section?.description ?? "");
  const [dirty, setDirty] = useState(false);
  const editing = Boolean(section);

  return (
    <Dialog>
      <DialogTrigger
        render={editing ? (
          <Button type="button" variant="ghost" className="min-h-11 px-3" aria-label={t("editSectionLabel", { title: section!.title })} />
        ) : (
          <Button type="button" variant="outline" className="min-h-16 w-full border-dashed text-primary" />
        )}
      >
        {editing ? <PencilLine className="size-4" aria-hidden="true" /> : <Plus className="size-5" aria-hidden="true" />}
        {editing ? t("editSection") : t("addSection")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader className="pr-12">
          <DialogTitle>{editing ? t("editSectionTitle") : t("createSectionTitle")}</DialogTitle>
          <DialogDescription>{editing ? t("editSectionBody") : t("createSectionBody")}</DialogDescription>
        </DialogHeader>
        <DialogClose render={<Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 size-11" aria-label={t("closeSectionDialog")} />}>
          <X className="size-4" aria-hidden="true" />
        </DialogClose>
        <form onSubmit={(event) => event.preventDefault()} className="grid gap-4" noValidate>
          <div id={pendingId} role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
              <div><p className="font-heading text-sm font-semibold">{t("sectionCommandPendingTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("sectionCommandPendingBody")}</p></div>
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor={fieldId} className="text-sm font-medium">{t("sectionTitleLabel")}</label>
            <Input id={fieldId} value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} className="h-11" aria-describedby={pendingId} />
          </div>
          <div className="grid gap-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">{t("sectionDescriptionLabel")} <span className="font-normal text-muted-foreground">{t("optionalLabel")}</span></label>
            <Textarea id={descriptionId} value={description} onChange={(event) => { setDescription(event.target.value); setDirty(true); }} rows={3} aria-describedby={`${descriptionId}-help ${pendingId}`} />
            <p id={`${descriptionId}-help`} className="text-xs leading-5 text-muted-foreground">{t("sectionDescriptionHelp")}</p>
          </div>
          {dirty ? <p role="status" className="text-sm font-semibold text-primary">{t("localChanges")}</p> : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" className="min-h-11" />}>{t("cancel")}</DialogClose>
            <Button type="submit" className="min-h-11" disabled aria-describedby={pendingId}><Save className="size-4" aria-hidden="true" />{t("saveSection")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SectionDeleteConfirmation({ section }: { section: LearningSectionViewModel }) {
  const t = useTranslations("learning");
  const pendingId = useId();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="destructive" className="min-h-11 px-3" aria-label={t("deleteSectionLabel", { title: section.title })} />}>
        <Trash2 className="size-4" aria-hidden="true" />{t("deleteSection")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia><Trash2 className="text-destructive" aria-hidden="true" /></AlertDialogMedia>
          <AlertDialogTitle>{t("deleteSectionTitle")}</AlertDialogTitle>
          <AlertDialogDescription id={pendingId}>{t("deleteSectionBody", { title: section.title })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled aria-describedby={pendingId}>{t("deleteSectionAction")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ActivityDetail({
  activity,
  mode,
  timeZone,
  editHref,
  submissionHref,
}: {
  activity: LearningActivityViewModel;
  mode: LearningMode;
  timeZone: string;
  editHref?: string;
  submissionHref?: string;
}) {
  const t = useTranslations("learning");
  const blocked = mode === "learn" && activity.availability.state !== "AVAILABLE";
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-labelledby="activity-detail-title">
      <header className="border-b p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{activityTypeLabel(activity.type, t)}</Badge>
          {mode === "preview" ? <Badge variant="outline" className={lifecycleStyles[activity.lifecycle]}>{t(`lifecycle.${activity.lifecycle}`)}</Badge> : null}
          <Badge variant="outline">{t("revision", { revision: activity.revision })}</Badge>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 id="activity-detail-title" className="break-words font-heading text-xl font-semibold tracking-tight sm:text-2xl">{activity.title}</h2>
          {editHref ? (
            <Link href={editHref} className={buttonVariants({ variant: "outline", className: "min-h-11 shrink-0 self-start" })} aria-label={t("editActivityLabel", { title: activity.title })}>
              <PencilLine className="size-4" aria-hidden="true" />{t("editActivity")}
            </Link>
          ) : null}
        </div>
        {activity.summary ? <p className="mt-2 max-w-[72ch] text-sm leading-6 text-muted-foreground">{activity.summary}</p> : null}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {activity.durationMinutes ? <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden="true" />{t("duration", { minutes: activity.durationMinutes })}</span> : null}
          {activity.dueAt ? <span className="inline-flex items-center gap-1.5"><CalendarClock className="size-4" aria-hidden="true" />{t("due", { date: formatLearningDate(activity.dueAt, timeZone) })}</span> : null}
          {activity.cutoffAt ? <span className="inline-flex items-center gap-1.5"><LockKeyhole className="size-4" aria-hidden="true" />{t("cutoff", { date: formatLearningDate(activity.cutoffAt, timeZone) })}</span> : null}
        </div>
        {submissionHref ? (
          <Link href={submissionHref} className={buttonVariants({ className: "mt-5 min-h-11" })}>
            <Send className="size-4" aria-hidden="true" />{t("openSubmission")}
          </Link>
        ) : null}
      </header>

      {blocked ? (
        <UnavailableActivity activity={activity} timeZone={timeZone} />
      ) : (
        <div className="space-y-8 p-5 sm:p-6">
          <StructuredContent blocks={activity.content} />
          <AttachmentList attachments={activity.attachments} mode={mode} />
        </div>
      )}
    </article>
  );
}

function RevisionConflict({ activity }: { activity: LearningActivityViewModel }) {
  const t = useTranslations("learning");
  return (
    <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" /><div><h3 className="font-heading text-sm font-semibold">{t("conflictTitle")}</h3><p id="learning-conflict-pending" className="mt-1 text-sm leading-6 text-muted-foreground">{t("conflictBody", { current: activity.revision, latest: activity.latestRevision ?? activity.revision })}</p></div></div>
      <Button type="button" variant="outline" className="mt-4 min-h-11" disabled aria-describedby="learning-conflict-pending">{t("reviewLatest")}</Button>
    </div>
  );
}

function UnavailableActivity({ activity, timeZone }: { activity: LearningActivityViewModel; timeZone: string }) {
  const t = useTranslations("learning");
  const availability = activity.availability;
  return (
    <div className="p-5 sm:p-6">
      <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <LockKeyhole className="size-6 text-amber-600 dark:text-amber-300" aria-hidden="true" />
        <h3 className="mt-3 font-heading font-semibold">{t(`availabilityTitles.${availability.state}`)}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{availability.reason ?? t("availabilityFallback")}</p>
        {availability.prerequisiteLabel ? <p className="mt-3 text-sm"><span className="font-semibold">{t("prerequisiteLabel")}</span> {availability.prerequisiteLabel}</p> : null}
        {availability.availableAt ? <p className="mt-3 text-sm"><span className="font-semibold">{t("availableAtLabel")}</span> {formatLearningDate(availability.availableAt, timeZone)}</p> : null}
      </div>
    </div>
  );
}

function AttachmentList({ attachments, mode }: { attachments: LearningAttachmentViewModel[]; mode: LearningMode }) {
  const t = useTranslations("learning");
  if (attachments.length === 0) return null;
  return (
    <section aria-labelledby="activity-attachments-title">
      <div className="flex items-center gap-2"><Paperclip className="size-4 text-primary" aria-hidden="true" /><h3 id="activity-attachments-title" className="font-heading font-semibold">{t("attachmentsTitle")}</h3></div>
      <div className="mt-3 grid gap-3">
        {attachments.map((attachment) => (
          <article key={attachment.id} className="flex min-w-0 flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-5" aria-hidden="true" /></span><div className="min-w-0"><h4 className="break-all text-sm font-semibold">{attachment.name}</h4><p className="mt-1 text-xs text-muted-foreground">{formatFileSize(attachment.sizeBytes)} · {attachment.mimeType}</p>{attachment.statusReason ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{attachment.statusReason}</p> : null}</div></div>
            <div className="flex shrink-0 flex-wrap items-center gap-2"><Badge variant="outline" className={fileStateStyles[attachment.state]}>{t(`fileStates.${attachment.state}`)}</Badge>{mode === "learn" ? <Button type="button" variant="outline" className="min-h-11" disabled aria-describedby="learning-file-access-pending">{attachment.state === "EXPIRED" ? t("requestAccess") : t("openFile")}</Button> : null}</div>
          </article>
        ))}
      </div>
      {mode === "learn" ? <p id="learning-file-access-pending" className="mt-2 text-xs leading-5 text-muted-foreground">{t("fileAccessPending")}</p> : null}
    </section>
  );
}

function AuthoringPanel({ activity, attachments, filePolicy, canPublish, canUpload, intent = "edit", sectionTitle }: { activity: LearningActivityViewModel; attachments: LearningAttachmentViewModel[]; filePolicy?: FileSelectionPolicyViewModel; canPublish: boolean; canUpload: boolean; intent?: "create" | "edit"; sectionTitle?: string }) {
  const t = useTranslations("learning");
  const [title, setTitle] = useState(activity.title);
  const [summary, setSummary] = useState(activity.summary ?? "");
  const [dirty, setDirty] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [fileResult, setFileResult] = useState<FileSelectionResult>();
  const lifecycleAction = activity.lifecycle === "PUBLISHED" ? "withdraw" : "publish";
  useUnsavedChangesWarning(dirty || Boolean(selectedFile));

  function selectFile(file?: File) {
    setSelectedFile(file);
    setFileResult(file && filePolicy ? validateFileSelection(file, filePolicy) : undefined);
  }

  return (
    <section className="space-y-6 rounded-xl border bg-card p-5 sm:p-6" aria-labelledby="authoring-panel-title">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{t("manageMode")}</p><h1 id="authoring-panel-title" className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">{intent === "create" ? t("createEditorTitle") : t("editorTitle")}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{intent === "create" ? t("createEditorBody", { section: sectionTitle ?? "-" }) : t("editorBody")}</p></div>
        <div className="flex shrink-0 flex-wrap gap-2"><Badge variant="outline">{activityTypeLabel(activity.type, t)}</Badge><Badge variant="outline" className={lifecycleStyles[activity.lifecycle]}>{t(`lifecycle.${activity.lifecycle}`)}</Badge>{intent === "edit" ? <Badge variant="outline">{t("revision", { revision: activity.revision })}</Badge> : null}</div>
      </div>
      <div id="learning-authoring-pending" role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" /><div><p className="font-heading text-sm font-semibold">{t("commandPendingTitle")}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{t("commandPendingBody")}</p></div></div></div>
      <form onSubmit={(event) => event.preventDefault()} className="grid gap-4" noValidate>
        <div className="grid gap-2"><label htmlFor={`learning-title-${activity.id}`} className="text-sm font-medium">{t("titleLabel")}</label><Input id={`learning-title-${activity.id}`} value={title} onChange={(event) => { setTitle(event.target.value); setDirty(true); }} className="h-11" aria-describedby="learning-authoring-pending" /></div>
        <div className="grid gap-2"><label htmlFor={`learning-summary-${activity.id}`} className="text-sm font-medium">{t("summaryFieldLabel")}</label><Textarea id={`learning-summary-${activity.id}`} value={summary} onChange={(event) => { setSummary(event.target.value); setDirty(true); }} rows={4} aria-describedby="learning-authoring-pending" /></div>
        {dirty ? <p role="status" className="text-sm font-semibold text-primary">{t("localChanges")}</p> : null}
        <div className="flex flex-wrap justify-end gap-2">
          {canPublish ? <LifecycleConfirmation action={lifecycleAction} activityTitle={activity.title} /> : null}
          <Button type="submit" className="min-h-11" disabled aria-describedby="learning-authoring-pending"><Save className="size-4" aria-hidden="true" />{t("saveDraft")}</Button>
        </div>
      </form>
      <section className="rounded-xl border bg-muted/20 p-4 sm:p-5" aria-labelledby="structured-editor-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h4 id="structured-editor-title" className="font-heading text-sm font-semibold">{t("structuredEditorTitle")}</h4><p id="structured-editor-pending" className="mt-1 text-xs leading-5 text-muted-foreground">{t("structuredEditorBody", { count: activity.content.length })}</p></div><Badge variant="outline">{t("blockCount", { count: activity.content.length })}</Badge></div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("blockToolsLabel")}>
          {[t("blockParagraph"), t("blockHeading"), t("blockList"), t("blockLink")].map((label) => <Button key={label} type="button" variant="outline" className="min-h-11" disabled aria-describedby="structured-editor-pending"><Plus className="size-4" aria-hidden="true" />{label}</Button>)}
        </div>
      </section>
      <AttachmentList attachments={attachments} mode="preview" />
      {canUpload && filePolicy ? <FilePicker policy={filePolicy} selectedFile={selectedFile} result={fileResult} onSelect={selectFile} /> : null}
    </section>
  );
}

function LifecycleConfirmation({ action, activityTitle }: { action: "publish" | "withdraw"; activityTitle: string }) {
  const t = useTranslations("learning");
  const Icon = action === "publish" ? Send : XCircle;
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="outline" className="min-h-11" />}><Icon className="size-4" aria-hidden="true" />{t(`actions.${action}`)}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogMedia><Icon className="size-5" aria-hidden="true" /></AlertDialogMedia><AlertDialogTitle>{t(`confirm.${action}Title`)}</AlertDialogTitle><AlertDialogDescription>{t(`confirm.${action}Body`, { title: activityTitle })}</AlertDialogDescription></AlertDialogHeader>
        <p id={`learning-${action}-pending`} className="rounded-lg bg-amber-500/10 p-3 text-xs leading-5 text-amber-900 dark:text-amber-100">{t("confirm.disabled")}</p>
        <AlertDialogFooter><AlertDialogCancel className="min-h-11">{t("cancel")}</AlertDialogCancel><AlertDialogAction className="min-h-11" disabled aria-describedby={`learning-${action}-pending`}>{t(`actions.${action}`)}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FilePicker({ policy, selectedFile, result, onSelect }: { policy: FileSelectionPolicyViewModel; selectedFile?: File; result?: FileSelectionResult; onSelect: (file?: File) => void }) {
  const t = useTranslations("learning");
  const accept = [...policy.allowedMimeTypes, ...policy.allowedExtensions].join(",");
  return (
    <section className="rounded-xl border bg-muted/20 p-4 sm:p-5" aria-labelledby="file-picker-title">
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Upload className="size-5" aria-hidden="true" /></span><div><h4 id="file-picker-title" className="font-heading text-sm font-semibold">{t("uploadTitle")}</h4><p id="file-policy-help" className="mt-1 text-xs leading-5 text-muted-foreground">{t("uploadPolicy", { size: formatFileSize(policy.maxBytes), types: policy.allowedExtensions.join(", ") })}</p></div></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="grid gap-2"><label htmlFor="learning-file-picker" className="text-sm font-medium">{t("chooseFile")}</label><Input id="learning-file-picker" type="file" accept={accept} className="h-11 cursor-pointer file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold" aria-describedby="file-policy-help learning-file-validation learning-authoring-pending" onChange={(event) => onSelect(event.target.files?.[0])} /></div>
        <Button type="button" className="min-h-11" disabled aria-describedby="learning-authoring-pending"><Upload className="size-4" aria-hidden="true" />{t("uploadAction")}</Button>
      </div>
      <div id="learning-file-validation" aria-live="polite" className="mt-3">
        {selectedFile ? <p className="break-all text-sm"><span className="font-semibold">{selectedFile.name}</span> <span className="text-muted-foreground">({formatFileSize(selectedFile.size)})</span></p> : null}
        {result?.valid ? <p className="mt-1 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="size-4" aria-hidden="true" />{t("fileAdvisoryValid")}</p> : null}
        {result && !result.valid ? <p role="alert" className="mt-1 flex items-center gap-2 text-xs text-destructive"><CircleAlert className="size-4" aria-hidden="true" />{t(`fileErrors.${result.reason}`)}</p> : null}
      </div>
    </section>
  );
}

function ActivityIcon({ type, className }: { type: string; className?: string }) {
  const normalized = type.toLocaleUpperCase("en-US");
  if (normalized === "MATERIAL") return <FileText className={className} aria-hidden="true" />;
  if (normalized === "ASSIGNMENT") return <PencilLine className={className} aria-hidden="true" />;
  if (normalized === "LINK") return <Link2 className={className} aria-hidden="true" />;
  return <FileQuestion className={className} aria-hidden="true" />;
}

function activityTypeLabel(type: string, t: ReturnType<typeof useTranslations<"learning">>): string {
  const normalized = type.toLocaleUpperCase("en-US");
  if (normalized === "MATERIAL") return t("types.MATERIAL");
  if (normalized === "ASSIGNMENT") return t("types.ASSIGNMENT");
  if (normalized === "LINK") return t("types.LINK");
  return t("types.UNKNOWN");
}
