import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class DifficultyRulesDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  easy?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  medium?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  hard?: number;
}

export class MockExamSectionDto {
  @IsUUID()
  subjectId!: string;

  @IsInt()
  @Min(0)
  sectionOrder!: number;

  @IsInt()
  @Min(1)
  questionCount!: number;

  @IsInt()
  @Min(1)
  timeLimitMinutes!: number;

  @IsEnum(["fixed", "randomized"])
  selectionMode!: "fixed" | "randomized";

  @IsInt()
  @Min(1)
  @Max(100)
  weightPercent!: number;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  fixedQuestionIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DifficultyRulesDto)
  difficultyRules?: DifficultyRulesDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicTags?: string[];
}

export class CreateMockExamTemplateDto {
  @IsUUID()
  subjectId!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  totalDurationMinutes!: number;

  @IsInt()
  @Min(0)
  @Max(100)
  passingScorePercent!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyAttemptLimit?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockExamSectionDto)
  sections!: MockExamSectionDto[];
}

export class UpdateMockExamTemplateDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalDurationMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  passingScorePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  monthlyAttemptLimit?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MockExamSectionDto)
  sections?: MockExamSectionDto[];
}
