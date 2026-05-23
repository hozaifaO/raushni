"use strict";

const strapiFactory = require("@strapi/strapi");

const uids = {
  landing: "api::landing-page.landing-page",
  siteSetting: "api::site-setting.site-setting",
  publicPage: "api::public-page.public-page",
  internshipAnnouncement: "api::internship-announcement.internship-announcement",
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
