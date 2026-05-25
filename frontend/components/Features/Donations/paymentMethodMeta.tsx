import {
  Banknote,
  CircleEllipsis,
  CreditCard,
  Globe2,
  Landmark,
  QrCode,
  Smartphone,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { DonationPaymentMethod } from "@/types/models/donation";

const paymentMethodIcons: Record<DonationPaymentMethod, LucideIcon> = {
  upi: Smartphone,
  qr_code: QrCode,
  gpay: Smartphone,
  cash: Banknote,
  cheque: WalletCards,
  debit_card: CreditCard,
  credit_card: CreditCard,
  international_card: Globe2,
  stripe: CreditCard,
  netbanking: Landmark,
  online_banking: Landmark,
  other: CircleEllipsis,
};

const paymentMethodLabels: Record<DonationPaymentMethod, string> = {
  upi: "UPI",
  qr_code: "QR Code",
  gpay: "GPay",
  cash: "Cash",
  cheque: "Cheque",
  debit_card: "Debit Card",
  credit_card: "Credit Card",
  international_card: "International Card",
  stripe: "Stripe",
  netbanking: "Netbanking",
  online_banking: "Online banking",
  other: "Other",
};

export function paymentMethodLabel(value: DonationPaymentMethod) {
  return paymentMethodLabels[value] ?? value.split("_").join(" ");
}

export function PaymentMethodIcon({
  method,
  className = "text-orange-600",
  size = 18,
}: {
  method: DonationPaymentMethod;
  className?: string;
  size?: number;
}) {
  const Icon = paymentMethodIcons[method] ?? CircleEllipsis;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
