import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/footer";

describe("Footer", () => {
  it("renders core navigation links", () => {
    render(<Footer />);
    // These appear exactly once in col1Links
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders all 4 legal page links", () => {
    render(<Footer />);
    // Legal column links — each has a distinct label
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "AI Likeness Policy" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DMCA / Takedowns" })).toBeInTheDocument();
  });

  it("renders the brand mark", () => {
    render(<Footer />);
    // The brand mark renders "memacta" — it appears once as the heading text
    const brandLinks = screen.getAllByText("memacta");
    expect(brandLinks.length).toBeGreaterThanOrEqual(1);
  });

  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
