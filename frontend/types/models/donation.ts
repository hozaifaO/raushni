export type DonationPaymentMethod = "cash" | "upi" | "bank_transfer" | "card" | "cheque" | "online";
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
  donor_name: string;
  donor_email: string | null;
  donor_phone: string;
  donor_address: string | null;
  donor_pan: string | null;
  donor_type: string;
  amount: number;
  currency: string;
  purpose: DonationPurpose;
  payment_method: DonationPaymentMethod;
  payment_status: DonationPaymentStatus;
  transaction_reference: string | null;
  donation_date: string;
  notes: string | null;
  receipt_number: string;
  receipt_issued: boolean;
  created_at: string;
  updated_at: string;
};

export type DonationFormValues = {
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_address: string;
  donor_pan: string;
  donor_type: string;
  amount: string;
  currency: string;
  purpose: DonationPurpose;
  payment_method: DonationPaymentMethod;
  payment_status: DonationPaymentStatus;
  transaction_reference: string;
  donation_date: string;
  notes: string;
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
