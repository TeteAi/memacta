import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ModelPicker from "../../components/create/model-picker";

describe("ModelPicker", () => {
  it("renders exactly 10 video options and no image model ids", () => {
    render(<ModelPicker mediaType="video" value="kling-3" onChange={() => {}} />);
    const options = screen.getAllByRole("option") as HTMLOptionElement[];
    expect(options.length).toBe(10);
    const values = options.map((o) => o.value);
    const imageIds = [
      "soul-v2",
      "nano-banana-pro",
      "nano-banana-2",
      "wan-25-image",
      "seedream-4",
      "gpt-image-15",
      "flux-kontext",
      "flux-2",
    ];
    for (const id of imageIds) {
      expect(values).not.toContain(id);
    }
  });
});
