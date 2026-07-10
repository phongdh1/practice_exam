export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export interface UnauthorizedGuardConfig {
  loginPath: string;
  clearSession: () => void;
  getCurrentPath?: () => string;
  shouldSkipRedirect?: (pathname: string) => boolean;
}

export function createUnauthorizedGuard(config: UnauthorizedGuardConfig): () => void {
  const {
    loginPath,
    clearSession,
    getCurrentPath = () => (typeof window !== "undefined" ? window.location.pathname : ""),
    shouldSkipRedirect = (pathname) => pathname.startsWith(loginPath),
  } = config;

  return () => {
    clearSession();
    const path = getCurrentPath();
    if (shouldSkipRedirect(path)) return;
    if (typeof window !== "undefined") {
      window.location.assign(loginPath);
    }
  };
}

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  guard: () => void,
): Promise<Response> {
  const res = await fetch(input, init);
  if (res.status === 401) {
    guard();
    throw new UnauthorizedError();
  }
  return res;
}
