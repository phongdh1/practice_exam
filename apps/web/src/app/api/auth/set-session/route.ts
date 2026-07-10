import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const accessToken = body.accessToken as string | undefined;
  const refreshToken = body.refreshToken as string | undefined;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  setAuthCookies(response, { accessToken, refreshToken });
  return response;
}
