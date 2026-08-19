import { cmsFetchJson } from "@/lib/cms/client";
import {
  fallbackDocumentTemplates,
  type CmsDocumentTemplate,
  type DocumentTemplateCategory,
} from "@/lib/cms/documentTemplatesShared";

export type { CmsDocumentTemplate, DocumentTemplateCategory } from "@/lib/cms/documentTemplatesShared";
export { fallbackDocumentTemplates } from "@/lib/cms/documentTemplatesShared";

const CMS_PUBLIC_URL =
  process.env.NEXT_PUBLIC_CMS_URL ?? process.env.CMS_INTERNAL_URL ?? "http://localhost:1337";

function resolveMediaUrl(media: unknown, fallback: string) {
  const candidate = media as { data?: { attributes?: { url?: string } }; url?: string } | undefined;
  const url = candidate?.data?.attributes?.url ?? candidate?.url;
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/assets")) return url;
  return `${CMS_PUBLIC_URL}${url}`;
}

function normalizeTemplate(
  attrs: Record<string, unknown>,
  fallback: CmsDocumentTemplate,
): CmsDocumentTemplate {
  return {
    ...fallback,
    key: String(attrs.key ?? fallback.key),
    name: String(attrs.name ?? fallback.name),
    category: (attrs.category as DocumentTemplateCategory) ?? fallback.category,
    description: String(attrs.description ?? fallback.description),
    title: String(attrs.title ?? fallback.title),
    subtitle: String(attrs.subtitle ?? fallback.subtitle),
    body: String(attrs.body ?? fallback.body),
    footer: String(attrs.footer ?? fallback.footer),
    legalNote: String(attrs.legalNote ?? fallback.legalNote),
    thankYouNote: String(attrs.thankYouNote ?? fallback.thankYouNote),
    signatoryLabel: String(attrs.signatoryLabel ?? fallback.signatoryLabel),
    logoUrl: resolveMediaUrl(attrs.logo, String(attrs.logoUrl ?? fallback.logoUrl)),
    stampUrl: resolveMediaUrl(attrs.stamp, String(attrs.stampUrl ?? fallback.stampUrl)),
    accentColor: String(attrs.accentColor ?? fallback.accentColor),
    htmlTemplate: String(attrs.htmlTemplate ?? fallback.htmlTemplate),
    placeholders: Array.isArray(attrs.placeholders)
      ? attrs.placeholders.map(String)
      : fallback.placeholders,
    settings:
      attrs.settings && typeof attrs.settings === "object"
        ? (attrs.settings as Record<string, unknown>)
        : fallback.settings,
  };
}

export async function getDocumentTemplate(key: string): Promise<CmsDocumentTemplate> {
  const fallback = fallbackDocumentTemplates[key] ?? fallbackDocumentTemplates["donation-receipt"];
  const payload = (await cmsFetchJson(
    `/document-templates?filters[key][$eq]=${encodeURIComponent(key)}&populate=*`,
  )) as {
    data?: Array<{ attributes?: Record<string, unknown> }>;
  } | null;
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const attrs = rows[0]?.attributes;
  return attrs ? normalizeTemplate(attrs, fallback) : fallback;
}

export async function listDocumentTemplates(): Promise<CmsDocumentTemplate[]> {
  const payload = (await cmsFetchJson(
    "/document-templates?populate=*&pagination[limit]=100&sort=name:asc",
  )) as {
    data?: Array<{ attributes?: Record<string, unknown> }>;
  } | null;
  const records = Array.isArray(payload?.data) ? payload.data : [];
  if (records.length === 0) {
    return Object.values(fallbackDocumentTemplates);
  }
  return records.map((record) => {
    const attrs = record.attributes ?? {};
    const key = String(attrs.key ?? "");
    const fallback = fallbackDocumentTemplates[key] ?? fallbackDocumentTemplates["donation-receipt"];
    return normalizeTemplate(attrs, fallback);
  });
}
