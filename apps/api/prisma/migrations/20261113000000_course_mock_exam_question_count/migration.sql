ALTER TABLE "courses"
ADD COLUMN "mock_exam_question_count" INTEGER NOT NULL DEFAULT 50,
ADD CONSTRAINT "courses_mock_exam_question_count_positive" CHECK ("mock_exam_question_count" > 0);
