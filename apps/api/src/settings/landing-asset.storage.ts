import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const LANDING_ASSET_MAX_BYTES = 2 * 1024 * 1024;

export interface StoredLandingAsset {
  assetId: string;
  filename: string;
  mimeType: string;
}

export interface LandingAssetStorage {
  save(
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredLandingAsset>;
  read(assetId: string): Promise<{ buffer: Buffer; mimeType: string } | null>;
}

@Injectable()
export class LocalDiskLandingAssetStorage implements LandingAssetStorage {
  private readonly rootDir: string;

  constructor() {
    this.rootDir =
      process.env.LANDING_ASSETS_DIR?.trim() ||
      path.join(process.cwd(), "storage", "landing-assets");
  }

  async save(buffer: Buffer, mimeType: string): Promise<StoredLandingAsset> {
    if (buffer.length > LANDING_ASSET_MAX_BYTES) {
      throw new BadRequestException({
        code: "FILE_TOO_LARGE",
        message: "Ảnh tối đa 2MB.",
      });
    }
    const ext = ALLOWED_MIME[mimeType];
    if (!ext) {
      throw new BadRequestException({
        code: "INVALID_FILE_TYPE",
        message: "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.",
      });
    }

    const assetId = randomUUID();
    const filename = `${assetId}${ext}`;
    await mkdir(this.rootDir, { recursive: true });
    await writeFile(path.join(this.rootDir, filename), buffer);

    return { assetId, filename, mimeType };
  }

  async read(assetId: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (!/^[0-9a-f-]{36}$/i.test(assetId)) {
      return null;
    }
    for (const ext of Object.values(ALLOWED_MIME)) {
      const filePath = path.join(this.rootDir, `${assetId}${ext}`);
      try {
        const buffer = await readFile(filePath);
        const mimeType =
          Object.entries(ALLOWED_MIME).find(([, e]) => e === ext)?.[0] ?? "application/octet-stream";
        return { buffer, mimeType };
      } catch {
        // try next extension
      }
    }
    return null;
  }
}

export function buildLandingAssetPublicUrl(assetId: string, ext: string): string {
  const base = (process.env.API_PUBLIC_URL ?? "http://localhost:3001").replace(/\/+$/, "");
  return `${base}/api/v1/settings/landing-assets/${assetId}${ext}`;
}

export function mimeToExt(mimeType: string): string {
  return ALLOWED_MIME[mimeType] ?? "";
}
