import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/footer";

describe("Footer", () => {
  it("renders all footer links", () => {
    render(<Footer />);
    for (const label of ["About", "Trust", "Privacy", "Terms", "Cookies", "Contact"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("renders the brand mark", () => {
    render(<Footer />);
    expect(screen.getByText("memacta")).toBeInTheDocument();
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
