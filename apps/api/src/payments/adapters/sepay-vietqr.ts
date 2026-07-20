/** Build SePay / VietQR dynamic QR image URL (https://developer.sepay.vn/vi/tien-ich-khac/tao-qr-code). */

export function buildSepayVietQrUrl(input: {
  accountNumber: string;
  bankCode: string;
  amountVnd: number;
  transferContent: string;
  accountHolder?: string;
}): string {
  const params = new URLSearchParams({
    acc: input.accountNumber.replace(/\s+/g, ""),
    bank: input.bankCode.trim(),
    amount: String(Math.trunc(input.amountVnd)),
    des: sanitizeTransferContent(input.transferContent),
    template: "compact",
  });
  if (input.accountHolder?.trim()) {
    params.set("holder", sanitizeTransferContent(input.accountHolder).slice(0, 80));
  }
  return `https://qr.sepay.vn/img?${params.toString()}`;
}

/** SePay transfer content: letters/digits only, no accents. */
export function sanitizeTransferContent(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 25);
}

/** Stable short payment code for matching SePay webhook `code` / transfer content. */
export function buildPaymentTransferCode(paymentId: string): string {
  const compact = paymentId.replace(/-/g, "").toUpperCase();
  return sanitizeTransferContent(`PE${compact.slice(0, 10)}`);
}
