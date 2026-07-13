import type {
  Prisma,
  Question,
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
} from "@prisma/client";
import type {
  QuestionDetail,
  QuestionOption,
  QuestionPreview,
  QuestionSummary,
} from "@practice-exam/types";

type QuestionWithRelations = Question & {
  subject?: { name: string };
  author?: { displayName: string | null; username: string };
  reviewer?: { displayName: string | null; username: string } | null;
};

export function normalizeStem(stem: string): string {
  return stem.trim().toLowerCase().replace(/\s+/g, " ");
}

export function toQuestionSummary(q: QuestionWithRelations): QuestionSummary {
  return {
    id: q.id,
    subjectId: q.subjectId,
    subjectName: q.subject?.name,
    authorId: q.authorId,
    authorName: q.author?.displayName ?? q.author?.username,
    status: q.status,
    questionType: q.questionType,
    difficulty: q.difficulty,
    stem: q.stem,
    tags: q.tags,
    versionNumber: q.versionNumber,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    submittedAt: q.submittedAt?.toISOString() ?? null,
    publishedAt: q.publishedAt?.toISOString() ?? null,
  };
}

export function toQuestionDetail(
  q: QuestionWithRelations,
  duplicateWarning?: { matchingQuestionId: string; stem: string } | null,
  includeSourceRef = true,
): QuestionDetail {
  return {
    ...toQuestionSummary(q),
    explanation: q.explanation,
    options: q.options as unknown as QuestionOption[],
    correctOptionKeys: q.correctOptionKeys as string[],
    imageUrls: q.imageUrls,
    sourceRef: includeSourceRef ? q.sourceRef : undefined,
    duplicateWarning: duplicateWarning ?? null,
    parentQuestionId: q.parentQuestionId,
    reviewerId: q.reviewerId,
    reviewerName: q.reviewer?.displayName ?? q.reviewer?.username ?? null,
  };
}

export function toQuestionPreview(q: Question): QuestionPreview {
  return {
    stem: q.stem,
    options: q.options as unknown as QuestionOption[],
    correctOptionKeys: q.correctOptionKeys as string[],
    explanation: q.explanation,
    imageUrls: q.imageUrls,
    questionType: q.questionType,
  };
}

export function buildQuestionSnapshot(q: Question): Prisma.InputJsonValue {
  return {
    stem: q.stem,
    explanation: q.explanation,
    options: q.options,
    correctOptionKeys: q.correctOptionKeys,
    tags: q.tags,
    imageUrls: q.imageUrls,
    questionType: q.questionType,
    difficulty: q.difficulty,
    sourceRef: q.sourceRef,
    versionNumber: q.versionNumber,
  };
}

export const PUBLISHED_CANDIDATE_STATUSES: QuestionStatus[] = ["published"];

export type QuestionCreateData = {
  subjectId: string;
  authorId: string;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  stem: string;
  explanation?: string | null;
  options: QuestionOption[];
  correctOptionKeys: string[];
  tags?: string[];
  imageUrls?: string[];
  sourceRef?: string | null;
  status?: QuestionStatus;
  parentQuestionId?: string | null;
};
