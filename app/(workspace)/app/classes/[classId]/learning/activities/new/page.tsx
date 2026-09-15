import { ActivityCreateContent } from "@/features/learning/components/learning-content";
import { creatableActivityTypeSchema, learningBelongsToClass } from "@/features/learning/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function ActivityCreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ sectionId?: string | string[]; type?: string | string[] }>;
}) {
  const [{ classId }, query, preview] = await Promise.all([params, searchParams, getDevelopmentPreview()]);
  const learning = preview?.classLearning[classId];
  const initialLearning = learningBelongsToClass(learning, classId) ? learning : undefined;
  const sectionId = typeof query.sectionId === "string" ? query.sectionId : undefined;
  const parsedType = creatableActivityTypeSchema.safeParse(typeof query.type === "string" ? query.type : undefined);

  return (
    <ActivityCreateContent
      key={`${classId}:${sectionId ?? "missing"}:${parsedType.success ? parsedType.data : "missing"}`}
      initialLearning={initialLearning}
      sectionId={sectionId}
      activityType={parsedType.success ? parsedType.data : undefined}
    />
  );
}
