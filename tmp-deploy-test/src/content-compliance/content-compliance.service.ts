import { BadRequestException, Injectable } from "@nestjs/common";
import type { ContentComplianceScanResult } from "@practice-exam/types";
import { scanProhibitedClaims } from "@practice-exam/utils";

@Injectable()
export class ContentComplianceService {
  scan(...texts: Array<string | null | undefined>): ContentComplianceScanResult {
    return scanProhibitedClaims(...texts);
  }

  assertCompliant(...texts: Array<string | null | undefined>): void {
    const result = this.scan(...texts);
    if (!result.ok) {
      throw new BadRequestException({
        code: "PROHIBITED_CLAIM",
        message: "Nội dung chứa cụm từ không được phép.",
        details: { violations: result.violations },
      });
    }
  }
}
