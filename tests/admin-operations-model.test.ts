import { describe, expect, it } from "vitest";
import { adminJobSchema, adminMigrationsSchema, canEnterAdminOperations, matchesAdminUser, parseAdminPreviewFixtures } from "@/features/admin/model";
import { adminAudit, adminMigrations, adminReports, adminUsers } from "@/mocks/fixtures";

describe("FE07 admin operations model", () => {
  it("validates every development projection through strict presentation schemas", () => {
    const parsed = parseAdminPreviewFixtures({ users: adminUsers, reports: adminReports, audit: adminAudit, migrations: adminMigrations });
    expect(parsed.users.users).toHaveLength(4);
    expect(parsed.reports.jobs.some((job) => job.state === "partial")).toBe(true);
    expect(parsed.audit.events.every((event) => event.requestId)).toBe(true);
    expect(parsed.migrations.readiness.map((item) => item.dimension)).toEqual(["CODE", "DATA", "OWNERSHIP"]);
    expect(Object.keys(parsed.migrations.evidence)).toEqual([
      "preflight", "backup", "mapping", "reconciliation", "quarantine", "rehearsal", "recovery", "fence", "pilot", "wave", "approval",
    ]);
    expect(parsed.migrations.ownership).toEqual({ writer: "LEGACY", fence: "READ_ONLY", ownerEpochLabel: "epoch-legacy-18" });
  });

  it("fails closed for unknown job and migration states", () => {
    expect(adminJobSchema.safeParse({ ...adminReports.jobs[0], state: "done" }).success).toBe(false);
    expect(adminMigrationsSchema.safeParse({ ...adminMigrations, maintenance: { state: "ACTIVE", detail: "invalid" } }).success).toBe(false);
  });

  it("requires site capability instead of the legacy site_admin boolean", () => {
    expect(canEnterAdminOperations({ site_capabilities: ["site.admin"] })).toBe(true);
    expect(canEnterAdminOperations({ site_capabilities: [] })).toBe(false);
    expect(canEnterAdminOperations({})).toBe(false);
  });

  it("searches only the supplied actor-scoped user projection", () => {
    expect(adminUsers.users.filter((user) => matchesAdminUser(user, "pengajar", "ALL"))).toHaveLength(1);
    expect(adminUsers.users.filter((user) => matchesAdminUser(user, "", "DISABLED"))).toHaveLength(1);
  });
});
