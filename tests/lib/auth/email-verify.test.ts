import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    emailVerificationToken: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: "tok-1", ...data })
      ),
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn().mockResolvedValue({ id: "user-1", emailVerified: new Date() }),
    },
    $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  },
}));

// Mock email client
vi.mock("@/lib/email/client", () => ({
  sendEmail: vi.fn().mockResolvedValue({ ok: true, id: "mock-email-id" }),
  isConfigured: vi.fn().mockReturnValue(false),
}));

// Mock templates
vi.mock("@/lib/email/templates/verification", () => ({
  renderVerificationEmail: vi.fn().mockReturnValue({
    html: "<p>verify</p>",
    text: "verify",
  }),
}));

describe("lib/auth/email-verify — generateVerificationToken", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("generates a hex token", async () => {
    const { generateVerificationToken } = await import("@/lib/auth/email-verify");
    const { prisma } = await import("@/lib/db");

    const token = await generateVerificationToken("user-1");
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(prisma.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", token }),
      })
    );
  });

  it("invalidates any existing unused tokens before creating a new one", async () => {
    const { generateVerificationToken } = await import("@/lib/auth/email-verify");
    const { prisma } = await import("@/lib/db");

    await generateVerificationToken("user-1");
    expect(prisma.emailVerificationToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1", usedAt: null }),
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      })
    );
  });

  it("sets expiry 24 hours in the future", async () => {
    const { generateVerificationToken } = await import("@/lib/auth/email-verify");
    const { prisma } = await import("@/lib/db");
    const before = Date.now();

    await generateVerificationToken("user-1");
    const call = (prisma.emailVerificationToken.create as ReturnType<typeof vi.fn>).mock.calls.at(-1);
    const expiresAt: Date = call[0].data.expiresAt;
    const diffHours = (expiresAt.getTime() - before) / (1000 * 60 * 60);

    expect(diffHours).toBeGreaterThan(23.9);
    expect(diffHours).toBeLessThan(24.1);
  });
});

describe("lib/auth/email-verify — token expiry / single-use", () => {
  it("token is 64 hex chars (32 bytes)", async () => {
    const { generateVerificationToken } = await import("@/lib/auth/email-verify");
    const tok = await generateVerificationToken("user-x");
    expect(tok.length).toBe(64);
  });
});
