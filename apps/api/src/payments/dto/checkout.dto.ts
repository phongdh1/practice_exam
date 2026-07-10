import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";
import type { PaymentChannel, PaymentProvider } from "@prisma/client";

export class InitiateCheckoutDto {
  @IsString()
  subjectId!: string;

  @IsOptional()
  @IsEnum(["payos", "sepay"])
  provider?: PaymentProvider;

  @IsEnum(["web", "zalo"])
  channel!: PaymentChannel;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  promoCode?: string;

  @IsUrl({ require_tld: false })
  returnUrl!: string;

  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}
