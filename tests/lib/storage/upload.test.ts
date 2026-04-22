import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

// Mock the supabase client to avoid real HTTP calls
vi.mock("@supabase/supabase-js", () => {
  const mockFrom = vi.fn().mockReturnValue({
    upload: vi.fn().mockResolvedValue({ data: { path: "test/path.jpg" }, error: null }),
    createSignedUrl: vi.fn().mockResolvedValue({
      data: { signedUrl: "https://supabase.co/storage/v1/sign/test/path.jpg?token=abc" },
      error: null,
    }),
    getPublicUrl: vi.fn().mockReturnValue({
      data: { publicUrl: "https://supabase.co/storage/v1/object/public/generations/test/path.jpg" },
    }),
  });
  return {
    createClient: vi.fn().mockReturnValue({
      storage: {
        from: mockFrom,
        listBuckets: vi.fn().mockResolvedValue({
          data: [{ id: "persona-photos" }, { id: "generations" }],
          error: null,
        }),
      },
    }),
  };
});

describe("lib/storage/upload — uploadPersonaPhoto", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns storageKey with correct path format", async () => {
    const { uploadPersonaPhoto } = await import("@/lib/storage/upload");
    const buffer = Buffer.from("fake-image-data");
    const result = await uploadPersonaPhoto("user-1", "persona-1", buffer, "image/jpeg");

    expect(result).not.toBeNull();
    expect(result!.storageKey).toMatch(/^user-1\/persona-1\/\d+\.jpg$/);
  });

  it("returns a signed URL", async () => {
    const { uploadPersonaPhoto } = await import("@/lib/storage/upload");
    const buffer = Buffer.from("fake-image-data");
    const result = await uploadPersonaPhoto("user-1", "persona-1", buffer, "image/jpeg");

    expect(result!.signedUrl).toContain("supabase.co");
  });

  it("passes through the correct content type", async () => {
    const { getStorageClient } = await import("@/lib/storage/client");
    const client = getStorageClient();
    const uploadSpy = vi.spyOn(client!.storage.from("persona-photos"), "upload");

    const { uploadPersonaPhoto } = await import("@/lib/storage/upload");
    await uploadPersonaPhoto("user-1", "persona-1", Buffer.from("x"), "image/png");

    expect(uploadSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Buffer),
      expect.objectContaining({ contentType: "image/png" })
    );
  });

  it("returns null when Supabase is not configured in dev", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();

    const { uploadPersonaPhoto } = await import("@/lib/storage/upload");
    const result = await uploadPersonaPhoto("u", "p", Buffer.from("x"), "image/jpeg");
    expect(result).toBeNull();
  });
});

describe("lib/storage/upload — uploadGenerationOutput", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    vi.stubEnv("NODE_ENV", "test");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns storageKey with correct path format", async () => {
    const { uploadGenerationOutput } = await import("@/lib/storage/upload");
    const result = await uploadGenerationOutput("user-1", "gen-1", Buffer.from("x"), "image/png");

    expect(result).not.toBeNull();
    expect(result!.storageKey).toMatch(/^user-1\/gen-1\/\d+\.png$/);
  });

  it("returns a public URL containing supabase.co", async () => {
    const { uploadGenerationOutput } = await import("@/lib/storage/upload");
    const result = await uploadGenerationOutput("user-1", "gen-1", Buffer.from("x"), "image/png");

    expect(result!.publicUrl).toContain("supabase.co");
  });
});
