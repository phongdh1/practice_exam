import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class SearchUsersQueryDto {
  @IsString()
  @IsNotEmpty()
  q!: string;
}

export class GrantSubscriptionDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class RevokeSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class MergePreviewQueryDto {
  @IsUUID()
  survivorId!: string;

  @IsUUID()
  duplicateId!: string;
}

export class ForceMergeDto {
  @IsUUID()
  survivorId!: string;

  @IsUUID()
  duplicateId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  ticketReference!: string;
}

export class SuspendUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class UnsuspendUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class ExportUserQueryDto {
  @IsOptional()
  @IsIn(["json", "csv"])
  format?: "json" | "csv";
}
