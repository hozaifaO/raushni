import { z } from "zod";
import { idString, isoDateString, isoDateTimeString, nullableEmail, nullableString } from "./common";

export const donationPaymentMethodSchema = z.enum([
  "upi",
  "qr_code",
  "gpay",
  "cash",
  "cheque",
  "debit_card",
  "credit_card",
  "international_card",
  "stripe",
  "netbanking",
  "online_banking",
  "other",
]);

/** Public / CMS-seeded manual methods only. */
export const manualDonationPaymentMethodSchema = z.enum([
  "upi",
  "qr_code",
  "gpay",
  "cash",
  "cheque",
]);

export const utrRequiredPaymentMethods = new Set([
  "upi",
  "qr_code",
  "gpay",
  "cheque",
] as const);

export const donationPaymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);

export const donationPurposeSchema = z.enum([
  "general",
  "education",
  "healthcare",
  "livelihood",
  "relief",
  "environment",
]);

export const donorTypeSchema = z.enum([
  "individual",
  "corporate",
  "trust",
  "foundation",
  "other",
]);

export const donationSchema = z.object({
  id: idString,
  organization_id: idString,
  donor_name: z.string().min(1),
  donor_email: nullableEmail,
  donor_phone: z.string(),
  donor_address: nullableString,
  donor_pan: nullableString,
  donor_type: z.string().min(1),
  is_anonymous: z.boolean().default(false),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  purpose: donationPurposeSchema,
  payment_method: donationPaymentMethodSchema,
  payment_status: donationPaymentStatusSchema,
  transaction_reference: nullableString,
  donation_date: isoDateString,
  notes: nullableString,
  gateway_provider: nullableString,
  gateway_session_id: nullableString,
  gateway_payment_intent: nullableString,
  checkout_url: nullableString,
  receipt_number: z.string().min(1),
  receipt_issued: z.boolean(),
  receipt_issued_at: isoDateTimeString.nullable().optional().default(null),
  receipt_snapshot: z.record(z.string(), z.unknown()).nullable().optional().default(null),
  created_at: isoDateTimeString,
  updated_at: isoDateTimeString,
});

export const donationStatusEventSchema = z.object({
  id: idString,
  donation_id: idString,
  from_status: nullableString,
  to_status: z.string().min(1),
  transaction_reference: nullableString,
  actor_role: nullableString,
  actor_email: nullableString,
  note: nullableString,
  created_at: isoDateTimeString,
});

export const donationListResponseSchema = z.object({
  items: z.array(donationSchema),
  total: z.number().int().nonnegative(),
  paid: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  refunded: z.number().int().nonnegative(),
  total_amount: z.number().nonnegative(),
});

export const donationCheckoutSessionSchema = z.object({
  donation_id: idString,
  provider: z.string().min(1),
  checkout_url: z.string().min(1),
  session_id: z.string().min(1),
  publishable_key: nullableString,
});

export const donationReceiptSchema = z.object({
  receipt_number: z.string().min(1),
  issued_at: isoDateTimeString,
  organization: z.string().min(1),
  registration_note: z.string(),
  donation: donationSchema,
});

export const donationFormSchema = z
  .object({
    donor_name: z.string().trim().min(2).max(140),
    donor_email: z.string().trim().email().or(z.literal("")),
    donor_phone: z.string().trim().max(20),
    donor_address: z.string().trim().max(260),
    donor_pan: z.string().trim().max(20),
    donor_type: donorTypeSchema.or(z.string().trim().max(40)),
    is_anonymous: z.boolean().default(false),
    amount: z.string().trim().min(1),
    currency: z.string().trim().min(3).max(3),
    purpose: donationPurposeSchema,
    payment_method: donationPaymentMethodSchema,
    payment_status: donationPaymentStatusSchema,
    transaction_reference: z.string().trim().max(120),
    donation_date: isoDateString,
    notes: z.string().trim().max(500),
  })
  .superRefine((values, ctx) => {
    if (!values.is_anonymous && values.donor_phone.length < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donor_phone"],
        message: "Phone is required unless the donation is anonymous",
      });
    }
    if (values.is_anonymous && values.donor_phone && values.donor_phone.length < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["donor_phone"],
        message: "Phone must be at least 7 characters when provided",
      });
    }
  });

/** Public donate form: UTR required for UPI / QR / GPay / cheque. */
export const publicDonationFormSchema = donationFormSchema.superRefine((values, ctx) => {
  const method = values.payment_method;
  if (
    (method === "upi" || method === "qr_code" || method === "gpay" || method === "cheque") &&
    !values.transaction_reference.trim()
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["transaction_reference"],
      message: "UTR / transaction reference is required for this payment method",
    });
  }
});

export type DonationParsed = z.infer<typeof donationSchema>;
export type DonationListResponseParsed = z.infer<typeof donationListResponseSchema>;
