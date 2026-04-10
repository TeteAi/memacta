import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ClipAdder from "../../components/studio/clip-adder";

describe("ClipAdder", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: "gen-1", status: "succeeded", url: "https://x.test/a.mp4" }),
      }),
    ) as unknown as typeof fetch;
  });

  it("posts to /api/generate and calls onAdd with a clip object", async () => {
    const onAdd = vi.fn();
    render(<ClipAdder onAdd={onAdd} />);
    fireEvent.change(screen.getByLabelText("Clip prompt"), { target: { value: "a cat" } });
    fireEvent.change(screen.getByLabelText("Model"), { target: { value: "kling-3" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Clip" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const args = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(args[0]).toBe("/api/generate");
    });
    await waitFor(() => {
      expect(onAdd).toHaveBeenCalled();
    });
    const clipArg = onAdd.mock.calls[0][0];
    expect(clipArg).toMatchObject({ prompt: "a cat", model: "kling-3" });
    expect(typeof clipArg.id).toBe("string");
  });
});
