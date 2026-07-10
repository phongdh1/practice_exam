/** Whether a server timer sync payload indicates the section has expired. */
export function isSectionTimerExpired(remainingMs: number | null | undefined): boolean {
  return remainingMs != null && remainingMs <= 0;
}

/**
 * Invoke onExpire when server sync reports expiry and the client has not fired yet.
 * Returns true when onExpire was called.
 */
export function handleServerTimerSyncExpiry(
  nextRemainingMs: number | null | undefined,
  wasExpired: boolean,
  onExpire?: () => void,
): boolean {
  if (!isSectionTimerExpired(nextRemainingMs) || wasExpired) {
    return false;
  }
  onExpire?.();
  return true;
}
