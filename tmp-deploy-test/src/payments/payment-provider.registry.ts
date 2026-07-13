import { BadRequestException, Injectable } from "@nestjs/common";
import type { PaymentProvider } from "@prisma/client";
import { PayosAdapter, SepayAdapter } from "./adapters/payment-adapters";
import type { PaymentProviderAdapter } from "./payment-provider.port";

@Injectable()
export class PaymentProviderRegistry {
  private readonly adapters: Map<PaymentProvider, PaymentProviderAdapter>;

  constructor(payos: PayosAdapter, sepay: SepayAdapter) {
    this.adapters = new Map<PaymentProvider, PaymentProviderAdapter>([
      ["payos", payos],
      ["sepay", sepay],
    ]);
  }

  get(provider: PaymentProvider): PaymentProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new BadRequestException({
        code: "UNSUPPORTED_PAYMENT_PROVIDER",
        message: "Nhà cung cấp thanh toán không được hỗ trợ.",
      });
    }
    return adapter;
  }

  getDefaultProvider(): PaymentProvider {
    const configured = process.env.DEFAULT_PAYMENT_PROVIDER;
    if (configured === "sepay" || configured === "payos") {
      return configured;
    }
    return "payos";
  }
}
