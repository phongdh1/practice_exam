"use client";

import * as React from "react";
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

const DISCLAIMER_ACK_PREFIX = "disclaimer_ack_";

export function getDisclaimerAckKey(version: string): string {
  return `${DISCLAIMER_ACK_PREFIX}${version}`;
}

export function isDisclaimerAcknowledged(version: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getDisclaimerAckKey(version)) === "1";
}

export function acknowledgeDisclaimer(version: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getDisclaimerAckKey(version), "1");
}

export interface DisclaimerModalProps {
  open: boolean;
  text: string;
  version: string;
  onAcknowledge: () => void;
  screenId?: "Z-02" | "W-03" | "W-40" | "W-41" | "W-42" | "W-50" | "Z-40" | "Z-41" | "Z-42";
  className?: string;
}

/** First-visit UBCKNN disclaimer acknowledgment modal (Z-02, W-03) */
export function DisclaimerModal({
  open,
  text,
  onAcknowledge,
  screenId = "W-03",
  className,
}: DisclaimerModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        className={cn("[&>button]:hidden", className)}
        data-component="disclaimer-modal"
        data-screen={screenId}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-primary">Tuyên bố miễn trừ trách nhiệm</DialogTitle>
          <DialogDescription className="text-left leading-relaxed">{text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" className="w-full" size="lg" onClick={onAcknowledge}>
            Tôi đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
