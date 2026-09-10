import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { http, HttpResponse } from "msw";
import { ActorSessionProvider } from "@/lib/auth/provider";
import { classKeys } from "@/lib/auth/query-keys";
import type { ClassAccessSummary } from "@/lib/api/types";
import { ClassContextProvider, useClassContext } from "@/features/workspace/context";
import { actors, classes } from "@/mocks/fixtures";
import { server } from "@/mocks/server";
import messages from "@/messages/id.json";

const navigation = vi.hoisted(() => ({ pathname: "/app", replace: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => navigation }));

afterEach(() => {
  cleanup();
  navigation.pathname = "/app";
  navigation.replace.mockReset();
  navigation.push.mockReset();
});

function Probe() {
  const { activeClass, switchClass } = useClassContext();
  return <div><p>{activeClass?.name}</p><button onClick={() => void switchClass(classes.draft.id)}>Ganti Class</button></div>;
}

function renderContext(client: QueryClient, initialClasses: ClassAccessSummary[] = [classes.published, classes.draft], previewMode = false) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <QueryClientProvider client={client}>
        <ActorSessionProvider initialActor={actors.student} previewMode={previewMode}>
          <ClassContextProvider initialClasses={initialClasses} previewMode={previewMode}><Probe /></ClassContextProvider>
        </ActorSessionProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  );
}

function queryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } } });
}

describe("FE01 Class route context", () => {
  it("uses seeded preview Classes without calling the Class API", async () => {
    let classRequests = 0;
    server.use(http.get("/api/v3/classes/:classId", () => {
      classRequests += 1;
      return HttpResponse.json(classes.published);
    }));
    navigation.pathname = `/app/classes/${classes.published.id}`;

    renderContext(queryClient(), [classes.published, classes.draft], true);
    await Promise.resolve();

    expect(screen.getByText("Product Engineering 2026")).toBeInTheDocument();
    expect(classRequests).toBe(0);
  });

  it("fails closed for an unknown Class in preview mode", () => {
    navigation.pathname = "/app/classes/unknown-preview-class";
    renderContext(queryClient(), [classes.published], true);
    expect(screen.getByText("Class tidak ditemukan")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ganti Class" })).not.toBeInTheDocument();
  });

  it("clears old Class queries and preserves the child route when switching", async () => {
    navigation.pathname = `/app/classes/${classes.published.id}/learning`;
    const client = queryClient();
    client.setQueryData(classKeys.detail(actors.student.id, classes.closed.id), { secret: "old-class" });
    renderContext(client);
    fireEvent.click(screen.getByRole("button", { name: "Ganti Class" }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith(`/app/classes/${classes.draft.id}/learning`));
    expect(client.getQueryData(classKeys.detail(actors.student.id, classes.closed.id))).toBeUndefined();
  });

  it("denies a direct route when its capability is stale or absent", () => {
    navigation.pathname = `/app/classes/${classes.published.id}/learning`;
    renderContext(queryClient(), [{ ...classes.published, capabilities: ["class.read"] }]);
    expect(screen.getByText("Akses tidak tersedia")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ganti Class" })).not.toBeInTheDocument();
  });

  it("does not invent capabilities when the backend omits them", () => {
    navigation.pathname = `/app/classes/${classes.published.id}`;
    const withoutCapabilities = { ...classes.published, capabilities: undefined };
    renderContext(queryClient(), [withoutCapabilities]);
    expect(screen.getByText("Capability Class belum tersedia")).toBeInTheDocument();
  });

  it("does not render ended participation", () => {
    navigation.pathname = `/app/classes/${classes.archived.id}`;
    renderContext(queryClient(), [classes.archived]);
    expect(screen.getByText("Akses Class tidak aktif")).toBeInTheDocument();
  });
});
