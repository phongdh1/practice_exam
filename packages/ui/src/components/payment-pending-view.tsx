import * as React from "react";
import { cn } from "../lib/utils";
import { Card, CardContent } from "./ui/card";

export interface PaymentPendingViewProps {
  screenId?: "Z-25" | "W-25";
  className?: string;
}

/** Payment pending / polling state (Z-25, W-25) */
export function PaymentPendingView({ screenId = "W-25", className }: PaymentPendingViewProps) {
  return (
    <Card
      className={cn("border-outline-variant bg-surface-elevated text-center shadow-sm", className)}
      data-component="payment-pending"
      data-screen={screenId}
      role="status"
      aria-live="polite"
    >
      <CardContent className="p-6">
        <p className="text-lg font-semibold text-primary">Đang xác nhận thanh toán...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vui lòng đợi trong giây lát. Không đóng trang này.
        </p>
        <div
          className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </CardContent>
    </Card>
  );
}
