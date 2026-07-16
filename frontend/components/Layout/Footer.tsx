"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import type { PublicLink } from "@/lib/cms/publicContentShared";

type FooterLink = PublicLink & { name?: string };

type FooterContent = {
  title: string;
  description: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  logo: string;
  quickLinks: FooterLink[];
  supportLinks: FooterLink[];
  newsletterTitle: string;
  newsletterText: string;
  footerNote: string;
};

type StrapiMediaLike = {
  data?: { attributes?: { url?: string } };
  url?: string;
};

type CmsAttributes = {
  title?: string;
  siteName?: string;
  description?: string;
  heroSubtitle?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  logo?: StrapiMediaLike;
  quickLinks?: unknown;
  supportLinks?: unknown;
  newsletterTitle?: string;
  newsletterText?: string;
  footerNote?: string;
};

type CmsCollectionResponse = {
  data?: { attributes?: CmsAttributes } | Array<{ attributes?: CmsAttributes }>;
};

const footerStyles = {
  heading: "public-footer-heading text-sm font-bold uppercase tracking-[0.18em] text-amber-700",
  link: "public-footer-link whitespace-normal break-words text-sm font-medium leading-tight text-stone-700 transition hover:text-amber-800 focus:outline-none focus:text-amber-800",
  iconLink:
    "public-footer-icon inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-700 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2",
  primaryButton:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2",
  input:
    "public-footer-input min-h-11 flex-1 rounded-full border border-stone-300 bg-white px-4 text-sm text-stone-950 outline-none transition placeholder:text-stone-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200/40 sm:w-72",
  muted: "public-footer-muted text-sm leading-6 text-stone-600",
  title: "public-footer-title text-lg font-black text-stone-950",
  note: "public-footer-note text-sm text-stone-500",
} as const;

const defaultFooterContent: FooterContent = {
  title: "",
  description:
    "Empowering underserved communities through education, healthcare access, livelihood development, and social welfare programs.",
  contactAddress: "Rauzah Apartment, Bhatauna Road, Marwan Khurd, Muzaffarpur, Bihar 843113",
  contactPhone: "+91 997 3955 7600",
  contactEmail: "info@raushni.com",
  logo: "/assets/brand/tL1.png",
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
  newsletterTitle: "Stay connected with Raushni",
  newsletterText: "Get updates about programs, events, relief work, and volunteer opportunities.",
  footerNote: "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
};

function isFooterLink(value: unknown): value is FooterLink {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const label = typeof item.label === "string" ? item.label : typeof item.name === "string" ? item.name : null;
  return Boolean(label) && typeof item.href === "string";
}

function parseFooterLinks(value: unknown, fallback: FooterLink[]): FooterLink[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(isFooterLink).map((item) => ({
    label: item.label ?? item.name ?? "",
    href: item.href,
    name: item.name,
  }));
  return items.length > 0 ? items : fallback;
}

function resolveMediaUrl(media: StrapiMediaLike | undefined, fallback: string): string {
  const url = media?.data?.attributes?.url ?? media?.url;
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  const base = (process.env.NEXT_PUBLIC_CMS_URL ?? "").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function firstAttributes(payload: CmsCollectionResponse | null): CmsAttributes | undefined {
  if (!payload?.data) return undefined;
  return Array.isArray(payload.data) ? payload.data[0]?.attributes : payload.data.attributes;
}

function linkKey(link: FooterLink): string {
  return `${link.href}:${link.label ?? link.name ?? ""}`;
}

function linkLabel(link: FooterLink): string {
  return link.label ?? link.name ?? link.href;
}

const socialLinks: Array<{ name: string; href: string; icon: ComponentType<{ size?: number }> }> = [
  { name: "Facebook", icon: FaFacebook, href: "https://www.facebook.com/profile.php?id=61563690991747" },
  { name: "Twitter", icon: FaTwitter, href: "https://X.com/" },
  { name: "Instagram", icon: FaInstagram, href: "https://instagram.com/" },
  { name: "LinkedIn", icon: FaLinkedin, href: "https://linkedin.com/company/" },
  { name: "YouTube", icon: FaYoutube, href: "https://youtube.com/" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFooterContent() {
      try {
        const [landingPayload, settingResponse] = await Promise.all([
          fetch("/cms/api/landing-pages?populate=*", { signal: controller.signal })
            .then((item) => (item.ok ? (item.json() as Promise<CmsCollectionResponse>) : null))
            .catch(() => null),
          fetch("/cms/api/site-settings?populate=*", { signal: controller.signal })
            .then((item) => (item.ok ? (item.json() as Promise<CmsCollectionResponse>) : null))
            .catch(() => null),
        ]);
        const attributes = firstAttributes(landingPayload);
        const settings = firstAttributes(settingResponse);

        if (attributes || settings) {
          setContent({
            title: settings?.siteName ?? attributes?.title ?? defaultFooterContent.title,
            description: settings?.description ?? attributes?.heroSubtitle ?? defaultFooterContent.description,
            contactAddress: settings?.contactAddress ?? attributes?.contactAddress ?? defaultFooterContent.contactAddress,
            contactPhone: settings?.contactPhone ?? attributes?.contactPhone ?? defaultFooterContent.contactPhone,
            contactEmail: settings?.contactEmail ?? attributes?.contactEmail ?? defaultFooterContent.contactEmail,
            logo: resolveMediaUrl(settings?.logo ?? attributes?.logo, defaultFooterContent.logo),
            quickLinks: parseFooterLinks(settings?.quickLinks, defaultFooterContent.quickLinks),
            supportLinks: parseFooterLinks(settings?.supportLinks, defaultFooterContent.supportLinks),
            newsletterTitle: settings?.newsletterTitle ?? defaultFooterContent.newsletterTitle,
            newsletterText: settings?.newsletterText ?? defaultFooterContent.newsletterText,
            footerNote: settings?.footerNote ?? defaultFooterContent.footerNote,
          });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.warn("Unable to load Strapi footer content", error);
      }
    }

    void loadFooterContent();
    return () => controller.abort();
  }, []);

  return (
    <footer className="public-footer border-t border-stone-200 bg-white text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.7fr_0.7fr_1fr]">
          <div>
            <Link href="/#top" className="inline-flex items-center gap-3">
              <img
                src={content.logo}
                alt={content.title ? `${content.title} logo` : "Organization logo"}
                className="h-14 w-14 rounded-full object-contain ring-2 ring-stone-200"
              />
            </Link>

            <p className={`mt-5 max-w-sm ${footerStyles.muted}`}>{content.description}</p>

            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={footerStyles.iconLink}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Explore</h3>
            <ul className="mt-5 space-y-3">
              {content.quickLinks.map((link) => (
                <li key={linkKey(link)}>
                  <Link href={link.href} className={footerStyles.link}>
                    {linkLabel(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Links</h3>
            <ul className="mt-5 space-y-3">
              {content.supportLinks.map((link) => (
                <li key={linkKey(link)}>
                  <Link href={link.href} className={footerStyles.link}>
                    {linkLabel(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={footerStyles.heading}>Contact</h3>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="public-footer-accent mt-0.5 flex-none text-amber-700" />
                <p className={footerStyles.muted}>{content.contactAddress}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="public-footer-accent flex-none text-amber-700" />
                <a href={`tel:${content.contactPhone.replace(/\s/g, "")}`} className={footerStyles.link}>
                  {content.contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="public-footer-accent flex-none text-amber-700" />
                <a href={`mailto:${content.contactEmail}`} className={footerStyles.link}>
                  {content.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="public-footer-divider mt-10 border-t border-stone-200 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h4 className={footerStyles.title}>{content.newsletterTitle}</h4>
              <p className={`mt-1 ${footerStyles.note}`}>{content.newsletterText}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input type="email" placeholder="Enter your email" className={footerStyles.input} />
              <button type="button" className={footerStyles.primaryButton}>
                <Send size={16} aria-hidden="true" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div
          className={`public-footer-divider mt-8 flex flex-col gap-3 border-t border-stone-200 pt-8 md:flex-row md:items-center md:justify-between ${footerStyles.note}`}
        >
          <p>© {currentYear}. All rights reserved.</p>
          <p className="inline-flex items-center gap-2 text-xs">
            {content.footerNote}
            <ArrowRight size={14} aria-hidden="true" />
          </p>
        </div>
      </div>
    </footer>
  );
}
