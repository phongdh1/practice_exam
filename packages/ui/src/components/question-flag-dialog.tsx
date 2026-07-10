"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface QuestionFlagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comment?: string) => Promise<void>;
  submitting?: boolean;
}

/** Post-reveal question flag with optional comment (FR-9) */
export function QuestionFlagDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: QuestionFlagDialogProps) {
  const [comment, setComment] = useState("");

  async function handleSubmit() {
    await onSubmit(comment.trim() || undefined);
    setComment("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo cáo câu hỏi</DialogTitle>
          <DialogDescription>
            Mô tả vấn đề bạn gặp phải (tùy chọn). Biên tập viên sẽ xem xét báo cáo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="flag-comment">Ghi chú</Label>
          <Input
            id="flag-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ví dụ: Đáp án B cũng đúng..."
            disabled={submitting}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
