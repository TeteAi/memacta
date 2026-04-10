import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../../lib/db";

describe("prisma db", () => {
  it("finds seeded demo user", async () => {
    const user = await prisma.user.findUnique({
      where: { email: "demo@memacta.app" },
    });
    expect(user).not.toBeNull();
    expect(user!.credits).toBe(1000);
    expect(user!.name).toBe("Demo User");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
