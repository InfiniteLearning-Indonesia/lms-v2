import { ActivityEditorContent } from "@/features/learning/components/learning-content";
import { learningBelongsToClass } from "@/features/learning/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function ActivityEditorPage({
  params,
}: {
  params: Promise<{ classId: string; activityId: string }>;
}) {
  const [{ classId, activityId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const learning = preview?.classLearning[classId];
  const initialLearning = learningBelongsToClass(learning, classId) ? learning : undefined;

  return <ActivityEditorContent key={`${classId}:${activityId}`} initialLearning={initialLearning} activityId={activityId} />;
}
