export type DocumentTemplateCategory =
  | "member_id"
  | "donation_receipt"
  | "invoice"
  | "certificate"
  | "appointment_letter"
  | "qr_code";

export type CmsDocumentTemplate = {
  key: string;
  name: string;
  category: DocumentTemplateCategory;
  description: string;
  title: string;
  subtitle: string;
  body: string;
  footer: string;
  legalNote: string;
  thankYouNote: string;
  signatoryLabel: string;
  logoUrl: string;
  stampUrl: string;
  accentColor: string;
  htmlTemplate: string;
  placeholders: string[];
  settings: Record<string, unknown>;
};

export const fallbackDocumentTemplates: Record<string, CmsDocumentTemplate> = {
  "member-id-card": {
    key: "member-id-card",
    name: "Member ID Card",
    category: "member_id",
    description:
      "Printable member identification card with QR verification block and contact-safe member details.",
    title: "Member ID Card",
    subtitle: "Authorized community representative",
    body: "This card identifies an active member or volunteer associated with Raushni Educational & Social Welfare Trust.",
    footer: "If found, please contact the trust office using the public contact details.",
    legalNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
    thankYouNote: "",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#ea580c",
    htmlTemplate: "",
    placeholders: ["member_name", "member_role", "member_id", "joined_on", "phone", "qr_code"],
    settings: { organization: "Raushni Educational & Social Welfare Trust", includeQr: true },
  },
  "donation-receipt": {
    key: "donation-receipt",
    name: "Donation Receipt",
    category: "donation_receipt",
    description:
      "Official receipt wording for verified donations, print/PDF generation, and donor acknowledgement.",
    title: "Official Receipt",
    subtitle: "Donation acknowledgement",
    body: "We gratefully acknowledge this contribution toward community education, welfare, and social development programs. This receipt is computer generated and valid without a physical signature.",
    footer:
      "Keep this receipt for your records. Payment status and donor details are maintained in the dashboard.",
    legalNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
    thankYouNote: "Thank you for supporting Raushni.",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#ea580c",
    htmlTemplate: "",
    placeholders: [
      "receipt_number",
      "issued_at",
      "donor_name",
      "amount",
      "purpose",
      "payment_method",
      "transaction_reference",
    ],
    settings: { organization: "Raushni Educational & Social Welfare Trust", receiptPrefix: "RSH-DON" },
  },
  invoice: {
    key: "invoice",
    name: "Invoice",
    category: "invoice",
    description:
      "Professional invoice template for services, program fees, reimbursements, and institutional billing.",
    title: "Invoice",
    subtitle: "Official billing document",
    body: "This invoice is issued for approved services, program support, or operational billing recorded by Raushni Educational & Social Welfare Trust.",
    footer: "Payment is subject to finance verification and dashboard reconciliation.",
    legalNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
    thankYouNote: "Thank you for your support.",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#0f766e",
    htmlTemplate: "",
    placeholders: [
      "invoice_number",
      "issued_at",
      "bill_to",
      "line_items",
      "subtotal",
      "tax",
      "total",
      "payment_terms",
      "qr_code",
    ],
    settings: {
      organization: "Raushni Educational & Social Welfare Trust",
      invoicePrefix: "RSH-INV",
      includeQr: true,
    },
  },
  "internship-completion-certificate": {
    key: "internship-completion-certificate",
    name: "Internship Completion Certificate",
    category: "certificate",
    description:
      "QR-verifiable internship completion certificate template used by the dashboard issue certificate workflow.",
    title: "Certificate of Completion",
    subtitle: "This certificate is proudly awarded to",
    body: "for successfully completing <strong>${program_title}</strong> in the <strong>${track}</strong> track with professional conduct, practical contribution, and learning commitment.",
    footer: "This certificate can be authenticated using the QR code or verification URL.",
    legalNote: "Issued by Raushni Educational & Social Welfare Trust for verified internship completion.",
    thankYouNote: "",
    signatoryLabel: "Authorized Signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#b45309",
    htmlTemplate: "",
    placeholders: [
      "participant_name",
      "program_title",
      "track",
      "certificate_number",
      "issued_on",
      "verification_url",
      "qr_code_svg",
    ],
    settings: { certificatePrefix: "RSH-CERT", includeQr: true },
  },
  "achievement-certificate": {
    key: "achievement-certificate",
    name: "Achievement Certificate",
    category: "certificate",
    description: "General certificate template for volunteers, donors, members, and program participants.",
    title: "Certificate of Appreciation",
    subtitle: "Presented with gratitude to",
    body: "for meaningful contribution, service, and commitment to community welfare programs.",
    footer: "Issued for verified contribution and approved by the authorized team.",
    legalNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
    thankYouNote: "",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#047857",
    htmlTemplate: "",
    placeholders: ["recipient_name", "achievement_title", "issued_on", "certificate_number", "qr_code"],
    settings: { certificatePrefix: "RSH-ACH", includeQr: true },
  },
  "appointment-letter": {
    key: "appointment-letter",
    name: "Appointment Letter",
    category: "appointment_letter",
    description: "Appointment and engagement letter wording for staff, volunteers, interns, and coordinators.",
    title: "Appointment Letter",
    subtitle: "Formal role confirmation",
    body: "We are pleased to appoint ${recipient_name} as ${role_title}. The appointment is subject to trust policies, role responsibilities, code of conduct, and periodic review.",
    footer: "This letter is generated from the dashboard and should be verified against approved records.",
    legalNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
    thankYouNote: "",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#1d4ed8",
    htmlTemplate: "",
    placeholders: ["recipient_name", "role_title", "start_date", "department", "letter_number", "qr_code"],
    settings: { letterPrefix: "RSH-APT", includeQr: true },
  },
  "qr-verification": {
    key: "qr-verification",
    name: "QR Verification Block",
    category: "qr_code",
    description: "Reusable QR verification instructions for certificates, ID cards, receipts, and letters.",
    title: "Scan to verify",
    subtitle: "Public authentication",
    body: "Scan the QR code to open the public verification page and confirm the document number, recipient, status, and issue date.",
    footer: "Do not accept altered documents without QR or verification URL confirmation.",
    legalNote: "Verification records are managed by Raushni dashboard and CMS configuration.",
    thankYouNote: "",
    signatoryLabel: "",
    logoUrl: "",
    stampUrl: "",
    accentColor: "#111827",
    htmlTemplate: "",
    placeholders: ["verification_url", "document_number", "qr_code_svg"],
    settings: {
      supportedDocuments: ["member_id", "donation_receipt", "certificate", "appointment_letter"],
    },
  },
};
