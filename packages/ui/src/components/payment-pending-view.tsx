import * as React from "react";
import { formatMonthlyPriceVnd } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { Card, CardContent } from "./ui/card";

export interface PaymentPendingViewProps {
  screenId?: "Z-25" | "W-25";
  className?: string;
  qrImageUrl?: string | null;
  transferContent?: string | null;
  amountVnd?: number | null;
  bankAccountNumber?: string | null;
  bankCode?: string | null;
  accountHolder?: string | null;
}

/** Payment pending / polling state (Z-25, W-25) — optional VietQR panel */
export function PaymentPendingView({
  screenId = "W-25",
  className,
  qrImageUrl,
  transferContent,
  amountVnd,
  bankAccountNumber,
  bankCode,
  accountHolder,
}: PaymentPendingViewProps) {
  const showQr = Boolean(qrImageUrl);

  return (
    <Card
      className={cn("border-outline-variant bg-surface-elevated text-center shadow-sm", className)}
      data-component="payment-pending"
      data-screen={screenId}
      role="status"
      aria-live="polite"
    >
      <CardContent className="p-6">
        <p className="text-lg font-semibold text-primary">
          {showQr ? "Quét mã VietQR để thanh toán" : "Đang xác nhận thanh toán..."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {showQr
            ? "Giữ nguyên số tiền và nội dung chuyển khoản. Trang sẽ tự mở khóa môn khi nhận được tiền."
            : "Vui lòng đợi trong giây lát. Không đóng trang này."}
        </p>

        {showQr && qrImageUrl && (
          <div className="mx-auto mt-6 max-w-xs space-y-3 text-left">
            <img
              src={qrImageUrl}
              alt="Mã VietQR thanh toán"
              className="mx-auto w-full max-w-[240px] rounded-lg border border-outline-variant bg-white"
            />
            {typeof amountVnd === "number" && (
              <p className="text-center text-base font-semibold text-price-highlight">
                {formatMonthlyPriceVnd(amountVnd)}
              </p>
            )}
            {transferContent && (
              <p className="rounded-md bg-surface px-3 py-2 font-mono text-sm">
                <span className="text-muted-foreground">Nội dung CK: </span>
                {transferContent}
              </p>
            )}
            {(bankAccountNumber || bankCode || accountHolder) && (
              <dl className="space-y-1 text-sm text-muted-foreground">
                {accountHolder && (
                  <div className="flex justify-between gap-2">
                    <dt>Chủ TK</dt>
                    <dd className="text-foreground">{accountHolder}</dd>
                  </div>
                )}
                {bankAccountNumber && (
                  <div className="flex justify-between gap-2">
                    <dt>Số TK</dt>
                    <dd className="font-mono text-foreground">{bankAccountNumber}</dd>
                  </div>
                )}
                {bankCode && (
                  <div className="flex justify-between gap-2">
                    <dt>Ngân hàng</dt>
                    <dd className="text-foreground">{bankCode}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}

        <div
          className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      </CardContent>
    </Card>
  );
}
