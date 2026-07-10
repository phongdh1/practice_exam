"use client";

import type { LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface AdminIconActionProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

/** Icon-only admin row action with hover tooltip and aria-label. */
export function AdminIconAction({
  icon: Icon,
  label,
  href,
  onClick,
  disabled,
  type = "button",
  className,
}: AdminIconActionProps) {
  const triggerClass = cn(
    "inline-flex h-9 w-9 items-center justify-center rounded-md text-primary hover:bg-surface-container-low disabled:pointer-events-none disabled:opacity-40",
    className,
  );

  const content = (
    <>
      <Icon className="h-4 w-4" aria-hidden />
      <span className="sr-only">{label}</span>
    </>
  );

  const trigger =
    href && !disabled ? (
      <InternalLink href={href} className={triggerClass} aria-label={label}>
        {content}
      </InternalLink>
    ) : (
      <Button
        type={type}
        variant="ghost"
        size="icon"
        className={cn("text-primary", className)}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </Button>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
