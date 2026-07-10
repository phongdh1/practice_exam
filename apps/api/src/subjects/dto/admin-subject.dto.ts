import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { MIN_SUBJECT_PRICE_VND } from "../subject.constants";

export class CreateSubjectDto {
  @IsUUID("4")
  courseId!: string;

  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(MIN_SUBJECT_PRICE_VND)
  monthlyAmountVnd!: number;

  @IsInt()
  @Min(1)
  freeTierLimit!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  studyTierLimit?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicTags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  minPublishedQuestionsForGoLive?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  minApprovedTemplatesForGoLive?: number;
}

export class UpdateSubjectDto {
  @IsOptional()
  @IsUUID("4")
  courseId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(MIN_SUBJECT_PRICE_VND)
  monthlyAmountVnd?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  freeTierLimit?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  studyTierLimit?: number;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsEnum(["active", "archived"])
  visibility?: "active" | "archived";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicTags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  minPublishedQuestionsForGoLive?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  minApprovedTemplatesForGoLive?: number;
}

export class ReorderSubjectsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  orderedIds!: string[];
}

export class SubjectBlueprintDto {
  @IsArray()
  @IsString({ each: true })
  topicTags!: string[];
}
