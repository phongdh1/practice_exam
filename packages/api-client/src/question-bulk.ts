import type { QuestionStatusType } from "@practice-exam/types";

/** Minimal row shape needed to partition a bulk selection by lifecycle status. */
export interface BulkQuestionRow {
  id: string;
  status: QuestionStatusType;
}

export interface StatusPartition {
  /** Ids eligible for "Gửi duyệt" (submit for review). */
  draftIds: string[];
  /** Ids eligible for "Duyệt tất cả" (approve all). */
  inReviewIds: string[];
}

/**
 * Split a selection of question rows into the id buckets that each bulk action
 * can legally operate on. Rows in other statuses (published/archived) are ignored.
 */
export function partitionByStatus(rows: readonly BulkQuestionRow[]): StatusPartition {
  const draftIds: string[] = [];
  const inReviewIds: string[] = [];

  for (const row of rows) {
    if (row.status === "draft") {
      draftIds.push(row.id);
    } else if (row.status === "in_review") {
      inReviewIds.push(row.id);
    }
  }

  return { draftIds, inReviewIds };
}

export interface BulkSummary {
  success: number;
  failed: number;
}

/**
 * Reduce the output of `Promise.allSettled` into success/failure counts so a
 * bulk runner can report partial results without aborting on the first error.
 */
export function summarizeSettled(
  results: readonly PromiseSettledResult<unknown>[],
): BulkSummary {
  let success = 0;
  let failed = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      success += 1;
    } else {
      failed += 1;
    }
  }

  return { success, failed };
}
