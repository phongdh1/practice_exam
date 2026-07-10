"use client";

import { formatMonthlyPriceVnd } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import {
  STUDY_PAYWALL_BENEFITS,
  STUDY_PAYWALL_TITLE,
  formatStudyPaywallDescription,
} from "./study-tier-paywall-copy";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface StudyTierPaywallProps {
  open: boolean;
  subjectName: string;
  monthlyPriceVnd: number;
  studyTierLimit?: number;
  onSubscribe: () => void;
  onBackToList: () => void;
  onFreePractice?: () => void;
  screenId?: "Z-14" | "W-14";
  className?: string;
}

/** Study Tier paywall sheet/dialog (Z-14, W-14) */
export function StudyTierPaywall({
  open,
  subjectName,
  monthlyPriceVnd,
  studyTierLimit = 5,
  onSubscribe,
  onBackToList,
  onFreePractice,
  screenId = "W-14",
  className,
}: StudyTierPaywallProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onBackToList()}>
      <DialogContent
        className={cn(
          "top-auto bottom-0 max-w-md translate-y-0 rounded-t-xl sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] sm:rounded-lg",
          className,
        )}
        data-component="study-tier-paywall"
        data-screen={screenId}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">{STUDY_PAYWALL_TITLE}</DialogTitle>
          <DialogDescription className="text-left">
            {formatStudyPaywallDescription(studyTierLimit, subjectName)}
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {STUDY_PAYWALL_BENEFITS.map((benefit) => (
            <li key={benefit}>• {benefit}</li>
          ))}
        </ul>
        <p className="text-lg font-bold text-price-highlight">
          {formatMonthlyPriceVnd(monthlyPriceVnd)}
        </p>
        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button type="button" className="w-full" size="lg" onClick={onSubscribe}>
            Đăng ký ngay
          </Button>
          {onFreePractice && (
            <Button type="button" variant="outline" className="w-full" onClick={onFreePractice}>
              Luyện tập miễn phí
            </Button>
          )}
          <Button type="button" variant="ghost" className="w-full" onClick={onBackToList}>
            Quay lại danh sách
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
