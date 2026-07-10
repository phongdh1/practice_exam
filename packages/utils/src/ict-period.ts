const ICT_TIMEZONE = "Asia/Ho_Chi_Minh";

/** Calendar month key in ICT (YYYY-MM) for Free Tier reset boundaries */
export function getIctPeriodKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ICT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Unable to resolve ICT period key");
  }

  return `${year}-${month}`;
}

export { ICT_TIMEZONE };
