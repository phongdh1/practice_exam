const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = then - Date.now();

  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");

  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");

  const days = Math.round(diffMs / 86_400_000);
  if (Math.abs(days) < 7) return rtf.format(days, "day");

  const weeks = Math.round(days / 7);
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");

  const months = Math.round(days / 30);
  return rtf.format(months, "month");
}
