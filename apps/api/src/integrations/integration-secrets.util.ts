export function maskSecret(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= 4) return "****";
  return `****${value.slice(-4)}`;
}

export function mergeSecretField(
  incoming: string | undefined,
  existing: string | undefined,
  maskedPlaceholder = "****",
): string {
  if (!incoming || incoming === maskedPlaceholder || incoming.startsWith("****")) {
    return existing ?? "";
  }
  return incoming;
}
