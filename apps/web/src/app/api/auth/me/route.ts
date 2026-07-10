import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function GET() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: { message: "Auth service unavailable." } },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await upstream.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid response from auth service." } },
      { status: 502 },
    );
  }

  return NextResponse.json(body, { status: upstream.status });
}
