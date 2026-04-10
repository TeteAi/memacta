import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../../components/ui/button";

describe("Button", () => {
  it("renders as a button element", () => {
    render(<Button>Click</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Button>Click</Button>);
    expect(screen.getByText("Click")).toBeInTheDocument();
  });

  it("applies outline variant with border class", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/border/);
  });
});
