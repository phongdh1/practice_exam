import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { createApiClient, queryKeys } from "@practice-exam/api-client";
import { disclaimerQueryOptions } from "./lib/zalo-api";
import { MaintenanceGate } from "./components/maintenance-gate";
import {
  AttemptHistoryList,
  CatalogSkeleton,
  CheckoutView,
  DisclaimerGate,
  FALLBACK_PLATFORM_DISCLAIMER,
  FreeTierPaywall,
  MaterialIcon,
  MockExamQuestionReviewScreen,
  MockExamResultsScreen,
  PaymentConfirmationView,
  PaymentFailedView,
  PaymentPendingView,
  PracticeFlowScreen,
  PracticeSessionDetailScreen,
  ProgressDashboard,
  PullToRefresh,
  StudyFlowScreen,
  SubjectCatalogGrid,
  SubjectDetailView,
  Toaster,
  ZaloAppHeader,
  ZaloBottomTabs,
  ZaloCatalogHeader,
  type PracticeApiAdapter,
  type StudyApiAdapter,
} from "@practice-exam/ui";
import type { SubjectSubscriptionView } from "@practice-exam/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StrictMode, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function getStoredToken(): string | undefined {
  return localStorage.getItem("access_token") ?? undefined;
}

function createClient() {
  return createApiClient({
    baseUrl: API_URL,
    getAccessToken: getStoredToken,
  });
}

const queryClient = new QueryClient();

function AuthScreen() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleZaloSignIn() {
    setError(null);
    setLoading(true);
    try {
      const accessToken = "test-zalo-mini-app-user";
      const client = createClient();
      const result = await client.zaloSignIn(accessToken);
      localStorage.setItem("access_token", result.data.tokens.accessToken);
      localStorage.setItem("refresh_token", result.data.tokens.refreshToken);
      window.location.href = "/";
    } catch {
      setError("Không thể đăng nhập Zalo. Thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle p-4">
      <div className="mb-8 text-center">
        <h1 className="text-display-lg text-primary">CNVCK Prep</h1>
        <p className="mt-2 text-body-sm text-ink-muted">Z-01 — Bắt đầu luyện tập trong Zalo</p>
      </div>
      <div className="glass-morphism w-full max-w-md rounded-xl border border-outline-variant p-8 shadow-sm">
        {error && (
          <p className="mb-4 text-sm text-error" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleZaloSignIn}
          disabled={loading}
          className="btn-interact flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-heading text-on-primary disabled:opacity-50"
        >
          <MaterialIcon name="login" size={20} />
          {loading ? "Đang xử lý..." : "Đăng nhập với Zalo"}
        </button>
      </div>
    </main>
  );
}

function AuthErrorScreen() {
  return (
    <main className="p-4 text-center">
      <h1 className="text-xl font-semibold text-primary">Lỗi xác thực</h1>
      <p className="mt-4 text-ink-muted">Không thể đăng nhập Zalo. Thử lại.</p>
      <p className="mt-2 text-xs text-ink-muted">Z-91</p>
      <a
        href="/auth"
        className="mt-6 inline-block rounded-md bg-primary px-4 py-2 font-medium text-white"
      >
        Thử lại
      </a>
    </main>
  );
}

function CatalogPage() {
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data: entitlementsResponse } = useQuery({
    queryKey: queryKeys.entitlements.freeTier,
    queryFn: async () => {
      if (!getStoredToken()) return null;
      try {
        return await createClient().getFreeTierUsage();
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const subjects = data?.data ?? [];
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const freeTierUsedBySubjectId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of entitlementsResponse?.data?.items ?? []) {
      map[item.subjectId] = item.used;
    }
    return map;
  }, [entitlementsResponse]);

  const content = (
    <>
      <ZaloAppHeader />
      <PullToRefresh
        className="min-h-screen pb-24"
        onRefresh={() => refetch()}
        disabled={isFetching}
      >
        <ZaloCatalogHeader />
        <div className="px-gutter-mobile -mt-4">
          <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
            <MaterialIcon name="search" className="ml-2 text-outline" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm môn học..."
              className="w-full border-none bg-transparent text-body text-on-surface-variant focus:ring-0"
              readOnly
            />
          </div>
        </div>
        <main className="mt-8 px-gutter-mobile">
          {!getStoredToken() && (
            <a
              href="/auth"
              className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-primary underline"
            >
              <MaterialIcon name="login" size={16} />
              Đăng nhập Zalo
            </a>
          )}
          {isLoading && <CatalogSkeleton />}
          {isError && (
            <p className="text-sm text-error" role="alert">
              Không thể tải danh mục môn học. Kéo xuống để thử lại.
            </p>
          )}
          {!isLoading && !isError && (
            <SubjectCatalogGrid
              subjects={subjects}
              variant="zalo"
              freeTierUsedBySubjectId={freeTierUsedBySubjectId}
              onSubjectClick={(subject) =>
                navigate({ to: "/subjects/$subjectId", params: { subjectId: subject.id } })
              }
            />
          )}
        </main>
      </PullToRefresh>
      <ZaloBottomTabs active="subjects" />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
      {content}
    </DisclaimerGate>
  );
}

function SubjectDetailPage() {
  const { subjectId } = subjectDetailRoute.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data: entitlementResponse } = useQuery({
    queryKey: queryKeys.entitlements.subject(subjectId),
    queryFn: async () => {
      if (!getStoredToken()) return null;
      try {
        return await createClient().getSubjectFreeTier(subjectId);
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const { data: studyTierResponse } = useQuery({
    queryKey: queryKeys.study.tier(subjectId),
    queryFn: async () => {
      if (!getStoredToken()) return null;
      try {
        return await createClient().getStudyTierStatus(subjectId);
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const { data: subscriptionResponse } = useQuery({
    queryKey: queryKeys.subscriptions.subject(subjectId),
    queryFn: async () => {
      if (!getStoredToken()) return null;
      try {
        const res = await createClient().getSubscription(subjectId);
        const summary = res.data;
        if (!summary) return null;
        return { status: summary.status, expiresAt: summary.periodEnd } satisfies SubjectSubscriptionView;
      } catch {
        return null;
      }
    },
    retry: false,
  });

  const subject = data?.data.find((item) => item.id === subjectId);
  const freeTierStatus = entitlementResponse?.data ?? null;
  const studyTierStatus = studyTierResponse?.data ?? null;
  const subscription = subscriptionResponse ?? null;
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  async function handleStudy() {
    if (!subject) return;
    setActionError(null);

    if (!getStoredToken()) {
      setActionError("Vui lòng đăng nhập để xem câu hỏi.");
      return;
    }

    navigate({ to: "/subjects/$subjectId/study", params: { subjectId } });
  }

  async function handlePractice() {
    if (!subject) return;
    setActionError(null);

    if (!getStoredToken()) {
      setActionError("Vui lòng đăng nhập để luyện tập.");
      return;
    }

    if (freeTierStatus?.isAtLimit) {
      setPaywallOpen(true);
      return;
    }

    navigate({ to: "/subjects/$subjectId/practice", params: { subjectId } });
  }

  async function handleMockExam() {
    if (!subject) return;
    setActionError(null);

    if (!getStoredToken()) {
      setActionError("Vui lòng đăng nhập để thi thử.");
      return;
    }

    try {
      const access = await createClient().getMockExamAccess(subjectId);
      if (!access.data.allowed) {
        setPaywallOpen(true);
      }
    } catch {
      setActionError("Không thể kiểm tra quyền thi thử. Vui lòng thử lại.");
    }
  }

  const detail = (
    <>
      <ZaloAppHeader title={subject?.name ?? "Chi tiết môn"} />
      <main className="px-gutter-mobile pb-24 pt-4">
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="text-sm text-primary underline"
      >
        ← Quay lại danh mục
      </button>
      <p className="mt-4 text-sm text-ink-muted">Z-11 — Chi tiết môn học</p>
      {actionError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {actionError}
        </p>
      )}
      {isLoading && (
        <div className="mt-4">
          <CatalogSkeleton count={1} />
        </div>
      )}
      {isError && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          Không thể tải thông tin môn học.
        </p>
      )}
      {!isLoading && !isError && subject && (
        <div className="mt-4">
          <SubjectDetailView
            subject={subject}
            subscription={subscription}
            freeTierStatus={freeTierStatus}
            studyTierStatus={studyTierStatus}
            screenId="Z-11"
            onStudy={handleStudy}
            onPractice={handlePractice}
            onMockExam={handleMockExam}
            onSubscribe={() =>
              navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } })
            }
          />
          <FreeTierPaywall
            open={paywallOpen}
            subjectName={subject.name}
            monthlyPriceVnd={subject.monthlyPriceVnd}
            screenId="Z-23"
            onSubscribe={() => {
              setPaywallOpen(false);
              navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } });
            }}
            onDismiss={() => setPaywallOpen(false)}
          />
        </div>
      )}
      {!isLoading && !isError && !subject && (
        <p className="mt-4 text-sm text-ink-muted">Không tìm thấy môn học.</p>
      )}
      </main>
      <ZaloBottomTabs active="subjects" />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
      {detail}
    </DisclaimerGate>
  );
}

function createZaloStudyApi(): StudyApiAdapter {
  const client = createClient();
  return {
    listQuestions: async (subjectId, params) =>
      (await client.listStudyQuestions(subjectId, params)).data,
    getQuestionDetail: async (subjectId, questionId) =>
      (await client.getStudyQuestionDetail(subjectId, questionId)).data,
    flagQuestion: async (questionId, comment) => {
      await client.flagQuestion(questionId, comment);
    },
  };
}

function SubjectStudyPage() {
  const { subjectId } = subjectStudyRoute.useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = data?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const studyApi = useMemo(() => createZaloStudyApi(), []);

  if (!getStoredToken()) {
    return (
      <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
        <ZaloAppHeader title="Ôn tập" />
        <main className="px-gutter-mobile pb-24 pt-4">
          <p className="text-sm text-red-600" role="alert">
            Vui lòng đăng nhập để xem câu hỏi.
          </p>
        </main>
        <ZaloBottomTabs active="subjects" />
      </DisclaimerGate>
    );
  }

  const content = (
    <>
      <ZaloAppHeader title={subject?.name ?? "Ôn tập"} />
      <main className="px-gutter-mobile pb-24 pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
          className="text-sm text-primary underline"
        >
          ← Quay lại môn học
        </button>
        <p className="mt-2 text-xs text-ink-muted">Z-12 — Ôn tập</p>
        {isLoading && <p className="mt-4 text-sm text-ink-muted">Đang tải...</p>}
        {isError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Không thể tải thông tin môn học.
          </p>
        )}
        {!isLoading && !isError && subject && (
          <div className="mt-4">
            <StudyFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
              api={studyApi}
              mode="list"
              screenId="Z-12"
              paywallScreenId="Z-14"
              enablePullToRefresh
              onBack={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
              onSubscribe={() =>
                navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } })
              }
              onSelectQuestion={(questionId) =>
                navigate({
                  to: "/subjects/$subjectId/study/$questionId",
                  params: { subjectId, questionId },
                })
              }
              onFreePractice={() =>
                navigate({ to: "/subjects/$subjectId/practice", params: { subjectId } })
              }
            />
          </div>
        )}
        {!isLoading && !isError && !subject && (
          <p className="mt-4 text-sm text-ink-muted">Không tìm thấy môn học.</p>
        )}
      </main>
      <ZaloBottomTabs active="subjects" />
      <Toaster />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
      {content}
    </DisclaimerGate>
  );
}

function SubjectStudyDetailPage() {
  const { subjectId, questionId } = subjectStudyDetailRoute.useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = data?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const studyApi = useMemo(() => createZaloStudyApi(), []);

  if (!getStoredToken()) {
    return (
      <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
        <ZaloAppHeader title="Chi tiết câu hỏi" />
        <main className="px-gutter-mobile pb-24 pt-4">
          <p className="text-sm text-red-600" role="alert">
            Vui lòng đăng nhập để xem câu hỏi.
          </p>
        </main>
        <ZaloBottomTabs active="subjects" />
      </DisclaimerGate>
    );
  }

  const content = (
    <>
      <ZaloAppHeader title={subject?.name ?? "Chi tiết câu hỏi"} />
      <main className="px-gutter-mobile pb-24 pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/subjects/$subjectId/study", params: { subjectId } })}
          className="text-sm text-primary underline"
        >
          ← Quay lại danh sách
        </button>
        <p className="mt-2 text-xs text-ink-muted">Z-13 — Chi tiết ôn tập</p>
        {isLoading && <p className="mt-4 text-sm text-ink-muted">Đang tải...</p>}
        {isError && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            Không thể tải thông tin môn học.
          </p>
        )}
        {!isLoading && !isError && subject && (
          <div className="mt-4">
            <StudyFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
              api={studyApi}
              mode="detail"
              questionId={questionId}
              screenId="Z-13"
              paywallScreenId="Z-14"
              onBack={() => navigate({ to: "/subjects/$subjectId/study", params: { subjectId } })}
              onSubscribe={() =>
                navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } })
              }
              onSelectQuestion={() => undefined}
              onFreePractice={() =>
                navigate({ to: "/subjects/$subjectId/practice", params: { subjectId } })
              }
            />
          </div>
        )}
        {!isLoading && !isError && !subject && (
          <p className="mt-4 text-sm text-ink-muted">Không tìm thấy môn học.</p>
        )}
      </main>
      <ZaloBottomTabs active="subjects" />
      <Toaster />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
      {content}
    </DisclaimerGate>
  );
}

function createZaloPracticeApi(): PracticeApiAdapter {
  const client = createClient();
  return {
    getActiveSession: async (subjectId) => (await client.getActivePracticeSession(subjectId)).data,
    startSession: async (subjectId, forceNew) =>
      (await client.startPracticeSession(subjectId, forceNew)).data,
    getQuestion: async (sessionId) => (await client.getPracticeQuestion(sessionId)).data,
    submitAnswer: async (sessionId, input) =>
      (await client.submitPracticeAnswer(sessionId, input)).data,
    endSession: async (sessionId) => (await client.endPracticeSession(sessionId)).data,
    flagQuestion: async (questionId, comment) => {
      await client.flagQuestion(questionId, comment);
    },
  };
}

function SubjectPracticePage() {
  const { subjectId } = subjectPracticeRoute.useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const subject = data?.data.find((item) => item.id === subjectId);
  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const practiceApi = useMemo(() => createZaloPracticeApi(), []);

  const content = (
    <>
      <ZaloAppHeader title={subject?.name ?? "Luyện tập"} />
      <main className="px-gutter-mobile pb-24 pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
          className="text-sm text-primary underline"
        >
          ← Quay lại môn học
        </button>
        <p className="mt-2 text-xs text-ink-muted">Z-21 — Luyện tập</p>
        {!isLoading && subject && (
          <div className="mt-4">
            <PracticeFlowScreen
              subjectId={subjectId}
              subjectName={subject.name}
              monthlyPriceVnd={subject.monthlyPriceVnd}
              api={practiceApi}
              screenId="Z-21"
              summaryScreenId="Z-22"
              resumeScreenId="Z-20"
              paywallScreenId="Z-23"
              onBack={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
              onSubscribe={() =>
                navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } })
              }
            />
          </div>
        )}
      </main>
      <ZaloBottomTabs active="subjects" />
      <Toaster />
    </>
  );

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-02">
      {content}
    </DisclaimerGate>
  );
}

function SubjectCheckoutPage() {
  const { subjectId } = subjectCheckoutRoute.useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<"payos" | "sepay">("payos");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: () => createClient().listSubjects(),
  });

  const subject = data?.data.find((item) => item.id === subjectId);

  async function handleSubmit() {
    if (!subject || !getStoredToken()) return;
    setLoading(true);
    setError(null);
    try {
      const client = createClient();
      const origin = window.location.origin;
      const result = await client.initiateCheckout({
        subjectId,
        channel: "zalo",
        provider,
        promoCode: promoCode || undefined,
        returnUrl: `${origin}/checkout/pending?subjectId=${subjectId}`,
        cancelUrl: `${origin}/subjects/${subjectId}`,
      });

      if (result.data.checkoutUrl.includes("/mock-checkout")) {
        await client.simulateMockCheckout(result.data.paymentId, provider);
        navigate({
          to: "/checkout/pending",
          search: { paymentId: result.data.paymentId, subjectId },
        });
        return;
      }

      window.location.href = result.data.checkoutUrl;
    } catch {
      setError("Không thể bắt đầu thanh toán.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-4">
      <button
        type="button"
        onClick={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
        className="text-sm text-primary underline"
      >
        ← Quay lại
      </button>
      <p className="mt-4 text-sm text-ink-muted">Z-24 — Thanh toán đăng ký</p>
      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {isLoading && <p className="mt-4 text-sm text-ink-muted">Đang tải...</p>}
      {subject && (
        <div className="mt-4">
          <CheckoutView
            subjectName={subject.name}
            monthlyPriceVnd={subject.monthlyPriceVnd}
            provider={provider}
            promoCode={promoCode}
            loading={loading}
            onProviderChange={setProvider}
            onPromoCodeChange={setPromoCode}
            onSubmit={handleSubmit}
            onCancel={() => navigate({ to: "/subjects/$subjectId", params: { subjectId } })}
            screenId="Z-24"
          />
        </div>
      )}
    </main>
  );
}

function CheckoutPendingPage() {
  const navigate = useNavigate();
  const { paymentId, subjectId } = checkoutPendingRoute.useSearch();

  const { data, isError } = useQuery({
    queryKey: queryKeys.payments.detail(paymentId ?? ""),
    queryFn: () => createClient().getPayment(paymentId!),
    enabled: Boolean(paymentId && getStoredToken()),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (status === "paid" || status === "failed" || status === "cancelled") return false;
      return 2000;
    },
  });

  const payment = data?.data;
  const terminal =
    payment?.status === "paid" || payment?.status === "failed" || payment?.status === "cancelled";

  return (
    <main className="p-4">
      <p className="text-sm text-ink-muted">Z-25 / Z-26 — Xác nhận thanh toán</p>
      {!terminal && !isError && <PaymentPendingView screenId="Z-25" className="mt-4" />}
      {payment?.status === "paid" && payment.subscription && (
        <PaymentConfirmationView
          className="mt-4"
          subjectName="môn học"
          expiresAt={payment.subscription.periodEnd}
          screenId="Z-26"
          onContinue={() =>
            subjectId
              ? navigate({ to: "/subjects/$subjectId", params: { subjectId } })
              : navigate({ to: "/" })
          }
        />
      )}
      {(payment?.status === "failed" || payment?.status === "cancelled" || isError) && (
        <PaymentFailedView
          className="mt-4"
          screenId="Z-25"
          onRetry={() =>
            subjectId
              ? navigate({ to: "/subjects/$subjectId/checkout", params: { subjectId } })
              : navigate({ to: "/" })
          }
          onDismiss={() =>
            subjectId
              ? navigate({ to: "/subjects/$subjectId", params: { subjectId } })
              : navigate({ to: "/" })
          }
        />
      )}
    </main>
  );
}

function LinkZaloPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleLink() {
    setError(null);
    try {
      const client = createClient();
      const zaloToken = "test-zalo-link-secondary";
      const result = await client.linkZalo(zaloToken);
      localStorage.setItem("access_token", result.data.tokens.accessToken);
      alert("Liên kết thành công");
      window.location.href = "/";
    } catch {
      setError("Không thể đăng nhập Zalo. Thử lại.");
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold text-primary">Liên kết tài khoản</h1>
      <p className="mt-2 text-sm text-ink-muted">Z-51</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleLink}
        className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-white"
      >
        Liên kết Zalo
      </button>
    </main>
  );
}

function ProgressPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState<30 | 90>(30);

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.progress.summary(days),
    queryFn: async () => {
      if (!getStoredToken()) throw new Error("UNAUTHORIZED");
      const res = await createClient().getProgressSummary(days);
      return res.data;
    },
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-40">
      <ZaloAppHeader title="Tiến độ" />
      <main className="px-gutter-mobile pb-24 pt-4">
        {isLoading && <CatalogSkeleton count={2} />}
        {isError && (
          <p className="text-sm text-error" role="alert">
            Không thể tải tiến độ. Vui lòng đăng nhập và thử lại.
          </p>
        )}
        {data && (
          <ProgressDashboard
            summaries={data.subjects}
            days={days}
            onDaysChange={setDays}
            onPractice={(subjectId) =>
              navigate({ to: "/subjects/$subjectId", params: { subjectId } })
            }
            historyHref="/progress/history"
            screenId="Z-40"
          />
        )}
      </main>
      <ZaloBottomTabs active="progress" />
    </DisclaimerGate>
  );
}

function AttemptHistoryPage() {
  const navigate = useNavigate();

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.progress.attempts,
    queryFn: async () => {
      if (!getStoredToken()) throw new Error("UNAUTHORIZED");
      const res = await createClient().listAttemptHistory();
      return res.data;
    },
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-41">
      <ZaloAppHeader title="Lịch sử" />
      <main className="px-gutter-mobile pb-24 pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/progress" })}
          className="text-sm text-primary underline"
        >
          ← Quay lại tiến độ
        </button>
        <h1 className="mt-4 text-xl font-semibold text-primary">Lịch sử luyện tập</h1>
        {isLoading && (
          <div className="mt-6">
            <CatalogSkeleton count={3} />
          </div>
        )}
        {isError && (
          <p className="mt-6 text-sm text-error" role="alert">
            Không thể tải lịch sử.
          </p>
        )}
        {data && (
          <div className="mt-6">
            <AttemptHistoryList
              items={data.items}
              onItemClick={(item) =>
                navigate({
                  to: "/progress/history/$type/$id",
                  params: { type: item.type, id: item.id },
                })
              }
              screenId="Z-41"
            />
          </div>
        )}
      </main>
      <ZaloBottomTabs active="progress" />
    </DisclaimerGate>
  );
}

function AttemptDetailPage() {
  const navigate = useNavigate();
  const { type, id } = attemptDetailRoute.useParams();
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const isValidType = type === "practice" || type === "mock";
  const isPractice = type === "practice";

  const { data: disclaimerResponse } = useQuery(disclaimerQueryOptions);

  const practiceQuery = useQuery({
    queryKey: queryKeys.progress.practiceDetail(id),
    queryFn: async () => {
      const res = await createClient().getPracticeSessionDetail(id);
      return res.data;
    },
    enabled: isValidType && isPractice,
    retry: false,
  });

  const mockQuery = useQuery({
    queryKey: ["mock-exam", "results", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/mock-exam-attempts/${id}/results`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` },
      });
      if (!res.ok) throw new Error("Failed");
      const body = await res.json();
      return body.data;
    },
    enabled: isValidType && !isPractice,
    retry: false,
  });

  const disclaimer = disclaimerResponse?.data ?? FALLBACK_PLATFORM_DISCLAIMER;
  const isLoading = isValidType && (isPractice ? practiceQuery.isLoading : mockQuery.isLoading);
  const isError = isValidType && (isPractice ? practiceQuery.isError : mockQuery.isError);

  if (!isValidType) {
    return (
      <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-42">
        <ZaloAppHeader title="Không tìm thấy" />
        <main className="px-gutter-mobile pb-24 pt-4">
          <p className="text-sm text-error" role="alert">
            Loại phiên không hợp lệ.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/progress/history" })}
            className="mt-4 text-sm text-primary underline"
          >
            ← Quay lại lịch sử
          </button>
        </main>
        <ZaloBottomTabs active="progress" />
      </DisclaimerGate>
    );
  }

  return (
    <DisclaimerGate text={disclaimer.text} version={disclaimer.version} screenId="Z-42">
      <ZaloAppHeader title="Chi tiết" />
      <main className="px-gutter-mobile pb-24 pt-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/progress/history" })}
          className="text-sm text-primary underline"
        >
          ← Quay lại lịch sử
        </button>
        {isLoading && (
          <div className="mt-6">
            <CatalogSkeleton count={2} />
          </div>
        )}
        {isError && (
          <p className="mt-6 text-sm text-error" role="alert">
            Không thể tải chi tiết phiên.
          </p>
        )}
        {isPractice && practiceQuery.data && (
          <div className="mt-6">
            <PracticeSessionDetailScreen
              detail={practiceQuery.data}
              onBack={() => navigate({ to: "/progress/history" })}
              screenId="Z-42"
            />
          </div>
        )}
        {!isPractice && mockQuery.data && !showReview && (
          <div className="mt-6">
            <MockExamResultsScreen
              results={mockQuery.data}
              onReviewQuestions={() => setShowReview(true)}
              onDone={() => navigate({ to: "/progress/history" })}
              screenId="Z-42"
            />
          </div>
        )}
        {!isPractice && mockQuery.data?.questionReviews && showReview && (
          <div className="mt-6">
            <MockExamQuestionReviewScreen
              reviews={mockQuery.data.questionReviews}
              currentIndex={reviewIndex}
              onChangeIndex={setReviewIndex}
              onBack={() => setShowReview(false)}
              screenId="Z-42"
            />
          </div>
        )}
      </main>
      <ZaloBottomTabs active="progress" />
    </DisclaimerGate>
  );
}

function RootLayout() {
  return <Outlet />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthScreen,
});

const authErrorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/error",
  component: AuthErrorScreen,
});

const linkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/link",
  component: LinkZaloPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CatalogPage,
});

const subjectDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId",
  component: SubjectDetailPage,
});

const subjectPracticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId/practice",
  component: SubjectPracticePage,
});

const subjectStudyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId/study",
  component: SubjectStudyPage,
});

const subjectStudyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId/study/$questionId",
  component: SubjectStudyDetailPage,
});

const subjectCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subjects/$subjectId/checkout",
  component: SubjectCheckoutPage,
});

const checkoutPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/pending",
  validateSearch: (search: Record<string, unknown>) => ({
    paymentId: (search.paymentId as string) ?? "",
    subjectId: (search.subjectId as string) ?? "",
  }),
  component: CheckoutPendingPage,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress",
  component: ProgressPage,
});

const progressHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress/history",
  component: AttemptHistoryPage,
});

const attemptDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/progress/history/$type/$id",
  component: AttemptDetailPage,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  authErrorRoute,
  linkRoute,
  indexRoute,
  subjectDetailRoute,
  subjectPracticeRoute,
  subjectStudyRoute,
  subjectStudyDetailRoute,
  subjectCheckoutRoute,
  checkoutPendingRoute,
  progressRoute,
  progressHistoryRoute,
  attemptDetailRoute,
]);
const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MaintenanceGate>
        <RouterProvider router={router} />
      </MaintenanceGate>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
