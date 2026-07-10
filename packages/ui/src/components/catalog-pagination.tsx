"use client";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function CatalogPagination({
  page,
  totalPages,
  total,
  onPageChange,
  className,
}: CatalogPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-4",
        className,
      )}
      data-component="catalog-pagination"
    >
      <p className="text-label text-ink-muted">
        {total} môn học · Trang {page}/{totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Trang trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
}
