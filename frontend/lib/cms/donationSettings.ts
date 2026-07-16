import { cmsFetchJson } from "@/lib/cms/client";
import { getSiteSettings } from "@/lib/cms/publicContent";
import {
  fallbackDonationPaymentSettings,
  mapDonationPaymentSettingsAttrs,
  type DonationPaymentSettings,
} from "@/lib/cms/donationSettingsShared";

export type {
  DonationPaymentOption,
  DonationPaymentSettings,
} from "@/lib/cms/donationSettingsShared";
export {
  MANUAL_PAYMENT_METHODS,
  fallbackPaymentOptions,
  fallbackDonationPaymentSettings,
  normalizePaymentOptions,
  resolveDonationQrImageUrl,
  mapDonationPaymentSettingsAttrs,
} from "@/lib/cms/donationSettingsShared";

/** Server-only: fetches CMS payment settings for the current tenant. */
export async function getDonationPaymentSettings(): Promise<DonationPaymentSettings> {
  const [rawPayload, siteSettings] = await Promise.all([
    cmsFetchJson(
      "/donation-payment-settings?filters[slug][$eq]=donation-payment-methods&populate=*",
    ),
    getSiteSettings(),
  ]);
  const payload = rawPayload as { data?: Array<{ attributes?: Record<string, unknown> }> } | null;
  const attrs = payload?.data?.[0]?.attributes;
  const organizationName = siteSettings.siteName || fallbackDonationPaymentSettings.accountName;
  return mapDonationPaymentSettingsAttrs(attrs, organizationName);
}
