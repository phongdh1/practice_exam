"use client";

import type { InternalLinkComponentProps } from "@practice-exam/ui";
import Link from "next/link";

export function ClientLink({ href, children, ...props }: InternalLinkComponentProps) {
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}
