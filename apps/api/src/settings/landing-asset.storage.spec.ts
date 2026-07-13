import { BadRequestException } from "@nestjs/common";
import { LocalDiskLandingAssetStorage, LANDING_ASSET_MAX_BYTES } from "./landing-asset.storage";

describe("LocalDiskLandingAssetStorage", () => {
  let storage: LocalDiskLandingAssetStorage;

  beforeEach(() => {
    storage = new LocalDiskLandingAssetStorage();
  });

  it("rejects files over 2MB", async () => {
    const buffer = Buffer.alloc(LANDING_ASSET_MAX_BYTES + 1);
    await expect(storage.save(buffer, "image/png")).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects unsupported mime types", async () => {
    await expect(storage.save(Buffer.from("x"), "image/gif")).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
