import type {
  QuestionDetail,
  QuestionDifficultyType,
  QuestionOption,
  QuestionTypeValue,
} from "@practice-exam/types";

export type QuestionEditorFormState = {
  courseId: string;
  subjectId: string;
  questionType: QuestionTypeValue;
  difficulty: QuestionDifficultyType;
  stem: string;
  explanation: string;
  options: QuestionOption[];
  correctOptionKeys: string[];
  tags: string;
  sourceRef: string;
  imageUrls: string;
};

export const DEFAULT_OPTIONS: QuestionOption[] = [
  { key: "A", text: "" },
  { key: "B", text: "" },
  { key: "C", text: "" },
  { key: "D", text: "" },
];

export const TRUE_FALSE_OPTIONS: QuestionOption[] = [
  { key: "A", text: "Đúng" },
  { key: "B", text: "Sai" },
];

export function createEmptyQuestionForm(): QuestionEditorFormState {
  return {
    courseId: "",
    subjectId: "",
    questionType: "single_choice",
    difficulty: "medium",
    stem: "",
    explanation: "",
    options: DEFAULT_OPTIONS.map((option) => ({ ...option })),
    correctOptionKeys: [],
    tags: "",
    sourceRef: "",
    imageUrls: "",
  };
}

export function questionDetailToForm(
  question: QuestionDetail,
  courseId: string,
): QuestionEditorFormState {
  return {
    courseId,
    subjectId: question.subjectId,
    questionType: question.questionType,
    difficulty: question.difficulty,
    stem: question.stem,
    explanation: question.explanation ?? "",
    options: question.options.map((option) => ({ ...option })),
    correctOptionKeys: [...question.correctOptionKeys],
    tags: question.tags.join(", "),
    sourceRef: question.sourceRef ?? "",
    imageUrls: question.imageUrls.join("\n"),
  };
}

export function applyQuestionTypeChange(
  form: QuestionEditorFormState,
  questionType: QuestionTypeValue,
): QuestionEditorFormState {
  if (questionType === "true_false") {
    return {
      ...form,
      questionType,
      options: TRUE_FALSE_OPTIONS.map((option) => ({ ...option })),
      correctOptionKeys: form.correctOptionKeys.filter((key) => key === "A" || key === "B").slice(0, 1),
    };
  }

  const nextOptions =
    form.questionType === "true_false"
      ? DEFAULT_OPTIONS.map((option) => ({ ...option }))
      : form.options;

  let correctOptionKeys = form.correctOptionKeys;
  if (questionType === "single_choice" && correctOptionKeys.length > 1) {
    correctOptionKeys = correctOptionKeys.slice(0, 1);
  }

  return {
    ...form,
    questionType,
    options: nextOptions,
    correctOptionKeys,
  };
}

export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseImageUrls(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function buildQuestionPayload(form: QuestionEditorFormState) {
  const options = form.options.filter((option) => option.text.trim().length > 0);

  return {
    questionType: form.questionType,
    difficulty: form.difficulty,
    stem: form.stem.trim(),
    explanation: form.explanation.trim() || null,
    options,
    correctOptionKeys: form.correctOptionKeys,
    tags: parseTags(form.tags),
    imageUrls: parseImageUrls(form.imageUrls),
    sourceRef: form.sourceRef.trim() || null,
  };
}

export function validateQuestionForm(form: QuestionEditorFormState): string | null {
  if (!form.subjectId) return "Vui lòng chọn môn học.";
  if (!form.stem.trim()) return "Vui lòng nhập nội dung câu hỏi.";

  const options = form.options.filter((option) => option.text.trim().length > 0);
  if (options.length < 2) return "Câu hỏi phải có ít nhất 2 phương án.";

  if (form.questionType === "true_false" && options.length !== 2) {
    return "Câu hỏi đúng/sai phải có đúng 2 phương án.";
  }

  if (form.correctOptionKeys.length === 0) return "Vui lòng chọn ít nhất một đáp án đúng.";

  if (form.questionType === "single_choice" && form.correctOptionKeys.length !== 1) {
    return "Câu hỏi một lựa chọn phải có đúng 1 đáp án đúng.";
  }

  if (form.questionType === "multiple_choice" && form.correctOptionKeys.length < 2) {
    return "Câu hỏi nhiều lựa chọn phải có ít nhất 2 đáp án đúng.";
  }

  if (form.questionType === "true_false" && form.correctOptionKeys.length !== 1) {
    return "Câu hỏi đúng/sai phải có đúng 1 đáp án đúng.";
  }

  for (const key of form.correctOptionKeys) {
    if (!options.some((option) => option.key === key)) {
      return `Đáp án đúng "${key}" không khớp với phương án đã nhập.`;
    }
  }

  return null;
}
