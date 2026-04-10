import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Timeline, { type Clip } from "../../components/studio/timeline";

const clips: Clip[] = [
  { id: "c1", prompt: "opening shot", model: "kling-3", durationSec: 5, order: 0 },
  { id: "c2", prompt: "closing shot", model: "sora-2", durationSec: 5, order: 1 },
];

describe("Timeline", () => {
  it("renders all clips with their prompts visible", () => {
    render(<Timeline clips={clips} onDelete={() => {}} onMove={() => {}} />);
    expect(screen.getByText("opening shot")).toBeInTheDocument();
    expect(screen.getByText("closing shot")).toBeInTheDocument();
  });

  it("calls onDelete with clip id when delete is clicked", () => {
    const onDelete = vi.fn();
    render(<Timeline clips={clips} onDelete={onDelete} onMove={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete opening shot" }));
    expect(onDelete).toHaveBeenCalledWith("c1");
  });
});
