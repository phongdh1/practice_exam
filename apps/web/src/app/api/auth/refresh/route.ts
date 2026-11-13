import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) return new NextResponse(null, { status: 401 });

  try {
    const accessToken = request.cookies.get("access_token")?.value;
    if (accessToken) {
      const session = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      if (session.ok) return new NextResponse(null, { status: 204 });
      if (session.status !== 401) return new NextResponse(null, { status: 503 });
    }

    const upstream = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status === 401 ? 401 : 503 });
    }

    const { data } = await upstream.json();
    const response = new NextResponse(null, { status: 204 });
    setAuthCookies(response, data.tokens);
    return response;
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
