import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ContentComplianceService } from "./content-compliance.service";

describe("ContentComplianceService", () => {
  let service: ContentComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentComplianceService],
    }).compile();

    service = module.get(ContentComplianceService);
  });

  it("allows compliant copy", () => {
    expect(service.scan("Luyện thi CNVCK hiệu quả").ok).toBe(true);
  });

  it("flags prohibited claims", () => {
    const result = service.scan("Cam kết guaranteed pass");
    expect(result.ok).toBe(false);
  });

  it("throws on assertCompliant when violations exist", () => {
    expect(() => service.assertCompliant("đề thi chính thức UBCKNN")).toThrow(BadRequestException);
  });
});
