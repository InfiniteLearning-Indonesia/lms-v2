import createClient from "openapi-fetch";
import type { paths } from "./generated";

/** Typed browser client. It intentionally points only to same-origin routes. */
export const apiClient = createClient<paths>({ baseUrl: "/api" });
