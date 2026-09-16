import { LogbookContent } from "@/features/logbook/components/logbook-content";
import { logbookBelongsToClass } from "@/features/logbook/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function LogbookPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const logbook = preview?.classLogbooks[classId];
  return <LogbookContent key={classId} initialLogbook={logbookBelongsToClass(logbook, classId) ? logbook : undefined} />;
}
