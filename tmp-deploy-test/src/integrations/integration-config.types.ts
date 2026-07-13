export type ZaloDeploymentStatus = "not_configured" | "configured" | "verified" | "invalid";

export interface ZaloMiniAppConfigStored {
  appId: string;
  appSecret: string;
  callbackUrl?: string;
  deploymentStatus: ZaloDeploymentStatus;
  lastVerifiedAt?: string;
  lastError?: string;
}

export interface PaymentMerchantConfigStored {
  merchantId: string;
  apiKey: string;
  checksumKey?: string;
  webhookSecret?: string;
  testMode: boolean;
}
