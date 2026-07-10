import * as React from "react";
import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";

export interface AuthShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-surface-subtle p-4",
        className,
      )}
      data-component="auth-shell"
    >
      <div className="mb-10 text-center">
        <h1 className="text-display-lg text-primary">CNVCK Prep</h1>
        <p className="mt-2 text-body-sm text-ink-muted">Hệ thống ôn luyện chứng chỉ chuyên nghiệp</p>
      </div>
      <div className="glass-morphism w-full max-w-md rounded-xl border border-outline-variant p-8 shadow-sm md:p-10">
        {children}
      </div>
      <footer className="mt-8 flex items-center gap-2 text-caption text-ink-muted">
        <MaterialIcon name="verified_user" size={16} className="text-success" />
        <span>Bảo mật theo tiêu chuẩn ngành tài chính</span>
      </footer>
    </div>
  );
}
