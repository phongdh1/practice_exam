import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(request: NextRequest): HeadersInit | null {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subjectId: string }> },
) {
  const headers = authHeaders(request);
  if (!headers) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const { subjectId } = await context.params;
  const upstream = await fetch(`${API_URL}/api/v1/practice/sessions/active/${subjectId}`, {
    headers,
    cache: "no-store",
  });
  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subjectId: string }> },
) {
  const headers = authHeaders(request);
  if (!headers) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const { subjectId } = await context.params;
  const payload = await request.json().catch(() => ({}));
  const upstream = await fetch(`${API_URL}/api/v1/practice/sessions`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId, forceNew: payload.forceNew ?? false }),
    cache: "no-store",
  });
  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}
