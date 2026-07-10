import { IsArray, IsOptional, IsString, IsUUID, ArrayNotEmpty } from "class-validator";

export class StartMockExamAttemptDto {
  @IsUUID()
  templateId!: string;
}

export class SaveMockExamAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedKeys!: string[];
}

export class GetMockExamQuestionQueryDto {
  @IsOptional()
  @IsUUID()
  questionId?: string;
}
