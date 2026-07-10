import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, ArrayNotEmpty } from "class-validator";

export class StartPracticeSessionDto {
  @IsUUID()
  subjectId!: string;

  @IsOptional()
  @IsBoolean()
  forceNew?: boolean;
}

export class SubmitPracticeAnswerDto {
  @IsUUID()
  questionId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  selectedKeys!: string[];
}
