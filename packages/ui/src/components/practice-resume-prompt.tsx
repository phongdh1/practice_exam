"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export interface PracticeResumePromptProps {
  open: boolean;
  subjectName: string;
  answeredCount: number;
  onResume: () => void;
  onStartNew: () => void;
  screenId?: "W-20" | "Z-20";
}

/** Resume in-progress practice session within 24h TTL */
export function PracticeResumePrompt({
  open,
  subjectName,
  answeredCount,
  onResume,
  onStartNew,
  screenId = "W-20",
}: PracticeResumePromptProps) {
  return (
    <Dialog open={open}>
      <DialogContent data-screen={screenId}>
        <DialogHeader>
          <DialogTitle>Tiếp tục phiên luyện tập?</DialogTitle>
          <DialogDescription>
            Bạn có phiên luyện tập {subjectName} đang dở ({answeredCount} câu đã trả lời). Phiên
            hết hạn sau 24 giờ kể từ lần hoạt động cuối.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onStartNew}>
            Bắt đầu mới
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={onResume}>
            Tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
