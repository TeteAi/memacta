import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PricingCards from "@/app/pricing/pricing-cards";

vi.mock("next/navigation", () => ({
  usePathname: () => "/pricing",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PricingCards", () => {
  const mockPackages = [
    { id: "pkg-starter", name: "Starter", credits: 100, priceUsd: 999, popular: false },
    { id: "pkg-pro", name: "Pro", credits: 500, priceUsd: 3999, popular: true },
    { id: "pkg-team", name: "Team", credits: 2000, priceUsd: 9999, popular: false },
    { id: "pkg-enterprise", name: "Enterprise", credits: 10000, priceUsd: 39999, popular: false },
  ];

  it("renders all pricing cards with correct data", () => {
    render(<PricingCards packages={mockPackages} />);

    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();

    expect(screen.getByText("100 credits")).toBeInTheDocument();
    expect(screen.getByText("500 credits")).toBeInTheDocument();
    expect(screen.getByText("2000 credits")).toBeInTheDocument();
    expect(screen.getByText("10000 credits")).toBeInTheDocument();

    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("$39.99")).toBeInTheDocument();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("$399.99")).toBeInTheDocument();
  });

  it("shows Popular badge on the popular package", () => {
    render(<PricingCards packages={mockPackages} />);
    const badges = screen.getAllByTestId("popular-badge");
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent("Popular");
  });

  it("renders Buy Now buttons for each package", () => {
    render(<PricingCards packages={mockPackages} />);
    const buttons = screen.getAllByRole("button", { name: "Buy Now" });
    expect(buttons).toHaveLength(4);
  });
});
