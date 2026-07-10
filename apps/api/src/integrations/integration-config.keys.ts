export const ZALO_MINI_APP_CONFIG_KEY = "zalo_mini_app_config";
export const PAYMENT_MERCHANT_CONFIG_PREFIX = "payment_merchant_";

export function paymentMerchantConfigKey(provider: "payos" | "sepay"): string {
  return `${PAYMENT_MERCHANT_CONFIG_PREFIX}${provider}`;
}
