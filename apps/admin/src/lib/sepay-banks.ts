export type SepayBankOption = {
  value: string;
  label: string;
  supported: boolean;
  bin: string;
  code: string;
};

type SepayBanksJson = {
  data?: Array<{
    name?: string;
    code?: string;
    bin?: string;
    short_name?: string;
    alias?: string[];
    supported?: boolean;
  }>;
};

const BANKS_URL = "https://qr.sepay.vn/banks.json";

export function bankOptionValue(bank: {
  short_name?: string;
  code?: string;
}): string {
  return (bank.short_name || bank.code || "").trim();
}

export function normalizeSepayBanks(payload: SepayBanksJson): SepayBankOption[] {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const seen = new Set<string>();
  const options: SepayBankOption[] = [];

  for (const bank of rows) {
    const value = bankOptionValue(bank);
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      value,
      label: `${value} — ${bank.name?.trim() || value}`,
      supported: bank.supported === true,
      bin: bank.bin?.trim() || "",
      code: bank.code?.trim() || "",
    });
  }

  options.sort((a, b) => {
    if (a.supported !== b.supported) return a.supported ? -1 : 1;
    return a.label.localeCompare(b.label, "vi");
  });

  return options;
}

export async function fetchSepayBankOptions(): Promise<SepayBankOption[]> {
  const res = await fetch(BANKS_URL, { cache: "force-cache" });
  if (!res.ok) {
    throw new Error(`Không tải được danh sách ngân hàng SePay (HTTP ${res.status}).`);
  }
  const raw: unknown = await res.json();
  if (!raw || typeof raw !== "object") {
    throw new Error("Phản hồi danh sách ngân hàng SePay không hợp lệ.");
  }
  const options = normalizeSepayBanks(raw as SepayBanksJson);
  if (options.length === 0) {
    throw new Error("Danh sách ngân hàng SePay trống.");
  }
  return options;
}

export function findSepayBankOption(
  bankCode: string | null | undefined,
  options: SepayBankOption[],
): SepayBankOption | undefined {
  if (!bankCode?.trim()) return undefined;
  const needle = bankCode.trim().toLowerCase();
  return options.find(
    (o) =>
      o.value.toLowerCase() === needle ||
      (o.code && o.code.toLowerCase() === needle) ||
      (o.bin && o.bin === bankCode.trim()),
  );
}

export function isKnownSepayBank(
  bankCode: string | null | undefined,
  options: SepayBankOption[],
): boolean {
  return Boolean(findSepayBankOption(bankCode, options));
}

/** Canonical dropdown value (`short_name`/`code`) for a stored bankCode. */
export function resolveSepayBankValue(
  bankCode: string | null | undefined,
  options: SepayBankOption[],
): string {
  return findSepayBankOption(bankCode, options)?.value ?? "";
}
