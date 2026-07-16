export type DonationPaymentMethod =
  | "upi"
  | "qr_code"
  | "gpay"
  | "cash"
  | "cheque"
  | "debit_card"
  | "credit_card"
  | "international_card"
  | "stripe"
  | "netbanking"
  | "online_banking"
  | "other";
export type DonationPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type DonationPurpose =
  | "general"
  | "education"
  | "healthcare"
  | "livelihood"
  | "relief"
  | "environment";

export type Donation = {
  id: string;
  organization_id: string;
  donor_name: string;
  donor_email: string | null;
  donor_phone: string;
  donor_address: string | null;
  donor_pan: string | null;
  donor_type: string;
  is_anonymous: boolean;
  amount: number;
  currency: string;
  purpose: DonationPurpose;
  payment_method: DonationPaymentMethod;
  payment_status: DonationPaymentStatus;
  transaction_reference: string | null;
  donation_date: string;
  notes: string | null;
  gateway_provider: string | null;
  gateway_session_id: string | null;
  gateway_payment_intent: string | null;
  checkout_url: string | null;
  receipt_number: string;
  receipt_issued: boolean;
  receipt_issued_at: string | null;
  receipt_snapshot: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type DonationStatusEvent = {
  id: string;
  donation_id: string;
  from_status: string | null;
  to_status: string;
  transaction_reference: string | null;
  actor_role: string | null;
  actor_email: string | null;
  note: string | null;
  created_at: string;
};

export type DonationFormValues = {
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_address: string;
  donor_pan: string;
  donor_type: string;
  is_anonymous: boolean;
  amount: string;
  currency: string;
  purpose: DonationPurpose;
  payment_method: DonationPaymentMethod;
  payment_status: DonationPaymentStatus;
  transaction_reference: string;
  donation_date: string;
  notes: string;
};

export type DonationCheckoutSession = {
  donation_id: string;
  provider: string;
  checkout_url: string;
  session_id: string;
  publishable_key: string | null;
};

export type DonationReceipt = {
  receipt_number: string;
  issued_at: string;
  organization: string;
  registration_note: string;
  donation: Donation;
};

export type DonationListResponse = {
  items: Donation[];
  total: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
  total_amount: number;
};
