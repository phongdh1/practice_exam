import { describe, expect, it } from "vitest";
import type { ApiResponse } from "./index";

describe("ApiResponse types", () => {
  it("accepts data envelope shape", () => {
    const response: ApiResponse<{ status: string }> = {
      data: { status: "ok" },
    };
    expect(response.data.status).toBe("ok");
    expect(response.error).toBeUndefined();
  });
});
