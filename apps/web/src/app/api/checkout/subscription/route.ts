import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(request: NextRequest): HeadersInit | null {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function POST(request: NextRequest) {
  const headers = authHeaders(request);
  if (!headers) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const body = await request.json();
  const upstream = await fetch(`${API_URL}/api/v1/checkout/subscription`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const responseBody = await upstream.json();
  return NextResponse.json(responseBody, { status: upstream.status });
}
