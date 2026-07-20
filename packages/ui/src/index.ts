export { cn } from "./lib/utils";

export {
  InternalLink,
  InternalLinkProvider,
  type InternalLinkComponent,
  type InternalLinkComponentProps,
  type InternalLinkProps,
} from "./components/internal-link";

// shadcn/ui primitives — DESIGN.md inherited components
export { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
export { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
export { Badge, badgeVariants, type BadgeProps } from "./components/ui/badge";
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/ui/card";
export { Checkbox } from "./components/ui/checkbox";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/ui/dropdown-menu";
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from "./components/ui/form";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export { Progress } from "./components/ui/progress";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./components/ui/select";
export { Separator } from "./components/ui/separator";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/ui/table";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/ui/sheet";
export { Skeleton } from "./components/ui/skeleton";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/tabs";
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from "./components/ui/toast";
export { Toaster } from "./components/ui/toaster";
export { useToast, toast } from "./hooks/use-toast";

export { MaterialIcon, type MaterialIconProps } from "./components/material-icon";
export { CandidateTopNav, type CandidateTopNavProps, type CandidateNavItem } from "./components/candidate-top-nav";
export { CandidateBottomNav, type CandidateBottomNavProps } from "./components/candidate-bottom-nav";
export { CandidateFooter, type CandidateFooterProps } from "./components/candidate-footer";
export { AuthShell, type AuthShellProps } from "./components/auth-shell";
export { LandingHero, type LandingHeroProps, DEFAULT_LANDING_CONTENT, mergeLandingContent } from "./components/landing-hero";
export { LandingFeatures, type LandingFeaturesProps } from "./components/landing-features";
export {
  LandingFeaturedSubjects,
  type LandingFeaturedSubjectsProps,
} from "./components/landing-featured-subjects";
export { LandingCtaBand, type LandingCtaBandProps } from "./components/landing-cta-band";
export { SafeMarkdown, type SafeMarkdownProps } from "./components/safe-markdown";
export {
  AdminSidebar,
  AdminShell,
  type AdminSidebarProps,
  type AdminShellProps,
  type AdminNavItem,
  type AdminSettingsSubNav,
} from "./components/admin-shell";
export {
  AdminDataTable,
  AdminTableEmpty,
  AdminTableActions,
  type AdminDataTableProps,
} from "./components/admin-data-table";
export { AdminIconAction, type AdminIconActionProps } from "./components/admin-icon-action";
export { CatalogPagination, type CatalogPaginationProps } from "./components/catalog-pagination";
export {
  ZaloAppHeader,
  ZaloBottomTabs,
  ZaloCatalogHeader,
  type ZaloAppHeaderProps,
  type ZaloBottomTabsProps,
  type ZaloCatalogHeaderProps,
} from "./components/zalo-shell";
export { SubjectCard, type SubjectCardProps } from "./components/subject-card";
export { AnswerOption, type AnswerOptionProps, type AnswerOptionState } from "./components/answer-option";
export {
  PracticeFlowScreen,
  type PracticeApiAdapter,
  type PracticeFlowScreenProps,
} from "./components/practice-flow-screen";
export {
  PracticeQuestionView,
  type PracticeQuestionViewProps,
} from "./components/practice-question-view";
export {
  PracticeResumePrompt,
  type PracticeResumePromptProps,
} from "./components/practice-resume-prompt";
export {
  PracticeSessionSummaryView,
  type PracticeSessionSummaryViewProps,
} from "./components/practice-session-summary-view";
export { AccountProfileView, type AccountProfileViewProps, type AccountProfileUser } from "./components/account-profile-view";
export { AttemptHistoryList, type AttemptHistoryListProps } from "./components/attempt-history-list";
export {
  ProgressDashboard,
  SubjectPerformanceCard,
  type ProgressDashboardProps,
  type SubjectPerformanceCardProps,
} from "./components/progress-dashboard";
export {
  PracticeSessionDetailScreen,
  type PracticeSessionDetailViewProps,
} from "./components/practice-session-detail-screen";
export {
  QuestionFlagDialog,
  type QuestionFlagDialogProps,
} from "./components/question-flag-dialog";
export { QuestionPreview, type QuestionPreviewProps } from "./components/question-preview";
export { CatalogSkeleton, type CatalogSkeletonProps } from "./components/catalog-skeleton";
export { SubjectCatalogGrid, type SubjectCatalogGridProps } from "./components/subject-catalog-grid";
export { SubjectDetailView, type SubjectDetailViewProps } from "./components/subject-detail-view";
export { PullToRefresh, type PullToRefreshProps } from "./components/pull-to-refresh";
export {
  MockExamFlowScreen,
  type MockExamApiAdapter,
  type MockExamFlowScreenProps,
} from "./components/mock-exam-flow-screen";
export { MockExamTemplateList, type MockExamTemplateListProps } from "./components/mock-exam-template-list";
export { MockExamBriefing, type MockExamBriefingProps } from "./components/mock-exam-briefing";
export { MockExamTimerBar, type MockExamTimerBarProps } from "./components/mock-exam-timer-bar";
export {
  MockExamSectionQuestion,
  type MockExamSectionQuestionProps,
} from "./components/mock-exam-section-question";
export { MockExamReviewGrid, type MockExamReviewGridProps } from "./components/mock-exam-review-grid";
export {
  MockExamResultsScreen,
  type MockExamResultsViewProps,
} from "./components/mock-exam-results-screen";
export {
  MockExamQuestionReviewScreen,
  type MockExamQuestionReviewScreenProps,
} from "./components/mock-exam-question-review-screen";
export { FreeTierPaywall, type FreeTierPaywallProps } from "./components/free-tier-paywall";
export { StudyMeterBadge, type StudyMeterBadgeProps } from "./components/study-meter-badge";
export { StudyTierPaywall, type StudyTierPaywallProps } from "./components/study-tier-paywall";
export { StudyQuestionRow, isStudyRowLocked, type StudyQuestionRowProps } from "./components/study-question-row";
export { StudyQuestionList, type StudyQuestionListProps } from "./components/study-question-list";
export {
  StudyQuestionDetail,
  type StudyQuestionDetailProps,
} from "./components/study-question-detail";
export {
  StudyFlowScreen,
  type StudyApiAdapter,
  type StudyFlowScreenProps,
} from "./components/study-flow-screen";
export { CheckoutView, type CheckoutViewProps } from "./components/checkout-view";
export { PaymentPendingView, type PaymentPendingViewProps } from "./components/payment-pending-view";
export { PaymentConfirmationView, type PaymentConfirmationViewProps } from "./components/payment-confirmation-view";
export { PaymentFailedView, type PaymentFailedViewProps } from "./components/payment-failed-view";
export {
  DisclaimerModal,
  acknowledgeDisclaimer,
  getDisclaimerAckKey,
  isDisclaimerAcknowledged,
  type DisclaimerModalProps,
} from "./components/disclaimer-modal";
export { DisclaimerFooter, type DisclaimerFooterProps } from "./components/disclaimer-footer";
export { DisclaimerGate, type DisclaimerGateProps } from "./components/disclaimer-gate";
export { FALLBACK_PLATFORM_DISCLAIMER } from "./constants/disclaimer";
export { MaintenanceScreen, type MaintenanceScreenProps } from "./components/maintenance-screen";

/** Exported brand color tokens from DESIGN.md / Stitch sync */
export const brandColors = {
  primary: "#1B4F72",
  success: "#0E7C4A",
  accent: "#0E7C4A",
} as const;
