"use client";

import * as React from "react";
import { formatMonthlyPriceVnd } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface FreeTierPaywallProps {
  open: boolean;
  subjectName: string;
  monthlyPriceVnd: number;
  onSubscribe: () => void;
  onDismiss: () => void;
  screenId?: "Z-23" | "W-23";
  className?: string;
}

/** Free Tier paywall sheet/dialog (Z-23, W-23) */
export function FreeTierPaywall({
  open,
  subjectName,
  monthlyPriceVnd,
  onSubscribe,
  onDismiss,
  screenId = "W-23",
  className,
}: FreeTierPaywallProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent
        className={cn(
          "top-auto bottom-0 max-w-md translate-y-0 rounded-t-xl sm:bottom-auto sm:top-[50%] sm:translate-y-[-50%] sm:rounded-lg",
          className,
        )}
        data-component="free-tier-paywall"
        data-screen={screenId}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">Hết lượt miễn phí</DialogTitle>
          <DialogDescription className="text-left">
            Bạn đã dùng hết câu hỏi miễn phí cho <strong>{subjectName}</strong> trong tháng này.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Luyện tập không giới hạn</li>
          <li>• Thi thử mô phỏng</li>
          <li>• Giải thích chi tiết</li>
        </ul>
        <p className="text-lg font-bold text-price-highlight">
          {formatMonthlyPriceVnd(monthlyPriceVnd)}
        </p>
        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button type="button" className="w-full" size="lg" onClick={onSubscribe}>
            Đăng ký ngay
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={onDismiss}>
            Để sau
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
