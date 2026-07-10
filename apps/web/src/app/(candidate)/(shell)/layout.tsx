"use client";

import { CandidateBottomNav, CandidateTopNav, InternalLink, MaterialIcon } from "@practice-exam/ui";
import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { useCandidateShellState } from "@/components/candidate-shell-context";
import { useWebSession } from "@/components/web-session-provider";
import { resolveActiveNav } from "@/lib/candidate-nav";

function useShellAccountAction(): ReactNode {
  const { user, isAuthenticated, isLoading } = useWebSession();

  return useMemo(() => {
    if (isLoading) return undefined;
    if (!isAuthenticated) {
      return (
        <InternalLink
          href="/sign-in"
          className="rounded-lg bg-primary px-4 py-2 text-label font-medium text-on-primary"
        >
          Đăng nhập
        </InternalLink>
      );
    }

    const displayName = user?.displayName ?? "Tài khoản";
    return (
      <InternalLink
        href="/account"
        aria-label="Tài khoản"
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-container"
      >
        {user?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <MaterialIcon name="account_circle" className="text-primary" />
        )}
        <span className="hidden text-label font-medium text-on-surface md:inline">
          {displayName}
        </span>
      </InternalLink>
    );
  }, [isAuthenticated, isLoading, user]);
}

export default function CandidateShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = resolveActiveNav(pathname);
  const { hideBottomNav } = useCandidateShellState();
  const accountAction = useShellAccountAction();

  return (
    <>
      <CandidateTopNav active={active} accountAction={accountAction} />
      {children}
      {!hideBottomNav && <CandidateBottomNav active={active} />}
    </>
  );
}
