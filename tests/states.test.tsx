import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState, ForbiddenState, LoadingState } from "@/components/ui-v3/states";

describe("standard UI states", () => {
  it("exposes loading status", () => { render(<LoadingState />); expect(screen.getByRole("status")).toBeInTheDocument(); });
  it("exposes empty and forbidden messaging", () => { render(<><EmptyState /><ForbiddenState /></>); expect(screen.getByText("Belum ada data")).toBeInTheDocument(); expect(screen.getByText("Akses tidak tersedia")).toBeInTheDocument(); });
});
