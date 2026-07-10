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
  @IsString()
  @MinLength(1)
  merchantId!: string;

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
}

export class TestPaymentWebhookDto {
  @IsString()
  @MinLength(1)
  paymentId!: string;
}
