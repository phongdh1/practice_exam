import { afterEach, describe, expect, it, vi } from "vitest";
import {
  parseCoverImageInput,
  readCoverImage,
  COVER_IMAGE_MAX_BYTES,
} from "./cover-image";

afterEach(() => vi.unstubAllGlobals());

describe("course and subject cover images", () => {
  it("keeps inline images, remote URLs and image removal valid", () => {
    for (const value of ["data:image/png;base64,AQID", "https://example.com/cover.png"]) {
      expect(parseCoverImageInput(value)).toEqual({ ok: true, value });
    }
    expect(parseCoverImageInput(" ")).toEqual({ ok: true, value: null });
  });

  it("rejects unsupported or malformed inline images", () => {
    for (const value of ["data:image/svg+xml;base64,AQID", "data:image/png;base64,", "data:image/png;base64,ABC", "data:text/html;base64,AQID"]) {
      expect(parseCoverImageInput(value).ok).toBe(false);
    }
  });

  it("enforces decoded byte size, allowing exactly 10MiB", () => {
    const atLimit = Buffer.alloc(COVER_IMAGE_MAX_BYTES).toString("base64");
    expect(parseCoverImageInput(`data:image/png;base64,${atLimit}`).ok).toBe(true);
    const overLimit = Buffer.alloc(COVER_IMAGE_MAX_BYTES + 1).toString("base64");
    expect(parseCoverImageInput(`data:image/png;base64,${overLimit}`).ok).toBe(false);
  });

  it("reads a chosen image locally as a data URL", async () => {
    const dataUrl = "data:image/png;base64,AQID";
    const readAsDataURL = vi.fn(function (this: { result: string; onload: () => void }) {
      this.result = dataUrl;
      this.onload();
    });
    vi.stubGlobal("FileReader", class { result = ""; onload = () => {}; readAsDataURL = readAsDataURL; });
    const file = new File([new Uint8Array([1, 2, 3])], "cover.png", { type: "image/png" });
    await expect(readCoverImage(file)).resolves.toBe(dataUrl);
    expect(readAsDataURL).toHaveBeenCalledWith(file);
  });

  it("rejects oversized, empty and unsupported files before reading", async () => {
    await expect(readCoverImage(new File(["x"], "cover.svg", { type: "image/svg+xml" }))).rejects.toThrow("JPEG");
    await expect(readCoverImage(new File([], "cover.png", { type: "image/png" }))).rejects.toThrow("trống");
    await expect(readCoverImage(new File([new Uint8Array(COVER_IMAGE_MAX_BYTES + 1)], "large.png", { type: "image/png" }))).rejects.toThrow("10MB");
  });

  it("reports file reading errors", async () => {
    vi.stubGlobal("FileReader", class {
      onerror = () => {};
      readAsDataURL() { this.onerror(); }
    });
    await expect(readCoverImage(new File(["x"], "cover.png", { type: "image/png" }))).rejects.toThrow("Không đọc được");
  });
});
