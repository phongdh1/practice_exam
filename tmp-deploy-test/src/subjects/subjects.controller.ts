import { Controller, Get, Query } from "@nestjs/common";
import type { PaginatedResult, SubjectCatalogItem } from "@practice-exam/types";
import { SubjectsService } from "./subjects.service";
import { ListSubjectsQueryDto } from "./dto/list-subjects.dto";

@Controller("subjects")
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  listCatalog(
    @Query() query: ListSubjectsQueryDto,
  ): Promise<SubjectCatalogItem[] | PaginatedResult<SubjectCatalogItem>> {
    if (query.page !== undefined || query.limit !== undefined) {
      return this.subjectsService.listActiveCatalogPaginated(
        query.page ?? 1,
        query.limit ?? 12,
      );
    }
    return this.subjectsService.listActiveCatalog();
  }
}
