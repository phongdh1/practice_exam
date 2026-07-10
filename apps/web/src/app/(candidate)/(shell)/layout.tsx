"use client";

import { CandidateBottomNav, CandidateTopNav } from "@practice-exam/ui";
import { usePathname } from "next/navigation";
import { useCandidateShellState } from "@/components/candidate-shell-context";
import { resolveActiveNav } from "@/lib/candidate-nav";

export default function CandidateShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = resolveActiveNav(pathname);
  const { accountAction, hideBottomNav } = useCandidateShellState();

  return (
    <>
      <CandidateTopNav active={active} accountAction={accountAction} />
      {children}
      {!hideBottomNav && <CandidateBottomNav active={active} />}
    </>
  );
}
