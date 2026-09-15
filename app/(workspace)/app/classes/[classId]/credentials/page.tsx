import { CredentialsContent } from "@/features/credential/components/credentials-content";
import { credentialBelongsToClass } from "@/features/credential/model";
import { getDevelopmentPreview } from "@/lib/dev-preview/server";

export default async function CredentialsPage({ params }: { params: Promise<{ classId: string }> }) {
  const [{ classId }, preview] = await Promise.all([params, getDevelopmentPreview()]);
  const credential = preview?.classCredentials[classId];
  return <CredentialsContent key={classId} initialCredential={credentialBelongsToClass(credential, classId) ? credential : undefined} />;
}
