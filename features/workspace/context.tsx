"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, ForbiddenState, LoadingState } from "@/components/ui-v3/states";
import { useActorSession } from "@/lib/auth/provider";
import { classKeys } from "@/lib/auth/query-keys";
import { ApiRequestError } from "@/lib/api/errors";
import type { ClassAccessSummary } from "@/lib/api/types";
import { getClassAccess } from "./api";
import { requiredCapability } from "./navigation";
import type { ClassOverviewViewModel } from "./overview";

interface ClassContextValue {
  classId?: string;
  activeClass?: ClassAccessSummary;
  activeClassOverview?: ClassOverviewViewModel;
  availableClasses: ClassAccessSummary[];
  filteredClasses: ClassAccessSummary[];
  classSearch: string;
  setClassSearch: (value: string) => void;
  directoryAvailable: boolean;
  switchClass: (classId: string) => Promise<void>;
}

const ClassContext = createContext<ClassContextValue | undefined>(undefined);
const EMPTY_CLASSES: ClassAccessSummary[] = [];

export function ClassContextProvider({
  children,
  initialClasses,
  initialClassOverviews,
  previewMode = false,
}: {
  children: React.ReactNode;
  initialClasses?: ClassAccessSummary[];
  initialClassOverviews?: Record<string, ClassOverviewViewModel>;
  previewMode?: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("workspace");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { actor } = useActorSession();
  const [classSearch, setClassSearch] = useState("");
  const seededClasses = initialClasses ?? EMPTY_CLASSES;
  const classId = classIdFromPath(pathname);
  const seededClass = seededClasses.find((item) => item.id === classId);
  const classQuery = useQuery({
    queryKey: classKeys.detail(actor.id, classId ?? "none"),
    queryFn: ({ signal }) => getClassAccess(classId as string, signal),
    enabled: classId !== undefined && !previewMode,
    initialData: seededClass,
    retry: false,
  });

  const unauthorized = classQuery.error instanceof ApiRequestError && classQuery.error.apiError.status === 401;
  useEffect(() => {
    if (!unauthorized) return;
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router, unauthorized]);

  const availableClasses = useMemo(() => {
    if (!classQuery.data || seededClasses.some((item) => item.id === classQuery.data?.id)) return seededClasses;
    return [...seededClasses, classQuery.data];
  }, [classQuery.data, seededClasses]);

  const filteredClasses = useMemo(
    () => availableClasses.filter((item) => matchesClassSearch(item, classSearch)),
    [availableClasses, classSearch],
  );

  const value = useMemo<ClassContextValue>(() => ({
    classId,
    activeClass: classQuery.data,
    activeClassOverview: classId ? initialClassOverviews?.[classId] : undefined,
    availableClasses,
    filteredClasses,
    classSearch,
    setClassSearch,
    directoryAvailable: initialClasses !== undefined,
    switchClass: async (nextClassId: string) => {
      if (nextClassId === classId) return;
      const suffix = classPathSuffix(pathname);
      await queryClient.cancelQueries({ queryKey: classKeys.all(actor.id) });
      queryClient.removeQueries({ queryKey: classKeys.all(actor.id) });
      router.push(`/app/classes/${encodeURIComponent(nextClassId)}${suffix}`);
    },
  }), [actor.id, availableClasses, classId, classQuery.data, classSearch, filteredClasses, initialClasses, initialClassOverviews, pathname, queryClient, router]);

  let boundary: React.ReactNode = children;
  if (classId) {
    if (previewMode && !seededClass) {
      boundary = <EmptyState title={t("classNotFoundTitle")} description={t("classNotFoundBody")} />;
    } else if (classQuery.isPending || unauthorized) {
      boundary = <LoadingState label={t("classLoading")} />;
    } else if (classQuery.error instanceof ApiRequestError && classQuery.error.apiError.status === 403) {
      boundary = <ForbiddenState description={withRequestId(t("classForbidden"), classQuery.error, t)} />;
    } else if (classQuery.error instanceof ApiRequestError && classQuery.error.apiError.status === 404) {
      boundary = <EmptyState title={t("classNotFoundTitle")} description={withRequestId(t("classNotFoundBody"), classQuery.error, t)} />;
    } else if (classQuery.error) {
      boundary = <ErrorState title={t("classUnavailableTitle")} description={withRequestId(t("classUnavailableBody"), classQuery.error, t)} onRetry={() => void classQuery.refetch()} />;
    } else if (!classQuery.data?.capabilities) {
      boundary = <EmptyState title={t("capabilityPendingTitle")} description={t("capabilityPendingBody")} />;
    } else if (classQuery.data.enrollment_state && classQuery.data.enrollment_state !== "ACTIVE") {
      boundary = <ForbiddenState title={t("inactiveTitle")} description={t("inactiveBody")} />;
    } else {
      const capability = requiredCapability(pathname, classId);
      if (capability && !classQuery.data.capabilities.includes(capability)) boundary = <ForbiddenState />;
    }
  }

  return <ClassContext.Provider value={value}>{boundary}</ClassContext.Provider>;
}

export function useClassContext(): ClassContextValue {
  const value = useContext(ClassContext);
  if (!value) throw new Error("useClassContext must be used within ClassContextProvider");
  return value;
}

export function classIdFromPath(pathname: string): string | undefined {
  return /^\/app\/classes\/([^/]+)/.exec(pathname)?.[1];
}

export function matchesClassSearch(item: ClassAccessSummary, search: string): boolean {
  const query = search.trim().toLocaleLowerCase("id-ID");
  if (!query) return true;
  return [item.name, item.program_label, item.cohort_label, item.state]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase("id-ID").includes(query));
}

function classPathSuffix(pathname: string): string {
  return /^\/app\/classes\/[^/]+(\/[^/?#]+)?/.exec(pathname)?.[1] ?? "";
}

function withRequestId(fallback: string, error: unknown, t: ReturnType<typeof useTranslations<"workspace">>): string {
  if (!(error instanceof ApiRequestError) || !error.apiError.request_id) return fallback;
  return `${fallback} ${t("requestId", { requestId: error.apiError.request_id })}`;
}
