import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import {
  ImportQuestionsService,
  IMPORT_TEMPLATE_COLUMNS,
  IMPORT_QUESTION_TYPE_LABELS,
} from "./import-questions.service";
import { PrismaService } from "../prisma/prisma.service";

function buildLegacyTestBuffer(rows: Record<string, string>[]): Buffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Questions");
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

function buildCauHoiBuffer(rows: Record<string, string>[]): Buffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Câu hỏi");
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

describe("ImportQuestionsService", () => {
  let service: ImportQuestionsService;

  const mockPrisma = {
    subject: { findUnique: jest.fn(async () => ({ id: "sub-1" })) },
    importBatch: {
      create: jest.fn(async () => ({ id: "batch-1" })),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    importRowError: { create: jest.fn() },
    question: { create: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportQuestionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(ImportQuestionsService);
  });

  it("parses legacy workbook rows without question type column", () => {
    const buffer = buildLegacyTestBuffer([
      { stem: "Test question?", option_a: "A1", option_b: "B1", correct: "A" },
    ]);
    const rows = service.parseWorkbook(buffer);
    expect(rows).toHaveLength(1);
    expect(rows[0].stem).toBe("Test question?");
    expect(rows[0].questionType).toBe("single_choice");
    expect(rows[0].correctOptionKeys).toEqual(["A"]);
  });

  it("parses Câu hỏi sheet by name when multiple sheets exist", () => {
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([["ignore"]]), "DanhMuc");
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet([
        {
          [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.multiple_choice,
          [IMPORT_TEMPLATE_COLUMNS.stem]: "Multi choice sample question here?",
          [IMPORT_TEMPLATE_COLUMNS.optionA]: "a",
          [IMPORT_TEMPLATE_COLUMNS.optionB]: "b",
          [IMPORT_TEMPLATE_COLUMNS.optionC]: "c",
          [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A,B",
        },
      ]),
      "Câu hỏi",
    );
    const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const rows = service.parseWorkbook(buffer);
    expect(rows[0].questionType).toBe("multiple_choice");
    expect(rows[0].correctOptionKeys).toEqual(["A", "B"]);
  });

  it("records row errors for invalid rows", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "single_choice",
        stem: "",
        optionA: "a",
        optionB: "b",
        correctOptionKeys: ["A"],
      },
    ]);
    expect(mockPrisma.importRowError.create).toHaveBeenCalled();
    expect(mockPrisma.question.create).not.toHaveBeenCalled();
  });

  it("creates draft single-choice questions for valid rows", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "single_choice",
        stem: "Which is correct answer for sample?",
        optionA: "a",
        optionB: "b",
        correctOptionKeys: ["A"],
      },
    ]);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "draft",
          questionType: "single_choice",
          correctOptionKeys: ["A"],
        }),
      }),
    );
  });

  it("creates draft multiple-choice questions with multiple correct keys", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "multiple_choice",
        stem: "Select all correct answers for sample?",
        optionA: "a",
        optionB: "b",
        optionC: "c",
        correctOptionKeys: ["A", "C"],
      },
    ]);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          questionType: "multiple_choice",
          correctOptionKeys: ["A", "C"],
        }),
      }),
    );
  });

  it("rejects true_false rows with extra options", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "true_false",
        stem: "True or false sample question?",
        optionA: "Đúng",
        optionB: "Sai",
        optionC: "extra",
        correctOptionKeys: ["A"],
      },
    ]);
    expect(mockPrisma.importRowError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: "options" }),
      }),
    );
  });

  it("rejects invalid question type labels", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "single_choice",
        stem: "Sample question with invalid type?",
        optionA: "a",
        optionB: "b",
        correctOptionKeys: ["A"],
        preflightError: { field: "questionType", message: "Loại câu hỏi không hợp lệ." },
      },
    ]);
    expect(mockPrisma.importRowError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: "questionType" }),
      }),
    );
  });

  it("rejects multiple choice with only one correct key", async () => {
    await service.processBatch("batch-1", "sub-1", "admin-1", [
      {
        rowNumber: 2,
        questionType: "multiple_choice",
        stem: "Multiple choice needs two keys sample?",
        optionA: "a",
        optionB: "b",
        correctOptionKeys: ["A"],
      },
    ]);
    expect(mockPrisma.importRowError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: "correctKey" }),
      }),
    );
  });

  it("rejects batches over 500 rows", async () => {
    const rows = Array.from({ length: 501 }, (_, i) => ({
      stem: `Question number ${i} sample text?`,
      option_a: "a",
      option_b: "b",
      correct: "A",
    }));
    const buffer = buildLegacyTestBuffer(rows);

    await expect(
      service.enqueueImport("sub-1", "admin-1", "test.xlsx", buffer),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("builds import template with three sheets and example rows", async () => {
    const buffer = await service.buildImportTemplateBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.getWorksheet("Câu hỏi")).toBeDefined();
    expect(workbook.getWorksheet("DanhMuc")).toBeDefined();
    expect(workbook.getWorksheet("HuongDan")).toBeDefined();

    const cauHoi = workbook.getWorksheet("Câu hỏi")!;
    expect(cauHoi.rowCount).toBeGreaterThanOrEqual(4);
    const headerRow = cauHoi.getRow(1).values as string[];
    expect(headerRow.slice(1)).toEqual(Object.values(IMPORT_TEMPLATE_COLUMNS));

    const typeValidation = cauHoi.getCell("A2").dataValidation;
    expect(typeValidation?.type).toBe("list");
    expect(typeValidation?.formulae).toEqual(expect.arrayContaining(["DanhMuc!$A$2:$A$4"]));

    expect(headerRow).toContain(IMPORT_TEMPLATE_COLUMNS.optionE);
    expect(headerRow).toContain(IMPORT_TEMPLATE_COLUMNS.optionF);
    const difficultyValidation = cauHoi.getCell(2, headerRow.indexOf(IMPORT_TEMPLATE_COLUMNS.difficulty)).dataValidation;
    expect(difficultyValidation?.formulae).toEqual(expect.arrayContaining(["DanhMuc!$C$2:$C$4"]));
  });

  it("parses the generated import template with example rows skipped", async () => {
    const buffer = await service.buildImportTemplateBuffer();
    const rows = service.parseWorkbook(buffer);

    expect(rows).toHaveLength(0);
  });

  it("imports a fifth option as the single correct answer", async () => {
    const rows = service.parseWorkbook(buildCauHoiBuffer([{
      [IMPORT_TEMPLATE_COLUMNS.stem]: "Which is the fifth correct answer?",
      [IMPORT_TEMPLATE_COLUMNS.optionA]: "a",
      [IMPORT_TEMPLATE_COLUMNS.optionB]: "b",
      [IMPORT_TEMPLATE_COLUMNS.optionE]: "e",
      [IMPORT_TEMPLATE_COLUMNS.correctKey]: "E",
    }]));

    expect(service.validateRow(rows[0])).toBeNull();
    await service.processBatch("batch-1", "sub-1", "admin-1", rows);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        correctOptionKeys: ["E"],
        options: [{ key: "A", text: "a" }, { key: "B", text: "b" }, { key: "E", text: "e" }],
      }),
    }));
  });

  it("persists multiple answers beyond D from legacy option headers", async () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      questionType: "multiple_choice",
      stem: "Select all the correct answers here?",
      option_a: "a", option_b: "b", option_e: "e", option_f: "f", correct: "a, e, f",
    }]));

    await service.processBatch("batch-1", "sub-1", "admin-1", rows);
    expect(mockPrisma.question.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        correctOptionKeys: ["A", "E", "F"],
        options: [{ key: "A", text: "a" }, { key: "B", text: "b" }, { key: "E", text: "e" }, { key: "F", text: "f" }],
      }),
    }));
  });

  it("sorts arbitrary option labels in spreadsheet order and skips blank options", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      stem: "Which option comes after letter Z?",
      "Đáp án AA": "after Z", option_ab: "next", Z: "last letter", B: "b", A: "a", E: "   ", correct: "AA",
      ID: "question-1", URL: "https://example.com", STT: "1",
    }]));

    expect(rows[0].options?.map((option) => option.key)).toEqual(["A", "B", "Z", "AA", "AB"]);
    expect(service.validateRow(rows[0])).toBeNull();
  });

  it("rejects a correct answer whose option text is empty", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      stem: "Which answer is missing its text?", option_a: "a", option_b: "b", option_e: " ", correct: "E",
    }]));

    expect(service.validateRow(rows[0])).toEqual(expect.objectContaining({ field: "correctKey" }));
  });

  it("accepts two remaining options with stable nonconsecutive keys", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      stem: "Which remaining option is correct?", C: "third", E: "fifth", correct: "E",
    }]));
    expect(service.validateRow(rows[0])).toBeNull();
    expect(rows[0].options?.map((option) => option.key)).toEqual(["C", "E"]);
  });

  it("rejects a choice question with only one nonblank option", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      stem: "Which question needs more options?", A: "   ", E: "fifth", correct: "E",
    }]));
    expect(service.validateRow(rows[0])?.field).toBe("options");
  });

  it("rejects nonempty options beyond B for true/false questions", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      questionType: "true_false", stem: "True or false with extra option?",
      option_a: "Đúng", option_b: "Sai", option_e: "extra", correct: "A",
    }]));

    expect(service.validateRow(rows[0])).toEqual(expect.objectContaining({ field: "options" }));
  });

  it("allows blank optional columns for true/false questions", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{
      questionType: "true_false", stem: "True or false with blank extra columns?",
      option_a: "Đúng", option_b: "Sai", option_e: " ", option_aa: "", correct: "B",
    }]));

    expect(service.validateRow(rows[0])).toBeNull();
    expect(rows[0].options).toEqual([{ key: "A", text: "Đúng" }, { key: "B", text: "Sai" }]);
  });

  it("keeps a row containing only an extra option so its missing stem is reported", () => {
    const rows = service.parseWorkbook(buildLegacyTestBuffer([{ option_e: "extra" }, { option_e: " " }]));

    expect(rows).toHaveLength(1);
    expect(service.validateRow(rows[0])).toEqual(expect.objectContaining({ field: "stem" }));
  });

  it("roundtrips user questions in the generated template with additional option columns", async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await service.buildImportTemplateBuffer());
    const sheet = workbook.getWorksheet("Câu hỏi")!;
    const headers = Object.values(IMPORT_TEMPLATE_COLUMNS);
    const values: Record<string, string> = {
      [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.single_choice,
      [IMPORT_TEMPLATE_COLUMNS.stem]: "Which answer was added to the template?",
      [IMPORT_TEMPLATE_COLUMNS.optionA]: "a", [IMPORT_TEMPLATE_COLUMNS.optionB]: "b",
      [IMPORT_TEMPLATE_COLUMNS.correctKey]: "AA",
    };
    sheet.getCell(1, headers.length + 1).value = "Đáp án AA";
    const row = sheet.addRow(headers.map((header) => values[header] ?? ""));
    row.getCell(headers.length + 1).value = "added answer";

    const rows = service.parseWorkbook(Buffer.from(await workbook.xlsx.writeBuffer()));
    expect(rows).toHaveLength(1);
    expect(service.validateRow(rows[0])).toBeNull();
    expect(rows[0].options).toContainEqual({ key: "AA", text: "added answer" });
  });

  it("parses invalid question type labels via parseWorkbook", () => {
    const buffer = buildCauHoiBuffer([
      {
        [IMPORT_TEMPLATE_COLUMNS.questionType]: "loại không tồn tại",
        [IMPORT_TEMPLATE_COLUMNS.stem]: "Sample question with invalid type?",
        [IMPORT_TEMPLATE_COLUMNS.optionA]: "a",
        [IMPORT_TEMPLATE_COLUMNS.optionB]: "b",
        [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A",
      },
    ]);
    const rows = service.parseWorkbook(buffer);
    expect(rows[0].preflightError).toEqual({
      field: "questionType",
      message: "Loại câu hỏi không hợp lệ.",
    });
  });

  it("maps đúng/sai alias to true_false", () => {
    const buffer = buildCauHoiBuffer([
      {
        [IMPORT_TEMPLATE_COLUMNS.questionType]: "đúng/sai",
        [IMPORT_TEMPLATE_COLUMNS.stem]: "True false alias sample question?",
        [IMPORT_TEMPLATE_COLUMNS.optionA]: "Đúng",
        [IMPORT_TEMPLATE_COLUMNS.optionB]: "Sai",
        [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A",
      },
    ]);
    const rows = service.parseWorkbook(buffer);
    expect(rows[0].questionType).toBe("true_false");
  });

  it("flags unknown difficulty during parse via processBatch", async () => {
    const buffer = buildCauHoiBuffer([
      {
        [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.single_choice,
        [IMPORT_TEMPLATE_COLUMNS.stem]: "Sample question with bad difficulty?",
        [IMPORT_TEMPLATE_COLUMNS.optionA]: "a",
        [IMPORT_TEMPLATE_COLUMNS.optionB]: "b",
        [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A",
        [IMPORT_TEMPLATE_COLUMNS.difficulty]: "siêu khó",
      },
    ]);
    const rows = service.parseWorkbook(buffer);
    await service.processBatch("batch-1", "sub-1", "admin-1", rows);
    expect(mockPrisma.importRowError.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ field: "difficulty" }),
      }),
    );
  });
});
