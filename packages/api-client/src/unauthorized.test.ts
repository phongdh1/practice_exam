import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApiClient } from "./index";

describe("ApiClient onUnauthorized", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("invokes onUnauthorized when request returns 401", async () => {
    const onUnauthorized = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }),
    } as Response);

    const client = createApiClient({ baseUrl: "http://test", onUnauthorized });
    await expect(client.health()).rejects.toThrow("Unauthorized");
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("does not invoke onUnauthorized for non-401 errors", async () => {
    const onUnauthorized = vi.fn();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: "Server error" } }),
    } as Response);

    const client = createApiClient({ baseUrl: "http://test", onUnauthorized });
    await expect(client.health()).rejects.toThrow("Server error");
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
