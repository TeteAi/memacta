import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "@/components/nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Nav", () => {
  it("renders all link labels and Sign In button", () => {
    render(<Nav />);
    for (const label of ["Home", "Create", "Effects", "Studio", "Chat", "Library", "Community", "Pricing"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("marks the active link ('/') with font-semibold", () => {
    render(<Nav />);
    const home = screen.getByRole("link", { name: "Home" });
    expect(home.className).toContain("font-semibold");
  });
});
