import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(request: NextRequest): HeadersInit | null {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

async function proxy(
  request: NextRequest,
  sessionId: string,
  path: string,
  method: "GET" | "POST",
  body?: unknown,
) {
  const headers = authHeaders(request);
  if (!headers) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const upstream = await fetch(`${API_URL}/api/v1/practice/sessions/${sessionId}${path}`, {
    method,
    headers: body ? { ...headers, "Content-Type": "application/json" } : headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const resBody = await upstream.json();
  return NextResponse.json(resBody, { status: upstream.status });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const url = new URL(request.url);
  if (url.pathname.endsWith("/question")) {
    return proxy(request, sessionId, "/question", "GET");
  }
  return proxy(request, sessionId, "", "GET");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await context.params;
  const url = new URL(request.url);
  const payload = await request.json().catch(() => ({}));
  if (url.pathname.endsWith("/answer")) {
    return proxy(request, sessionId, "/answer", "POST", payload);
  }
  if (url.pathname.endsWith("/end")) {
    return proxy(request, sessionId, "/end", "POST");
  }
  return NextResponse.json({ error: { message: "Not found" } }, { status: 404 });
}
