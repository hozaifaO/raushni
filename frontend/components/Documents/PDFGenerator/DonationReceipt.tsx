type DonationReceiptProps = {
  receiptNumber?: string;
  issuedAt?: string;
  donorName?: string;
  donorPhone?: string;
  donorEmail?: string;
  donorAddress?: string;
  donorPan?: string;
  amount?: string;
  purpose?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  transactionReference?: string;
};

const stampLogoPath = "/assets/brand/raushni-stamp-logo.png";

export default function DonationReceipt({
  receiptNumber = "RSH-DON-YYYY-0000",
  issuedAt = new Date().toLocaleDateString("en-IN"),
  donorName = "Donor Name",
  donorPhone = "Phone number",
  donorEmail = "Email not provided",
  donorAddress = "Address not provided",
  donorPan = "Not provided",
  amount = "INR 0",
  purpose = "General welfare",
  paymentMethod = "UPI",
  paymentStatus = "Paid",
  transactionReference = "Not provided",
}: DonationReceiptProps) {
  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-gray-950">
      <header className="flex items-start justify-between gap-6 border-b border-gray-300 pb-6">
        <div className="flex gap-4">
          <img
            src={stampLogoPath}
            alt="Raushni Educational and Social Welfare Trust stamp logo"
            className="h-28 w-28 rounded-full border border-gray-200 bg-gray-50 object-contain p-1"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Official Donation Receipt
            </p>
            <h1 className="mt-2 text-2xl font-bold">Raushni Educational & Social Welfare Trust</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
              Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <p className="font-semibold text-gray-500">Receipt no.</p>
          <p className="mt-1 font-bold text-gray-950">{receiptNumber}</p>
          <p className="mt-3 font-semibold text-gray-500">Issued on</p>
          <p className="mt-1 text-gray-800">{issuedAt}</p>
        </div>
      </header>

      <section className="grid gap-4 py-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Received from</p>
          <p className="mt-2 text-lg font-bold">{donorName}</p>
          <p className="mt-1 text-sm text-gray-600">{donorPhone}</p>
          <p className="text-sm text-gray-600">{donorEmail}</p>
          <p className="mt-2 text-sm text-gray-600">{donorAddress}</p>
          <p className="mt-2 text-sm text-gray-600">PAN: {donorPan}</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase text-gray-500">Donation details</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">{amount}</p>
          <dl className="mt-4 grid gap-2 text-sm text-gray-700">
            <div className="flex justify-between gap-3">
              <dt>Purpose</dt>
              <dd className="font-semibold">{purpose}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Payment</dt>
              <dd className="font-semibold">{paymentMethod}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Status</dt>
              <dd className="font-semibold">{paymentStatus}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Reference</dt>
              <dd className="font-semibold">{transactionReference}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        <img src={stampLogoPath} alt="" className="h-16 w-16 rounded-full object-contain opacity-70" />
        <p>
          We gratefully acknowledge this contribution toward community education, welfare, and social
          development programs. This receipt is computer generated and valid without a physical
          signature.
        </p>
      </section>

      <footer className="mt-8 flex items-end justify-between gap-6 text-sm text-gray-600">
        <p>Thank you for supporting Raushni.</p>
        <div className="min-w-44 border-t border-gray-400 pt-2 text-center font-semibold text-gray-800">
          Authorized signatory
        </div>
      </footer>
    </article>
  );
}
