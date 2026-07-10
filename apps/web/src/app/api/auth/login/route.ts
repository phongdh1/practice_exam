import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? "Đăng nhập thất bại." },
      { status: upstream.status },
    );
  }

  const response = NextResponse.json({ user: payload.data.user });
  setAuthCookies(response, payload.data.tokens);
  return response;
}
