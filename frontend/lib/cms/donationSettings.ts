import type { DonationPaymentMethod } from "@/types/models/donation";

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

const CMS_BASE_URL =
  process.env.CMS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_CMS_URL ??
  "http://localhost:1337";

export const fallbackPaymentOptions: DonationPaymentOption[] = [
  { value: "upi", label: "UPI", description: "Pay with any UPI app.", enabled: true, requiresReference: true },
  { value: "qr_code", label: "QR Code", description: "Scan the Raushni QR code and submit the UPI reference.", enabled: true, requiresReference: true },
  { value: "gpay", label: "GPay", description: "Pay via Google Pay UPI.", enabled: true, requiresReference: true },
  { value: "cash", label: "Cash", description: "Record cash received by authorized staff.", enabled: true, requiresReference: false },
  { value: "cheque", label: "Cheque", description: "Record cheque number and bank details.", enabled: true, requiresReference: true },
  { value: "debit_card", label: "Debit Card", description: "Debit card payment via approved payment terminal or gateway.", enabled: true, requiresReference: true },
  { value: "credit_card", label: "Credit Card", description: "Credit card payment via approved payment terminal or gateway.", enabled: true, requiresReference: true },
  { value: "international_card", label: "International Card", description: "International card payment through Stripe Checkout.", enabled: true, requiresReference: false },
  { value: "stripe", label: "Stripe", description: "Secure Stripe Checkout for international cards.", enabled: true, requiresReference: false },
  { value: "netbanking", label: "Netbanking", description: "Bank netbanking transfer reference.", enabled: true, requiresReference: true },
  { value: "online_banking", label: "Online banking", description: "Online banking or NEFT/IMPS transfer reference.", enabled: true, requiresReference: true },
  { value: "other", label: "Other", description: "Any approved custom payment mode.", enabled: true, requiresReference: false },
];

export const fallbackDonationPaymentSettings: DonationPaymentSettings = {
  slug: "donation-payment-methods",
  title: "Donation Payment Methods",
  intro: "Choose a payment method and share the transaction reference for verification and receipt generation.",
  upiId: "raushni.eswt@upi",
  qrImageUrl: "/cms/donations/raushni-upi-qr.jpeg",
  accountName: "Raushni Educational & Social Welfare Trust",
  paymentOptions: fallbackPaymentOptions,
  instructions: [
    "Scan the QR code for UPI, GPay, or QR Code payments.",
    "Enter the transaction reference so the finance team can verify payment.",
    "For international card payments, continue to Stripe Checkout after submitting the donation form.",
    "Receipts are issued after payment status is marked paid.",
  ],
};

async function fetchCmsJson(path: string) {
  try {
    const response = await fetch(`${CMS_BASE_URL}/api${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getDonationPaymentSettings(): Promise<DonationPaymentSettings> {
  const payload = await fetchCmsJson("/donation-payment-settings?filters[slug][$eq]=donation-payment-methods&populate=*");
  const attrs = payload?.data?.[0]?.attributes;
  if (!attrs) return fallbackDonationPaymentSettings;
  return {
    ...fallbackDonationPaymentSettings,
    slug: attrs.slug ?? fallbackDonationPaymentSettings.slug,
    title: attrs.title ?? fallbackDonationPaymentSettings.title,
    intro: attrs.intro ?? fallbackDonationPaymentSettings.intro,
    upiId: attrs.upiId ?? fallbackDonationPaymentSettings.upiId,
    qrImageUrl: attrs.qrImageUrl ?? fallbackDonationPaymentSettings.qrImageUrl,
    accountName: attrs.accountName ?? fallbackDonationPaymentSettings.accountName,
    paymentOptions: Array.isArray(attrs.paymentOptions) ? attrs.paymentOptions : fallbackDonationPaymentSettings.paymentOptions,
    instructions: Array.isArray(attrs.instructions) ? attrs.instructions : fallbackDonationPaymentSettings.instructions,
  };
}
