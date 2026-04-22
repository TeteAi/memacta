import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

// We test the module in isolation by controlling env vars and mocking resend.
// The resend package is mocked so no real HTTP calls happen.

const mockSend = vi.fn().mockResolvedValue({ data: { id: "resend-id-123" }, error: null });

vi.mock("resend", () => {
  return {
    Resend: function Resend() {
      return {
        emails: {
          send: mockSend,
        },
      };
    },
  };
});

describe("lib/email/client — isConfigured()", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns false when RESEND_API_KEY is not set", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.resetModules();
    const { isConfigured } = await import("@/lib/email/client");
    expect(isConfigured()).toBe(false);
  });

  it("returns true when RESEND_API_KEY is set", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_123");
    vi.resetModules();
    const { isConfigured } = await import("@/lib/email/client");
    expect(isConfigured()).toBe(true);
  });
});

describe("lib/email/client — sendEmail() dev fallback", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns ok=true and logs to console in dev when no API key", async () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const { sendEmail } = await import("@/lib/email/client");

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.ok).toBe(true);
    expect(result.id).toBe("dev-noop");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[email:dev]"),
      expect.any(String)
    );
    consoleSpy.mockRestore();
  });

  it("returns ok=true without calling Resend in dev when API key absent", async () => {
    mockSend.mockClear();
    const { sendEmail } = await import("@/lib/email/client");
    await sendEmail({ to: "a@b.com", subject: "s", html: "<p>x</p>" });
    // Resend.send should not have been called in dev-fallback path
    expect(mockSend).not.toHaveBeenCalled();
  });
});

describe("lib/email/client — sendEmail() with Resend", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "re_live_fake_key");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
    mockSend.mockResolvedValue({ data: { id: "resend-id-123" }, error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns ok=true with id when Resend succeeds", async () => {
    const { sendEmail } = await import("@/lib/email/client");
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>World</p>",
    });
    expect(result.ok).toBe(true);
    expect(result.id).toBe("resend-id-123");
  });
});
