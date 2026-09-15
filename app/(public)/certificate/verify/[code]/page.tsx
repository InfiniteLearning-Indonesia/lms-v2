import { VerificationContent } from "@/features/credential/components/verification-content";
import { getDevelopmentCredentialVerification } from "@/lib/dev-preview/server";

export default async function CertificateVerificationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const verification = /^[A-Za-z0-9-]{6,120}$/.test(code) ? await getDevelopmentCredentialVerification(code) : undefined;
  return <VerificationContent code={code} verification={verification} />;
}
