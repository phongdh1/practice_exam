"use client";

import { InternalLinkProvider } from "@practice-exam/ui";
import { ClientLink } from "@/components/client-link";
import { CandidateShellProvider } from "@/components/candidate-shell-context";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return (
    <InternalLinkProvider linkComponent={ClientLink}>
      <CandidateShellProvider>{children}</CandidateShellProvider>
    </InternalLinkProvider>
  );
}
