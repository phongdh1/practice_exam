"use client";

import type * as React from "react";
import { cn } from "../lib/utils";
import { Table } from "./ui/table";

export interface AdminDataTableProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

/** Standard admin list table wrapper — consistent border, radius, and cell padding via Table primitives. */
export function AdminDataTable({ children, className, footer }: AdminDataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm",
        className,
      )}
      data-component="admin-data-table"
    >
      <Table>{children}</Table>
      {footer}
    </div>
  );
}

export interface AdminTableEmptyProps {
  colSpan: number;
  children: React.ReactNode;
}

export function AdminTableEmpty({ colSpan, children }: AdminTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-ink-muted">
        {children}
      </td>
    </tr>
  );
}

export interface AdminTableActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTableActions({ children, className }: AdminTableActionsProps) {
  return <div className={cn("flex items-center justify-end gap-1", className)}>{children}</div>;
}
