import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ subjectId: string }> },
) {
  const { subjectId } = await context.params;
  const token = _request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/api/v1/entitlements/${subjectId}/free-tier`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ subjectId: string }> },
) {
  const { subjectId } = await context.params;
  const token = _request.cookies.get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const upstream = await fetch(`${API_URL}/api/v1/entitlements/${subjectId}/consume`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}
