import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class MaintenanceModeDto {
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;
}

export class EmailTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}

export class UpdateSystemSettingsDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  disclaimerText?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MaintenanceModeDto)
  maintenance?: MaintenanceModeDto;

  @IsOptional()
  @IsObject()
  emailTemplates?: Record<string, EmailTemplateDto>;
}
