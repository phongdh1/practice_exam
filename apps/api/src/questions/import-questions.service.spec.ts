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

    const difficultyValidation = cauHoi.getCell("I2").dataValidation;
    expect(difficultyValidation?.formulae).toEqual(expect.arrayContaining(["DanhMuc!$C$2:$C$4"]));
  });

  it("parses the generated import template with example rows skipped", async () => {
    const buffer = await service.buildImportTemplateBuffer();
    const rows = service.parseWorkbook(buffer);

    expect(rows).toHaveLength(0);
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
