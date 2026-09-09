import type { components } from "./generated";

export type ActorContext = components["schemas"]["Actor"] & {
  display_name?: string;
  account_state?: "ACTIVE" | "DISABLED" | "LOCKED";
  site_capabilities?: string[];
  session_expires_at?: string;
};

export type ClassAccessSummary = components["schemas"]["Class"] & {
  contextual_roles?: Array<"teacher" | "student" | "facilitator" | "mentor">;
  capabilities?: string[];
  enrollment_state?: "ACTIVE" | "SUSPENDED" | "ENDED";
  next_actions?: string[];
};

export interface Page<T> {
  items: T[];
  next_cursor?: string;
  sort?: string;
  filters?: Record<string, string | number | boolean | undefined>;
}

export interface ResourceVersion {
  version?: number;
  etag?: string;
}

export interface CommandReceipt extends ResourceVersion {
  operation_id: string;
  status: "ACCEPTED" | "COMPLETED" | "REJECTED" | "REPLAYED";
  affected_resource?: { type: string; id: string };
  replay?: boolean;
  job_id?: string;
}

export interface Job {
  id: string;
  status: "queued" | "running" | "succeeded" | "partial" | "failed";
  progress?: number;
  status_url?: string;
  retryable?: boolean;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  request_id?: string;
  field_errors?: Record<string, string[]>;
  current_version?: number;
  retry_after_seconds?: number;
  details?: unknown;
  status: number;
}

export type UnsafeMethod = "POST" | "PUT" | "PATCH" | "DELETE";
