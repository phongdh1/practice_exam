import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateZaloConfigDto {
  @IsString()
  @MinLength(1)
  appId!: string;

  @IsOptional()
  @IsString()
  appSecret?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class UpdatePaymentMerchantDto {
  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  checksumKey?: string;

  @IsOptional()
  @IsString()
  webhookSecret?: string;

  @IsBoolean()
  testMode!: boolean;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  accountHolder?: string;
}

export class TestPaymentWebhookDto {
  @IsString()
  @MinLength(1)
  paymentId!: string;
}
