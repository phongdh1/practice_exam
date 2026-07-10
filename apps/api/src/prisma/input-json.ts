import type { Prisma } from "@prisma/client";

/** Prisma 7 JSON fields reject `Record<string, unknown>` without an explicit cast. */
export function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export function toOptionalInputJsonValue(
  value: unknown | undefined,
): Prisma.InputJsonValue | undefined {
  return value === undefined ? undefined : toInputJsonValue(value);
}
