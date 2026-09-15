import { ProgressContent } from "@/features/completion/components/progress-content";
import { completionBelongsToClass } from "@/features/completion/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function ProgressPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const completion = preview?.classCompletions[classId];
  return <ProgressContent key={classId} initialCompletion={completionBelongsToClass(completion, classId) ? completion : undefined} />;
}
