"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, LogOut, RefreshCcw, ShieldX, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui-v3/page-header";
import { ApiRequestError } from "@/lib/api/errors";
import { useActorSession } from "@/lib/auth/provider";

type Command = "rotate" | "logout" | "revoke";

export function ProfileContent() {
  const t = useTranslations("profile");
  const { actor, csrfReady, rotate, logout, revokeAll } = useActorSession();
  const [busy, setBusy] = useState<Command>();
  const busyRef = useRef(false);
  const [error, setError] = useState<string>();

  async function run(command: Command, action: () => Promise<void>) {
    if (busyRef.current || !csrfReady) return;
    busyRef.current = true;
    setBusy(command);
    setError(undefined);
    try {
      await action();
    } catch (reason) {
      const requestId = reason instanceof ApiRequestError ? reason.apiError.request_id : undefined;
      setError(requestId ? `${t("commandError")} ${t("requestId", { requestId })}` : t("commandError"));
    } finally {
      busyRef.current = false;
      setBusy(undefined);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><UserRound className="size-4 text-primary" />{t("identityTitle")}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div><p className="text-muted-foreground">ID</p><p className="break-all font-medium">{actor.id}</p></div>
            <div><p className="text-muted-foreground">{t("accountState")}</p><p className="font-medium">{actor.account_state ?? "ACTIVE"}</p></div>
            <div><p className="text-muted-foreground">{t("siteAccess")}</p><p className="font-medium">{actor.site_capabilities?.join(" · ") || t("noSiteCapability")}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><KeyRound className="size-4 text-primary" />{t("sessionTitle")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("sessionDescription")}</p>
            {!csrfReady && <p role="status" className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-800 dark:text-amber-200">{t("csrfPending")}</p>}
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" disabled={!csrfReady || Boolean(busy)} onClick={() => void run("rotate", rotate)}><RefreshCcw className="size-4" />{busy === "rotate" ? t("working") : t("rotate")}</Button>
              <Button variant="outline" disabled={!csrfReady || Boolean(busy)} onClick={() => void run("logout", logout)}><LogOut className="size-4" />{busy === "logout" ? t("working") : t("logout")}</Button>
              <Button variant="destructive" disabled={!csrfReady || Boolean(busy)} onClick={() => void run("revoke", revokeAll)}><ShieldX className="size-4" />{busy === "revoke" ? t("working") : t("revokeAll")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
