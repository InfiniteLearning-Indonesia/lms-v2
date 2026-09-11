import { z } from "zod";
import type { components } from "@/lib/api/generated";

const utf8Length = (value: string) => new TextEncoder().encode(value).length;
const optionalLabel = z.string().trim().refine((value) => utf8Length(value) <= 200, "Maksimal 200 byte UTF-8.");

export const classDetailsFormSchema = z.object({
  name: z.string().trim().min(1, "Nama Class wajib diisi.").refine((value) => utf8Length(value) <= 200, "Maksimal 200 byte UTF-8."),
  programLabel: optionalLabel,
  cohortLabel: optionalLabel,
});

export const participantFormSchema = z.object({
  userId: z.string().regex(/^[a-f0-9]{32}$/, "Pilih identity yang valid."),
  role: z.enum(["teacher", "student"]),
});

export type ClassDetailsFormValues = z.infer<typeof classDetailsFormSchema>;

export function toCreateClassInput(values: ClassDetailsFormValues): components["schemas"]["CreateClass"] {
  const parsed = classDetailsFormSchema.parse(values);
  return {
    name: parsed.name,
    ...(parsed.programLabel ? { program_label: parsed.programLabel } : {}),
    ...(parsed.cohortLabel ? { cohort_label: parsed.cohortLabel } : {}),
  };
}

export function toEditClassInput(values: ClassDetailsFormValues, version: number): components["schemas"]["EditClass"] {
  return { ...toCreateClassInput(values), version };
}
