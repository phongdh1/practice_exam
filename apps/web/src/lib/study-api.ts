import type { StudyApiAdapter } from "@practice-exam/ui";
import { webAuthFetch } from "./auth-fetch";

export class StudyApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "StudyApiError";
    this.code = code;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!res.ok) {
    throw new StudyApiError(body.error?.message ?? `HTTP ${res.status}`, body.error?.code);
  }
  return body.data as T;
}

export function createWebStudyApi(subjectId: string): StudyApiAdapter {
  return {
    async listQuestions(id, params) {
      const search = new URLSearchParams();
      if (params?.page) search.set("page", String(params.page));
      if (params?.pageSize) search.set("pageSize", String(params.pageSize));
      const suffix = search.toString() ? `?${search.toString()}` : "";
      const res = await webAuthFetch(`/api/study/subjects/${id}/questions${suffix}`);
      return parseJson(res);
    },
    async getQuestionDetail(id, questionId) {
      const res = await webAuthFetch(`/api/study/subjects/${id}/questions/${questionId}`);
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
