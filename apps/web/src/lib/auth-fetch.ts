import { authFetch } from "@practice-exam/api-client";
import { webOnUnauthorized } from "./web-api";

export async function webAuthFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return authFetch(input, init, webOnUnauthorized);
}
