import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/db", () => ({
  prisma: {
    post: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe("app/page.tsx", () => {
  it("renders the text memacta", async () => {
    const { default: Page } = await import("../../app/page");
    const jsx = await Page();
    render(jsx);
    expect(screen.getByText("memacta")).toBeInTheDocument();
  });

  it("renders trending section heading", async () => {
    const { default: Page } = await import("../../app/page");
    const jsx = await Page();
    render(jsx);
    expect(screen.getByText("Trending")).toBeInTheDocument();
  });

  it("renders Start Creating CTA", async () => {
    const { default: Page } = await import("../../app/page");
    const jsx = await Page();
    render(jsx);
    expect(screen.getByText("Start Creating")).toBeInTheDocument();
  });

  it("renders Explore Tools section", async () => {
    const { default: Page } = await import("../../app/page");
    const jsx = await Page();
    render(jsx);
    expect(screen.getByText("Explore Tools")).toBeInTheDocument();
  });
});
