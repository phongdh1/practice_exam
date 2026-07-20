import type {
  AdminMergePreview,
  AdminPaymentRefund,
  AdminPaymentTransaction,
  AdminPromoCode,
  AdminPermissionMatrixView,
  AdminStaffUser,
  AdminAuthAuditEntry,
  AdminCourseView,
  AdminDashboardKpis,
  AdminNotificationsRecentResponse,
  AdminRoleType,
  AdminReconciliationDay,
  AdminRevenueReport,
  AdminUserProfile,
  AdminUserSearchResult,
  ApiResponse,
  AuthMeUser,
  AuthResult,
  CheckoutResult,
  ContentComplianceScanResult,
  EditorialQueueItem,
  FreeTierStatus,
  FreeTierUsageSummary,
  HealthData,
  ImportBatchReport,
  LandingContentView,
  MaintenanceMode,
  MergeSummary,
  MockExamAccess,
  MockExamResultsView,
  PaginatedResult,
  PaymentDetail,
  PaymentMerchantConfigView,
  PaymentMerchantsView,
  PlatformDisclaimer,
  PracticeAnswerFeedback,
  PracticeQuestionView,
  PracticeSessionSummary,
  PracticeSessionView,
  PracticeSessionDetailView,
  AttemptHistoryList,
  ProgressSummaryResponse,
  QuestionDetail,
  QuestionFlagItem,
  QuestionPreview,
  QuestionSearchResult,
  QuestionBankStats,
  AdminSubjectView,
  SubjectCatalogItem,
  StudyQuestionDetail,
  StudyQuestionListResult,
  StudyTierStatus,
  SubscriptionSummary,
  SystemSettingsView,
  WebhookEventLogItem,
  ZaloMiniAppConfigView,
} from "@practice-exam/types";

export const SETTINGS_QUERY_STALE_MS = 5 * 60 * 1000;
export const DASHBOARD_QUERY_STALE_MS = 5 * 60 * 1000;
export const ADMIN_NOTIFICATIONS_POLL_MS = 60_000;

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => string | undefined;
  /** Called when any request receives HTTP 401. Use for session cleanup / redirect. */
  onUnauthorized?: () => void;
}

export class ApiClientError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
  }
}

export class ApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  private notifyIfUnauthorized(status: number): void {
    if (status === 401) {
      this.config.onUnauthorized?.();
    }
  }

  private async readErrorMessage(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as ApiResponse<unknown> & {
        error?: { message?: string; code?: string };
      };
      return body.error?.message ?? `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}`;
    }
  }

  private async assertOk(res: Response): Promise<void> {
    if (res.ok) return;
    this.notifyIfUnauthorized(res.status);
    throw new ApiClientError(await this.readErrorMessage(res));
  }

  private async request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...init?.headers,
    };
    const token = this.config.getAccessToken?.();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, { ...init, headers });
    const body = (await res.json()) as ApiResponse<T> & {
      error?: { message?: string; code?: string };
    };
    if (!res.ok) {
      this.notifyIfUnauthorized(res.status);
      throw new ApiClientError(body.error?.message ?? `HTTP ${res.status}`, body.error?.code);
    }
    return body;
  }

  health(): Promise<ApiResponse<HealthData>> {
    return this.request<HealthData>("/api/v1/health");
  }

  listSubjects(): Promise<ApiResponse<SubjectCatalogItem[]>> {
    return this.request<SubjectCatalogItem[]>("/api/v1/subjects");
  }

  listSubjectsPaginated(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResult<SubjectCatalogItem>>> {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.limit !== undefined) qs.set("limit", String(params.limit));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return this.request<PaginatedResult<SubjectCatalogItem>>(`/api/v1/subjects${suffix}`);
  }

  getFreeTierUsage(): Promise<ApiResponse<FreeTierUsageSummary>> {
    return this.request<FreeTierUsageSummary>("/api/v1/entitlements/free-tier");
  }

  getSubjectFreeTier(subjectId: string): Promise<ApiResponse<FreeTierStatus>> {
    return this.request<FreeTierStatus>(`/api/v1/entitlements/${subjectId}/free-tier`);
  }

  consumeFreeTierQuestion(subjectId: string): Promise<ApiResponse<FreeTierStatus>> {
    return this.request<FreeTierStatus>(`/api/v1/entitlements/${subjectId}/consume`, {
      method: "POST",
    });
  }

  getMockExamAccess(subjectId: string): Promise<ApiResponse<MockExamAccess>> {
    return this.request<MockExamAccess>(`/api/v1/entitlements/${subjectId}/mock-exam`);
  }

  getPlatformDisclaimer(): Promise<ApiResponse<PlatformDisclaimer>> {
    return this.request<PlatformDisclaimer>("/api/v1/settings/disclaimer");
  }

  getMaintenanceMode(): Promise<ApiResponse<MaintenanceMode>> {
    return this.request<MaintenanceMode>("/api/v1/settings/maintenance");
  }

  getLandingContent(): Promise<ApiResponse<LandingContentView>> {
    return this.request<LandingContentView>("/api/v1/settings/landing-content");
  }

  adminGetLandingContent(): Promise<ApiResponse<LandingContentView>> {
    return this.request<LandingContentView>("/api/v1/admin/landing-content");
  }

  adminUpdateLandingContent(
    input: Omit<LandingContentView, "version" | "updatedAt">,
  ): Promise<ApiResponse<LandingContentView>> {
    return this.request<LandingContentView>("/api/v1/admin/landing-content", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  async adminUploadLandingAsset(file: File): Promise<ApiResponse<{ assetId: string; url: string; alt: string }>> {
    const form = new FormData();
    form.append("file", file);
    const headers: HeadersInit = {};
    const token = this.config.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${this.config.baseUrl}/api/v1/admin/landing-content/assets`, {
      method: "POST",
      headers,
      body: form,
    });
    await this.assertOk(res);
    return (await res.json()) as ApiResponse<{ assetId: string; url: string; alt: string }>;
  }

  scanContentCompliance(text: string): Promise<ApiResponse<ContentComplianceScanResult>> {
    return this.request<ContentComplianceScanResult>("/api/v1/content-compliance/scan", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  register(input: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  login(input: { email: string; password: string }): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  refresh(refreshToken: string): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  zaloSignIn(accessToken: string): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>("/api/v1/auth/zalo", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    });
  }

  linkZalo(accessToken: string): Promise<ApiResponse<AuthResult>> {
    return this.request<AuthResult>("/api/v1/auth/link/zalo", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    });
  }

  googleSignInUrl(): string {
    return `${this.config.baseUrl}/api/v1/auth/google`;
  }

  googleLinkUrl(): string {
    return `${this.config.baseUrl}/api/v1/auth/link/google`;
  }

  getMe(): Promise<ApiResponse<AuthMeUser>> {
    return this.request<AuthMeUser>("/api/v1/auth/me");
  }

  listSubscriptions(): Promise<ApiResponse<SubscriptionSummary[]>> {
    return this.request<SubscriptionSummary[]>("/api/v1/subscriptions");
  }

  getSubscription(subjectId: string): Promise<ApiResponse<SubscriptionSummary | null>> {
    return this.request<SubscriptionSummary | null>(`/api/v1/subscriptions/${subjectId}`);
  }

  initiateCheckout(input: {
    subjectId: string;
    channel: "web" | "zalo";
    provider?: "payos" | "sepay";
    promoCode?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<ApiResponse<CheckoutResult>> {
    return this.request<CheckoutResult>("/api/v1/checkout/subscription", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  getPayment(paymentId: string): Promise<ApiResponse<PaymentDetail>> {
    return this.request<PaymentDetail>(`/api/v1/payments/${paymentId}`);
  }

  simulateMockCheckout(paymentId: string, provider: "payos" | "sepay" = "payos"): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/payments/${paymentId}/mock-checkout?provider=${provider}`, {
      method: "POST",
    });
  }

  getActivePracticeSession(subjectId: string): Promise<ApiResponse<PracticeSessionView | null>> {
    return this.request<PracticeSessionView | null>(`/api/v1/practice/sessions/active/${subjectId}`);
  }

  startPracticeSession(subjectId: string, forceNew = false): Promise<ApiResponse<PracticeSessionView>> {
    return this.request<PracticeSessionView>("/api/v1/practice/sessions", {
      method: "POST",
      body: JSON.stringify({ subjectId, forceNew }),
    });
  }

  getPracticeSession(sessionId: string): Promise<ApiResponse<PracticeSessionView>> {
    return this.request<PracticeSessionView>(`/api/v1/practice/sessions/${sessionId}`);
  }

  getPracticeQuestion(sessionId: string): Promise<ApiResponse<PracticeQuestionView | null>> {
    return this.request<PracticeQuestionView | null>(`/api/v1/practice/sessions/${sessionId}/question`);
  }

  submitPracticeAnswer(
    sessionId: string,
    input: { questionId: string; selectedKeys: string[] },
  ): Promise<ApiResponse<PracticeAnswerFeedback>> {
    return this.request<PracticeAnswerFeedback>(`/api/v1/practice/sessions/${sessionId}/answer`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  endPracticeSession(sessionId: string): Promise<ApiResponse<PracticeSessionSummary>> {
    return this.request<PracticeSessionSummary>(`/api/v1/practice/sessions/${sessionId}/end`, {
      method: "POST",
    });
  }

  getStudyTierStatus(subjectId: string): Promise<ApiResponse<StudyTierStatus>> {
    return this.request<StudyTierStatus>(`/api/v1/study/subjects/${subjectId}/tier`);
  }

  listStudyQuestions(
    subjectId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<ApiResponse<StudyQuestionListResult>> {
    const qs = new URLSearchParams();
    if (params?.page !== undefined) qs.set("page", String(params.page));
    if (params?.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return this.request<StudyQuestionListResult>(
      `/api/v1/study/subjects/${subjectId}/questions${suffix}`,
    );
  }

  getStudyQuestionDetail(
    subjectId: string,
    questionId: string,
  ): Promise<ApiResponse<StudyQuestionDetail>> {
    return this.request<StudyQuestionDetail>(
      `/api/v1/study/subjects/${subjectId}/questions/${questionId}`,
    );
  }

  listAttemptHistory(): Promise<ApiResponse<AttemptHistoryList>> {
    return this.request<AttemptHistoryList>("/api/v1/progress/attempts");
  }

  getPracticeSessionDetail(sessionId: string): Promise<ApiResponse<PracticeSessionDetailView>> {
    return this.request<PracticeSessionDetailView>(`/api/v1/progress/attempts/practice/${sessionId}`);
  }

  getMockExamAttemptResults(attemptId: string): Promise<ApiResponse<MockExamResultsView>> {
    return this.request<MockExamResultsView>(`/api/v1/mock-exam-attempts/${attemptId}/results`);
  }

  getProgressSummary(days: 30 | 90 = 30): Promise<ApiResponse<ProgressSummaryResponse>> {
    return this.request<ProgressSummaryResponse>(`/api/v1/progress/subjects?days=${days}`);
  }

  flagQuestion(questionId: string, comment?: string): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/api/v1/questions/${questionId}/flag`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  }

  // --- Admin: Question Bank (EPIC-8) ---

  adminSearchQuestions(params: Record<string, string | number | undefined>): Promise<ApiResponse<QuestionSearchResult>> {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") qs.set(key, String(value));
    }
    const query = qs.toString();
    return this.request<QuestionSearchResult>(`/api/v1/admin/questions${query ? `?${query}` : ""}`);
  }

  adminGetQuestionStats(): Promise<ApiResponse<QuestionBankStats>> {
    return this.request<QuestionBankStats>("/api/v1/admin/questions/stats");
  }

  adminGetQuestion(id: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/questions/${id}`);
  }

  adminPreviewQuestion(id: string): Promise<ApiResponse<QuestionPreview>> {
    return this.request<QuestionPreview>(`/api/v1/admin/questions/${id}/preview`);
  }

  adminCreateQuestion(input: Record<string, unknown>): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>("/api/v1/admin/questions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminUpdateQuestion(id: string, input: Record<string, unknown>): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/questions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminSubmitQuestionForReview(id: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/questions/${id}/submit-for-review`, {
      method: "POST",
    });
  }

  adminDeleteQuestion(id: string): Promise<ApiResponse<{ id: string; deleted: true }>> {
    return this.request<{ id: string; deleted: true }>(`/api/v1/admin/questions/${id}`, {
      method: "DELETE",
    });
  }

  adminListReviewQueue(params?: Record<string, string>): Promise<ApiResponse<EditorialQueueItem[]>> {
    const qs = params ? `?${new URLSearchParams(params)}` : "";
    return this.request<EditorialQueueItem[]>(`/api/v1/admin/content/review-queue${qs}`);
  }

  adminAssignReview(id: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/content/review-queue/${id}/assign`, {
      method: "POST",
    });
  }

  adminApproveQuestion(id: string, comment?: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/content/review-queue/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  }

  adminRejectQuestion(id: string, comment: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/content/review-queue/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ comment }),
    });
  }

  adminUnpublishQuestion(id: string, reason: string): Promise<ApiResponse<QuestionDetail>> {
    return this.request<QuestionDetail>(`/api/v1/admin/content/questions/${id}/unpublish`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  adminListFlags(status?: string): Promise<ApiResponse<QuestionFlagItem[]>> {
    const qs = status ? `?status=${status}` : "";
    return this.request<QuestionFlagItem[]>(`/api/v1/admin/content/flags${qs}`);
  }

  adminResolveFlag(id: string, resolutionNote: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/v1/admin/content/flags/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionNote }),
    });
  }

  async adminImportQuestions(subjectId: string, file: File): Promise<ApiResponse<{ batchId: string; status: string }>> {
    const form = new FormData();
    form.append("subjectId", subjectId);
    form.append("file", file);
    const headers: HeadersInit = {};
    const token = this.config.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${this.config.baseUrl}/api/v1/admin/questions/import`, {
      method: "POST",
      headers,
      body: form,
    });
    await this.assertOk(res);
    return (await res.json()) as ApiResponse<{ batchId: string; status: string }>;
  }

  adminGetImportReport(batchId: string): Promise<ApiResponse<ImportBatchReport>> {
    return this.request<ImportBatchReport>(`/api/v1/admin/questions/import/${batchId}`);
  }

  async adminDownloadImportTemplate(): Promise<Blob> {
    const headers: HeadersInit = {};
    const token = this.config.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${this.config.baseUrl}/api/v1/admin/questions/import/template`, {
      headers,
    });
    await this.assertOk(res);
    return res.blob();
  }

  adminListSubjects(): Promise<
    ApiResponse<AdminSubjectView[]>
  > {
    return this.request(`/api/v1/admin/subjects`);
  }

  adminCreateSubject(input: {
    courseId: string;
    code: string;
    name: string;
    description?: string | null;
    monthlyAmountVnd: number;
    freeTierLimit: number;
    studyTierLimit?: number;
    displayOrder?: number;
    topicTags?: string[];
    coverImageUrl?: string | null;
    isHot?: boolean;
    minPublishedQuestionsForGoLive?: number;
    minApprovedTemplatesForGoLive?: number;
  }): Promise<ApiResponse<AdminSubjectView>> {
    return this.request<AdminSubjectView>("/api/v1/admin/subjects", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminUpdateSubject(
    id: string,
    input: {
      courseId?: string;
      name?: string;
      description?: string | null;
      monthlyAmountVnd?: number;
      freeTierLimit?: number;
      studyTierLimit?: number;
      displayOrder?: number;
      visibility?: "active" | "archived";
      topicTags?: string[];
      coverImageUrl?: string | null;
      isHot?: boolean;
      minPublishedQuestionsForGoLive?: number;
      minApprovedTemplatesForGoLive?: number;
    },
  ): Promise<ApiResponse<AdminSubjectView>> {
    return this.request<AdminSubjectView>(`/api/v1/admin/subjects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminArchiveSubject(id: string): Promise<ApiResponse<AdminSubjectView>> {
    return this.request<AdminSubjectView>(`/api/v1/admin/subjects/${id}/archive`, {
      method: "POST",
    });
  }

  adminActivateSubject(id: string): Promise<ApiResponse<AdminSubjectView>> {
    return this.request<AdminSubjectView>(`/api/v1/admin/subjects/${id}/activate`, {
      method: "POST",
    });
  }

  adminDeleteSubject(id: string): Promise<ApiResponse<{ id: string; deleted: true }>> {
    return this.request<{ id: string; deleted: true }>(`/api/v1/admin/subjects/${id}`, {
      method: "DELETE",
    });
  }

  adminListCourses(): Promise<ApiResponse<AdminCourseView[]>> {
    return this.request<AdminCourseView[]>("/api/v1/admin/courses");
  }

  adminCreateCourse(input: {
    code: string;
    name: string;
    description?: string | null;
    displayOrder?: number;
    coverImageUrl?: string | null;
  }): Promise<ApiResponse<AdminCourseView>> {
    return this.request<AdminCourseView>("/api/v1/admin/courses", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminUpdateCourse(
    id: string,
    input: {
      code?: string;
      name?: string;
      description?: string | null;
      displayOrder?: number;
      visibility?: "active" | "archived";
      coverImageUrl?: string | null;
    },
  ): Promise<ApiResponse<AdminCourseView>> {
    return this.request<AdminCourseView>(`/api/v1/admin/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminArchiveCourse(id: string): Promise<ApiResponse<AdminCourseView>> {
    return this.request<AdminCourseView>(`/api/v1/admin/courses/${id}/archive`, {
      method: "POST",
    });
  }

  adminActivateCourse(id: string): Promise<ApiResponse<AdminCourseView>> {
    return this.request<AdminCourseView>(`/api/v1/admin/courses/${id}/activate`, {
      method: "POST",
    });
  }

  adminDeleteCourse(id: string): Promise<ApiResponse<{ id: string; deleted: true }>> {
    return this.request<{ id: string; deleted: true }>(`/api/v1/admin/courses/${id}`, {
      method: "DELETE",
    });
  }

  adminReorderCourses(orderedIds: string[]): Promise<ApiResponse<{ orderedIds: string[] }>> {
    return this.request<{ orderedIds: string[] }>("/api/v1/admin/courses/reorder", {
      method: "PATCH",
      body: JSON.stringify({ orderedIds }),
    });
  }

  adminReorderSubjects(orderedIds: string[]): Promise<ApiResponse<{ orderedIds: string[] }>> {
    return this.request<{ orderedIds: string[] }>("/api/v1/admin/subjects/reorder", {
      method: "PATCH",
      body: JSON.stringify({ orderedIds }),
    });
  }

  adminSearchUsers(q: string): Promise<ApiResponse<AdminUserSearchResult[]>> {
    const params = new URLSearchParams({ q });
    return this.request<AdminUserSearchResult[]>(`/api/v1/admin/users/search?${params}`);
  }

  adminGetUserProfile(id: string): Promise<ApiResponse<AdminUserProfile>> {
    return this.request<AdminUserProfile>(`/api/v1/admin/users/${id}`);
  }

  adminGrantSubscription(
    userId: string,
    input: { subjectId: string; reason: string },
  ): Promise<ApiResponse<SubscriptionSummary>> {
    return this.request<SubscriptionSummary>(`/api/v1/admin/users/${userId}/subscriptions/grant`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminRevokeSubscription(
    userId: string,
    subscriptionId: string,
    reason: string,
  ): Promise<ApiResponse<SubscriptionSummary>> {
    return this.request<SubscriptionSummary>(
      `/api/v1/admin/users/${userId}/subscriptions/${subscriptionId}/revoke`,
      { method: "POST", body: JSON.stringify({ reason }) },
    );
  }

  adminPreviewMerge(survivorId: string, duplicateId: string): Promise<ApiResponse<AdminMergePreview>> {
    const params = new URLSearchParams({ survivorId, duplicateId });
    return this.request<AdminMergePreview>(`/api/v1/admin/users/merge/preview?${params}`);
  }

  adminForceMerge(input: {
    survivorId: string;
    duplicateId: string;
    ticketReference: string;
  }): Promise<ApiResponse<MergeSummary>> {
    return this.request<MergeSummary>("/api/v1/admin/users/merge", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async adminExportUser(userId: string, format: "json" | "csv"): Promise<Blob> {
    const headers: HeadersInit = {};
    const token = this.config.getAccessToken?.();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const params = new URLSearchParams({ format });
    const res = await fetch(
      `${this.config.baseUrl}/api/v1/admin/users/${userId}/export?${params}`,
      { headers },
    );
    await this.assertOk(res);
    return res.blob();
  }

  adminSuspendUser(userId: string, reason: string): Promise<ApiResponse<{ id: string; isSuspended: boolean }>> {
    return this.request<{ id: string; isSuspended: boolean }>(`/api/v1/admin/users/${userId}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  adminUnsuspendUser(userId: string, reason: string): Promise<ApiResponse<{ id: string; isSuspended: boolean }>> {
    return this.request<{ id: string; isSuspended: boolean }>(`/api/v1/admin/users/${userId}/unsuspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  adminGetZaloConfig(): Promise<ApiResponse<ZaloMiniAppConfigView>> {
    return this.request<ZaloMiniAppConfigView>("/api/v1/admin/integrations/zalo");
  }

  adminUpdateZaloConfig(input: {
    appId: string;
    appSecret?: string;
    callbackUrl?: string;
  }): Promise<ApiResponse<ZaloMiniAppConfigView>> {
    return this.request<ZaloMiniAppConfigView>("/api/v1/admin/integrations/zalo", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  adminVerifyZaloConfig(): Promise<ApiResponse<ZaloMiniAppConfigView>> {
    return this.request<ZaloMiniAppConfigView>("/api/v1/admin/integrations/zalo/verify", {
      method: "POST",
    });
  }

  adminGetPaymentMerchants(): Promise<ApiResponse<PaymentMerchantsView>> {
    return this.request<PaymentMerchantsView>("/api/v1/admin/integrations/payments");
  }

  adminUpdatePaymentMerchant(
    provider: "payos" | "sepay",
    input: {
      merchantId?: string;
      apiKey?: string;
      checksumKey?: string;
      webhookSecret?: string;
      testMode: boolean;
      bankAccountNumber?: string;
      bankCode?: string;
      accountHolder?: string;
    },
  ): Promise<ApiResponse<PaymentMerchantConfigView>> {
    return this.request<PaymentMerchantConfigView>(`/api/v1/admin/integrations/payments/${provider}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  adminTestPaymentWebhook(
    provider: "payos" | "sepay",
    paymentId: string,
  ): Promise<ApiResponse<{ processed: boolean; duplicate: boolean }>> {
    return this.request<{ processed: boolean; duplicate: boolean }>(
      `/api/v1/admin/integrations/payments/${provider}/test-webhook`,
      { method: "POST", body: JSON.stringify({ paymentId }) },
    );
  }

  adminListWebhookEvents(limit = 50): Promise<ApiResponse<WebhookEventLogItem[]>> {
    return this.request<WebhookEventLogItem[]>(`/api/v1/admin/integrations/webhooks?limit=${limit}`);
  }

  adminRetryPaymentWebhook(eventId: string): Promise<ApiResponse<{ processed: boolean }>> {
    return this.request<{ processed: boolean }>(
      `/api/v1/admin/integrations/webhooks/payment/${eventId}/retry`,
      { method: "POST" },
    );
  }

  adminListPaymentTransactions(
    params: Record<string, string | number | undefined>,
  ): Promise<ApiResponse<PaginatedResult<AdminPaymentTransaction>>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") query.set(key, String(value));
    }
    const qs = query.toString();
    return this.request<PaginatedResult<AdminPaymentTransaction>>(
      `/api/v1/admin/payments/transactions${qs ? `?${qs}` : ""}`,
    );
  }

  adminGetReconciliation(
    params?: Record<string, string | undefined>,
  ): Promise<ApiResponse<AdminReconciliationDay[]>> {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, value);
      }
    }
    const qs = query.toString();
    return this.request<AdminReconciliationDay[]>(
      `/api/v1/admin/payments/reconciliation${qs ? `?${qs}` : ""}`,
    );
  }

  adminInitiateRefund(paymentId: string, reason: string): Promise<ApiResponse<AdminPaymentRefund>> {
    return this.request<AdminPaymentRefund>(`/api/v1/admin/payments/${paymentId}/refund`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  adminGetRevenueReport(
    params?: Record<string, string | undefined>,
  ): Promise<ApiResponse<AdminRevenueReport>> {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, value);
      }
    }
    const qs = query.toString();
    return this.request<AdminRevenueReport>(`/api/v1/admin/payments/revenue${qs ? `?${qs}` : ""}`);
  }

  async adminExportRevenueReport(params?: Record<string, string | undefined>): Promise<Blob> {
    const query = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value) query.set(key, value);
      }
    }
    const qs = query.toString();
    const headers: Record<string, string> = {};
    const token = this.config.getAccessToken?.();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(
      `${this.config.baseUrl}/api/v1/admin/payments/revenue/export${qs ? `?${qs}` : ""}`,
      { headers },
    );
    await this.assertOk(res);
    return res.blob();
  }

  adminListPromoCodes(): Promise<ApiResponse<AdminPromoCode[]>> {
    return this.request<AdminPromoCode[]>("/api/v1/admin/promo-codes");
  }

  adminCreatePromoCode(input: {
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    expiresAt: string;
    usageLimit: number;
    subjectIds?: string[];
  }): Promise<ApiResponse<AdminPromoCode>> {
    return this.request<AdminPromoCode>("/api/v1/admin/promo-codes", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminUpdatePromoCode(
    id: string,
    input: {
      expiresAt?: string;
      usageLimit?: number;
      subjectIds?: string[];
      isActive?: boolean;
    },
  ): Promise<ApiResponse<AdminPromoCode>> {
    return this.request<AdminPromoCode>(`/api/v1/admin/promo-codes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminGetPermissionMatrix(): Promise<ApiResponse<AdminPermissionMatrixView>> {
    return this.request<AdminPermissionMatrixView>("/api/v1/admin/rbac/permission-matrix");
  }

  adminListStaffUsers(): Promise<ApiResponse<AdminStaffUser[]>> {
    return this.request<AdminStaffUser[]>("/api/v1/admin/admin-users");
  }

  adminCreateStaffUser(input: {
    username: string;
    password: string;
    role: AdminRoleType;
    displayName?: string;
  }): Promise<ApiResponse<AdminStaffUser>> {
    return this.request<AdminStaffUser>("/api/v1/admin/admin-users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  adminUpdateStaffUser(
    id: string,
    input: {
      role?: AdminRoleType;
      isDisabled?: boolean;
      displayName?: string;
      password?: string;
    },
  ): Promise<ApiResponse<AdminStaffUser>> {
    return this.request<AdminStaffUser>(`/api/v1/admin/admin-users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminListAdminAuthAudit(limit?: number): Promise<ApiResponse<AdminAuthAuditEntry[]>> {
    const qs = limit ? `?limit=${limit}` : "";
    return this.request<AdminAuthAuditEntry[]>(`/api/v1/admin/admin-users/auth-audit${qs}`);
  }

  adminGetSystemSettings(): Promise<ApiResponse<SystemSettingsView>> {
    return this.request<SystemSettingsView>("/api/v1/admin/system-settings");
  }

  adminUpdateSystemSettings(input: {
    disclaimerText?: string;
    maintenance?: MaintenanceMode;
    emailTemplates?: SystemSettingsView["emailTemplates"];
  }): Promise<ApiResponse<SystemSettingsView>> {
    return this.request<SystemSettingsView>("/api/v1/admin/system-settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }

  adminGetDashboardKpis(): Promise<ApiResponse<AdminDashboardKpis>> {
    return this.request<AdminDashboardKpis>("/api/v1/admin/dashboard/kpis");
  }

  adminListRecentNotifications(since?: string): Promise<ApiResponse<AdminNotificationsRecentResponse>> {
    const qs = since ? `?since=${encodeURIComponent(since)}` : "";
    return this.request<AdminNotificationsRecentResponse>(`/api/v1/admin/notifications/recent${qs}`);
  }
}

export function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient({ ...config, baseUrl: normalizeBaseUrl(config.baseUrl) });
}

export {
  authFetch,
  createUnauthorizedGuard,
  UnauthorizedError,
  type UnauthorizedGuardConfig,
} from "./unauthorized-guard";

/** TanStack Query key factories */
export const queryKeys = {
  health: ["health"] as const,
  auth: {
    me: ["auth", "me"] as const,
  },
  subjects: {
    all: ["subjects"] as const,
    catalogPage: (page: number, limit: number) => ["subjects", "catalog", page, limit] as const,
    detail: (id: string) => ["subjects", id] as const,
    admin: ["subjects", "admin"] as const,
  },
  courses: {
    admin: ["courses", "admin"] as const,
    detail: (id: string) => ["courses", id] as const,
  },
  entitlements: {
    freeTier: ["entitlements", "free-tier"] as const,
    subject: (id: string) => ["entitlements", "subject", id] as const,
    mockExam: (id: string) => ["entitlements", "mock-exam", id] as const,
  },
  settings: {
    disclaimer: ["settings", "disclaimer"] as const,
    maintenance: ["settings", "maintenance"] as const,
    landingContent: ["settings", "landing-content"] as const,
  },
  subscriptions: {
    all: ["subscriptions"] as const,
    subject: (id: string) => ["subscriptions", id] as const,
  },
  payments: {
    detail: (id: string) => ["payments", id] as const,
  },
  practice: {
    active: (subjectId: string) => ["practice", "active", subjectId] as const,
    session: (sessionId: string) => ["practice", "session", sessionId] as const,
  },
  study: {
    tier: (subjectId: string) => ["study", "tier", subjectId] as const,
    questions: (subjectId: string, params?: { page?: number; pageSize?: number }) =>
      ["study", "questions", subjectId, params] as const,
    questionDetail: (subjectId: string, questionId: string) =>
      ["study", "question", subjectId, questionId] as const,
  },
  progress: {
    attempts: ["progress", "attempts"] as const,
    summary: (days: 30 | 90) => ["progress", "summary", days] as const,
    practiceDetail: (sessionId: string) => ["progress", "practice", sessionId] as const,
  },
  questions: {
    search: (params: Record<string, string | number | undefined>) => ["questions", "search", params] as const,
    stats: ["questions", "stats"] as const,
    detail: (id: string) => ["questions", id] as const,
    preview: (id: string) => ["questions", id, "preview"] as const,
  },
  editorial: {
    queue: (params?: Record<string, string>) => ["editorial", "queue", params] as const,
    flags: (status?: string) => ["editorial", "flags", status] as const,
  },
  importBatches: {
    detail: (id: string) => ["importBatches", id] as const,
  },
  users: {
    search: (q: string) => ["users", "search", q] as const,
    profile: (id: string) => ["users", "profile", id] as const,
    mergePreview: (survivorId: string, duplicateId: string) =>
      ["users", "mergePreview", survivorId, duplicateId] as const,
  },
  integrations: {
    zalo: ["integrations", "zalo"] as const,
    payments: ["integrations", "payments"] as const,
    webhooks: (limit?: number) => ["integrations", "webhooks", limit] as const,
  },
  paymentsAdmin: {
    transactions: (params: Record<string, string | number | undefined>) =>
      ["paymentsAdmin", "transactions", params] as const,
    reconciliation: (params?: Record<string, string | undefined>) =>
      ["paymentsAdmin", "reconciliation", params] as const,
    revenue: (params?: Record<string, string | undefined>) =>
      ["paymentsAdmin", "revenue", params] as const,
    promoCodes: ["paymentsAdmin", "promoCodes"] as const,
  },
  rbac: {
    permissionMatrix: ["rbac", "permissionMatrix"] as const,
  },
  adminStaff: {
    list: ["adminStaff", "list"] as const,
    authAudit: (limit?: number) => ["adminStaff", "authAudit", limit] as const,
  },
  adminSystemSettings: {
    all: ["adminSystemSettings"] as const,
  },
  adminLandingContent: {
    all: ["adminLandingContent"] as const,
  },
  dashboard: {
    kpis: ["dashboard", "kpis"] as const,
  },
  notifications: {
    recent: (since?: string) => ["notifications", "recent", since] as const,
  },
};

export type { MergeSummary, AuthResult, AuthMeUser };

export {
  partitionByStatus,
  summarizeSettled,
  type BulkQuestionRow,
  type StatusPartition,
  type BulkSummary,
} from "./question-bulk";
