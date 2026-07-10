import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ templateId: string }> },
) {
  const headers = authHeaders(request);
  if (!headers) {
    return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const { templateId } = await context.params;
  const upstream = await fetch(`${API_URL}/api/v1/mock-exam-attempts/active/${templateId}`, {
    headers,
    cache: "no-store",
  });
  const body = await upstream.json();
  return Response.json(body, { status: upstream.status });
}
