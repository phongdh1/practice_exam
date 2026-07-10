/** Returns true when selected keys match the correct set (order-independent). */
export function isPracticeAnswerCorrect(selectedKeys: string[], correctKeys: string[]): boolean {
  if (selectedKeys.length !== correctKeys.length) return false;
  const selected = [...selectedKeys].sort();
  const correct = [...correctKeys].sort();
  return selected.every((key, index) => key === correct[index]);
}

export const PRACTICE_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function practiceSessionExpiresAt(from: Date = new Date()): Date {
  return new Date(from.getTime() + PRACTICE_SESSION_TTL_MS);
}
