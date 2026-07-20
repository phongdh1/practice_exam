/** Standard API response envelope (AD-2, architecture spine) */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface HealthData {
  status: "ok";
  timestamp: string;
}

export type AuthProviderType = "email" | "google" | "zalo";

export interface AuthIdentityView {
  provider: AuthProviderType;
  externalId: string;
}

/** Linked identity summary for GET /auth/me (no externalId exposed) */
export interface AuthIdentityLinkedView {
  provider: AuthProviderType;
  linkedAt: string;
}

export interface AuthMeUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  email?: string;
  identities: AuthIdentityLinkedView[];
}

export interface AuthUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  email?: string;
  identities: AuthIdentityView[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface MergeSummary {
  mergedUserIds: string[];
  survivorUserId: string;
  subscriptionsMerged: number;
  practiceSessionsMerged: number;
  mockExamAttemptsMerged?: number;
  duplicateSubscriptionsResolved: number;
}

export interface SubjectCatalogItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  code: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  isHot: boolean;
  monthlyPriceVnd: number;
  freeTierLimit: number;
}

export interface FreeTierStatus {
  subjectId: string;
  used: number;
  limit: number;
  remaining: number;
  periodKey: string;
  isAtLimit: boolean;
  hasActiveSubscription: boolean;
}

export interface FreeTierUsageSummary {
  periodKey: string;
  items: FreeTierStatus[];
}

export interface StudyTierStatus {
  subjectId: string;
  used: number;
  limit: number;
  /** When `hasActiveSubscription` is true, access is unlimited; `remaining` mirrors `limit` for display only. */
  remaining: number;
  periodKey: string;
  isAtLimit: boolean;
  hasActiveSubscription: boolean;
}

export interface StudyQuestionListItem {
  id: string;
  stem: string;
  questionType: QuestionTypeValue;
  difficulty: QuestionDifficultyType;
  tags: string[];
  imageUrls: string[];
  /** True when the user already opened this question in the current ICT period */
  viewedThisPeriod: boolean;
}

export interface StudyQuestionListResult {
  items: StudyQuestionListItem[];
  total: number;
  page: number;
  pageSize: number;
  studyTier: StudyTierStatus;
}

export interface StudyQuestionDetail {
  id: string;
  stem: string;
  questionType: QuestionTypeValue;
  difficulty: QuestionDifficultyType;
  tags: string[];
  imageUrls: string[];
  options: QuestionOption[];
  correctOptionKeys: string[];
  explanation: string | null;
  studyTier: StudyTierStatus;
}

export interface MockExamAccess {
  allowed: boolean;
  reason?: "FREE_TIER_ONLY" | "NO_SUBSCRIPTION";
}

export interface MockExamAttemptStatus {
  templateId: string;
  periodKey: string;
  limit: number;
  used: number;
  remaining: number;
}

export interface MockExamTemplateSummary {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  status: "draft" | "approved" | "archived";
  totalDurationMinutes: number;
  passingScorePercent: number;
  monthlyAttemptLimit: number;
}

export interface MockExamSectionSummary {
  id: string;
  subjectId: string;
  sectionOrder: number;
  questionCount: number;
  timeLimitMinutes: number;
  selectionMode: "fixed" | "randomized";
  weightPercent: number;
  topicTags: string[];
}

/** Candidate-facing template list item — omits admin-only section fields and status. */
export interface MockExamCandidateTemplateListItem {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  totalDurationMinutes: number;
  passingScorePercent: number;
  monthlyAttemptLimit: number;
  sections: MockExamSectionSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface MockExamCandidateTemplateView {
  id: string;
  subjectId: string;
  name: string;
  description: string | null;
  totalDurationMinutes: number;
  passingScorePercent: number;
  totalQuestions: number;
  subjectIds: string[];
  sections: Array<{
    sectionOrder: number;
    subjectId: string;
    questionCount: number;
    timeLimitMinutes: number;
    weightPercent: number;
  }>;
  attempts: MockExamAttemptStatus;
  canStart: boolean;
  accessDeniedReason?: "FREE_TIER_ONLY" | "NO_SUBSCRIPTION";
  attemptsExhausted: boolean;
}

export type MockExamAttemptPhaseType = "in_section" | "review" | "completed";
export type MockExamAttemptStatusType = "in_progress" | "completed" | "expired";

export interface MockExamAttemptView {
  id: string;
  templateId: string;
  templateName: string;
  subjectId: string;
  status: MockExamAttemptStatusType;
  phase: MockExamAttemptPhaseType;
  passingScorePercent: number;
  totalDurationMinutes: number;
  totalQuestions: number;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  sectionCount: number;
  sectionRemainingMs: number | null;
  sections: Array<{
    sectionIndex: number;
    sectionOrder: number;
    subjectId: string;
    questionCount: number;
    timeLimitMinutes: number;
    weightPercent: number;
  }>;
  startedAt: string;
  completedAt: string | null;
}

export interface MockExamQuestionView {
  id: string;
  stem: string;
  questionType: QuestionTypeValue;
  options: QuestionOption[];
  imageUrls: string[];
  sectionIndex: number;
  questionIndex: number;
  globalQuestionNumber: number;
  selectedKeys: string[];
  canEdit: boolean;
}

export interface MockExamReviewItem {
  questionId: string;
  sectionIndex: number;
  questionIndex: number;
  globalQuestionNumber: number;
  answered: boolean;
}

export interface MockExamSectionScoreView {
  sectionIndex: number;
  sectionOrder: number;
  subjectId: string;
  weightPercent: number;
  correctCount: number;
  totalCount: number;
  scorePercent: number;
  weightedScore: number;
}

export interface MockExamQuestionReview {
  questionId: string;
  sectionIndex: number;
  questionIndex: number;
  globalQuestionNumber: number;
  stem: string;
  questionType: QuestionTypeValue;
  options: QuestionOption[];
  selectedKeys: string[];
  correctOptionKeys: string[];
  isCorrect: boolean;
  explanation: string | null;
}

export interface MockExamResultsView {
  attemptId: string;
  templateId: string;
  templateName: string;
  scorePercent: number;
  passingScorePercent: number;
  passed: boolean;
  sectionBreakdown: MockExamSectionScoreView[];
  questionReviews?: MockExamQuestionReview[];
  completedAt: string;
}

export interface SubjectGoLiveStatus {
  publishedQuestionCount: number;
  approvedTemplateCount: number;
  canActivate: boolean;
  requirements: {
    minPublishedQuestions: number;
    minApprovedTemplates: number;
  };
}

export type CourseVisibilityType = "active" | "archived";
export type SubjectVisibilityType = "active" | "archived";

export interface AdminCourseView {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  visibility: CourseVisibilityType;
  displayOrder: number;
  subjectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSubjectView {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  code: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  isHot: boolean;
  visibility: SubjectVisibilityType;
  displayOrder: number;
  topicTags: string[];
  monthlyAmountVnd: number | null;
  freeTierLimit: number | null;
  studyTierLimit: number | null;
  goLive: SubjectGoLiveStatus;
  createdAt: string;
  updatedAt: string;
}

export type PaymentProviderType = "payos" | "sepay";
export type PaymentChannelType = "web" | "zalo";
export type PaymentStatusType = "pending" | "paid" | "failed" | "cancelled" | "refunded";

export interface SubscriptionSummary {
  id: string;
  subjectId: string;
  subjectName?: string;
  status: SubjectSubscriptionStatus;
  periodStart: string;
  periodEnd: string;
  channel: string;
  daysUntilExpiry: number;
}

export interface CheckoutResult {
  paymentId: string;
  checkoutUrl: string;
  provider: PaymentProviderType;
  channel: PaymentChannelType;
  amountVnd: number;
  /** Present for SePay VietQR / bank-transfer checkout */
  qrImageUrl?: string | null;
  transferContent?: string | null;
  bankAccountNumber?: string | null;
  bankCode?: string | null;
  accountHolder?: string | null;
  checkoutMode?: "redirect" | "vietqr";
}

export interface PaymentDetail {
  id: string;
  status: PaymentStatusType;
  provider: PaymentProviderType;
  channel: PaymentChannelType;
  amountVnd: number;
  subjectId: string;
  checkoutUrl: string | null;
  paidAt: string | null;
  subscription: SubscriptionSummary | null;
  qrImageUrl?: string | null;
  transferContent?: string | null;
  bankAccountNumber?: string | null;
  bankCode?: string | null;
  accountHolder?: string | null;
  checkoutMode?: "redirect" | "vietqr";
}

export type SubjectSubscriptionStatus = "active" | "expiring" | "expired";

export interface PlatformDisclaimer {
  text: string;
  version: string;
}

export interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

export type EmailNotificationTemplateKey =
  | "welcome"
  | "payment_confirmed"
  | "subscription_expiring";

export interface EmailNotificationTemplate {
  subject: string;
  body: string;
}

export interface SystemSettingsView {
  disclaimer: PlatformDisclaimer;
  maintenance: MaintenanceMode;
  emailTemplates: Record<EmailNotificationTemplateKey, EmailNotificationTemplate>;
  updatedAt: string | null;
}

export type {
  HeroBackgroundConfig,
  HeroChartPreset,
  HeroSidecardConfig,
  HeroSidecardMode,
  HeroSidecardStatsConfig,
  LandingAssetRef,
  LandingContentView,
  LandingMetric,
} from "./landing-content";
export {
  DEFAULT_LANDING_CONTENT,
  DEFAULT_LANDING_ILLUSTRATION_FOOTNOTE,
  HERO_CHART_PRESET_HEIGHTS,
  mergeLandingContent,
} from "./landing-content";

export interface AdminDashboardSubscriptionRow {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  activeCount: number;
}

export interface AdminDashboardKpis {
  generatedAt: string;
  subscriptionsBySubject: AdminDashboardSubscriptionRow[] | null;
  monthlyRevenue: {
    from: string;
    to: string;
    totalRevenueVnd: number;
    totalCount: number;
  } | null;
  contentQueue: {
    editorialPending: number;
    flaggedOpen: number;
  } | null;
}

export interface ContentComplianceScanResult {
  ok: boolean;
  violations: Array<{ phrase: string; matchedText: string }>;
}

export type QuestionStatusType = "draft" | "in_review" | "published" | "archived";
export type QuestionTypeValue = "single_choice" | "multiple_choice" | "true_false";
export type QuestionDifficultyType = "easy" | "medium" | "hard";
export type QuestionFlagStatusType = "open" | "assigned" | "resolved" | "escalated";
export type ImportBatchStatusType = "pending" | "processing" | "completed" | "failed";

export interface QuestionOption {
  key: string;
  text: string;
}

export interface QuestionSummary {
  id: string;
  subjectId: string;
  subjectName?: string;
  authorId: string;
  authorName?: string;
  status: QuestionStatusType;
  questionType: QuestionTypeValue;
  difficulty: QuestionDifficultyType;
  stem: string;
  tags: string[];
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  publishedAt?: string | null;
}

export interface QuestionDetail extends QuestionSummary {
  explanation: string | null;
  options: QuestionOption[];
  correctOptionKeys: string[];
  imageUrls: string[];
  sourceRef?: string | null;
  duplicateWarning?: { matchingQuestionId: string; stem: string } | null;
  parentQuestionId?: string | null;
  reviewerId?: string | null;
  reviewerName?: string | null;
}

export interface QuestionPreview {
  stem: string;
  options: QuestionOption[];
  correctOptionKeys: string[];
  explanation: string | null;
  imageUrls: string[];
  questionType: QuestionTypeValue;
}

export interface QuestionSearchResult {
  items: QuestionSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface QuestionBankStats {
  total: number;
  published: number;
  inReview: number;
  draft: number;
}

export interface EditorialQueueItem {
  id: string;
  stem: string;
  subjectId: string;
  subjectName: string;
  authorId: string;
  authorName: string;
  submittedAt: string;
  ageDays: number;
  reviewerId?: string | null;
  reviewerName?: string | null;
}

export interface ImportBatchSummary {
  id: string;
  subjectId: string;
  fileName: string;
  status: ImportBatchStatusType;
  totalRows: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string | null;
}

export interface ImportRowErrorItem {
  rowNumber: number;
  field?: string | null;
  message: string;
}

export interface ImportBatchReport extends ImportBatchSummary {
  rowErrors: ImportRowErrorItem[];
}

export interface QuestionFlagItem {
  id: string;
  questionId: string;
  questionStem: string;
  userId: string;
  userDisplayName: string | null;
  comment: string | null;
  status: QuestionFlagStatusType;
  assigneeId?: string | null;
  assigneeName?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export type PracticeSessionStatusType = "in_progress" | "completed" | "expired";

export interface PracticeSessionView {
  id: string;
  subjectId: string;
  subjectName: string;
  status: PracticeSessionStatusType;
  answeredCount: number;
  correctCount: number;
  expiresAt: string;
  resumable: boolean;
  freeTierAtLimit: boolean;
}

export interface PracticeQuestionView {
  questionId: string;
  questionNumber: number;
  questionType: QuestionTypeValue;
  stem: string;
  options: QuestionOption[];
  imageUrls: string[];
}

export interface PracticeAnswerFeedback {
  isCorrect: boolean;
  correctOptionKeys: string[];
  explanation: string | null;
  freeTierStatus: FreeTierStatus;
  answeredCount: number;
  correctCount: number;
  freeTierAtLimit: boolean;
}

export interface PracticeSessionSummary {
  sessionId: string;
  subjectId: string;
  subjectName: string;
  answeredCount: number;
  correctCount: number;
  scorePercent: number;
  endedAt: string;
  freeTierAtLimit: boolean;
}

export type AttemptHistoryType = "practice" | "mock";

export interface AttemptHistoryItem {
  id: string;
  type: AttemptHistoryType;
  subjectId: string;
  subjectName: string;
  date: string;
  scorePercent: number | null;
  label: string;
}

export interface AttemptHistoryList {
  items: AttemptHistoryItem[];
}

export interface SubjectPerformanceSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  questionsAttempted: number;
  correctCount: number;
  correctnessRate: number;
  mockAttemptsCount: number;
  averageMockScore: number | null;
  latestMockScore: number | null;
  hasAttempts: boolean;
}

export interface ProgressSummaryResponse {
  days: 30 | 90;
  subjects: SubjectPerformanceSummary[];
}

export interface PracticeSessionQuestionReview {
  questionId: string;
  questionNumber: number;
  stem: string;
  questionType: QuestionTypeValue;
  options: QuestionOption[];
  selectedKeys: string[];
  correctOptionKeys: string[];
  isCorrect: boolean;
  explanation: string | null;
}

export interface PracticeSessionDetailView {
  sessionId: string;
  subjectId: string;
  subjectName: string;
  scorePercent: number;
  answeredCount: number;
  correctCount: number;
  completedAt: string;
  questions: PracticeSessionQuestionReview[];
}

export interface AuthResult {
  user: AuthUser;
  tokens: TokenPair;
  mergeSummary?: MergeSummary;
}

// --- Admin: User & Subscription (EPIC-10) ---

export interface AdminUserSearchResult {
  id: string;
  displayName: string | null;
  isSuspended: boolean;
  createdAt: string;
  email: string | null;
  zaloId: string | null;
  identityCount: number;
}

export interface AdminUserIdentityView {
  provider: AuthProviderType;
  externalId: string;
  linkedAt: string;
}

export interface AdminUserPracticeSessionSummary {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  status: string;
  answeredCount: number;
  correctCount: number;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminUserMockExamAttemptSummary {
  id: string;
  templateId: string;
  templateName: string;
  status: string;
  scorePercent: number | null;
  startedAt: string;
  completedAt: string | null;
}

export interface AdminUserTimelineEvent {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminUserProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  isSuspended: boolean;
  createdAt: string;
  identities: AdminUserIdentityView[];
  subscriptions: SubscriptionSummary[];
  practiceSessions: AdminUserPracticeSessionSummary[];
  mockExamAttempts: AdminUserMockExamAttemptSummary[];
  timeline: AdminUserTimelineEvent[];
}

export interface AdminMergePreview {
  survivor: {
    id: string;
    displayName: string | null;
    identityCount: number;
    activeSubscriptions: number;
  };
  duplicate: {
    id: string;
    displayName: string | null;
    identityCount: number;
    activeSubscriptions: number;
  };
  summary: {
    subscriptionsToMerge: number;
    duplicateSubscriptionsResolved: number;
    practiceSessionsToMerge: number;
    mockExamAttemptsToMerge: number;
    identitiesToMerge: number;
  };
}

export interface AdminUserExportData {
  profile: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    isSuspended: boolean;
    createdAt: string;
  };
  identities: AdminUserIdentityView[];
  subscriptions: SubscriptionSummary[];
  practiceSessions: AdminUserPracticeSessionSummary[];
  mockExamAttempts: AdminUserMockExamAttemptSummary[];
}

export type ZaloDeploymentStatus = "not_configured" | "configured" | "verified" | "invalid";

export interface ZaloMiniAppConfigView {
  appId: string | null;
  appSecretMasked: string | null;
  callbackUrl: string | null;
  deploymentStatus: ZaloDeploymentStatus;
  lastVerifiedAt: string | null;
  diagnosticError: string | null;
}

export interface PaymentMerchantConfigView {
  provider: "payos" | "sepay";
  merchantId: string | null;
  apiKeyMasked: string | null;
  checksumKeyMasked: string | null;
  webhookSecretMasked: string | null;
  testMode: boolean;
  webhookUrl: string;
  configured: boolean;
  bankAccountNumber: string | null;
  bankCode: string | null;
  accountHolder: string | null;
}

export interface PaymentMerchantsView {
  payos: PaymentMerchantConfigView;
  sepay: PaymentMerchantConfigView;
}

export interface WebhookEventLogItem {
  id: string;
  category: "payment" | "zalo_oauth";
  provider: "payos" | "sepay" | null;
  externalEventId: string | null;
  status: string;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  processedAt: string | null;
  paymentId: string | null;
  payload: unknown;
  canRetry: boolean;
}

// --- Admin: Payments & Finance (EPIC-11) ---

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminPaymentTransaction {
  id: string;
  userId: string;
  userDisplayName: string | null;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  amountVnd: number;
  provider: PaymentProviderType;
  channel: PaymentChannelType;
  status: PaymentStatusType;
  externalRef: string | null;
  promoCode: string | null;
  paidAt: string | null;
  createdAt: string;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
}

export interface AdminReconciliationDay {
  date: string;
  provider: PaymentProviderType;
  transactionCount: number;
  grossRevenueVnd: number;
  failedCount: number;
  pendingCount: number;
  discrepancyCount: number;
}

export interface AdminPaymentRefund {
  id: string;
  paymentId: string;
  amountVnd: number;
  status: "pending" | "confirmed" | "failed";
  reason: string;
  providerRef: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface AdminRevenueSubjectRow {
  subjectId: string;
  subjectName: string;
  revenueVnd: number;
  count: number;
}

export interface AdminRevenueChannelRow {
  channel: PaymentChannelType;
  revenueVnd: number;
  count: number;
}

export interface AdminRevenueReport {
  from: string;
  to: string;
  totalRevenueVnd: number;
  totalCount: number;
  bySubject: AdminRevenueSubjectRow[];
  byChannel: AdminRevenueChannelRow[];
}

export type PromoDiscountType = "percentage" | "fixed";

export interface AdminPromoCode {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  expiresAt: string;
  usageLimit: number;
  usageCount: number;
  subjectIds: string[];
  isActive: boolean;
  isExpired: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminRoleType =
  | "super_admin"
  | "editor"
  | "reviewer"
  | "support"
  | "finance";

export type AdminPermissionCapability =
  | "subject_crud_pricing"
  | "question_crud_draft"
  | "editorial_approve_reject"
  | "mock_exam_template"
  | "user_search_profile"
  | "manual_subscription_grant"
  | "account_merge_override"
  | "payment_log_reconciliation"
  | "refunds"
  | "promo_codes"
  | "zalo_payment_config"
  | "system_settings"
  | "rbac_admin_users";

export interface AdminPermissionMatrixRow {
  capability: AdminPermissionCapability;
  labelVi: string;
  labelEn: string;
  roles: Record<AdminRoleType, boolean>;
}

export interface AdminPermissionMatrixView {
  roles: AdminRoleType[];
  capabilities: AdminPermissionMatrixRow[];
  source: string;
}

export interface AdminStaffUser {
  id: string;
  username: string;
  displayName: string | null;
  role: AdminRoleType;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthAuditEntry {
  id: string;
  adminId: string | null;
  username: string | null;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

// --- Admin: Activity notifications (STORY-71) ---

export type AdminNotificationType = "registration" | "payment";

export interface AdminNotificationItem {
  id: string;
  type: AdminNotificationType;
  title: string;
  occurredAt: string;
  href: string;
  metadata?: {
    userId?: string;
    userDisplayName?: string | null;
    amountVnd?: number;
    subjectName?: string;
  };
}

export interface AdminNotificationsRecentResponse {
  items: AdminNotificationItem[];
  since: string;
  generatedAt: string;
}
