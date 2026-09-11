import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { addClassParticipant, createClass, editClass, transitionClass, transitionParticipation } from "@/features/classes/api";
import { server } from "@/mocks/server";

describe("Class management typed transport", () => {
  it("uses only the existing same-origin Class endpoints and bodies", async () => {
    const classId = "a".repeat(32);
    const requests: Array<{ path: string; body: unknown }> = [];
    server.use(
      http.post("/api/v3/classes", async ({ request }) => { requests.push({ path: new URL(request.url).pathname, body: await request.json() }); return HttpResponse.json({ id: classId, name: "Class", state: "DRAFT", version: 1 }); }),
      http.patch(`/api/v3/classes/${classId}`, async ({ request }) => { requests.push({ path: new URL(request.url).pathname, body: await request.json() }); return HttpResponse.json({ id: classId, name: "Edited", state: "DRAFT", version: 3 }); }),
      http.post(`/api/v3/classes/${classId}/publish`, async ({ request }) => { requests.push({ path: new URL(request.url).pathname, body: await request.json() }); return HttpResponse.json({ id: classId, name: "Edited", state: "PUBLISHED", version: 4 }); }),
    );

    await createClass({ name: "Class" });
    await editClass(classId, { name: "Edited", version: 2 });
    await transitionClass(classId, "publish", 3);

    expect(requests).toEqual([
      { path: "/api/v3/classes", body: { name: "Class" } },
      { path: `/api/v3/classes/${classId}`, body: { name: "Edited", version: 2 } },
      { path: `/api/v3/classes/${classId}/publish`, body: { version: 3 } },
    ]);
  });

  it("uses opaque Class and identity IDs in participant commands", async () => {
    const classId = "b".repeat(32);
    const userId = "c".repeat(32);
    const paths: string[] = [];
    const bodies: unknown[] = [];
    server.use(
      http.post(`/api/v3/classes/${classId}/participants`, async ({ request }) => { paths.push(new URL(request.url).pathname); bodies.push(await request.json()); return HttpResponse.json({ id: "participation-1" }); }),
      http.post(`/api/v3/classes/${classId}/participants/${userId}/suspend`, async ({ request }) => { paths.push(new URL(request.url).pathname); bodies.push(await request.json()); return HttpResponse.json({ id: "participation-1" }); }),
    );

    await addClassParticipant(classId, userId, "student");
    await transitionParticipation(classId, userId, "suspend");

    expect(paths).toEqual([`/api/v3/classes/${classId}/participants`, `/api/v3/classes/${classId}/participants/${userId}/suspend`]);
    expect(bodies).toEqual([{ user_id: userId, role: "student" }, {}]);
  });
});
