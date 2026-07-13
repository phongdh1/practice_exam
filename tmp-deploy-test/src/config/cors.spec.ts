import { isDevLanOrigin, isOriginAllowed, resolveCorsOrigins } from "./cors";

describe("resolveCorsOrigins", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.CORS_ORIGINS;
    delete process.env.WEB_APP_URL;
    delete process.env.ADMIN_APP_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns default local dev origins when unset", () => {
    expect(resolveCorsOrigins()).toContain("http://localhost:3000");
    expect(resolveCorsOrigins()).toContain("http://localhost:3002");
  });

  it("prefers explicit CORS_ORIGINS", () => {
    process.env.CORS_ORIGINS = "https://app.example.com, https://admin.example.com";
    expect(resolveCorsOrigins()).toEqual([
      "https://app.example.com",
      "https://admin.example.com",
    ]);
  });

  it("merges WEB_APP_URL into defaults when CORS_ORIGINS is unset", () => {
    process.env.WEB_APP_URL = "https://practice.example.com";
    expect(resolveCorsOrigins()).toContain("https://practice.example.com");
    expect(resolveCorsOrigins()).toContain("http://localhost:3000");
  });
});

describe("isDevLanOrigin", () => {
  it("allows private LAN origins on dev client ports", () => {
    expect(isDevLanOrigin("http://192.168.56.1:3002")).toBe(true);
    expect(isDevLanOrigin("http://10.0.0.5:3000")).toBe(true);
  });

  it("rejects public hosts and wrong ports", () => {
    expect(isDevLanOrigin("http://example.com:3002")).toBe(false);
    expect(isDevLanOrigin("http://192.168.56.1:8080")).toBe(false);
  });
});

describe("isOriginAllowed", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "development" };
    delete process.env.CORS_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("allows LAN admin origin in development without explicit CORS_ORIGINS", () => {
    expect(
      isOriginAllowed("http://192.168.56.1:3002", [
        "http://localhost:3002",
      ]),
    ).toBe(true);
  });

  it("does not allow LAN origins when CORS_ORIGINS is explicitly set", () => {
    process.env.CORS_ORIGINS = "http://localhost:3002";
    expect(
      isOriginAllowed("http://192.168.56.1:3002", [
        "http://localhost:3002",
      ]),
    ).toBe(false);
  });
});
