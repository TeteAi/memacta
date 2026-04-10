import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EffectsGrid } from "@/components/effects/effects-grid";
import type { Effect } from "@/lib/effects";

vi.mock("next/navigation", () => ({
  usePathname: () => "/effects",
}));

const sample: Effect[] = [
  { id: "a", name: "Alpha FX", thumbnail: "https://placehold.co/1", prompt: "a", category: "effect" },
  { id: "b", name: "Beta FX", thumbnail: "https://placehold.co/2", prompt: "b", category: "effect" },
  { id: "c", name: "Gamma Template", thumbnail: "https://placehold.co/3", prompt: "c", category: "template" },
];

describe("EffectsGrid", () => {
  it("renders all card names", () => {
    render(<EffectsGrid effects={sample} />);
    expect(screen.getByText("Alpha FX")).toBeInTheDocument();
    expect(screen.getByText("Beta FX")).toBeInTheDocument();
    expect(screen.getByText("Gamma Template")).toBeInTheDocument();
  });

  it("filters to templates when Templates tab clicked", () => {
    render(<EffectsGrid effects={sample} />);
    fireEvent.click(screen.getByTestId("filter-template"));
    expect(screen.getByText("Gamma Template")).toBeInTheDocument();
    expect(screen.queryByText("Alpha FX")).not.toBeInTheDocument();
    expect(screen.queryByText("Beta FX")).not.toBeInTheDocument();
  });
});
