import * as React from "react";
import { formatSubscriptionActivePill } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";

export interface PaymentConfirmationViewProps {
  subjectName: string;
  expiresAt: string;
  onContinue: () => void;
  screenId?: "Z-26" | "W-26";
  className?: string;
}

/** Payment success confirmation (Z-26, W-26) */
export function PaymentConfirmationView({
  subjectName,
  expiresAt,
  onContinue,
  screenId = "W-26",
  className,
}: PaymentConfirmationViewProps) {
  return (
    <Card
      className={cn("border-outline-variant bg-surface-elevated shadow-sm", className)}
      data-component="payment-confirmation"
      data-screen={screenId}
    >
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-display-sm text-success">Thanh toán thành công</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gói đăng ký <strong>{subjectName}</strong> đã được kích hoạt.
        </p>
        <Badge
          variant="secondary"
          className="mt-2 w-fit bg-success-muted text-subscription-active hover:bg-success-muted"
        >
          {formatSubscriptionActivePill(expiresAt)}
        </Badge>
      </CardHeader>
      <CardFooter className="p-6">
        <Button type="button" className="w-full" size="lg" onClick={onContinue}>
          Tiếp tục học
        </Button>
      </CardFooter>
    </Card>
  );
}
