import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { ImportBatchReport, QuestionTypeValue } from "@practice-exam/types";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { PrismaService } from "../prisma/prisma.service";
import { normalizeStem } from "../questions/question.mapper";

const MAX_IMPORT_ROWS = 500;
const IMPORT_SHEET_NAME = "Câu hỏi";
const DANH_MUC_SHEET_NAME = "DanhMuc";
const HUONG_DAN_SHEET_NAME = "HuongDan";
const TEMPLATE_DATA_ROW_START = 2;
const TEMPLATE_DATA_ROW_END = 501;

export const IMPORT_TEMPLATE_COLUMNS = {
  questionType: "Loại câu hỏi",
  stem: "Câu hỏi",
  optionA: "Đáp án A",
  optionB: "Đáp án B",
  optionC: "Đáp án C",
  optionD: "Đáp án D",
  correctKey: "Đáp án đúng",
  explanation: "Giải thích",
  difficulty: "Độ khó",
  tags: "Chủ đề",
} as const;

export const IMPORT_QUESTION_TYPE_LABELS = {
  single_choice: "Một lựa chọn",
  multiple_choice: "Nhiều lựa chọn",
  true_false: "Đúng/Sai",
} as const;

export const IMPORT_DIFFICULTY_LABELS = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
} as const;

const QUESTION_TYPE_BY_LABEL: Record<string, QuestionTypeValue> = {
  [IMPORT_QUESTION_TYPE_LABELS.single_choice]: "single_choice",
  [IMPORT_QUESTION_TYPE_LABELS.multiple_choice]: "multiple_choice",
  [IMPORT_QUESTION_TYPE_LABELS.true_false]: "true_false",
  "đúng/sai": "true_false",
  "true/false": "true_false",
  single_choice: "single_choice",
  multiple_choice: "multiple_choice",
  true_false: "true_false",
  single: "single_choice",
  multiple: "multiple_choice",
};

const IMPORT_TEMPLATE_EXAMPLE_ROWS: Record<string, string>[] = [
  {
    [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.single_choice,
    [IMPORT_TEMPLATE_COLUMNS.stem]: "Đây là câu hỏi mẫu một lựa chọn minh họa định dạng import?",
    [IMPORT_TEMPLATE_COLUMNS.optionA]: "Đáp án A mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionB]: "Đáp án B mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionC]: "Đáp án C mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionD]: "Đáp án D mẫu",
    [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A",
    [IMPORT_TEMPLATE_COLUMNS.explanation]: "Giải thích mẫu cho câu hỏi một lựa chọn.",
    [IMPORT_TEMPLATE_COLUMNS.difficulty]: IMPORT_DIFFICULTY_LABELS.easy,
    [IMPORT_TEMPLATE_COLUMNS.tags]: "mẫu, một lựa chọn",
  },
  {
    [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.multiple_choice,
    [IMPORT_TEMPLATE_COLUMNS.stem]: "Đây là câu hỏi mẫu nhiều lựa chọn minh họa định dạng import?",
    [IMPORT_TEMPLATE_COLUMNS.optionA]: "Đáp án A mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionB]: "Đáp án B mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionC]: "Đáp án C mẫu",
    [IMPORT_TEMPLATE_COLUMNS.optionD]: "Đáp án D mẫu",
    [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A,C",
    [IMPORT_TEMPLATE_COLUMNS.explanation]: "Giải thích mẫu cho câu hỏi nhiều lựa chọn.",
    [IMPORT_TEMPLATE_COLUMNS.difficulty]: IMPORT_DIFFICULTY_LABELS.medium,
    [IMPORT_TEMPLATE_COLUMNS.tags]: "mẫu, nhiều lựa chọn",
  },
  {
    [IMPORT_TEMPLATE_COLUMNS.questionType]: IMPORT_QUESTION_TYPE_LABELS.true_false,
    [IMPORT_TEMPLATE_COLUMNS.stem]: "Đây là câu hỏi mẫu đúng/sai minh họa định dạng import?",
    [IMPORT_TEMPLATE_COLUMNS.optionA]: "Đúng",
    [IMPORT_TEMPLATE_COLUMNS.optionB]: "Sai",
    [IMPORT_TEMPLATE_COLUMNS.optionC]: "",
    [IMPORT_TEMPLATE_COLUMNS.optionD]: "",
    [IMPORT_TEMPLATE_COLUMNS.correctKey]: "A",
    [IMPORT_TEMPLATE_COLUMNS.explanation]: "Giải thích mẫu cho câu hỏi đúng/sai.",
    [IMPORT_TEMPLATE_COLUMNS.difficulty]: IMPORT_DIFFICULTY_LABELS.hard,
    [IMPORT_TEMPLATE_COLUMNS.tags]: "mẫu, đúng/sai",
  },
];

const IMPORT_TEMPLATE_EXAMPLE_STEMS = new Set(
  IMPORT_TEMPLATE_EXAMPLE_ROWS.map((row) => normalizeStem(row[IMPORT_TEMPLATE_COLUMNS.stem])),
);

export interface ImportRow {
  rowNumber: number;
  questionType: QuestionTypeValue;
  stem: string;
  optionA: string;
  optionB: string;
  optionC?: string;
  optionD?: string;
  correctOptionKeys: string[];
  explanation?: string;
  difficulty?: string;
  tags?: string;
  preflightError?: { field: string; message: string };
}

@Injectable()
export class ImportQuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async enqueueImport(
    subjectId: string,
    uploadedById: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<{ batchId: string; status: string }> {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      throw new NotFoundException({
        code: "SUBJECT_NOT_FOUND",
        message: "Không tìm thấy môn học.",
      });
    }

    const rows = this.parseWorkbook(buffer);
    if (rows.length === 0) {
      throw new BadRequestException({
        code: "EMPTY_IMPORT",
        message: "File không có dữ liệu.",
      });
    }
    if (rows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestException({
        code: "IMPORT_TOO_LARGE",
        message: `Tối đa ${MAX_IMPORT_ROWS} dòng mỗi lần import.`,
      });
    }

    const batch = await this.prisma.importBatch.create({
      data: {
        subjectId,
        uploadedById,
        fileName,
        status: "pending",
        totalRows: rows.length,
      },
    });

    setImmediate(() => {
      void this.processBatch(batch.id, subjectId, uploadedById, rows);
    });

    return { batchId: batch.id, status: "pending" };
  }

  async getBatchReport(batchId: string): Promise<ImportBatchReport> {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id: batchId },
      include: { rowErrors: { orderBy: { rowNumber: "asc" } } },
    });
    if (!batch) {
      throw new NotFoundException({
        code: "IMPORT_BATCH_NOT_FOUND",
        message: "Không tìm thấy batch import.",
      });
    }

    return {
      id: batch.id,
      subjectId: batch.subjectId,
      fileName: batch.fileName,
      status: batch.status,
      totalRows: batch.totalRows,
      successCount: batch.successCount,
      errorCount: batch.errorCount,
      createdAt: batch.createdAt.toISOString(),
      completedAt: batch.completedAt?.toISOString() ?? null,
      rowErrors: batch.rowErrors.map((e) => ({
        rowNumber: e.rowNumber,
        field: e.field,
        message: e.message,
      })),
    };
  }

  async processBatch(
    batchId: string,
    subjectId: string,
    authorId: string,
    rows: ImportRow[],
  ) {
    await this.prisma.importBatch.update({
      where: { id: batchId },
      data: { status: "processing" },
    });

    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      const validationError = this.validateRow(row);
      if (validationError) {
        errorCount += 1;
        await this.prisma.importRowError.create({
          data: {
            importBatchId: batchId,
            rowNumber: row.rowNumber,
            field: validationError.field,
            message: validationError.message,
            rawData: row as unknown as object,
          },
        });
        continue;
      }

      try {
        const options = this.buildOptions(row);
        await this.prisma.question.create({
          data: {
            subjectId,
            authorId,
            stem: row.stem.trim(),
            explanation: row.explanation?.trim() ?? null,
            options,
            correctOptionKeys: row.correctOptionKeys,
            difficulty: this.mapDifficulty(row.difficulty),
            tags: row.tags ? row.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            status: "draft",
            questionType: row.questionType,
          },
        });
        successCount += 1;
      } catch (err) {
        errorCount += 1;
        await this.prisma.importRowError.create({
          data: {
            importBatchId: batchId,
            rowNumber: row.rowNumber,
            message: err instanceof Error ? err.message : "Lỗi không xác định",
            rawData: row as unknown as object,
          },
        });
      }
    }

    await this.prisma.importBatch.update({
      where: { id: batchId },
      data: {
        status: errorCount === rows.length ? "failed" : "completed",
        successCount,
        errorCount,
        completedAt: new Date(),
      },
    });
  }

  async buildImportTemplateBuffer(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    const danhMuc = workbook.addWorksheet(DANH_MUC_SHEET_NAME);
    danhMuc.columns = [
      { header: "Loại câu hỏi", key: "typeLabel", width: 20 },
      { header: "Mã", key: "typeCode", width: 18 },
      { header: "Độ khó", key: "difficultyLabel", width: 14 },
      { header: "Mã", key: "difficultyCode", width: 10 },
    ];
    danhMuc.addRows([
      {
        typeLabel: IMPORT_QUESTION_TYPE_LABELS.single_choice,
        typeCode: "single_choice",
        difficultyLabel: IMPORT_DIFFICULTY_LABELS.easy,
        difficultyCode: "easy",
      },
      {
        typeLabel: IMPORT_QUESTION_TYPE_LABELS.multiple_choice,
        typeCode: "multiple_choice",
        difficultyLabel: IMPORT_DIFFICULTY_LABELS.medium,
        difficultyCode: "medium",
      },
      {
        typeLabel: IMPORT_QUESTION_TYPE_LABELS.true_false,
        typeCode: "true_false",
        difficultyLabel: IMPORT_DIFFICULTY_LABELS.hard,
        difficultyCode: "hard",
      },
    ]);

    const huongDan = workbook.addWorksheet(HUONG_DAN_SHEET_NAME);
    huongDan.columns = [{ header: "Hướng dẫn import câu hỏi", key: "guide", width: 90 }];
    huongDan.addRows([
      { guide: "Nhập dữ liệu trên sheet Câu hỏi. Chọn Loại câu hỏi và Độ khó từ dropdown (danh mục ở sheet DanhMuc)." },
      { guide: "Một lựa chọn: đáp án đúng là 1 chữ cái (A, B, C hoặc D)." },
      { guide: "Nhiều lựa chọn: đáp án đúng là 2+ chữ cái, phân tách bằng dấu phẩy (vd: A,C)." },
      { guide: "Đúng/Sai: chỉ dùng đáp án A=Đúng, B=Sai; đáp án đúng là A hoặc B." },
      { guide: "Tối đa 500 dòng mỗi lần import. Câu hỏi import luôn ở trạng thái Nháp." },
    ]);

    const cauHoi = workbook.addWorksheet(IMPORT_SHEET_NAME);
    const headers = Object.values(IMPORT_TEMPLATE_COLUMNS);
    cauHoi.addRow(headers);
    for (const example of IMPORT_TEMPLATE_EXAMPLE_ROWS) {
      cauHoi.addRow(headers.map((header) => example[header] ?? ""));
    }

    const listValidation = (formulae: string) => ({
      type: "list" as const,
      allowBlank: false,
      formulae: [formulae],
      showErrorMessage: true,
      errorStyle: "error" as const,
    });

    for (let row = TEMPLATE_DATA_ROW_START; row <= TEMPLATE_DATA_ROW_END; row += 1) {
      cauHoi.getCell(`A${row}`).dataValidation = {
        ...listValidation("DanhMuc!$A$2:$A$4"),
        errorTitle: "Loại câu hỏi",
        error: "Chọn từ danh sách: Một lựa chọn, Nhiều lựa chọn, Đúng/Sai",
      };
      cauHoi.getCell(`I${row}`).dataValidation = {
        ...listValidation("DanhMuc!$C$2:$C$4"),
        allowBlank: true,
        errorTitle: "Độ khó",
        error: "Chọn từ danh sách: Dễ, Trung bình, Khó",
      };
    }

    cauHoi.columns = headers.map((header) => ({
      header,
      key: header,
      width: header === IMPORT_TEMPLATE_COLUMNS.stem ? 48 : 18,
    }));

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  parseWorkbook(buffer: Buffer): ImportRow[] {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames.includes(IMPORT_SHEET_NAME)
      ? IMPORT_SHEET_NAME
      : workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

    const rows: ImportRow[] = [];

    for (let index = 0; index < raw.length; index += 1) {
      const row = raw[index];
      const questionTypeRaw = String(
        row.questionType ?? row["Loại câu hỏi"] ?? row["loại câu hỏi"] ?? "",
      ).trim();

      let questionType: QuestionTypeValue = "single_choice";
      let preflightError: { field: string; message: string } | undefined;

      if (questionTypeRaw) {
        const mapped = QUESTION_TYPE_BY_LABEL[questionTypeRaw];
        if (!mapped) {
          preflightError = { field: "questionType", message: "Loại câu hỏi không hợp lệ." };
        } else {
          questionType = mapped;
        }
      }

      const difficultyRaw = String(row.difficulty ?? row["Độ khó"] ?? "").trim() || undefined;
      if (!preflightError && difficultyRaw) {
        const difficultyError = this.validateDifficultyLabel(difficultyRaw);
        if (difficultyError) {
          preflightError = difficultyError;
        }
      }

      const correctRaw = String(row.correct ?? row["Đáp án đúng"] ?? row.answer ?? "");
      const stem = String(row.stem ?? row["Câu hỏi"] ?? row.question ?? "");
      const optionA = String(row.option_a ?? row["Đáp án A"] ?? row.A ?? "");
      const optionB = String(row.option_b ?? row["Đáp án B"] ?? row.B ?? "");
      const optionC = String(row.option_c ?? row["Đáp án C"] ?? row.C ?? "") || undefined;
      const optionD = String(row.option_d ?? row["Đáp án D"] ?? row.D ?? "") || undefined;
      const explanation = String(row.explanation ?? row["Giải thích"] ?? "") || undefined;
      const tags = String(row.tags ?? row["Chủ đề"] ?? "") || undefined;

      if (
        !stem.trim() &&
        !optionA.trim() &&
        !optionB.trim() &&
        !optionC?.trim() &&
        !optionD?.trim() &&
        !correctRaw.trim() &&
        !explanation?.trim() &&
        !tags?.trim() &&
        !questionTypeRaw &&
        !difficultyRaw
      ) {
        continue;
      }

      if (IMPORT_TEMPLATE_EXAMPLE_STEMS.has(normalizeStem(stem))) {
        continue;
      }

      rows.push({
        rowNumber: index + 2,
        questionType,
        stem,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOptionKeys: this.parseCorrectOptionKeys(correctRaw),
        explanation,
        difficulty: difficultyRaw,
        tags,
        preflightError,
      });
    }

    return rows;
  }

  validateRow(row: ImportRow): { field: string; message: string } | null {
    if (row.preflightError) {
      return row.preflightError;
    }

    if (!row.stem?.trim()) {
      return { field: "stem", message: "Thiếu nội dung câu hỏi." };
    }
    if (normalizeStem(row.stem).length < 10) {
      return { field: "stem", message: "Câu hỏi quá ngắn." };
    }

    if (row.questionType === "true_false") {
      if (row.optionC?.trim() || row.optionD?.trim()) {
        return { field: "options", message: "Câu hỏi đúng/sai chỉ được có đáp án A và B." };
      }
      if (!row.optionA?.trim() || !row.optionB?.trim()) {
        return { field: "options", message: "Câu hỏi đúng/sai phải có đáp án A (Đúng) và B (Sai)." };
      }
    } else if (!row.optionA?.trim() || !row.optionB?.trim()) {
      return { field: "options", message: "Phải có ít nhất đáp án A và B." };
    }

    const options = this.buildOptions(row);
    const optionKeys = new Set(options.map((o) => o.key));

    if (row.questionType === "true_false" && options.length !== 2) {
      return { field: "options", message: "Câu hỏi đúng/sai phải có đúng 2 lựa chọn." };
    }

    if (row.correctOptionKeys.length === 0) {
      return { field: "correctKey", message: "Thiếu đáp án đúng." };
    }

    const uniqueKeys = [...new Set(row.correctOptionKeys)];
    if (uniqueKeys.length !== row.correctOptionKeys.length) {
      return { field: "correctKey", message: "Đáp án đúng không được trùng lặp." };
    }

    for (const key of row.correctOptionKeys) {
      if (!["A", "B", "C", "D"].includes(key)) {
        return { field: "correctKey", message: "Đáp án đúng phải là A, B, C hoặc D." };
      }
      if (!optionKeys.has(key)) {
        return { field: "correctKey", message: `Thiếu đáp án ${key} tương ứng với đáp án đúng.` };
      }
    }

    if (row.questionType === "single_choice" && row.correctOptionKeys.length !== 1) {
      return { field: "correctKey", message: "Câu hỏi một lựa chọn phải có đúng 1 đáp án đúng." };
    }

    if (row.questionType === "multiple_choice" && row.correctOptionKeys.length < 2) {
      return { field: "correctKey", message: "Câu hỏi nhiều lựa chọn phải có ít nhất 2 đáp án đúng." };
    }

    if (row.questionType === "true_false" && row.correctOptionKeys.length !== 1) {
      return { field: "correctKey", message: "Câu hỏi đúng/sai phải có đúng 1 đáp án đúng." };
    }

    return null;
  }

  private parseCorrectOptionKeys(value: string): string[] {
    return value
      .split(",")
      .map((part) => part.trim().toUpperCase())
      .filter(Boolean);
  }

  private validateDifficultyLabel(value: string): { field: string; message: string } | null {
    const v = value.trim();
    const lower = v.toLowerCase();
    const valid =
      v === IMPORT_DIFFICULTY_LABELS.easy ||
      lower === "dễ" ||
      lower === "easy" ||
      v === IMPORT_DIFFICULTY_LABELS.medium ||
      lower === "trung bình" ||
      lower === "medium" ||
      v === IMPORT_DIFFICULTY_LABELS.hard ||
      lower === "khó" ||
      lower === "hard";
    if (!valid) {
      return { field: "difficulty", message: "Độ khó không hợp lệ." };
    }
    return null;
  }

  private buildOptions(row: ImportRow) {
    const options = [
      { key: "A", text: row.optionA.trim() },
      { key: "B", text: row.optionB.trim() },
    ];
    if (row.optionC?.trim()) options.push({ key: "C", text: row.optionC.trim() });
    if (row.optionD?.trim()) options.push({ key: "D", text: row.optionD.trim() });
    return options;
  }

  private mapDifficulty(value?: string): "easy" | "medium" | "hard" {
    const v = value?.trim().toLowerCase();
    if (v === "easy" || v === "dễ" || value?.trim() === IMPORT_DIFFICULTY_LABELS.easy) return "easy";
    if (v === "hard" || v === "khó" || value?.trim() === IMPORT_DIFFICULTY_LABELS.hard) return "hard";
    if (v === "medium" || v === "trung bình" || value?.trim() === IMPORT_DIFFICULTY_LABELS.medium) {
      return "medium";
    }
    return "medium";
  }
}
