export const authKeys = {
  all: ["auth"] as const,
  actor: () => [...authKeys.all, "actor"] as const,
};

export const classKeys = {
  all: (actorId: string) => ["actor", actorId, "classes"] as const,
  detail: (actorId: string, classId: string) => [...classKeys.all(actorId), classId] as const,
};
