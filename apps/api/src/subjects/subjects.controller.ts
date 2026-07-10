import { Controller, Get } from "@nestjs/common";
import type { SubjectCatalogItem } from "@practice-exam/types";
import { SubjectsService } from "./subjects.service";

@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  listCatalog(): Promise<SubjectCatalogItem[]> {
    return this.subjectsService.listActiveCatalog();
  }
}
