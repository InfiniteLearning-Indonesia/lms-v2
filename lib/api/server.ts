import type { NextRequest } from "next/server";
import { getUpstreamApiOrigin } from "@/lib/config";

export async function proxyToApi(request: NextRequest, path: string): Promise<Response> {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_MOCK_API === "true") {
    throw new Error("Mock API cannot be enabled in production");
  }

  const upstream = `${getUpstreamApiOrigin()}/v3/${path}`;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  return fetch(upstream, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  });
}
