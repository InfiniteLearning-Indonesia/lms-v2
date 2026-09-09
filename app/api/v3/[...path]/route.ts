import { NextRequest } from "next/server";
import { proxyToApi } from "@/lib/api/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  return proxyToApi(request, path.join("/"));
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
