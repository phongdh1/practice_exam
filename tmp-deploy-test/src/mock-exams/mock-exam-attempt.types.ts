export interface MockExamAttemptSectionPlan {
  sectionOrder: number;
  subjectId: string;
  questionIds: string[];
  timeLimitMinutes: number;
  weightPercent: number;
}

export interface MockExamAttemptQuestionPlan {
  sections: MockExamAttemptSectionPlan[];
}

export interface MockExamSectionScore {
  sectionIndex: number;
  sectionOrder: number;
  subjectId: string;
  weightPercent: number;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  weightedScore: number;
}
