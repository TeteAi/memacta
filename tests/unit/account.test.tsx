import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock account view component for unit testing
function AccountView({
  user,
  purchases,
}: {
  user: { email: string; name: string; credits: number; createdAt: string };
  purchases: { id: string; credits: number; amountUsd: number; status: string; createdAt: string }[];
}) {
  return (
    <div>
      <h1>Account</h1>
      <p data-testid="account-email">{user.email}</p>
      <p data-testid="account-credits">{user.credits}</p>
      <p>{user.name}</p>
      <p>Joined: {user.createdAt}</p>
      {purchases.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Credits</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} data-testid="purchase-row">
                <td>{p.createdAt}</td>
                <td>{p.credits}</td>
                <td>${(p.amountUsd / 100).toFixed(2)}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

describe("AccountView", () => {
  const mockUser = {
    email: "demo@memacta.app",
    name: "Demo User",
    credits: 500,
    createdAt: "2026-01-15",
  };

  const mockPurchases = [
    { id: "p1", credits: 500, amountUsd: 3999, status: "completed", createdAt: "2026-04-10" },
  ];

  it("renders user email and credits", () => {
    render(<AccountView user={mockUser} purchases={mockPurchases} />);
    expect(screen.getByTestId("account-email")).toHaveTextContent("demo@memacta.app");
    expect(screen.getByTestId("account-credits")).toHaveTextContent("500");
  });

  it("renders purchase history rows", () => {
    render(<AccountView user={mockUser} purchases={mockPurchases} />);
    const rows = screen.getAllByTestId("purchase-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("500");
    expect(rows[0]).toHaveTextContent("$39.99");
    expect(rows[0]).toHaveTextContent("completed");
  });

  it("renders user name and join date", () => {
    render(<AccountView user={mockUser} purchases={[]} />);
    expect(screen.getByText("Demo User")).toBeInTheDocument();
    expect(screen.getByText("Joined: 2026-01-15")).toBeInTheDocument();
  });
});
