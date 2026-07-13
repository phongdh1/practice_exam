/** Add one calendar month from a date (renewal extends from previous period end). */
export function addOneMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

/** Days until expiry in ICT (floor, can be negative if already expired). */
export function daysUntilExpiry(periodEnd: Date, now = new Date()): number {
  const msPerDay = 86_400_000;
  return Math.floor((periodEnd.getTime() - now.getTime()) / msPerDay);
}
