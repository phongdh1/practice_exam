import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AdminJwtGuard } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import { AdminUser } from "../admin-auth/decorators/admin-user.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { ImportQuestionsService } from "../questions/import-questions.service";

@Controller("admin/questions/import")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin", "editor")
export class ImportQuestionsController {
  constructor(private readonly importService: ImportQuestionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @AdminUser() admin: AdminAuthPayload,
    @UploadedFile() file: { buffer: Buffer; originalname: string } | undefined,
    @Body("subjectId") subjectId: string,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: "FILE_REQUIRED",
        message: "Phải tải lên file Excel.",
      });
    }
    if (!subjectId) {
      throw new BadRequestException({
        code: "SUBJECT_REQUIRED",
        message: "Phải chọn môn học.",
      });
    }

    return this.importService.enqueueImport(
      subjectId,
      admin.sub,
      file.originalname,
      file.buffer,
    );
  }

  @Get("template")
  async downloadTemplate(): Promise<StreamableFile> {
    const buffer = await this.importService.buildImportTemplateBuffer();
    return new StreamableFile(buffer, {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      disposition: 'attachment; filename="mau-import-cau-hoi.xlsx"',
    });
  }

  @Get(":batchId")
  getReport(@Param("batchId") batchId: string) {
    return this.importService.getBatchReport(batchId);
  }
}
