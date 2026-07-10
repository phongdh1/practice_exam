import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function authHeaders(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ attemptId: string }> },
) {
  const headers = authHeaders(request);
  if (!headers) {
    return Response.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }
  const { attemptId } = await context.params;
  const body = await request.json();
  const upstream = await fetch(`${API_URL}/api/v1/mock-exam-attempts/${attemptId}/answer`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const responseBody = await upstream.json();
  return Response.json(responseBody, { status: upstream.status });
}
