import { AttendanceContent } from "@/features/attendance/components/attendance-content";
import { attendanceBelongsToClass } from "@/features/attendance/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function AttendancePage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const attendance = preview?.classAttendances[classId];
  return <AttendanceContent key={classId} initialAttendance={attendanceBelongsToClass(attendance, classId) ? attendance : undefined} />;
}
