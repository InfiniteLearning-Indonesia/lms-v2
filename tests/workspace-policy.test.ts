import { describe, expect, it } from "vitest";
import { authKeys, classKeys } from "@/lib/auth/query-keys";
import { classIdFromPath } from "@/features/workspace/context";
import { allowedClassNavigation, requiredCapability } from "@/features/workspace/navigation";

describe("FE01 contextual workspace policy", () => {
  it("fails closed when contextual capabilities are absent or unknown", () => {
    expect(allowedClassNavigation(undefined)).toEqual([]);
    expect(allowedClassNavigation(["unknown.future.capability"])).toEqual([]);
  });

  it("maps only known capabilities to Class navigation", () => {
    expect(allowedClassNavigation(["class.read", "content.read", "gradebook.read"]).map((item) => item.key)).toEqual(["overview", "learning", "gradebook"]);
    expect(allowedClassNavigation(["progress.read"])).toEqual([]);
  });

  it("derives context and direct-route requirements from the URL", () => {
    const classId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    expect(classIdFromPath(`/app/classes/${classId}/learning`)).toBe(classId);
    expect(requiredCapability(`/app/classes/${classId}/learning`, classId)).toBe("content.read");
    expect(requiredCapability(`/app/classes/${classId}/progress`, classId)).toBe("progress.read");
    expect(classIdFromPath("/app/profile")).toBeUndefined();
  });

  it("scopes query keys by actor and Class", () => {
    expect(authKeys.actor()).toEqual(["auth", "actor"]);
    expect(classKeys.detail("actor-a", "class-a")).toEqual(["actor", "actor-a", "classes", "class-a"]);
    expect(classKeys.detail("actor-b", "class-a")).not.toEqual(classKeys.detail("actor-a", "class-a"));
  });
});
