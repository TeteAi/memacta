import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Nav from "../../components/nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Nav credits display", () => {
  it("shows credits and Sign Out when session is present", () => {
    render(
      <Nav
        session={
          {
            user: {
              id: "u1",
              email: "demo@memacta.app",
              name: "Demo",
              credits: 1000,
            },
          } as any
        }
      />
    );
    expect(screen.getByText("1000 credits")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    for (const label of ["Home", "Create", "Effects", "Studio", "Chat", "Library", "Community", "Pricing"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("shows Sign In when session is null", () => {
    render(<Nav session={null} />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});
