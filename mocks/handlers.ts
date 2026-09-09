import { http, HttpResponse } from "msw";
import { actors, classes } from "./fixtures";

export const handlers = [
  http.get("/api/v3/auth/me", () => HttpResponse.json(actors.student)),
  http.get("/api/v3/classes/:classId", ({ params }) => {
    const value = Object.values(classes).find((item) => item.id === params.classId);
    return value ? HttpResponse.json(value) : HttpResponse.json({ code: "NOT_FOUND", message: "Class tidak ditemukan" }, { status: 404 });
  }),
  http.post("/api/v3/auth/challenge", () => HttpResponse.json({ nonce: "mock-nonce" })),
];
