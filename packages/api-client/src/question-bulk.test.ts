import { describe, expect, it } from "vitest";
import {
  partitionByStatus,
  summarizeSettled,
  type BulkQuestionRow,
} from "./question-bulk";

describe("partitionByStatus", () => {
  it("returns empty buckets for an empty selection", () => {
    expect(partitionByStatus([])).toEqual({ draftIds: [], inReviewIds: [] });
  });

  it("routes draft rows to draftIds and in_review rows to inReviewIds", () => {
    const rows: BulkQuestionRow[] = [
      { id: "d1", status: "draft" },
      { id: "r1", status: "in_review" },
      { id: "d2", status: "draft" },
    ];

    expect(partitionByStatus(rows)).toEqual({
      draftIds: ["d1", "d2"],
      inReviewIds: ["r1"],
    });
  });

  it("ignores published and archived rows", () => {
    const rows: BulkQuestionRow[] = [
      { id: "p1", status: "published" },
      { id: "a1", status: "archived" },
      { id: "d1", status: "draft" },
    ];

    expect(partitionByStatus(rows)).toEqual({
      draftIds: ["d1"],
      inReviewIds: [],
    });
  });

  it("preserves selection order within each bucket", () => {
    const rows: BulkQuestionRow[] = [
      { id: "d3", status: "draft" },
      { id: "d1", status: "draft" },
      { id: "d2", status: "draft" },
    ];

    expect(partitionByStatus(rows).draftIds).toEqual(["d3", "d1", "d2"]);
  });
});

describe("summarizeSettled", () => {
  it("counts an empty result set as zero", () => {
    expect(summarizeSettled([])).toEqual({ success: 0, failed: 0 });
  });

  it("counts fulfilled and rejected results independently", () => {
    const results: PromiseSettledResult<unknown>[] = [
      { status: "fulfilled", value: 1 },
      { status: "rejected", reason: new Error("boom") },
      { status: "fulfilled", value: 2 },
    ];

    expect(summarizeSettled(results)).toEqual({ success: 2, failed: 1 });
  });

  it("counts all rejected as failures", () => {
    const results: PromiseSettledResult<unknown>[] = [
      { status: "rejected", reason: "x" },
      { status: "rejected", reason: "y" },
    ];

    expect(summarizeSettled(results)).toEqual({ success: 0, failed: 2 });
  });
});
