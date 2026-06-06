"use strict";

const strapiFactory = require("@strapi/strapi");

const uids = {
  landing: "api::landing-page.landing-page",
  siteSetting: "api::site-setting.site-setting",
  publicPage: "api::public-page.public-page",
  internshipAnnouncement: "api::internship-announcement.internship-announcement",
  donationPaymentSetting: "api::donation-payment-setting.donation-payment-setting",
  designation: "api::designation.designation",
  documentTemplate: "api::document-template.document-template",
  projectContent: "api::project-content.project-content",
};

const now = () => new Date();

const siteSettingContent = {
  siteName: "Raushni Educational & Social Welfare Trust",
  brandShortName: "Raushni",
  brandTagline: "Educational & Social Welfare Trust",
  description:
    "Empowering underserved communities through education, healthcare access, livelihood development, and social welfare programs.",
  contactAddress: "Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113",
  contactPhone: "+91 997 3955 7600",
  contactEmail: "info@raushni.com",
  navItems: [
    { label: "About", href: "/about" },
    { label: "Activities", href: "/activities" },
    { label: "Events", href: "/events" },
    { label: "News", href: "/news" },
    { label: "Internships", href: "/internship-registration" },
    { label: "Gallery", href: "/gallery" },
    { label: "Careers", href: "/careers" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "Contact", href: "/contact" },
  ],
  quickLinks: [
    { label: "About Us", href: "/about" },
    { label: "Activities", href: "/activities" },
    { label: "News", href: "/news" },
    { label: "Volunteer", href: "/volunteer" },
    { label: "Contact", href: "/contact" },
  ],
  supportLinks: [
    { label: "Donate", href: "/donate" },
    { label: "Gallery", href: "/gallery" },
    { label: "Events", href: "/events" },
    { label: "Careers", href: "/careers" },
    { label: "Admin Login", href: "/login" },
  ],
  socialLinks: [
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61563690991747" },
    { label: "Twitter", href: "https://X.com/" },
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/company/" },
    { label: "YouTube", href: "https://youtube.com/" },
  ],
  newsletterTitle: "Stay connected with Raushni",
  newsletterText: "Get updates about programs, events, relief work, and volunteer opportunities.",
  footerNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
  publishedAt: now(),
};

const focusAreas = [
  { title: "Education", text: "Bridge classes, digital literacy, mentoring, school readiness, and learning material for children and adults." },
  { title: "Healthcare", text: "Community health camps, basic screening, nutrition awareness, and referral support for underserved families." },
  { title: "Livelihood", text: "Skill development, self-help groups, financial awareness, and pathways toward dignified income." },
  { title: "Relief", text: "Food, medicine, essentials, and field coordination during emergencies and seasonal hardship." },
];

const publicPages = [
  {
    slug: "about",
    title: "About",
    heroEyebrow: "About Raushni",
    heroTitle: "A public trust working for education, welfare, dignity, and opportunity.",
    heroText: "Raushni Educational & Social Welfare Trust supports underserved communities through learning programs, health access, livelihood development, relief, and community mobilization.",
    heroImageUrl: "/assets/brand/raushni-banner.png",
    sections: [
      { eyebrow: "Who we are", title: "Community work with structure, compassion, and accountability.", text: "We believe social welfare is strongest when local families, volunteers, donors, and field teams move together.", layout: "cards", items: focusAreas },
      { eyebrow: "Our promise", title: "Every program should be useful, respectful, and measurable.", layout: "checks", items: [
        "Equal access to education, healthcare, and livelihood opportunities",
        "Transparent donor communication and accountable field documentation",
        "Community-led planning rooted in local needs and dignity",
        "Long-term support for children, women, youth, and vulnerable families",
      ] },
    ],
    publishedAt: now(),
  },
  {
    slug: "activities",
    title: "Activities",
    heroEyebrow: "Activities",
    heroTitle: "Field programs designed around learning, wellbeing, livelihood, and relief.",
    heroText: "Raushni activities are practical, recurring, and community-led so families receive support they can actually use.",
    heroImageUrl: "/assets/images/og-image.jpg",
    actionLabel: "Volunteer with us",
    actionHref: "/volunteer",
    sections: [{ eyebrow: "Current work", title: "Programs active across education and welfare priorities.", layout: "cards", items: [
      { title: "Learning Support Circles", meta: "Education · Every week", text: "Structured after-school support with reading practice, foundational numeracy, digital basics, and mentoring.", location: "Community learning centers" },
      { title: "Health & Nutrition Camps", meta: "Healthcare · Monthly", text: "Basic checkups, nutrition counselling, hygiene awareness, and referrals through local health partners.", location: "Village clusters and urban settlements" },
      { title: "Women’s Livelihood Groups", meta: "Livelihood · Ongoing", text: "Savings discipline, small-enterprise readiness, product skills, and confidence-building for women.", location: "Self-help group meetings" },
      { title: "Environment Action Days", meta: "Environment · Seasonal", text: "Tree plantation, cleanliness drives, waste awareness, and student-led local stewardship.", location: "Schools and public spaces" },
    ] }],
    publishedAt: now(),
  },
  {
    slug: "events",
    title: "Events",
    heroEyebrow: "Events",
    heroTitle: "Join upcoming camps, orientations, distributions, and community programs.",
    heroText: "Events bring volunteers, families, donors, and partners together for focused action in the field.",
    heroImageUrl: "/assets/brand/raushni-banner.png",
    actionLabel: "Register as volunteer",
    actionHref: "/volunteer",
    sections: [{ eyebrow: "Upcoming", title: "Planned public programs", text: "Dates may be updated based on field readiness.", layout: "events", items: [
      { title: "Education Kit Distribution", date: "28 June 2026", time: "10:00 AM", location: "Muzaffarpur community center", text: "Distribution of notebooks, school bags, stationery, and reading material for enrolled learners." },
      { title: "Community Health Camp", date: "12 July 2026", time: "9:30 AM", location: "Marwan Khurd outreach site", text: "Screening, nutrition guidance, women’s health awareness, and referral support." },
      { title: "Volunteer Orientation", date: "26 July 2026", time: "4:00 PM", location: "Hybrid", text: "Onboarding session for teaching, field support, documentation, fundraising, and event volunteers." },
    ] }],
    publishedAt: now(),
  },
  {
    slug: "news",
    title: "News",
    heroEyebrow: "News",
    heroTitle: "Updates from Raushni programs, field teams, and community initiatives.",
    heroText: "Follow program progress, volunteer coordination, donor-supported work, and important public announcements.",
    heroImageUrl: "/assets/images/og-image.jpg",
    sections: [{ eyebrow: "Latest", title: "Recent updates", layout: "news", items: [
      { title: "Raushni expands weekly learning support for first-generation learners", date: "15 May 2026", tag: "Education", summary: "The trust is strengthening bridge learning sessions with reading practice, mentor check-ins, and basic digital exposure." },
      { title: "Women’s self-help group sessions focus on savings and micro-enterprise readiness", date: "2 May 2026", tag: "Livelihood", summary: "Field teams are helping participants build household budgeting confidence and explore income-supporting skills." },
      { title: "Volunteer network prepares for monsoon relief coordination", date: "20 April 2026", tag: "Relief", summary: "Raushni is mapping local support points, essential supply needs, and communication channels for faster response." },
    ] }],
    publishedAt: now(),
  },
  {
    slug: "gallery",
    title: "Gallery",
    heroEyebrow: "Gallery",
    heroTitle: "Visual records from programs, campaigns, and trust communications.",
    heroText: "A public gallery helps supporters understand the identity, field focus, and community-facing work of Raushni.",
    heroImageUrl: "/assets/brand/raushni-banner.png",
    sections: [{ eyebrow: "Media", title: "Program and brand gallery", layout: "gallery", items: [
      { title: "Education outreach", image: "/assets/brand/raushni-banner.png", caption: "Learning programs for children and adults." },
      { title: "Trust identity", image: "/assets/brand/raushni-logo.png", caption: "Community work guided by accountability and care." },
      { title: "Official stamp", image: "/assets/brand/raushni-stamp-logo.png", caption: "Raushni Educational & Social Welfare Trust." },
      { title: "Public awareness", image: "/assets/images/og-image.jpg", caption: "Campaigns for dignity, education, and welfare." },
    ] }],
    publishedAt: now(),
  },
  {
    slug: "careers",
    title: "Careers",
    heroEyebrow: "Careers",
    heroTitle: "Work with a team focused on practical, accountable community impact.",
    heroText: "Raushni welcomes people who are comfortable with field realities, documentation, coordination, and respectful communication.",
    heroImageUrl: "/assets/brand/raushni-logo.png",
    actionLabel: "Contact hiring team",
    actionHref: "/contact",
    sections: [{ eyebrow: "Open roles", title: "Current opportunities", layout: "cards", items: [
      { title: "Program Coordinator", meta: "Full time", text: "Coordinate education, health, and livelihood activities with volunteers, partners, and local stakeholders.", location: "Muzaffarpur / field-based" },
      { title: "Community Mobilizer", meta: "Part time", text: "Support beneficiary outreach, event mobilization, documentation, and follow-up with families.", location: "Field-based" },
      { title: "Content & Documentation Associate", meta: "Volunteer or contract", text: "Prepare program stories, reports, social updates, photos, and donor communication assets.", location: "Hybrid" },
    ] }],
    publishedAt: now(),
  },
  {
    slug: "volunteer",
    title: "Volunteer",
    heroEyebrow: "Volunteer",
    heroTitle: "Bring your time, skill, network, or care to community programs.",
    heroText: "Volunteers support teaching, camps, field coordination, content, fundraising, relief, and community follow-up.",
    heroImageUrl: "/assets/brand/raushni-banner.png",
    actionLabel: "Contact volunteer desk",
    actionHref: "/contact",
    sections: [{ eyebrow: "Ways to help", title: "Choose a role that matches your availability and strengths.", layout: "checks", items: [
      "Teach foundational literacy and numeracy",
      "Mentor adolescents and first-generation learners",
      "Support health camps and registration desks",
      "Document stories, photos, and field updates",
      "Coordinate fundraising and donation drives",
      "Assist relief distribution and follow-up calls",
    ] }],
    publishedAt: now(),
  },
  {
    slug: "contact",
    title: "Contact",
    heroEyebrow: "Contact",
    heroTitle: "Reach the Raushni team for programs, partnerships, volunteering, and donations.",
    heroText: "Share your enquiry and the team will route it to the right program or administrative contact.",
    heroImageUrl: "/assets/brand/raushni-stamp-logo.png",
    sections: [{
      eyebrow: "Connect",
      title: "Contact details and enquiry form",
      text: "For urgent field coordination, please call. For documents, partnership requests, volunteer onboarding, donation support, or careers, email or use the form.",
      layout: "contact",
      items: [
        { title: "Program coordination", text: "Education, healthcare, livelihood, relief, and field activity enquiries." },
        { title: "Partnerships and donors", text: "Institutional collaboration, donor documentation, receipts, and impact reporting." },
      ],
    }],
    publishedAt: now(),
  },
  {
    slug: "donate",
    title: "Donate",
    heroEyebrow: "Donation",
    heroTitle: "Support education, welfare, relief, and livelihood programs with transparent records.",
    heroText: "Your contribution helps Raushni keep reliable community programs available for families who need practical support.",
    heroImageUrl: "/assets/brand/raushni-banner.png",
    sections: [{
      eyebrow: "Giving with accountability",
      title: "Make a donation",
      text: "Donation details are recorded for finance review, payment verification, receipt generation, and donor acknowledgement.",
      layout: "cards",
      items: [
        { title: "Receipt process", text: "After payment verification, the team issues an official receipt with the donation reference number." },
        { title: "Payment status", text: "Public submissions are saved as pending so the finance team can verify the transfer before final acknowledgement." },
        { title: "Donor records", text: "Donor contact and purpose details help the team maintain accurate accounts and responsible communication." },
      ],
    }],
    publishedAt: now(),
  },
  {
    slug: "internship-registration",
    title: "Internship Registration",
    heroEyebrow: "Internship",
    heroTitle: "Apply for Raushni Internship 2026 and build real community technology experience.",
    heroText: "The internship module manages announcements, registrations, review status, completion certificates, QR verification, and public authentication.",
    heroImageUrl: "/assets/brand/internship-2026.jpg",
    sections: [{
      eyebrow: "Registration",
      title: "Complete your application carefully",
      text: "The team reviews every application from the dashboard and updates the registration status as the internship workflow progresses.",
      layout: "checks",
      items: [
        "Use your active email and phone number for coordination",
        "Choose the track that best matches your current skill level",
        "Add GitHub or portfolio links when available",
        "Completion certificates include QR code verification after approval",
      ],
    }],
    publishedAt: now(),
  },
];

const landingPageContent = {
  title: siteSettingContent.siteName,
  heroEyebrow: "Community-led education, healthcare, and dignity",
  heroSubtitle:
    "A focused social welfare trust helping underserved families access learning, basic healthcare, livelihood support, and emergency relief with dignity.",
  aboutHeading: "Lighting practical pathways out of poverty and illiteracy.",
  vision:
    "Raushni Educational & Social Welfare Trust envisions a just and enlightened society where every person, regardless of socio-economic background, has equal access to quality education, essential healthcare, and dignified livelihood opportunities. Our work is rooted in listening, local participation, and measurable community progress.",
  missionHeading: "Sustainable change, one family at a time.",
  mission:
    "To empower underserved communities through education support, healthcare access, skill development, women-led livelihoods, environmental care, and responsive relief programs that create long-term confidence and opportunity.",
  focusAreas,
  objectives: [
    "Formal and digital education for children and adults",
    "Healthcare and nutrition access for marginalized families",
    "Vocational training, self-help groups, and sustainable livelihoods",
    "Women and adolescent girls' safety, dignity, and economic independence",
    "Tree plantation, waste management, and environmental care",
    "Digital and financial inclusion for rural communities",
    "Emergency relief during natural disasters",
    "Community mobilization, advocacy, and strategic partnerships",
  ].map((item) => `- ${item}`).join("\n"),
  successHeading: "Progress shaped by community trust.",
  successIntro:
    "Every initiative begins with listening. Programs are designed around local needs, volunteer action, and tangible improvements in dignity for families.",
  successStories: [
    "A classroom closer to home: Children from underserved families receive structured learning support, books, and mentoring that keeps them connected to school.",
    "Women building income: Self-help group training helps women gain confidence, manage savings, and explore small-enterprise opportunities.",
    "Relief with dignity: During emergencies, volunteers coordinate food, medicine, and essentials through trusted local community networks.",
  ].map((item) => `- ${item}`).join("\n"),
  volunteerHeading: "Bring your time, skill, network, or care.",
  volunteerIntro:
    "Volunteers support teaching, health camps, field coordination, content, fundraising, disaster relief, and community mobilization. Every contribution helps a family move with more confidence.",
  volunteerWays: ["Teach or mentor", "Support health camps", "Document stories", "Coordinate relief", "Sponsor learning material"],
  contactHeading: "Let's build a more equitable community.",
  contactAddress: siteSettingContent.contactAddress,
  contactPhone: siteSettingContent.contactPhone,
  contactEmail: siteSettingContent.contactEmail,
  publishedAt: now(),
};

const internshipContent = {
  title: "Internship 2026: AI Enabled Community Technology Program",
  slug: "internship-2026-ai-community-technology",
  summary: "A professional internship for students to gain practical exposure, final-year project support, AI-enabled delivery experience, and career guidance.",
  description: "Raushni Educational & Social Welfare Trust invites students and early-career learners to work on real community technology workflows across web development, content operations, data, AI enablement, documentation, and outreach.",
  startDate: "2026-06-15",
  endDate: "2026-08-15",
  registrationDeadline: "2026-06-14",
  eventDate: "2026-06-15",
  eventTime: "01:00 PM",
  location: "Web/Virtual, India",
  mode: "virtual",
  status: "published",
  posterUrl: "/assets/brand/internship-2026.jpg",
  applyUrl: "/internship-registration",
  githubUrl: "https://github.com/owais4u/raushni",
  contactPhone: "+91 7827860062",
  benefits: ["Real industry exposure", "Final year project work", "Hands-on experience and AI enabled delivery", "Career guidance", "Completion certificate with QR verification"],
  tracks: ["Web Development", "AI Enabled Operations", "Content and Outreach", "Data and Reporting"],
  eligibility: ["Students, freshers, and early-career learners", "Basic computer and internet access", "Commitment to weekly progress and professional communication"],
  publishedAt: now(),
};

const donationPaymentSettingContent = {
  slug: "donation-payment-methods",
  title: "Donation Payment Methods",
  intro: "Choose a payment method and share the transaction reference for finance verification and receipt generation.",
  upiId: "raushni.eswt@upi",
  qrImageUrl: "/cms/donations/raushni-upi-qr.jpeg",
  accountName: siteSettingContent.siteName,
  paymentOptions: [
    { value: "upi", label: "UPI", description: "Pay with any UPI app.", enabled: true, requiresReference: true },
    { value: "qr_code", label: "QR Code", description: "Scan the Raushni QR code and submit the UPI reference.", enabled: true, requiresReference: true },
    { value: "gpay", label: "GPay", description: "Pay via Google Pay UPI.", enabled: true, requiresReference: true },
    { value: "cash", label: "Cash", description: "Record cash received by authorized staff.", enabled: true, requiresReference: false },
    { value: "cheque", label: "Cheque", description: "Record cheque number and bank details.", enabled: true, requiresReference: true },
    { value: "debit_card", label: "Debit Card", description: "Debit card payment via approved payment terminal or gateway.", enabled: true, requiresReference: true },
    { value: "credit_card", label: "Credit Card", description: "Credit card payment via approved payment terminal or gateway.", enabled: true, requiresReference: true },
    { value: "international_card", label: "International Card", description: "International donor card payment through Stripe Checkout.", enabled: true, requiresReference: false, gateway: "stripe" },
    { value: "stripe", label: "Stripe", description: "Secure Stripe Checkout for international cards.", enabled: true, requiresReference: false, gateway: "stripe" },
    { value: "netbanking", label: "Netbanking", description: "Bank netbanking transfer reference.", enabled: true, requiresReference: true },
    { value: "online_banking", label: "Online banking", description: "Online banking or NEFT/IMPS transfer reference.", enabled: true, requiresReference: true },
    { value: "other", label: "Other", description: "Any approved custom payment mode.", enabled: true, requiresReference: false },
  ],
  instructions: [
    "Scan the QR code for UPI, GPay, or QR Code payments.",
    "Enter the transaction reference so the finance team can verify payment.",
    "For international card payments, continue to Stripe Checkout after submitting the donation form.",
    "Receipts are issued after payment status is marked paid.",
  ],
  supportContact: siteSettingContent.contactEmail,
  publishedAt: now(),
};

const documentTemplates = [
  {
    key: "member-id-card",
    name: "Member ID Card",
    category: "member_id",
    description: "Printable member identification card with QR verification block and contact-safe member details.",
    title: "Member ID Card",
    subtitle: "Authorized community representative",
    body: "This card identifies an active member or volunteer associated with Raushni Educational & Social Welfare Trust.",
    footer: "If found, please contact the trust office using the public contact details.",
    legalNote: siteSettingContent.footerNote,
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#ea580c",
    placeholders: ["member_name", "member_role", "member_id", "joined_on", "phone", "qr_code"],
    settings: {
      organization: siteSettingContent.siteName,
      cardPrefix: "RSH-MEM",
      includeQr: true,
      paperSize: "ID-1 / printable badge",
    },
    publishedAt: now(),
  },
  {
    key: "donation-receipt",
    name: "Donation Receipt",
    category: "donation_receipt",
    description: "Official receipt wording for verified donations, print/PDF generation, and donor acknowledgement.",
    title: "Official Receipt",
    subtitle: "Donation acknowledgement",
    body: "We gratefully acknowledge this contribution toward community education, welfare, and social development programs. This receipt is computer generated and valid without a physical signature.",
    footer: "Keep this receipt for your records. Payment status and donor details are maintained in the dashboard.",
    legalNote: siteSettingContent.footerNote,
    thankYouNote: "Thank you for supporting Raushni.",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#ea580c",
    placeholders: ["receipt_number", "issued_at", "donor_name", "amount", "purpose", "payment_method", "transaction_reference"],
    settings: {
      organization: siteSettingContent.siteName,
      receiptPrefix: "RSH-DON",
      requirePaidStatus: true,
    },
    publishedAt: now(),
  },
  {
    key: "invoice",
    name: "Invoice",
    category: "invoice",
    description: "Professional invoice template for services, program fees, reimbursements, and institutional billing.",
    title: "Invoice",
    subtitle: "Official billing document",
    body: "This invoice is issued for approved services, program support, or operational billing recorded by Raushni Educational & Social Welfare Trust.",
    footer: "Payment is subject to finance verification and dashboard reconciliation.",
    legalNote: siteSettingContent.footerNote,
    thankYouNote: "Thank you for your support.",
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#0f766e",
    placeholders: ["invoice_number", "issued_at", "bill_to", "line_items", "subtotal", "tax", "total", "payment_terms", "qr_code"],
    settings: {
      organization: siteSettingContent.siteName,
      invoicePrefix: "RSH-INV",
      includeQr: true,
    },
    publishedAt: now(),
  },
  {
    key: "internship-completion-certificate",
    name: "Internship Completion Certificate",
    category: "certificate",
    description: "QR-verifiable internship completion certificate template used by the dashboard issue certificate workflow.",
    title: "Certificate of Completion",
    subtitle: "This certificate is proudly awarded to",
    body: "for successfully completing <strong>${program_title}</strong> in the <strong>${track}</strong> track with professional conduct, practical contribution, and learning commitment.",
    footer: "This certificate can be authenticated using the QR code or verification URL.",
    legalNote: "Issued by Raushni Educational & Social Welfare Trust for verified internship completion.",
    signatoryLabel: "Authorized Signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#b45309",
    placeholders: ["participant_name", "program_title", "track", "certificate_number", "issued_on", "verification_url", "qr_code_svg"],
    htmlTemplate: "Backend renders the HTML/PDF shell and substitutes this CMS-managed title, subtitle, body, footer, and signatory text.",
    settings: {
      certificatePrefix: "RSH-CERT",
      verificationBaseUrl: "/certificates/verify",
      includeQr: true,
    },
    publishedAt: now(),
  },
  {
    key: "achievement-certificate",
    name: "Achievement Certificate",
    category: "certificate",
    description: "General certificate template for volunteers, donors, members, and program participants.",
    title: "Certificate of Appreciation",
    subtitle: "Presented with gratitude to",
    body: "for meaningful contribution, service, and commitment to community welfare programs.",
    footer: "Issued for verified contribution and approved by the authorized team.",
    legalNote: siteSettingContent.footerNote,
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#047857",
    placeholders: ["recipient_name", "achievement_title", "issued_on", "certificate_number", "qr_code"],
    settings: {
      certificatePrefix: "RSH-ACH",
      includeQr: true,
    },
    publishedAt: now(),
  },
  {
    key: "appointment-letter",
    name: "Appointment Letter",
    category: "appointment_letter",
    description: "Appointment and engagement letter wording for staff, volunteers, interns, and coordinators.",
    title: "Appointment Letter",
    subtitle: "Formal role confirmation",
    body: "We are pleased to appoint ${recipient_name} as ${role_title}. The appointment is subject to trust policies, role responsibilities, code of conduct, and periodic review.",
    footer: "This letter is generated from the dashboard and should be verified against approved records.",
    legalNote: siteSettingContent.footerNote,
    signatoryLabel: "Authorized signatory",
    logoUrl: "/assets/brand/raushni-logo.png",
    stampUrl: "/assets/brand/raushni-stamp-logo.png",
    accentColor: "#1d4ed8",
    placeholders: ["recipient_name", "role_title", "start_date", "department", "letter_number", "qr_code"],
    settings: {
      letterPrefix: "RSH-APT",
      includeQr: true,
    },
    publishedAt: now(),
  },
  {
    key: "qr-verification",
    name: "QR Verification Block",
    category: "qr_code",
    description: "Reusable QR verification instructions for certificates, ID cards, receipts, and letters.",
    title: "Scan to verify",
    subtitle: "Public authentication",
    body: "Scan the QR code to open the public verification page and confirm the document number, recipient, status, and issue date.",
    footer: "Do not accept altered documents without QR or verification URL confirmation.",
    legalNote: "Verification records are managed by Raushni dashboard and CMS configuration.",
    accentColor: "#111827",
    placeholders: ["verification_url", "document_number", "qr_code_svg"],
    settings: {
      supportedDocuments: ["member_id", "donation_receipt", "certificate", "appointment_letter"],
    },
    publishedAt: now(),
  },
];

const designationContents = [
  {
    slug: "trustee",
    title: "Trustee",
    code: "TRUSTEE",
    department: "Governance",
    level: "board",
    status: "active",
    reportsTo: "",
    description: "Governance designation for trust oversight, policy approvals, compliance review, and statutory accountability.",
    assignmentScope: "Board governance and trust-level approvals",
    responsibilities: [
      "Approve strategic plans and budgets",
      "Review compliance and audit actions",
      "Represent trust governance decisions",
    ],
    requiredDocuments: ["Identity proof", "Address proof", "Board consent record"],
    staffAssigned: 3,
    capacity: 3,
    sortOrder: 10,
    notes: "Reserved for legally appointed board members.",
    publishedAt: now(),
  },
  {
    slug: "project-manager",
    title: "Project Manager",
    code: "PM",
    department: "Programmes",
    level: "management",
    status: "active",
    reportsTo: "Trustee",
    description: "Programme designation for project planning, donor reporting, field coordination, timeline control, and delivery quality.",
    assignmentScope: "Project execution and donor coordination",
    responsibilities: [
      "Prepare project plans and implementation calendars",
      "Coordinate field teams and partners",
      "Submit progress, impact, and utilization reports",
    ],
    requiredDocuments: ["Appointment letter", "KYC", "Experience profile"],
    staffAssigned: 1,
    capacity: 2,
    sortOrder: 20,
    publishedAt: now(),
  },
  {
    slug: "finance-accounts-officer",
    title: "Finance and Accounts Officer",
    code: "FIN",
    department: "Finance",
    level: "management",
    status: "active",
    reportsTo: "Trustee",
    description: "Finance designation for donation records, receipts, expenses, vouchers, bank records, and audit-ready reporting.",
    assignmentScope: "Finance controls, payment records, receipts, and compliance",
    responsibilities: [
      "Record donations and expenses",
      "Maintain vouchers and audit files",
      "Prepare financial summaries",
    ],
    requiredDocuments: ["Appointment letter", "KYC", "Bank verification"],
    staffAssigned: 1,
    capacity: 1,
    sortOrder: 30,
    publishedAt: now(),
  },
  {
    slug: "volunteer-coordinator",
    title: "Volunteer Coordinator",
    code: "VOL-COORD",
    department: "Community",
    level: "coordination",
    status: "active",
    reportsTo: "Project Manager",
    description: "Coordination designation for volunteer onboarding, deployment, attendance, conduct, and community activity support.",
    assignmentScope: "Volunteer deployment and community activity coordination",
    responsibilities: [
      "Maintain volunteer rosters",
      "Assign volunteers to activities",
      "Collect attendance and field updates",
    ],
    requiredDocuments: ["Volunteer form", "Identity proof", "Consent declaration"],
    staffAssigned: 1,
    capacity: 10,
    sortOrder: 40,
    publishedAt: now(),
  },
  {
    slug: "intern",
    title: "Intern",
    code: "INTERN",
    department: "Internships",
    level: "intern",
    status: "active",
    reportsTo: "Internship Coordinator",
    description: "Learning designation for internship tasks, documentation, weekly progress updates, completion deliverables, and certificate workflow.",
    assignmentScope: "Internship tasks, learning milestones, and certificate workflow",
    responsibilities: [
      "Complete assigned internship deliverables",
      "Submit weekly progress updates",
      "Follow mentor guidance and trust conduct rules",
    ],
    requiredDocuments: ["Internship application", "College ID", "Completion report"],
    staffAssigned: 0,
    capacity: 25,
    sortOrder: 50,
    publishedAt: now(),
  },
];

const projectContents = [
  {
    slug: "project-sparsh-watsan-muzaffarpur",
    title: "Project Sparsh: WATSAN Intervention Programme in Marginalized Schools",
    shortTitle: "Project Sparsh",
    summary:
      "A 12-month integrated Water, Sanitation, and Hygiene intervention for 10 marginalized government schools in Muzaffarpur, Bihar, focused on safe drinking water, gender-segregated sanitation, handwashing facilities, menstrual hygiene awareness, teacher capacity building, and community-led maintenance.",
    rationale:
      "Rural schools in Muzaffarpur continue to face unsafe drinking water, non-functional toilets, limited handwashing facilities, menstrual hygiene challenges, and flood-related water contamination. These gaps increase illness, absenteeism, girls' dropout risk, and educational inequality. Project Sparsh combines infrastructure, behaviour change, and community ownership to create safe, healthy, and gender-inclusive learning environments.",
    location: "Muzaffarpur District, Bihar, India",
    duration: "12 months",
    budget: "INR 48,11,136",
    beneficiaries: "2,500 school children, 100 teachers and staff, and 10,000+ community members",
    status: "proposed",
    focusArea: "Education, WATSAN, health, gender inclusion, school infrastructure",
    coverImageUrl: "/assets/brand/raushni-banner.png",
    proposalDocumentUrl: "/cms/project-proposals/project-sparsh-watsan-muzaffarpur.docx",
    objectives: [
      "Install RO-based drinking water systems, gender-segregated toilets, and handwashing stations in 10 schools.",
      "Conduct hygiene awareness, Menstrual Hygiene Management counselling, and teacher sensitization programmes.",
      "Build the capacity of teachers, school committees, and community stakeholders for operation and maintenance.",
      "Strengthen community participation and convergence with Jal Jeevan Mission, Swachh Bharat Mission, and Samagra Shiksha.",
    ],
    activities: [
      { title: "Baseline assessment and school selection", phase: "Q1", text: "WATSAN gap analysis, school mobilization, stakeholder consultation, and implementation planning." },
      { title: "Infrastructure development", phase: "Q1-Q3", text: "RO systems, toilets, handwashing stations, water storage, plumbing, drainage, and minor repairs." },
      { title: "Hygiene behaviour change", phase: "Q1-Q4", text: "Student hygiene sessions, IEC material, cleanliness drives, disease prevention awareness, and community sensitization." },
      { title: "MHM and gender inclusion", phase: "Q2-Q4", text: "Adolescent girls' counselling, menstrual hygiene support, teacher/parent sensitization, and stigma reduction." },
      { title: "Capacity building and sustainability", phase: "Q2-Q4", text: "Teacher workshops, SMC strengthening, SHG engagement, O&M systems, vendor linkages, and scheme convergence." },
      { title: "Monitoring and closure", phase: "Q1-Q4", text: "MIS reporting, quality checks, attendance and health tracking, case studies, endline assessment, and closure report." },
    ],
    outcomes: [
      "10 marginalized schools equipped with functional WATSAN infrastructure.",
      "Reduced waterborne diseases and hygiene-related absenteeism among children.",
      "Improved attendance and retention among adolescent girls.",
      "Better hygiene practices among students, teachers, and communities.",
      "Functional community-led maintenance systems in all covered schools.",
      "Replicable school WATSAN model for underserved districts of Bihar.",
    ],
    sdgs: [
      "SDG 3 - Good Health and Well-being",
      "SDG 4 - Quality Education",
      "SDG 5 - Gender Equality",
      "SDG 6 - Clean Water and Sanitation",
      "SDG 10 - Reduced Inequalities",
      "SDG 11 - Sustainable Cities and Communities",
      "SDG 12 - Responsible Consumption and Production",
      "SDG 13 - Climate Action",
    ],
    timeline: [
      { quarter: "Q1", milestone: "Planning, baseline, school selection, SMC formation, and procurement readiness" },
      { quarter: "Q2", milestone: "RO installation, toilet/handwashing works, hygiene sessions, and teacher sensitization" },
      { quarter: "Q3", milestone: "Infrastructure completion, MHM counselling, community drives, and monitoring" },
      { quarter: "Q4", milestone: "O&M handover, endline assessment, documentation, donor reporting, and closure" },
    ],
    budgetBreakdown: [
      { head: "Human resources", amount: 1164000 },
      { head: "Baseline and endline assessment", amount: 80000 },
      { head: "RO water purification systems", amount: 700000 },
      { head: "Gender-segregated toilet construction/renovation", amount: 500000 },
      { head: "Handwashing stations and plumbing fixtures", amount: 200000 },
      { head: "Water storage tanks and installation", amount: 200000 },
      { head: "Minor civil works and repairs", amount: 200000 },
      { head: "Teacher sensitization workshops", amount: 120000 },
      { head: "MHM counselling for adolescent girls", amount: 100000 },
      { head: "Hygiene awareness campaigns and IEC", amount: 130000 },
      { head: "Volunteer and stakeholder training", amount: 90000 },
      { head: "O&M support", amount: 150000 },
    ],
    team: [
      { role: "Project Manager", positions: 1 },
      { role: "Plant Manager (RO)", positions: 1 },
      { role: "Community Mobiliser", positions: 1 },
      { role: "Finance & Accounts Officer", positions: 1 },
    ],
    monitoring: [
      "Baseline and endline surveys",
      "Monthly progress reports and MIS dashboards",
      "School inspection and infrastructure functionality checks",
      "Training attendance and participant feedback",
      "Attendance, absenteeism, and health incident tracking",
      "Case studies, donor visibility, and final closure documentation",
    ],
    risks: [
      { risk: "Seasonal floods affecting infrastructure", mitigation: "Climate-resilient design and buffer planning." },
      { risk: "Low adoption of hygiene practices", mitigation: "Continuous school and community behaviour change sessions." },
      { risk: "Weak long-term maintenance", mitigation: "SMC, SHG, teacher, and vendor-linked O&M systems." },
      { risk: "Procurement or construction delays", mitigation: "Strong procurement planning, vendor accountability, and field supervision." },
    ],
    seoTitle: "Project Sparsh WATSAN Proposal",
    seoDescription: "CMS-managed Project Sparsh proposal for school WATSAN intervention in Muzaffarpur, Bihar.",
    publishedAt: now(),
  },
];

async function upsertSingle(app, uid, data) {
  const existing = await app.db.query(uid).findOne();
  if (existing) {
    await app.db.query(uid).update({ where: { id: existing.id }, data });
  } else {
    await app.db.query(uid).create({ data });
  }
}

async function upsertBySlug(app, uid, data) {
  const existing = await app.db.query(uid).findOne({ where: { slug: data.slug } });
  if (existing) {
    await app.db.query(uid).update({ where: { id: existing.id }, data });
  } else {
    await app.db.query(uid).create({ data });
  }
}

async function upsertByKey(app, uid, data) {
  const existing = await app.db.query(uid).findOne({ where: { key: data.key } });
  if (existing) {
    await app.db.query(uid).update({ where: { id: existing.id }, data });
  } else {
    await app.db.query(uid).create({ data });
  }
}

async function enablePublicRead(app) {
  const publicRole = await app.query("plugin::users-permissions.role").findOne({ where: { type: "public" } });
  if (!publicRole) return;
  const permissionUid = "plugin::users-permissions.permission";
  const requiredActions = Object.values(uids).flatMap((uid) => {
    const actions = [`${uid}.find`];
    const contentType = app.contentTypes[uid];
    if (contentType?.kind === "collectionType") {
      actions.push(`${uid}.findOne`);
    }
    return actions;
  });
  for (const action of requiredActions) {
    const existing = await app.db.query(permissionUid).findOne({
      where: { action, role: { id: publicRole.id } },
    });
    if (!existing) {
      await app.entityService.create(permissionUid, {
        data: {
          action,
          role: publicRole.id,
        },
      });
    }
  }
  console.log("Enabled public CMS read access for Raushni content types.");
  return;

  const permissionService = app.plugin("users-permissions").service("permission");
  const permissions = await permissionService.findRolePermissions(publicRole.id);
  for (const uid of Object.values(uids)) {
    const controllerName = uid.split(".").pop();
    const controllerPermissions = permissions[uid]?.controllers?.[controllerName];
    if (controllerPermissions?.find) {
      controllerPermissions.find.enabled = true;
    }
    if (controllerPermissions?.findOne) {
      controllerPermissions.findOne.enabled = true;
    }
  }
  if (typeof permissionService.updateRolePermissions === "function") {
    await permissionService.updateRolePermissions(publicRole.id, permissions);
    console.log("Enabled public CMS read access for Raushni content types.");
    return;
  }

  const roleService = app.plugin("users-permissions").service("role");
  if (typeof roleService.updateRole === "function") {
    await roleService.updateRole(publicRole.id, { permissions });
    console.log("Enabled public CMS read access for Raushni content types.");
    return;
  }

  console.warn("Could not auto-enable public CMS read permissions; enable find/findOne for Raushni content types in Strapi admin.");
}

async function main() {
  const app = await strapiFactory().load();
  try {
    await upsertSingle(app, uids.siteSetting, siteSettingContent);
    await upsertSingle(app, uids.landing, landingPageContent);
    for (const page of publicPages) {
      await upsertBySlug(app, uids.publicPage, page);
    }
    await upsertBySlug(app, uids.internshipAnnouncement, internshipContent);
    await upsertBySlug(app, uids.donationPaymentSetting, donationPaymentSettingContent);
    for (const designation of designationContents) {
      await upsertBySlug(app, uids.designation, designation);
    }
    for (const project of projectContents) {
      await upsertBySlug(app, uids.projectContent, project);
    }
    for (const template of documentTemplates) {
      await upsertByKey(app, uids.documentTemplate, template);
    }
    await enablePublicRead(app);
    console.log("Seeded Raushni CMS-managed site content.");
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error("Failed to seed Raushni Strapi content.");
  console.error(error);
  process.exit(1);
});
