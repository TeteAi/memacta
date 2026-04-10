import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LibraryTabs, { type LibraryItem } from "@/components/library/library-tabs";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockItems: LibraryItem[] = [
  { id: "1", type: "image", title: "Sunset Photo", thumbnail: null, date: "2026-04-01" },
  { id: "2", type: "video", title: "Dance Video", thumbnail: null, date: "2026-04-02" },
  { id: "3", type: "character", title: "Hero Char", thumbnail: null, date: "2026-04-03" },
  { id: "4", type: "project", title: "My Project", thumbnail: null, date: "2026-04-04" },
  { id: "5", type: "image", title: "Portrait", thumbnail: null, date: "2026-04-05" },
];

describe("LibraryTabs", () => {
  it("renders all tabs", () => {
    render(<LibraryTabs items={mockItems} />);
    for (const label of ["All", "Images", "Videos", "Characters", "Projects"]) {
      expect(screen.getByRole("tab", { name: label })).toBeInTheDocument();
    }
  });

  it("shows all items by default (All tab)", () => {
    render(<LibraryTabs items={mockItems} />);
    expect(screen.getByText("Sunset Photo")).toBeInTheDocument();
    expect(screen.getByText("Dance Video")).toBeInTheDocument();
    expect(screen.getByText("Hero Char")).toBeInTheDocument();
    expect(screen.getByText("My Project")).toBeInTheDocument();
    expect(screen.getByText("Portrait")).toBeInTheDocument();
  });

  it("filters to only images when Images tab clicked", () => {
    render(<LibraryTabs items={mockItems} />);
    fireEvent.click(screen.getByRole("tab", { name: "Images" }));
    expect(screen.getByText("Sunset Photo")).toBeInTheDocument();
    expect(screen.getByText("Portrait")).toBeInTheDocument();
    expect(screen.queryByText("Dance Video")).not.toBeInTheDocument();
    expect(screen.queryByText("Hero Char")).not.toBeInTheDocument();
    expect(screen.queryByText("My Project")).not.toBeInTheDocument();
  });

  it("filters to only videos when Videos tab clicked", () => {
    render(<LibraryTabs items={mockItems} />);
    fireEvent.click(screen.getByRole("tab", { name: "Videos" }));
    expect(screen.getByText("Dance Video")).toBeInTheDocument();
    expect(screen.queryByText("Sunset Photo")).not.toBeInTheDocument();
  });

  it("filters to only characters when Characters tab clicked", () => {
    render(<LibraryTabs items={mockItems} />);
    fireEvent.click(screen.getByRole("tab", { name: "Characters" }));
    expect(screen.getByText("Hero Char")).toBeInTheDocument();
    expect(screen.queryByText("Sunset Photo")).not.toBeInTheDocument();
  });

  it("filters to only projects when Projects tab clicked", () => {
    render(<LibraryTabs items={mockItems} />);
    fireEvent.click(screen.getByRole("tab", { name: "Projects" }));
    expect(screen.getByText("My Project")).toBeInTheDocument();
    expect(screen.queryByText("Sunset Photo")).not.toBeInTheDocument();
  });

  it("shows empty state when no items match", () => {
    render(<LibraryTabs items={[{ id: "1", type: "image", title: "Photo", thumbnail: null, date: "2026-04-01" }]} />);
    fireEvent.click(screen.getByRole("tab", { name: "Videos" }));
    expect(screen.getByText(/No items yet/)).toBeInTheDocument();
  });
});
