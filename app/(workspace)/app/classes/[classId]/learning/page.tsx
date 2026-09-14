import { LearningContent } from "@/features/learning/components/learning-content";
import { learningBelongsToClass } from "@/features/learning/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function LearningPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const learning = preview?.classLearning[classId];
  const initialLearning = learningBelongsToClass(learning, classId) ? learning : undefined;
  return <LearningContent key={classId} initialLearning={initialLearning} />;
}
