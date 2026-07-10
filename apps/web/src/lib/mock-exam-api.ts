import type { MockExamApiAdapter } from "@practice-exam/ui";

export class MockExamApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "MockExamApiError";
    this.code = code;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new MockExamApiError(body.error?.message ?? `HTTP ${res.status}`, body.error?.code);
  }
  return body.data as T;
}

export function createWebMockExamApi(): MockExamApiAdapter {
  return {
    async listTemplates(subjectId) {
      const res = await fetch(`/api/mock-exams/subjects/${subjectId}`);
      if (res.status === 401) throw new MockExamApiError("Vui lòng đăng nhập để thi thử.");
      return parseJson(res);
    },
    async getActiveAttempt(templateId) {
      const res = await fetch(`/api/mock-exams/templates/${templateId}/active`);
      if (res.status === 401) throw new MockExamApiError("Vui lòng đăng nhập để thi thử.");
      return parseJson(res);
    },
    async startAttempt(templateId) {
      const res = await fetch(`/api/mock-exams/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (res.status === 401) throw new MockExamApiError("Vui lòng đăng nhập để thi thử.");
      return parseJson(res);
    },
    async getAttempt(attemptId) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}`);
      return parseJson(res);
    },
    async getQuestion(attemptId, questionId) {
      const query = questionId ? `?questionId=${encodeURIComponent(questionId)}` : "";
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/question${query}`);
      return parseJson(res);
    },
    async saveAnswer(attemptId, input) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return parseJson(res);
    },
    async advanceSection(attemptId) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/advance-section`, {
        method: "POST",
      });
      return parseJson(res);
    },
    async getReview(attemptId) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/review`);
      return parseJson(res);
    },
    async submitAttempt(attemptId) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/submit`, { method: "POST" });
      return parseJson(res);
    },
    async getResults(attemptId) {
      const res = await fetch(`/api/mock-exams/attempts/${attemptId}/results`);
      return parseJson(res);
    },
  };
}
