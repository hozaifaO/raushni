/**
 * Paths the API BFF may proxy without a NextAuth session.
 * Everything else requires a signed-in staff/admin session.
 */
const PUBLIC_API_PREFIXES = [
  "donations/public",
  "enquiries/public",
  "internships/applications/public",
  "internships/public",
  "internships/certificates/", // GET verify by code
  "landing",
  "documents/",
  "webhooks/stripe",
] as const;

export function isPublicApiBffPath(segments: string[]): boolean {
  const path = segments.map(decodeURIComponent).join("/");
  if (!path) {
    return false;
  }
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (prefix.endsWith("/")) {
      if (path.startsWith(prefix) || path === prefix.slice(0, -1)) {
        return true;
      }
    } else if (path === prefix || path.startsWith(`${prefix}/`)) {
      return true;
    }
  }
  // Certificate HTML/verify style: internships/certificates/{code} or .../html
  if (/^internships\/certificates\/[^/]+(\/html)?$/.test(path)) {
    return true;
  }
  return false;
}

/** Anonymous browser GETs allowed against Strapi via CMS BFF (published marketing content). */
const PUBLIC_CMS_GET_ROOTS = new Set([
  "landing-pages",
  "site-settings",
  "public-pages",
  "internship-announcements",
  "donation-payment-settings",
  "document-templates",
]);

export function isPublicCmsGetPath(segments: string[]): boolean {
  const root = decodeURIComponent(segments[0] || "");
  return PUBLIC_CMS_GET_ROOTS.has(root);
}
