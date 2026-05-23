import {
  activities,
  careerOpenings,
  events,
  focusAreas,
  galleryItems,
  newsItems,
  publicContact,
  publicNavItems,
  volunteerRoles,
} from "@/lib/public/content";

export type PublicLink = { label: string; href: string };
export type CmsCard = {
  title: string;
  text?: string;
  meta?: string;
  category?: string;
  type?: string;
  image?: string;
  caption?: string;
  date?: string;
  time?: string;
  location?: string;
  tag?: string;
  summary?: string;
};
export type CmsSection = {
  eyebrow?: string;
  title: string;
  text?: string;
  layout?: "cards" | "checks" | "events" | "gallery" | "news" | "contact" | "notice";
  items?: CmsCard[] | string[];
  action?: PublicLink;
};
export type CmsPublicPage = {
  slug: string;
  title: string;
  heroEyebrow: string;
  heroTitle: string;
  heroText: string;
  heroImage: string;
  action?: PublicLink;
  sections: CmsSection[];
};
export type CmsSiteSettings = {
  siteName: string;
  brandShortName: string;
  brandTagline: string;
  description: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  logo: string;
  stampLogo: string;
  navItems: PublicLink[];
  quickLinks: PublicLink[];
  supportLinks: PublicLink[];
  socialLinks: Array<PublicLink & { name?: string }>;
  footerNote: string;
  newsletterTitle: string;
  newsletterText: string;
};

const CMS_BASE_URL =
  process.env.CMS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_CMS_URL ??
  "http://localhost:1337";

function resolveMediaUrl(media: unknown, fallback: string) {
  const candidate = media as { data?: { attributes?: { url?: string } }; url?: string } | undefined;
  const url = candidate?.data?.attributes?.url ?? candidate?.url;
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/assets")) return url;
  return `${process.env.NEXT_PUBLIC_CMS_URL ?? CMS_BASE_URL}${url}`;
}

async function fetchCmsJson(path: string) {
  try {
    const response = await fetch(`${CMS_BASE_URL}/api${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export const defaultSiteSettings: CmsSiteSettings = {
  siteName: "Raushni Educational & Social Welfare Trust",
  brandShortName: "Raushni",
  brandTagline: "Educational & Social Welfare Trust",
  description:
    "Empowering underserved communities through education, healthcare access, livelihood development, and social welfare programs.",
  contactAddress: publicContact.address,
  contactPhone: publicContact.phone,
  contactEmail: publicContact.email,
  logo: "/assets/brand/raushni-logo.png",
  stampLogo: "/assets/brand/raushni-stamp-logo.png",
  navItems: publicNavItems,
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
  footerNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
  newsletterTitle: "Stay connected with Raushni",
  newsletterText: "Get updates about programs, events, relief work, and volunteer opportunities.",
};

export const fallbackPages: Record<string, CmsPublicPage> = {
  about: {
    slug: "about",
    title: "About",
    heroEyebrow: "About Raushni",
    heroTitle: "A public trust working for education, welfare, dignity, and opportunity.",
    heroText:
      "Raushni Educational & Social Welfare Trust supports underserved communities through learning programs, health access, livelihood development, relief, and community mobilization.",
    heroImage: "/assets/brand/raushni-banner.png",
    sections: [
      {
        eyebrow: "Who we are",
        title: "Community work with structure, compassion, and accountability.",
        text: "We believe social welfare is strongest when local families, volunteers, donors, and field teams move together.",
        layout: "cards",
        items: focusAreas,
      },
      {
        eyebrow: "Our promise",
        title: "Every program should be useful, respectful, and measurable.",
        text: "Raushni's approach combines field listening, volunteer action, and transparent follow-up.",
        layout: "checks",
        items: [
          "Equal access to education, healthcare, and livelihood opportunities",
          "Transparent donor communication and accountable field documentation",
          "Community-led planning rooted in local needs and dignity",
          "Long-term support for children, women, youth, and vulnerable families",
        ],
      },
    ],
  },
  activities: {
    slug: "activities",
    title: "Activities",
    heroEyebrow: "Activities",
    heroTitle: "Field programs designed around learning, wellbeing, livelihood, and relief.",
    heroText: "Raushni activities are practical, recurring, and community-led so families receive support they can actually use.",
    heroImage: "/assets/images/og-image.jpg",
    action: { label: "Volunteer with us", href: "/volunteer" },
    sections: [{ eyebrow: "Current work", title: "Programs active across education and welfare priorities.", layout: "cards", items: activities }],
  },
  events: {
    slug: "events",
    title: "Events",
    heroEyebrow: "Events",
    heroTitle: "Join upcoming camps, orientations, distributions, and community programs.",
    heroText: "Events bring volunteers, families, donors, and partners together for focused action in the field.",
    heroImage: "/assets/brand/raushni-banner.png",
    action: { label: "Register as volunteer", href: "/volunteer" },
    sections: [{ eyebrow: "Upcoming", title: "Planned public programs", text: "Dates may be updated based on field readiness.", layout: "events", items: events }],
  },
  news: {
    slug: "news",
    title: "News",
    heroEyebrow: "News",
    heroTitle: "Updates from Raushni programs, field teams, and community initiatives.",
    heroText: "Follow program progress, volunteer coordination, donor-supported work, and important public announcements.",
    heroImage: "/assets/images/og-image.jpg",
    sections: [{ eyebrow: "Latest", title: "Recent updates", layout: "news", items: newsItems }],
  },
  gallery: {
    slug: "gallery",
    title: "Gallery",
    heroEyebrow: "Gallery",
    heroTitle: "Visual records from programs, campaigns, and trust communications.",
    heroText: "A public gallery helps supporters understand the identity, field focus, and community-facing work of Raushni.",
    heroImage: "/assets/brand/raushni-banner.png",
    sections: [{ eyebrow: "Media", title: "Program and brand gallery", layout: "gallery", items: galleryItems }],
  },
  careers: {
    slug: "careers",
    title: "Careers",
    heroEyebrow: "Careers",
    heroTitle: "Work with a team focused on practical, accountable community impact.",
    heroText: "Raushni welcomes people who are comfortable with field realities, documentation, coordination, and respectful communication.",
    heroImage: "/assets/brand/raushni-logo.png",
    action: { label: "Contact hiring team", href: "/contact" },
    sections: [{ eyebrow: "Open roles", title: "Current opportunities", layout: "cards", items: careerOpenings }],
  },
  volunteer: {
    slug: "volunteer",
    title: "Volunteer",
    heroEyebrow: "Volunteer",
    heroTitle: "Bring your time, skill, network, or care to community programs.",
    heroText: "Volunteers support teaching, camps, field coordination, content, fundraising, relief, and community follow-up.",
    heroImage: "/assets/brand/raushni-banner.png",
    action: { label: "Contact volunteer desk", href: "/contact" },
    sections: [{ eyebrow: "Ways to help", title: "Choose a role that matches your availability and strengths.", layout: "checks", items: volunteerRoles }],
  },
  contact: {
    slug: "contact",
    title: "Contact",
    heroEyebrow: "Contact",
    heroTitle: "Reach the Raushni team for programs, partnerships, volunteering, and donations.",
    heroText: "Share your enquiry and the team will route it to the right program or administrative contact.",
    heroImage: "/assets/brand/raushni-stamp-logo.png",
    sections: [
      {
        eyebrow: "Connect",
        title: "Contact details and enquiry form",
        text: "For urgent field coordination, please call. For documents, partnership requests, volunteer onboarding, donation support, or careers, email or use the form.",
        layout: "contact",
        items: [
          { title: "Program coordination", text: "Education, healthcare, livelihood, relief, and field activity enquiries." },
          { title: "Partnerships and donors", text: "Institutional collaboration, donor documentation, receipts, and impact reporting." },
        ],
      },
    ],
  },
  donate: {
    slug: "donate",
    title: "Donate",
    heroEyebrow: "Donation",
    heroTitle: "Support education, welfare, relief, and livelihood programs with transparent records.",
    heroText: "Your contribution helps Raushni keep reliable community programs available for families who need practical support.",
    heroImage: "/assets/brand/raushni-banner.png",
    sections: [
      {
        eyebrow: "Giving with accountability",
        title: "Make a donation",
        text: "Donation details are recorded for finance review, payment verification, receipt generation, and donor acknowledgement.",
        layout: "cards",
        items: [
          { title: "Receipt process", text: "After payment verification, the team issues an official receipt with the donation reference number." },
          { title: "Payment status", text: "Public submissions are saved as pending so the finance team can verify the transfer before final acknowledgement." },
          { title: "Donor records", text: "Donor contact and purpose details help the team maintain accurate accounts and responsible communication." },
        ],
      },
    ],
  },
  "internship-registration": {
    slug: "internship-registration",
    title: "Internship Registration",
    heroEyebrow: "Internship",
    heroTitle: "Apply for Raushni Internship 2026 and build real community technology experience.",
    heroText: "The internship module manages announcements, registrations, review status, completion certificates, QR verification, and public authentication.",
    heroImage: "/assets/brand/internship-2026.jpg",
    sections: [
      {
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
      },
    ],
  },
};

export async function getSiteSettings(): Promise<CmsSiteSettings> {
  const payload = await fetchCmsJson("/site-setting?populate=*");
  const attrs = payload?.data?.attributes;
  if (!attrs) return defaultSiteSettings;
  return {
    ...defaultSiteSettings,
    siteName: attrs.siteName ?? defaultSiteSettings.siteName,
    brandShortName: attrs.brandShortName ?? defaultSiteSettings.brandShortName,
    brandTagline: attrs.brandTagline ?? defaultSiteSettings.brandTagline,
    description: attrs.description ?? defaultSiteSettings.description,
    contactAddress: attrs.contactAddress ?? defaultSiteSettings.contactAddress,
    contactPhone: attrs.contactPhone ?? defaultSiteSettings.contactPhone,
    contactEmail: attrs.contactEmail ?? defaultSiteSettings.contactEmail,
    logo: resolveMediaUrl(attrs.logo, defaultSiteSettings.logo),
    stampLogo: resolveMediaUrl(attrs.stampLogo, defaultSiteSettings.stampLogo),
    navItems: Array.isArray(attrs.navItems) ? attrs.navItems : defaultSiteSettings.navItems,
    quickLinks: Array.isArray(attrs.quickLinks) ? attrs.quickLinks : defaultSiteSettings.quickLinks,
    supportLinks: Array.isArray(attrs.supportLinks) ? attrs.supportLinks : defaultSiteSettings.supportLinks,
    socialLinks: Array.isArray(attrs.socialLinks) ? attrs.socialLinks : defaultSiteSettings.socialLinks,
    footerNote: attrs.footerNote ?? defaultSiteSettings.footerNote,
    newsletterTitle: attrs.newsletterTitle ?? defaultSiteSettings.newsletterTitle,
    newsletterText: attrs.newsletterText ?? defaultSiteSettings.newsletterText,
  };
}

export async function getPublicPage(slug: string): Promise<CmsPublicPage> {
  const fallback = fallbackPages[slug] ?? fallbackPages.about;
  const payload = await fetchCmsJson(`/public-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
  const attrs = payload?.data?.[0]?.attributes;
  if (!attrs) return fallback;
  return {
    ...fallback,
    slug: attrs.slug ?? fallback.slug,
    title: attrs.title ?? fallback.title,
    heroEyebrow: attrs.heroEyebrow ?? fallback.heroEyebrow,
    heroTitle: attrs.heroTitle ?? fallback.heroTitle,
    heroText: attrs.heroText ?? fallback.heroText,
    heroImage: resolveMediaUrl(attrs.heroImage, attrs.heroImageUrl ?? fallback.heroImage),
    action: attrs.actionLabel && attrs.actionHref ? { label: attrs.actionLabel, href: attrs.actionHref } : fallback.action,
    sections: Array.isArray(attrs.sections) ? attrs.sections : fallback.sections,
  };
}
