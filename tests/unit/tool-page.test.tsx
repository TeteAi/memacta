import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToolPage } from "../../components/tools/tool-page";

describe("ToolPage", () => {
  it("submits values to /api/generate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "x",
        status: "succeeded",
        url: "https://placehold.co/1.png",
        createdAt: "2026-04-09",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <ToolPage
        tool={{
          id: "test",
          slug: "test",
          name: "Test",
          description: "d",
          category: "identity",
          inputs: [
            { key: "ref", label: "Ref", type: "image" },
            { key: "prompt", label: "Prompt", type: "prompt" },
          ],
          mediaOut: "image",
        }}
      />
    );

    fireEvent.change(screen.getByTestId("input-ref"), {
      target: { value: "https://example.com/a.png" },
    });
    fireEvent.change(screen.getByTestId("input-prompt"), {
      target: { value: "a cat" },
    });
    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/generate");
  });
});
