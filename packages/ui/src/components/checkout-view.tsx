"use client";

import * as React from "react";
import { formatMonthlyPriceVnd } from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface CheckoutViewProps {
  subjectName: string;
  monthlyPriceVnd: number;
  provider: "payos" | "sepay";
  promoCode: string;
  loading?: boolean;
  onProviderChange: (provider: "payos" | "sepay") => void;
  onPromoCodeChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  screenId?: "Z-24" | "W-24";
  className?: string;
}

/** Checkout screen (Z-24, W-24) */
export function CheckoutView({
  subjectName,
  monthlyPriceVnd,
  provider,
  promoCode,
  loading,
  onProviderChange,
  onPromoCodeChange,
  onSubmit,
  onCancel,
  screenId = "W-24",
  className,
}: CheckoutViewProps) {
  return (
    <Card
      className={cn("border-outline-variant bg-surface-elevated shadow-sm", className)}
      data-component="checkout-view"
      data-screen={screenId}
    >
      <CardHeader className="p-6 pb-0">
        <CardTitle className="text-display-sm text-primary">Thanh toán đăng ký</CardTitle>
        <p className="text-sm text-muted-foreground">Môn: {subjectName}</p>
        <p className="text-lg font-bold text-price-highlight">
          {formatMonthlyPriceVnd(monthlyPriceVnd)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="checkout-provider">Nhà cung cấp thanh toán</Label>
          <Select value={provider} onValueChange={(v) => onProviderChange(v as "payos" | "sepay")}>
            <SelectTrigger id="checkout-provider" className="bg-surface">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="payos">PayOS</SelectItem>
              <SelectItem value="sepay">SePay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="checkout-promo">Mã khuyến mãi (tùy chọn)</Label>
          <Input
            id="checkout-promo"
            type="text"
            className="bg-surface"
            value={promoCode}
            onChange={(e) => onPromoCodeChange(e.target.value)}
            placeholder="Nhập mã nếu có"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 p-6 pt-0 sm:flex-row">
        <Button type="button" className="flex-1" size="lg" disabled={loading} onClick={onSubmit}>
          {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Hủy
        </Button>
      </CardFooter>
    </Card>
  );
}
