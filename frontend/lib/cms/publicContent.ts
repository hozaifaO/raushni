import { cmsFetchJson } from "@/lib/cms/client";
import {
  defaultSiteSettings,
  fallbackPages,
  resolveMediaUrl,
  type CmsPublicPage,
  type CmsSection,
  type CmsSiteSettings,
  type PublicLink,
} from "@/lib/cms/publicContentShared";

export type {
  PublicLink,
  CmsCard,
  CmsSection,
  CmsPublicPage,
  CmsSiteSettings,
} from "@/lib/cms/publicContentShared";
export { defaultSiteSettings, fallbackPages, resolveMediaUrl } from "@/lib/cms/publicContentShared";

async function fetchCmsJson(path: string) {
  return cmsFetchJson(path) as Promise<{
    data?:
      | { attributes?: Record<string, unknown> }
      | Array<{ attributes?: Record<string, unknown> }>;
  } | null>;
}

export async function getSiteSettings(): Promise<CmsSiteSettings> {
  const payload = await fetchCmsJson("/site-settings?populate=*");
  const data = payload?.data;
  const attrs = Array.isArray(data)
    ? data[0]?.attributes
    : data && !Array.isArray(data)
      ? data.attributes
      : undefined;
  if (!attrs) return defaultSiteSettings;
  return {
    ...defaultSiteSettings,
    siteName: String(attrs.siteName ?? defaultSiteSettings.siteName),
    brandShortName: String(attrs.brandShortName ?? defaultSiteSettings.brandShortName),
    brandTagline: String(attrs.brandTagline ?? defaultSiteSettings.brandTagline),
    description: String(attrs.description ?? defaultSiteSettings.description),
    contactAddress: String(attrs.contactAddress ?? defaultSiteSettings.contactAddress),
    contactPhone: String(attrs.contactPhone ?? defaultSiteSettings.contactPhone),
    contactEmail: String(attrs.contactEmail ?? defaultSiteSettings.contactEmail),
    logo: resolveMediaUrl(attrs.logo, defaultSiteSettings.logo),
    stampLogo: resolveMediaUrl(attrs.stampLogo, defaultSiteSettings.stampLogo),
    navItems: Array.isArray(attrs.navItems) ? (attrs.navItems as PublicLink[]) : defaultSiteSettings.navItems,
    quickLinks: Array.isArray(attrs.quickLinks) ? (attrs.quickLinks as PublicLink[]) : defaultSiteSettings.quickLinks,
    supportLinks: Array.isArray(attrs.supportLinks)
      ? (attrs.supportLinks as PublicLink[])
      : defaultSiteSettings.supportLinks,
    socialLinks: Array.isArray(attrs.socialLinks)
      ? (attrs.socialLinks as Array<PublicLink & { name?: string }>)
      : defaultSiteSettings.socialLinks,
    footerNote: String(attrs.footerNote ?? defaultSiteSettings.footerNote),
    newsletterTitle: String(attrs.newsletterTitle ?? defaultSiteSettings.newsletterTitle),
    newsletterText: String(attrs.newsletterText ?? defaultSiteSettings.newsletterText),
  };
}

export async function getPublicPage(slug: string): Promise<CmsPublicPage> {
  const fallback = fallbackPages[slug] ?? fallbackPages.about;
  const payload = await fetchCmsJson(`/public-pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const attrs = rows[0]?.attributes;
  if (!attrs) return fallback;
  return {
    ...fallback,
    slug: String(attrs.slug ?? fallback.slug),
    title: String(attrs.title ?? fallback.title),
    heroEyebrow: String(attrs.heroEyebrow ?? fallback.heroEyebrow),
    heroTitle: String(attrs.heroTitle ?? fallback.heroTitle),
    heroText: String(attrs.heroText ?? fallback.heroText),
    heroImage: resolveMediaUrl(attrs.heroImage, String(attrs.heroImageUrl ?? fallback.heroImage)),
    action:
      typeof attrs.actionLabel === "string" && typeof attrs.actionHref === "string"
        ? { label: attrs.actionLabel, href: attrs.actionHref }
        : fallback.action,
    sections: Array.isArray(attrs.sections) ? (attrs.sections as CmsSection[]) : fallback.sections,
  };
}
