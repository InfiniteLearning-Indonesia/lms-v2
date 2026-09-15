import { describe, expect, it } from "vitest";
import {
  classCredentialViewModelSchema,
  credentialBelongsToClass,
  credentialUiPolicy,
  publicCredentialVerificationSchema,
} from "@/features/credential/model";
import { classCredentials, classes, publicCredentialVerifications } from "@/mocks/fixtures";

describe("FE05 credential model", () => {
  it("validates immutable transcript and credential lifecycle fixtures", () => {
    const parsed = classCredentialViewModelSchema.parse(classCredentials.student[classes.published.id]);
    expect(parsed.subjects[0].transcript.version).toBe(1);
    expect(parsed.subjects[0].certificate.state).toBe("NOT_ELIGIBLE");
  });

  it("rejects malformed transcript and public verification timestamps", () => {
    const subject = classCredentials.student[classes.published.id].subjects[0];
    expect(() => classCredentialViewModelSchema.parse({ ...classCredentials.student[classes.published.id], subjects: [{ ...subject, transcript: { ...subject.transcript, version: 0 } }] })).toThrow();
    expect(() => publicCredentialVerificationSchema.parse({ ...publicCredentialVerifications["IL-PE26-SALSA-0012"], issuedAt: "yesterday" })).toThrow();
  });

  it("uses a provisional capability seam and exact Class ancestry", () => {
    expect(credentialUiPolicy(["credentials.read"])).toEqual({ canRead: true, canReleaseTranscript: false, canIssue: false, canRevoke: false, canSupersede: false });
    expect(credentialUiPolicy(["credentials.read", "content.manage"]).canIssue).toBe(true);
    expect(credentialBelongsToClass(classCredentials.student[classes.published.id], classes.published.id)).toBe(true);
    expect(credentialBelongsToClass(classCredentials.student[classes.published.id], classes.draft.id)).toBe(false);
  });

  it("keeps the public projection data-minimal", () => {
    const parsed = publicCredentialVerificationSchema.parse(publicCredentialVerifications["IL-PE26-SALSA-0012"]);
    expect(parsed.state).toBe("VALID");
    expect(parsed).not.toHaveProperty("email");
    expect(parsed).not.toHaveProperty("gradeDisplay");
    expect(parsed).not.toHaveProperty("studentId");
  });
});
