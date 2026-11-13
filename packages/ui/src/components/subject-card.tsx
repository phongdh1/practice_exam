import * as React from "react";
import {
  formatMonthlyPriceVnd,
  resolveSubjectCardStatusLabel,
  type SubjectSubscriptionView,
} from "@practice-exam/utils";
import { cn } from "../lib/utils";
import { InternalLink } from "./internal-link";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { MaterialIcon } from "./material-icon";

export interface SubjectCardProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string | null;
  priceVnd?: number;
  /** @deprecated Use priceVnd instead */
  price?: string;
  /** @deprecated Use subscription or freeTier props */
  badge?: string;
  subscription?: SubjectSubscriptionView | null;
  freeTierUsed?: number;
  freeTierLimit?: number;
  featured?: boolean;
  variant?: "web" | "zalo";
  icon?: string;
  href?: string;
  onCardClick?: () => void;
  onActionClick?: () => void;
  actionLabel?: string;
  actionHref?: string;
  hasActiveSubscription?: boolean;
}

function freeTierProgress(used: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Stitch W-10 / Z-10 subject card */
export function SubjectCard({
  title,
  description,
  priceVnd,
  price,
  badge,
  subscription,
  freeTierUsed,
  freeTierLimit,
  featured,
  variant = "web",
  icon = "menu_book",
  href,
  onCardClick,
  onActionClick,
  actionLabel,
  actionHref,
  hasActiveSubscription,
  className,
  ...props
}: SubjectCardProps) {
  const priceLabel = priceVnd !== undefined ? formatMonthlyPriceVnd(priceVnd) : price;
  const status = badge
    ? { kind: "subscription" as const, label: badge }
    : resolveSubjectCardStatusLabel({ subscription, freeTierUsed, freeTierLimit });
  const hasSubscription =
    hasActiveSubscription ?? (subscription?.status === "active" || subscription?.status === "expiring");
  const used = freeTierUsed ?? 0;
  const limit = freeTierLimit ?? 20;
  const progress = freeTierProgress(used, limit);

  const defaultActionLabel = hasSubscription
    ? "Tiếp tục học"
    : used > 0
      ? "Tiếp tục học"
      : "Đăng ký ngay";

  const actionVariant = hasSubscription || used > 0 ? "default" : "outline";
  const actionClassName = cn(
    "mt-6 w-full rounded-lg py-3 text-label font-bold active:scale-95",
    actionVariant === "outline" && "border-2 border-primary text-primary hover:bg-surface-container-high",
  );
  const content = (
    <CardContent className="flex min-h-[220px] flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex items-center justify-center rounded-lg p-3",
            featured ? "bg-primary-fixed-dim text-primary" : "bg-secondary text-primary",
          )}
        >
          <MaterialIcon name={icon} size={22} />
        </div>
        {featured && (
          <Badge
            variant="secondary"
            className="bg-success-muted text-[10px] uppercase text-success hover:bg-success-muted"
          >
            Giai đoạn 1
          </Badge>
        )}
        {!featured && status.kind === "subscription" && (
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] uppercase",
              subscription?.status === "expiring"
                ? "bg-warning-muted text-warning hover:bg-warning-muted"
                : "bg-success-muted text-success hover:bg-success-muted",
            )}
          >
            {status.label}
          </Badge>
        )}
      </div>
      <h3 className="mt-4 text-heading font-heading text-primary">{title}</h3>
      {description && variant === "web" && (
        <p className="mt-2 line-clamp-2 text-caption text-ink-muted">{description}</p>
      )}
      {priceLabel && (
        <p className="mt-3 text-label font-bold text-price-highlight">{priceLabel}</p>
      )}
      {!hasSubscription && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-caption text-on-surface-variant">
            <span>Lượt dùng thử miễn phí</span>
            <span className="font-bold">
              {used}/{limit}
            </span>
          </div>
          <Progress
            value={Math.max(progress, progress === 0 ? 0 : 4)}
            className={cn("bg-surface-container", progress === 0 && "[&>div]:bg-outline-variant")}
          />
        </div>
      )}
      {onActionClick && (
        <Button type="button" size="lg" variant={actionVariant} className={actionClassName}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onActionClick();
          }}
        >
          {actionLabel ?? defaultActionLabel}
        </Button>
      )}
      {href && !onActionClick && !actionHref && (
        <span className={buttonVariants({ variant: actionVariant, size: "lg", className: actionClassName })}>
          {actionLabel ?? defaultActionLabel}
        </span>
      )}
    </CardContent>
  );

  const cardClassName = cn(
    "card-hover border-outline-variant bg-surface-container-lowest shadow-sm",
    (href || onCardClick) && "cursor-pointer",
    className,
  );

  if (href && actionHref) {
    return (
      <Card className={cardClassName} data-component="subject-card" data-variant={variant} {...props}>
        <InternalLink href={href} className="block no-underline" onClick={onCardClick}>
          {content}
        </InternalLink>
        <div className="px-5 pb-5">
          <Button asChild variant={actionVariant} size="lg" className={cn(actionClassName, "mt-0")}>
            <InternalLink href={actionHref}>{actionLabel ?? defaultActionLabel}</InternalLink>
          </Button>
        </div>
      </Card>
    );
  }

  if (href) {
    return (
      <InternalLink
        href={href}
        className={cn("block no-underline", cardClassName)}
        data-component="subject-card"
        data-variant={variant}
        onClick={onCardClick}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </InternalLink>
    );
  }

  return (
    <Card
      className={cardClassName}
      data-component="subject-card"
      data-variant={variant}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onClick={onCardClick}
      onKeyDown={
        onCardClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCardClick();
              }
            }
          : undefined
      }
      {...props}
    >
      {content}
    </Card>
  );
}
