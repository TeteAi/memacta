import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PostCard, { type PostCardData } from "@/components/community/post-card";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockFetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({ liked: true }))));

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
});

const mockPost: PostCardData = {
  id: "post-1",
  title: "Amazing Sunset",
  mediaUrl: "https://example.com/sunset.jpg",
  mediaType: "image",
  creatorName: "Demo User",
  likes: 10,
  liked: false,
};

describe("PostCard", () => {
  it("renders title and like count", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Amazing Sunset")).toBeInTheDocument();
    expect(screen.getByTestId("like-count")).toHaveTextContent("10");
  });

  it("renders creator name", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Demo User")).toBeInTheDocument();
  });

  it("calls fetch to /api/community/likes on like button click", async () => {
    render(<PostCard post={mockPost} />);
    const likeBtn = screen.getByRole("button", { name: "Like" });
    fireEvent.click(likeBtn);
    expect(mockFetch).toHaveBeenCalledWith("/api/community/likes", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ postId: "post-1" }),
    }));
  });

  it("increments like count optimistically on click", () => {
    render(<PostCard post={mockPost} />);
    fireEvent.click(screen.getByRole("button", { name: "Like" }));
    expect(screen.getByTestId("like-count")).toHaveTextContent("11");
  });

  it("shows Anonymous when no creator name", () => {
    render(<PostCard post={{ ...mockPost, creatorName: null }} />);
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
  });
});
