import {
  buildPaymentTransferCode,
  buildSepayVietQrUrl,
  sanitizeTransferContent,
} from "./sepay-vietqr";

describe("sepay-vietqr", () => {
  it("builds a compact transfer code from payment id", () => {
    expect(buildPaymentTransferCode("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("PEA1B2C3D4E5");
  });

  it("sanitizes accents and punctuation from transfer content", () => {
    expect(sanitizeTransferContent("Thanh toán DH-01")).toBe("THANHTOANDH01");
  });

  it("builds qr.sepay.vn image url with required params", () => {
    const url = buildSepayVietQrUrl({
      accountNumber: "0123 456 789",
      bankCode: "VCB",
      amountVnd: 150000,
      transferContent: "PEABCDEF1234",
      accountHolder: "NGUYEN VAN A",
    });

    expect(url).toContain("https://qr.sepay.vn/img?");
    expect(url).toContain("acc=0123456789");
    expect(url).toContain("bank=VCB");
    expect(url).toContain("amount=150000");
    expect(url).toContain("des=PEABCDEF1234");
    expect(url).toContain("holder=NGUYENVANA");
  });

  it("rejects empty bank code when building VietQR url", () => {
    expect(() =>
      buildSepayVietQrUrl({
        accountNumber: "0123456789",
        bankCode: "   ",
        amountVnd: 1000,
        transferContent: "PEABCDEF1234",
      }),
    ).toThrow(/Thiếu mã ngân hàng/);
  });
});
