import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CreateCourseDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  coverImageUrl?: string | null;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsEnum(["active", "archived"])
  visibility?: "active" | "archived";

  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  coverImageUrl?: string | null;
}

export class ReorderCoursesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  orderedIds!: string[];
}
