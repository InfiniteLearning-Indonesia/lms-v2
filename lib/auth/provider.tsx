"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { ErrorState, ForbiddenState, LoadingState } from "@/components/ui-v3/states";
import { ApiRequestError } from "@/lib/api/errors";
import { hasCsrfToken, setCsrfToken } from "@/lib/api/request";
import type { ActorContext } from "@/lib/api/types";
import { getActor, logoutSession, revokeAllSessions, rotateSession } from "./api";
import { authKeys } from "./query-keys";
import { publishSessionEvent, subscribeToSessionEvents } from "./session-channel";

interface ActorSessionValue {
  actor: ActorContext;
  previewMode: boolean;
  csrfReady: boolean;
  rotate: () => Promise<void>;
  logout: () => Promise<void>;
  revokeAll: () => Promise<void>;
}

const ActorSessionContext = createContext<ActorSessionValue | undefined>(undefined);

export function ActorSessionProvider({
  children,
  initialActor,
  previewMode = false,
}: {
  children: React.ReactNode;
  initialActor?: ActorContext;
  previewMode?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("auth");
  const queryClient = useQueryClient();
  const actorQuery = useQuery({
    queryKey: authKeys.actor(),
    queryFn: getActor,
    initialData: initialActor,
    enabled: !previewMode,
    retry: false,
  });

  const leaveWorkspace = useCallback(() => {
    setCsrfToken(undefined);
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);

  useEffect(() => subscribeToSessionEvents(leaveWorkspace), [leaveWorkspace]);

  const unauthorized = actorQuery.error instanceof ApiRequestError && actorQuery.error.apiError.status === 401;
  useEffect(() => {
    if (unauthorized) leaveWorkspace();
  }, [leaveWorkspace, unauthorized]);

  const value = useMemo<ActorSessionValue | undefined>(() => {
    if (!actorQuery.data) return undefined;
    return {
      actor: actorQuery.data,
      previewMode,
      csrfReady: previewMode ? false : hasCsrfToken(),
      rotate: async () => {
        rejectPreviewCommand(previewMode);
        try {
          await rotateSession();
          await queryClient.invalidateQueries({ queryKey: authKeys.actor() });
        } catch (error) {
          if (isUnauthorized(error)) leaveWorkspace();
          throw error;
        }
      },
      logout: async () => {
        rejectPreviewCommand(previewMode);
        try {
          await logoutSession();
          publishSessionEvent("logged-out");
          leaveWorkspace();
        } catch (error) {
          if (isUnauthorized(error)) leaveWorkspace();
          throw error;
        }
      },
      revokeAll: async () => {
        rejectPreviewCommand(previewMode);
        try {
          await revokeAllSessions();
          publishSessionEvent("revoked");
          leaveWorkspace();
        } catch (error) {
          if (isUnauthorized(error)) leaveWorkspace();
          throw error;
        }
      },
    };
  }, [actorQuery.data, leaveWorkspace, previewMode, queryClient]);

  if (actorQuery.isPending || unauthorized) {
    return <LoadingState label={t("verifying")} />;
  }

  if (actorQuery.error instanceof ApiRequestError && actorQuery.error.apiError.status === 403) {
    return <ForbiddenState description={requestDescription(t("sessionForbidden"), actorQuery.error, t)} />;
  }

  if (actorQuery.data?.account_state && actorQuery.data.account_state !== "ACTIVE") {
    return <ForbiddenState title={t("accountDisabledTitle")} description={t("accountDisabledBody")} />;
  }

  if (actorQuery.error || !value) {
    return (
      <ErrorState
        title={t("workspaceUnavailableTitle")}
        description={requestDescription(t("workspaceUnavailableBody"), actorQuery.error, t)}
        onRetry={() => void actorQuery.refetch()}
      />
    );
  }

  return <ActorSessionContext.Provider value={value}>{children}</ActorSessionContext.Provider>;
}

export function useActorSession(): ActorSessionValue {
  const value = useContext(ActorSessionContext);
  if (!value) throw new Error("useActorSession must be used within ActorSessionProvider");
  return value;
}

function requestDescription(fallback: string, error: unknown, t: ReturnType<typeof useTranslations<"auth">>): string {
  if (!(error instanceof ApiRequestError) || !error.apiError.request_id) return fallback;
  return `${fallback} ${t("requestId", { requestId: error.apiError.request_id })}`;
}

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiRequestError && error.apiError.status === 401;
}

function rejectPreviewCommand(previewMode: boolean): void {
  if (previewMode) throw new Error("Session command tidak tersedia dalam mode preview development.");
}
