import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import { AdminJwtGuard, type AdminRequestUser } from "../admin-auth/guards/admin-jwt.guard";
import { AdminRolesGuard } from "../admin-auth/guards/admin-roles.guard";
import { Roles } from "../admin-auth/decorators/roles.decorator";
import {
  CreatePromoCodeDto,
  InitiateRefundDto,
  ListTransactionsQueryDto,
  ReconciliationQueryDto,
  RevenueReportQueryDto,
  UpdatePromoCodeDto,
} from "./dto/payments-admin.dto";
import { PaymentsAdminService } from "./payments-admin.service";

@Controller("admin/payments")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class PaymentsAdminController {
  constructor(private readonly paymentsAdminService: PaymentsAdminService) {}

  @Get("transactions")
  @Roles("finance", "super_admin")
  listTransactions(@Query() query: ListTransactionsQueryDto) {
    return this.paymentsAdminService.listTransactions(query);
  }

  @Get("reconciliation")
  @Roles("finance", "super_admin")
  getReconciliation(@Query() query: ReconciliationQueryDto) {
    return this.paymentsAdminService.getReconciliation(query);
  }

  @Get("revenue")
  @Roles("finance", "super_admin")
  getRevenue(@Query() query: RevenueReportQueryDto) {
    return this.paymentsAdminService.getRevenueReport(query);
  }

  @Get("revenue/export")
  @Roles("finance", "super_admin")
  async exportRevenue(
    @Query() query: RevenueReportQueryDto,
    @Res() res: Response,
  ) {
    const report = await this.paymentsAdminService.getRevenueReport(query);
    const csv = this.paymentsAdminService.revenueReportToCsv(report);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="revenue-report.csv"');
    res.send(csv);
  }

  @Post(":id/refund")
  @Roles("finance", "super_admin")
  initiateRefund(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: InitiateRefundDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.paymentsAdminService.initiateRefund(id, dto, req.user);
  }
}

@Controller("admin/promo-codes")
@UseGuards(AdminJwtGuard, AdminRolesGuard)
export class PromoCodesAdminController {
  constructor(private readonly paymentsAdminService: PaymentsAdminService) {}

  @Get()
  @Roles("finance", "super_admin")
  list() {
    return this.paymentsAdminService.listPromoCodes();
  }

  @Post()
  @Roles("finance", "super_admin")
  create(@Body() dto: CreatePromoCodeDto, @Req() req: { user: AdminRequestUser }) {
    return this.paymentsAdminService.createPromoCode(dto, req.user);
  }

  @Patch(":id")
  @Roles("finance", "super_admin")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdatePromoCodeDto,
    @Req() req: { user: AdminRequestUser },
  ) {
    return this.paymentsAdminService.updatePromoCode(id, dto, req.user);
  }
}
