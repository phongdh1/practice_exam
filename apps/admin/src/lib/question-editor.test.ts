import { describe, expect, it } from "vitest";
import type { QuestionDetail } from "@practice-exam/types";
import {
  addQuestionOption,
  applyQuestionTypeChange,
  buildQuestionPayload,
  createEmptyQuestionForm,
  questionDetailToForm,
  removeQuestionOption,
  validateQuestionForm,
} from "./question-editor";

function filledForm() {
  const form = createEmptyQuestionForm();
  return {
    ...form,
    subjectId: "subject-1",
    stem: "Câu hỏi có nhiều phương án trả lời?",
    options: form.options.map((option) => ({ ...option, text: `Nội dung ${option.key}` })),
    correctOptionKeys: ["A"],
  };
}

describe("dynamic question options", () => {
  it("adds E and F and saves a single correct E answer", () => {
    let form = addQuestionOption(addQuestionOption(filledForm()));
    form = {
      ...form,
      options: form.options.map((option) => ({ ...option, text: option.key })),
      correctOptionKeys: ["E"],
    };
    expect(form.options.map((option) => option.key)).toEqual(["A", "B", "C", "D", "E", "F"]);
    expect(validateQuestionForm(form)).toBeNull();
    expect(buildQuestionPayload(form).correctOptionKeys).toEqual(["E"]);
    expect(buildQuestionPayload(form).options).toHaveLength(6);
  });

  it("continues after Z with AA and never reuses an existing key", () => {
    let form = filledForm();
    for (let index = 4; index < 28; index += 1) form = addQuestionOption(form);
    expect(form.options.slice(-3).map((option) => option.key)).toEqual(["Z", "AA", "AB"]);
    const afterDelete = removeQuestionOption(form, "B");
    expect(addQuestionOption(afterDelete).options.at(-1)?.key).toBe("AC");
    expect(new Set(afterDelete.options.map((option) => option.key)).size).toBe(27);
  });

  it("removes a selected option without changing other keys or selections", () => {
    const form = {
      ...filledForm(),
      questionType: "multiple_choice" as const,
      correctOptionKeys: ["B", "D"],
    };
    const result = removeQuestionOption(form, "B");
    expect(result.options.map((option) => option.key)).toEqual(["A", "C", "D"]);
    expect(result.correctOptionKeys).toEqual(["D"]);
    expect(validateQuestionForm(result)).toContain("ít nhất 2 đáp án đúng");
    expect(form.correctOptionKeys).toEqual(["B", "D"]);
  });

  it("keeps at least two slots and blocks option changes for true/false", () => {
    const two = removeQuestionOption(removeQuestionOption(filledForm(), "D"), "C");
    expect(removeQuestionOption(two, "B")).toBe(two);
    const trueFalse = applyQuestionTypeChange(filledForm(), "true_false");
    expect(addQuestionOption(trueFalse)).toBe(trueFalse);
    expect(removeQuestionOption(trueFalse, "A")).toBe(trueFalse);
  });

  it("does not leave fewer than two slots when old data contains duplicate keys", () => {
    const form = {
      ...filledForm(),
      options: [{ key: "A", text: "First" }, { key: "A", text: "Duplicate" }, { key: "B", text: "Second" }],
    };
    expect(removeQuestionOption(form, "A")).toBe(form);
  });

  it("preserves imported options and correct keys when opening an existing question", () => {
    const options = ["A", "B", "E", "Z", "AA"].map((key) => ({ key, text: key }));
    const question = {
      subjectId: "subject-1", questionType: "multiple_choice", difficulty: "easy",
      stem: "Existing extended question", explanation: null, options,
      correctOptionKeys: ["E", "AA"], tags: [], sourceRef: null, imageUrls: [],
    } as unknown as QuestionDetail;
    const form = questionDetailToForm(question, "course-1");
    expect(validateQuestionForm(form)).toBeNull();
    expect(buildQuestionPayload(form).options).toEqual(options);
    expect(buildQuestionPayload(form).correctOptionKeys).toEqual(["E", "AA"]);
    expect(applyQuestionTypeChange(form, "single_choice").options).toEqual(options);
  });

  it("rejects a blank selected option and drops unused blank options from payload", () => {
    const form = addQuestionOption(filledForm());
    expect(validateQuestionForm({ ...form, correctOptionKeys: ["E"] })).toContain("không khớp");
    expect(buildQuestionPayload(form).options).toHaveLength(4);
  });
});
