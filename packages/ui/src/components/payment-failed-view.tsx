import * as React from "react";
import { cn } from "../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";

export interface PaymentFailedViewProps {
  message?: string;
  onRetry: () => void;
  onDismiss: () => void;
  screenId?: "Z-25" | "W-25";
  className?: string;
}

/** Payment failed state with retry (Z-25/W-25 failure branch) */
export function PaymentFailedView({
  message = "Thanh toán không thành công. Quyền truy cập chưa thay đổi.",
  onRetry,
  onDismiss,
  screenId = "W-25",
  className,
}: PaymentFailedViewProps) {
  return (
    <Card
      className={cn("border-outline-variant bg-surface-elevated shadow-sm", className)}
      data-component="payment-failed"
      data-screen={screenId}
    >
      <CardContent className="p-6">
        <Alert variant="destructive" className="border-none bg-transparent p-0">
          <AlertTitle>Thanh toán thất bại</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-6 pt-0">
        <Button type="button" className="w-full" size="lg" onClick={onRetry}>
          Thử lại
        </Button>
        <Button type="button" variant="outline" className="w-full" onClick={onDismiss}>
          Quay lại
        </Button>
      </CardFooter>
    </Card>
  );
}
