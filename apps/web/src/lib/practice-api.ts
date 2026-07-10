import type { PracticeApiAdapter } from "@practice-exam/ui";
import { webAuthFetch } from "./auth-fetch";

export class PracticeApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "PracticeApiError";
    this.code = code;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new PracticeApiError(body.error?.message ?? `HTTP ${res.status}`, body.error?.code);
  }
  return body.data as T;
}

export function createWebPracticeApi(subjectId: string): PracticeApiAdapter {
  return {
    async getActiveSession() {
      const res = await webAuthFetch(`/api/practice/subjects/${subjectId}`);
      return parseJson(res);
    },
    async startSession(_subjectId, forceNew = false) {
      const res = await webAuthFetch(`/api/practice/subjects/${subjectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceNew }),
      });
      return parseJson(res);
    },
    async getQuestion(sessionId) {
      const res = await webAuthFetch(`/api/practice/sessions/${sessionId}/question`);
      return parseJson(res);
    },
    async submitAnswer(sessionId, input) {
      const res = await webAuthFetch(`/api/practice/sessions/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseJson(res);
    },
    async endSession(sessionId) {
      const res = await webAuthFetch(`/api/practice/sessions/${sessionId}/end`, { method: "POST" });
      return parseJson(res);
    },
    async flagQuestion(questionId, comment) {
      const res = await webAuthFetch(`/api/questions/${questionId}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      await parseJson(res);
    },
  };
}
