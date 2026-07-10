import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function setAuthCookies(response: NextResponse, tokens: { accessToken: string; refreshToken: string }) {
  response.cookies.set("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  response.cookies.set("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const upstream = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? "Đăng ký thất bại." },
      { status: upstream.status },
    );
  }

  const response = NextResponse.json({ user: payload.data.user });
  setAuthCookies(response, payload.data.tokens);
  return response;
}
