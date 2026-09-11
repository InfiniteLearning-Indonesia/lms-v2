import { ClassPeopleContent } from "@/features/classes/components/class-people-content";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function PeoplePage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  return <ClassPeopleContent initialParticipants={preview?.classParticipants[classId]} identityCandidates={preview?.identityCandidates} />;
}
