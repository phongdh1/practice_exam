import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authFetch, createApiClient, createUnauthorizedGuard, UnauthorizedError } from "./index";

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

describe("createUnauthorizedGuard", () => {
  const assign = vi.fn();

  beforeEach(() => {
    assign.mockReset();
    vi.stubGlobal("window", {
      location: { pathname: "/dashboard", assign },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clears session and assigns login path", () => {
    const clearSession = vi.fn();
    const guard = createUnauthorizedGuard({
      loginPath: "/login",
      clearSession,
      getCurrentPath: () => "/dashboard",
    });

    guard();

    expect(clearSession).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("skips redirect when already on login path", () => {
    const clearSession = vi.fn();
    const guard = createUnauthorizedGuard({
      loginPath: "/login",
      clearSession,
      getCurrentPath: () => "/login",
    });

    guard();

    expect(clearSession).toHaveBeenCalledOnce();
    expect(assign).not.toHaveBeenCalled();
  });
});

describe("authFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("invokes guard on 401 and throws UnauthorizedError", async () => {
    const guard = vi.fn();
    vi.mocked(fetch).mockResolvedValue({ status: 401 } as Response);

    await expect(authFetch("/api/protected", undefined, guard)).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(guard).toHaveBeenCalledOnce();
  });

  it("does not invoke guard on 200 or 403", async () => {
    const guard = vi.fn();
    vi.mocked(fetch).mockResolvedValueOnce({ status: 200 } as Response);
    vi.mocked(fetch).mockResolvedValueOnce({ status: 403 } as Response);

    const ok = await authFetch("/api/ok", undefined, guard);
    const forbidden = await authFetch("/api/forbidden", undefined, guard);

    expect(ok.status).toBe(200);
    expect(forbidden.status).toBe(403);
    expect(guard).not.toHaveBeenCalled();
  });
});
