const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3002",
  "http://127.0.0.1:3003",
];

const DEV_CLIENT_PORTS = new Set([3000, 3002, 3003]);

function isPrivateOrLocalHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return true;
  }

  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/** Allows LAN/VPN dev access (e.g. http://192.168.x.x:3002) when not using explicit CORS_ORIGINS. */
export function isDevLanOrigin(origin: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return false;
  }

  const port = parsed.port
    ? Number(parsed.port)
    : parsed.protocol === "https:"
      ? 443
      : 80;

  if (!DEV_CLIENT_PORTS.has(port)) {
    return false;
  }

  return isPrivateOrLocalHost(parsed.hostname);
}

export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (process.env.NODE_ENV === "production") {
    return false;
  }

  if (process.env.CORS_ORIGINS?.trim()) {
    return false;
  }

  return isDevLanOrigin(origin);
}

export function resolveCorsOrigins(): string[] {
  const explicit = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (explicit?.length) {
    return [...new Set(explicit)];
  }

  const fromEnv = [process.env.WEB_APP_URL, process.env.ADMIN_APP_URL].filter(
    (origin): origin is string => Boolean(origin?.trim()),
  );

  return [...new Set([...DEFAULT_DEV_ORIGINS, ...fromEnv])];
}

export function resolveCorsOptions() {
  const allowedOrigins = resolveCorsOrigins();
  const useDevLanOrigins =
    process.env.NODE_ENV !== "production" && !process.env.CORS_ORIGINS?.trim();

  return {
    origin: useDevLanOrigins
      ? (
          origin: string | undefined,
          callback: (err: Error | null, allow?: boolean) => void,
        ) => {
          callback(null, isOriginAllowed(origin, allowedOrigins));
        }
      : allowedOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
  };
}
