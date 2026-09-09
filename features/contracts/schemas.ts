import { z } from "zod";

export const actorFixtureSchema = z.object({ id: z.string().min(1), display_name: z.string().min(1), site_admin: z.boolean(), account_state: z.enum(["ACTIVE", "DISABLED", "LOCKED"]) });
export const classFixtureSchema = z.object({ id: z.string().min(1), name: z.string().min(1), state: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]), version: z.number().int().positive() });

export function assertFixture<T>(schema: z.ZodType<T>, fixture: unknown): T { return schema.parse(fixture); }
