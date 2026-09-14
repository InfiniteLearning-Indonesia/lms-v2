import { GradebookContent } from "@/features/gradebook/components/gradebook-content";
import { gradebookBelongsToClass } from "@/features/gradebook/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function GradebookPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const gradebook = preview?.classGradebooks[classId];
  return <GradebookContent key={classId} initialGradebook={gradebookBelongsToClass(gradebook, classId) ? gradebook : undefined} />;
}
