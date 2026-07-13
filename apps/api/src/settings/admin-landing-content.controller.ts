import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import type { AdminAuthPayload } from "../admin-auth/admin-auth.service";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { UpdateLandingContentDto } from "./dto/update-landing-content.dto";
import {
  buildLandingAssetPublicUrl,
  LocalDiskLandingAssetStorage,
  LANDING_ASSET_MAX_BYTES,
  mimeToExt,
} from "./landing-asset.storage";
import { SettingsService } from "./settings.service";

const ALLOWED_UPLOAD_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

@Controller("admin/landing-content")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
@Roles("super_admin")
export class AdminLandingContentController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly assetStorage: LocalDiskLandingAssetStorage,
  ) {}

  @Get()
  getLandingContent() {
    return this.settingsService.getLandingContent();
  }

  @Patch()
  updateLandingContent(
    @Body() dto: UpdateLandingContentDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.settingsService.updateLandingContent(dto, req.user as AdminAuthPayload);
  }

  @Post("assets")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAsset(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: "FILE_REQUIRED",
        message: "Phải tải lên ảnh banner.",
      });
    }
    if (file.size > LANDING_ASSET_MAX_BYTES) {
      throw new BadRequestException({
        code: "FILE_TOO_LARGE",
        message: "Ảnh tối đa 2MB.",
      });
    }
    if (!ALLOWED_UPLOAD_MIME.has(file.mimetype)) {
      throw new BadRequestException({
        code: "INVALID_FILE_TYPE",
        message: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.",
      });
    }

    const stored = await this.assetStorage.save(file.buffer, file.mimetype);
    const ext = mimeToExt(file.mimetype);
    return {
      assetId: stored.assetId,
      url: buildLandingAssetPublicUrl(stored.assetId, ext),
      alt: "",
    };
  }
}

@Controller("settings")
export class PublicLandingAssetsController {
  constructor(private readonly assetStorage: LocalDiskLandingAssetStorage) {}

  @Get("landing-assets/:assetId")
  async serveAsset(@Param("assetId") assetId: string): Promise<StreamableFile> {
    const file = await this.assetStorage.read(assetId);
    if (!file) {
      throw new NotFoundException({
        code: "ASSET_NOT_FOUND",
        message: "Không tìm thấy ảnh.",
      });
    }
    return new StreamableFile(file.buffer, {
      type: file.mimeType,
      disposition: "inline",
    });
  }
}
