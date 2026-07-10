import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class QuestionOptionDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  text!: string;
}

export class CreateQuestionDto {
  @IsUUID()
  subjectId!: string;

  @IsEnum(["single_choice", "multiple_choice", "true_false"])
  questionType!: "single_choice" | "multiple_choice" | "true_false";

  @IsEnum(["easy", "medium", "hard"])
  difficulty!: "easy" | "medium" | "hard";

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  stem!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  explanation?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options!: QuestionOptionDto[];

  @IsArray()
  @IsString({ each: true })
  correctOptionKeys!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sourceRef?: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsEnum(["single_choice", "multiple_choice", "true_false"])
  questionType?: "single_choice" | "multiple_choice" | "true_false";

  @IsOptional()
  @IsEnum(["easy", "medium", "hard"])
  difficulty?: "easy" | "medium" | "hard";

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  stem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  explanation?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctOptionKeys?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sourceRef?: string;
}

export class SearchQuestionsDto {
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @IsEnum(["draft", "in_review", "published", "archived"])
  status?: "draft" | "in_review" | "published" | "archived";

  @IsOptional()
  @IsEnum(["easy", "medium", "hard"])
  difficulty?: "easy" | "medium" | "hard";

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;
}
