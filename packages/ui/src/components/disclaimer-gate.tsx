"use client";

import * as React from "react";
import {
  DisclaimerModal,
  acknowledgeDisclaimer,
  isDisclaimerAcknowledged,
} from "./disclaimer-modal";
import { DisclaimerFooter } from "./disclaimer-footer";
import { cn } from "../lib/utils";

export interface DisclaimerGateProps {
  text: string;
  version: string;
  screenId?: "Z-02" | "W-03" | "W-40" | "W-41" | "W-42" | "W-50" | "Z-40" | "Z-41" | "Z-42";
  children: React.ReactNode;
  className?: string;
}

/** Loads disclaimer CMS text, shows first-visit modal, and persistent footer */
export function DisclaimerGate({
  text,
  version,
  screenId = "W-03",
  children,
  className,
}: DisclaimerGateProps) {
  const [acknowledged, setAcknowledged] = React.useState(() =>
    typeof window === "undefined" ? false : isDisclaimerAcknowledged(version),
  );
  const [showFullDisclaimer, setShowFullDisclaimer] = React.useState(false);

  React.useEffect(() => {
    setAcknowledged(isDisclaimerAcknowledged(version));
  }, [version]);

  function handleAcknowledge() {
    acknowledgeDisclaimer(version);
    setAcknowledged(true);
    setShowFullDisclaimer(false);
  }

  const modalOpen = !acknowledged || showFullDisclaimer;

  return (
    <div className={cn("flex min-h-screen flex-col", className)}>
      <DisclaimerModal
        open={modalOpen}
        text={text}
        version={version}
        screenId={screenId}
        onAcknowledge={handleAcknowledge}
      />
      <div className="flex-1">{children}</div>
      <DisclaimerFooter text={text} onOpenFull={() => setShowFullDisclaimer(true)} />
    </div>
  );
}
