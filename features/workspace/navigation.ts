export type ClassNavKey =
  | "overview"
  | "learning"
  | "people"
  | "submissions"
  | "gradebook"
  | "attendance"
  | "logbook"
  | "credentials"
  | "settings";

type ClassRouteKey = ClassNavKey | "progress";

export interface ClassNavigationItem {
  key: ClassNavKey;
  suffix: string;
  capability: string;
}

interface ClassRoutePolicy {
  key: ClassRouteKey;
  suffix: string;
  capability: string;
}

export const classNavigation: ClassNavigationItem[] = [
  { key: "overview", suffix: "", capability: "class.read" },
  { key: "learning", suffix: "/learning", capability: "content.read" },
  { key: "people", suffix: "/people", capability: "participants.read" },
  { key: "submissions", suffix: "/submissions", capability: "submission.read" },
  { key: "gradebook", suffix: "/gradebook", capability: "gradebook.read" },
  { key: "attendance", suffix: "/attendance", capability: "attendance.read" },
  { key: "logbook", suffix: "/logbook", capability: "logbook.read" },
  { key: "credentials", suffix: "/credentials", capability: "credentials.read" },
  { key: "settings", suffix: "/settings", capability: "class.manage" },
];

const classRoutePolicies: ClassRoutePolicy[] = [
  ...classNavigation,
  { key: "progress", suffix: "/progress", capability: "progress.read" },
];

export function allowedClassNavigation(capabilities: readonly string[] | undefined): ClassNavigationItem[] {
  if (!capabilities) return [];
  const allowed = new Set(capabilities);
  return classNavigation.filter((item) => allowed.has(item.capability));
}

export function requiredCapability(pathname: string, classId: string): string | undefined {
  const base = `/app/classes/${classId}`;
  return classRoutePolicies.find(({ suffix }) => pathname === `${base}${suffix}`)?.capability;
}
