import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, ArrayMinSize, MinLength } from "class-validator";

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
}

export class ReorderCoursesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  orderedIds!: string[];
}
