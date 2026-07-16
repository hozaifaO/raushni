import {
  donationFormSchema,
  publicDonationFormSchema,
} from "@/lib/validation/donation";

const baseForm = {
  donor_name: "Aisha Khan",
  donor_email: "aisha@example.org",
  donor_phone: "+91 9876543210",
  donor_address: "Hyderabad",
  donor_pan: "",
  donor_type: "individual" as const,
  is_anonymous: false,
  amount: "5000",
  currency: "INR",
  purpose: "general" as const,
  payment_method: "upi" as const,
  payment_status: "pending" as const,
  transaction_reference: "UTR-123456",
  donation_date: "2026-07-15",
  notes: "",
};

describe("donationFormSchema", () => {
  it("accepts a valid donation form", () => {
    expect(donationFormSchema.parse(baseForm).donor_name).toBe("Aisha Khan");
  });

  it("requires phone unless anonymous", () => {
    expect(() =>
      donationFormSchema.parse({ ...baseForm, donor_phone: "", is_anonymous: false }),
    ).toThrow();
  });

  it("allows missing phone when anonymous", () => {
    const result = donationFormSchema.parse({
      ...baseForm,
      donor_phone: "",
      is_anonymous: true,
    });
    expect(result.is_anonymous).toBe(true);
  });

  it("accepts foundation donor type", () => {
    const result = donationFormSchema.parse({ ...baseForm, donor_type: "foundation" });
    expect(result.donor_type).toBe("foundation");
  });
});

describe("publicDonationFormSchema", () => {
  it("requires UTR for upi", () => {
    expect(() =>
      publicDonationFormSchema.parse({ ...baseForm, transaction_reference: "" }),
    ).toThrow(/UTR|transaction reference/i);
  });

  it("allows cash without UTR", () => {
    const result = publicDonationFormSchema.parse({
      ...baseForm,
      payment_method: "cash",
      transaction_reference: "",
    });
    expect(result.payment_method).toBe("cash");
  });
});
