import type { paths } from "@/lib/api/generated";
import { apiRequest } from "@/lib/api/request";
import type { ClassAccessSummary } from "@/lib/api/types";
import { classAccessSummarySchema } from "@/features/contracts/schemas";
import { ApiRequestError } from "@/lib/api/errors";

const classDetailContractPath = "/v3/classes/{class_id}" satisfies keyof paths;

export async function getClassAccess(classId: string, signal?: AbortSignal): Promise<ClassAccessSummary> {
  void classDetailContractPath;
  const response = await apiRequest<unknown>(`/classes/${encodeURIComponent(classId)}`, { signal });
  const parsed = classAccessSummarySchema.safeParse(response);
  if (!parsed.success) {
    throw new ApiRequestError({ code: "CONTRACT_RESPONSE_INVALID", message: "Respons Class tidak sesuai kontrak.", status: 502 });
  }
  return parsed.data;
}
