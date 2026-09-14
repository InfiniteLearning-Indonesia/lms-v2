import { SubmissionsContent } from "@/features/submission/components/submissions-content";
import { submissionBelongsToClass } from "@/features/submission/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function SubmissionsPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const submissions = preview?.classSubmissions[classId];
  return <SubmissionsContent key={classId} initialSubmissions={submissionBelongsToClass(submissions, classId) ? submissions : undefined} />;
}
