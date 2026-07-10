import { cn } from "../lib/utils";
import { MaterialIcon } from "./material-icon";
import type { CandidateNavItem } from "./candidate-top-nav";

export interface ZaloAppHeaderProps {
  title?: string;
  className?: string;
  showNotifications?: boolean;
}

export function ZaloAppHeader({
  title = "CNVCK Prep",
  className,
  showNotifications = true,
}: ZaloAppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex w-full items-center justify-between bg-surface px-gutter-mobile py-3",
        className,
      )}
      data-component="zalo-app-header"
    >
      <div className="flex items-center gap-3">
        <button type="button" className="p-1 text-primary" aria-label="Menu">
          <MaterialIcon name="menu" />
        </button>
        <h1 className="text-display-sm font-bold text-primary">{title}</h1>
      </div>
      {showNotifications && (
        <button type="button" className="relative p-1 text-primary" aria-label="Thông báo">
          <MaterialIcon name="notifications" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error" />
        </button>
      )}
    </header>
  );
}

export interface ZaloBottomTabsProps {
  active?: CandidateNavItem;
  homeHref?: string;
  progressHref?: string;
  accountHref?: string;
  className?: string;
}

export function ZaloBottomTabs({
  active = "subjects",
  homeHref = "/",
  progressHref = "/progress",
  accountHref = "/account",
  className,
}: ZaloBottomTabsProps) {
  const tabs: { id: CandidateNavItem; label: string; icon: string; href: string }[] = [
    { id: "subjects", label: "Trang chủ", icon: "home", href: homeHref },
    { id: "progress", label: "Tiến độ", icon: "trending_up", href: progressHref },
    { id: "account", label: "Tài khoản", icon: "person", href: accountHref },
  ];

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-outline-variant bg-surface-container-lowest px-gutter-mobile py-2 shadow-lg",
        className,
      )}
      data-component="zalo-bottom-tabs"
    >
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={tab.href}
          className={cn(
            "flex flex-col items-center gap-0.5 px-4 py-1 text-caption",
            active === tab.id ? "font-bold text-primary" : "text-on-surface-variant",
          )}
        >
          <MaterialIcon name={tab.icon} size={22} filled={active === tab.id} />
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}

export interface ZaloCatalogHeaderProps {
  userName?: string;
  className?: string;
}

export function ZaloCatalogHeader({ userName = "bạn", className }: ZaloCatalogHeaderProps) {
  return (
    <section className={cn("bg-surface-subtle px-gutter-mobile py-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-display-lg text-primary">Chào bạn, {userName}</h2>
          <p className="text-body text-on-surface-variant">Sẵn sàng cho bài học hôm nay chưa?</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-primary/10 shadow-sm">
          <MaterialIcon name="person" className="text-primary" />
        </div>
      </div>
    </section>
  );
}
