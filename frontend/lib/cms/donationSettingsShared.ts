import type { DonationPaymentMethod } from "@/types/models/donation";
import { resolveMediaUrl } from "@/lib/cms/publicContentShared";

export type DonationPaymentOption = {
  value: DonationPaymentMethod;
  label: string;
  description?: string;
  enabled?: boolean;
  requiresReference?: boolean;
};

export type DonationPaymentSettings = {
  slug: string;
  title: string;
  intro: string;
  upiId: string;
  qrImageUrl: string;
  accountName: string;
  paymentOptions: DonationPaymentOption[];
  instructions: string[];
};

/** Manual payment methods only — public donate no longer offers card/Stripe/netbanking. */
export const MANUAL_PAYMENT_METHODS = new Set<DonationPaymentMethod>([
  "upi",
  "qr_code",
  "gpay",
  "cash",
  "cheque",
]);

export const fallbackPaymentOptions: DonationPaymentOption[] = [
  { value: "upi", label: "UPI", description: "Pay with any UPI app.", enabled: true, requiresReference: true },
  { value: "qr_code", label: "QR Code", description: "Scan the donation QR code and submit the UPI reference.", enabled: true, requiresReference: true },
  { value: "gpay", label: "GPay", description: "Pay via Google Pay UPI.", enabled: true, requiresReference: true },
  { value: "cash", label: "Cash", description: "Record cash received by authorized staff.", enabled: true, requiresReference: false },
  { value: "cheque", label: "Cheque", description: "Record cheque number and bank details.", enabled: true, requiresReference: true },
];

export const fallbackDonationPaymentSettings: DonationPaymentSettings = {
  slug: "donation-payment-methods",
  title: "Donation Payment Methods",
  intro: "Choose a payment method and share the transaction reference for verification and receipt generation.",
  upiId: "raushni.eswt@upi",
  // Prefer Strapi media `qrImage`; empty until NGO uploads QR in CMS.
  qrImageUrl: "",
  accountName: "Raushni Educational & Social Welfare Trust",
  paymentOptions: fallbackPaymentOptions,
  instructions: [
    "Scan the QR code for UPI, GPay, or QR Code payments (upload the QR image on Donation Payment Setting in CMS).",
    "Enter the UTR / transaction reference so the finance team can verify payment.",
    "Cash donations do not require a UTR; cheque requires the cheque number.",
    "Receipts are issued after payment status is marked paid.",
  ],
};

const LEGACY_FAKE_QR_PATH = "/cms/donations/raushni-upi-qr.jpeg";

export function normalizePaymentOptions(options: unknown): DonationPaymentOption[] {
  if (!Array.isArray(options)) {
    return fallbackPaymentOptions;
  }
  const filtered = (options as DonationPaymentOption[]).filter(
    (option) => option?.value && MANUAL_PAYMENT_METHODS.has(option.value) && option.enabled !== false,
  );
  return filtered.length > 0 ? filtered : fallbackPaymentOptions;
}

export function resolveDonationQrImageUrl(attrs: Record<string, unknown> | undefined | null): string {
  if (!attrs) {
    return fallbackDonationPaymentSettings.qrImageUrl;
  }
  const fromMedia = resolveMediaUrl(attrs.qrImage, "");
  if (fromMedia) {
    return fromMedia;
  }
  const raw = attrs.qrImageUrl;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed && trimmed !== LEGACY_FAKE_QR_PATH) {
      if (trimmed.startsWith("http") || trimmed.startsWith("/assets") || trimmed.startsWith("/uploads")) {
        return trimmed;
      }
      if (trimmed.startsWith("/")) {
        return trimmed;
      }
    }
  }
  return fallbackDonationPaymentSettings.qrImageUrl;
}

export function mapDonationPaymentSettingsAttrs(
  attrs: Record<string, unknown> | undefined | null,
  organizationName?: string,
): DonationPaymentSettings {
  const accountName =
    organizationName ||
    (typeof attrs?.accountName === "string" ? attrs.accountName : undefined) ||
    fallbackDonationPaymentSettings.accountName;
  if (!attrs) {
    return { ...fallbackDonationPaymentSettings, accountName };
  }
  return {
    ...fallbackDonationPaymentSettings,
    slug: String(attrs.slug ?? fallbackDonationPaymentSettings.slug),
    title: String(attrs.title ?? fallbackDonationPaymentSettings.title),
    intro: String(attrs.intro ?? fallbackDonationPaymentSettings.intro),
    upiId: String(attrs.upiId ?? fallbackDonationPaymentSettings.upiId),
    qrImageUrl: resolveDonationQrImageUrl(attrs),
    accountName: String(attrs.accountName ?? accountName),
    paymentOptions: normalizePaymentOptions(attrs.paymentOptions),
    instructions: Array.isArray(attrs.instructions)
      ? (attrs.instructions as string[])
      : fallbackDonationPaymentSettings.instructions,
  };
}
