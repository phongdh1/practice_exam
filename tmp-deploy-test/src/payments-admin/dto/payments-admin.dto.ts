import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import type { PaymentProvider, PaymentStatus } from "@prisma/client";

export class ListTransactionsQueryDto {
  @IsOptional()
  @IsEnum(["payos", "sepay"])
  provider?: PaymentProvider;

  @IsOptional()
  @IsEnum(["pending", "paid", "failed", "cancelled", "refunded"])
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class ReconciliationQueryDto {
  @IsOptional()
  @IsEnum(["payos", "sepay"])
  provider?: PaymentProvider;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class RevenueReportQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class InitiateRefundDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsEnum(["percentage", "fixed"])
  discountType!: "percentage" | "fixed";

  @Type(() => Number)
  @IsInt()
  @Min(1)
  discountValue!: number;

  @IsDateString()
  expiresAt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit!: number;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  subjectIds?: string[];
}

export class UpdatePromoCodeDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  subjectIds?: string[];

  @IsOptional()
  isActive?: boolean;
}
