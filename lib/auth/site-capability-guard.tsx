"use client";

import { ForbiddenState } from "@/components/ui-v3/states";
import { useTranslations } from "next-intl";
import { useActorSession } from "./provider";

export function SiteCapabilityGuard({ capability, children }: { capability: string; children: React.ReactNode }) {
  const { actor } = useActorSession();
  const t = useTranslations("auth");
  if (!actor.site_capabilities?.includes(capability)) {
    return <ForbiddenState description={t("siteCapabilityDenied")} />;
  }
  return children;
}
