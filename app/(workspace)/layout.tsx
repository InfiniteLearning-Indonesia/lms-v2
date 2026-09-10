import { WorkspaceShell } from "@/components/workspace/shell";
import { ClassContextProvider } from "@/features/workspace/context";
import { ActorSessionProvider } from "@/lib/auth/provider";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const preview = await getDevelopmentPreview();
  const previewMode = preview !== undefined;

  return (
    <ActorSessionProvider initialActor={preview?.actor} previewMode={previewMode}>
      <ClassContextProvider initialClasses={preview?.classes} initialClassOverviews={preview?.classOverviews} previewMode={previewMode}>
        <WorkspaceShell>{children}</WorkspaceShell>
      </ClassContextProvider>
    </ActorSessionProvider>
  );
}
