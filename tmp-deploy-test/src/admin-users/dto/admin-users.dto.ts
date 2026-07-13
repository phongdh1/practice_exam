import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import type { AdminRole } from "@prisma/client";

const ADMIN_ROLES = [
  "super_admin",
  "editor",
  "reviewer",
  "support",
  "finance",
] as const satisfies readonly AdminRole[];

export class CreateAdminUserDto {
  @IsEmail()
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(ADMIN_ROLES)
  role!: AdminRole;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEnum(ADMIN_ROLES)
  role?: AdminRole;

  @IsOptional()
  @IsBoolean()
  isDisabled?: boolean;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class ListAdminAuthAuditQueryDto {
  @IsOptional()
  limit?: string;
}
