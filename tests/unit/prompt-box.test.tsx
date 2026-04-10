import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PromptBox from "../../components/create/prompt-box";

describe("PromptBox", () => {
  it("calls onChange with 'cinematic' when Cinematic chip is clicked", () => {
    const mock = vi.fn();
    render(<PromptBox value="a cat" onChange={mock} />);
    fireEvent.click(screen.getByRole("button", { name: "Cinematic" }));
    expect(mock).toHaveBeenCalled();
    const called = mock.mock.calls.some((c) =>
      typeof c[0] === "string" && c[0].toLowerCase().includes("cinematic")
    );
    expect(called).toBe(true);
  });
});
