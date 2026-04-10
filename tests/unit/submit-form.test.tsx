import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SubmitForm from "@/components/community/submit-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockFetch = vi.fn(() =>
  Promise.resolve(new Response(JSON.stringify({ id: "new-1" }), { status: 201 }))
);

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
});

describe("SubmitForm", () => {
  it("renders title and media URL inputs", () => {
    render(<SubmitForm />);
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Media URL")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<SubmitForm />);
    expect(screen.getByRole("button", { name: "Submit to Community" })).toBeInTheDocument();
  });

  it("shows error when submitting with empty fields", () => {
    render(<SubmitForm />);
    fireEvent.click(screen.getByRole("button", { name: "Submit to Community" }));
    expect(screen.getByText("Title and media URL are required.")).toBeInTheDocument();
  });

  it("calls fetch to /api/community/posts on valid submit", async () => {
    render(<SubmitForm />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "My Creation" } });
    fireEvent.change(screen.getByLabelText("Media URL"), { target: { value: "https://example.com/img.png" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit to Community" }));

    expect(mockFetch).toHaveBeenCalledWith("/api/community/posts", expect.objectContaining({
      method: "POST",
    }));
  });

  it("renders media type and tool used selects", () => {
    render(<SubmitForm />);
    expect(screen.getByLabelText("Media Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Tool Used")).toBeInTheDocument();
  });
});
