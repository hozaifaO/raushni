/**
 * Host → tenant slug resolution for multi-tenant edge/BFF/CMS.
 * Keep this module free of next/headers so client components can import helpers.
 */

export const DEFAULT_TENANT_SLUG = (
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ||
  process.env.DEFAULT_TENANT_SLUG ||
  "raushni"
)
  .trim()
  .toLowerCase();

export const TENANT_HEADER = "x-tenant-slug";
export const TENANT_COOKIE = "tenant-slug";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "cms",
  "api",
  "app",
  "admin",
  "static",
  "assets",
  "mail",
  "status",
]);

export function normalizeTenantSlug(value: string | null | undefined): string {
  const normalized = (value || "").trim().toLowerCase();
  return normalized || DEFAULT_TENANT_SLUG;
}

/**
 * Resolve tenant from Host:
 * - localhost / 127.0.0.1 / *.localhost → DEFAULT_TENANT_SLUG
 * - slug.raushni.com (or any multi-label host) → subdomain slug
 * - apex / www → DEFAULT_TENANT_SLUG
 */
export function resolveTenantSlugFromHost(host: string | null | undefined): string {
  const hostname = (host || "").split(":")[0].trim().toLowerCase();
  if (
    !hostname ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  ) {
    return DEFAULT_TENANT_SLUG;
  }

  const labels = hostname.split(".").filter(Boolean);
  if (labels.length >= 3) {
    const subdomain = labels[0];
    if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return subdomain;
    }
  }

  return DEFAULT_TENANT_SLUG;
}

export function withTenantFilter(path: string, tenantSlug: string): string {
  const slug = normalizeTenantSlug(tenantSlug);
  // Strip any client-supplied tenantSlug filter so callers cannot preview another org.
  let cleaned = path.replace(
    /([?&])filters(?:\[|%5[Bb])tenantSlug(?:\]|%5[Dd])(?:\[|%5[Bb])\$eq(?:\]|%5[Dd])=[^&]*/gi,
    "$1",
  );
  cleaned = cleaned.replace(/\?&/, "?").replace(/[?&]$/, "").replace(/&&+/g, "&");
  const sep = cleaned.includes("?") ? "&" : "?";
  return `${cleaned}${sep}filters[tenantSlug][$eq]=${encodeURIComponent(slug)}`;
}

/** Content-API path prefixes that are keyed by tenantSlug. */
export const TENANT_SCOPED_CMS_PREFIXES = [
  "site-settings",
  "landing-pages",
  "public-pages",
  "donation-payment-settings",
  "document-templates",
] as const;

export function isTenantScopedCmsPath(pathSegments: string[]): boolean {
  const root = (pathSegments[0] || "").toLowerCase();
  return (TENANT_SCOPED_CMS_PREFIXES as readonly string[]).includes(root);
}

export function getBrowserTenantSlug(): string {
  if (typeof document === "undefined") {
    return DEFAULT_TENANT_SLUG;
  }
  const match = document.cookie.match(/(?:^|; )tenant-slug=([^;]*)/);
  if (!match?.[1]) {
    return DEFAULT_TENANT_SLUG;
  }
  try {
    return normalizeTenantSlug(decodeURIComponent(match[1]));
  } catch {
    return DEFAULT_TENANT_SLUG;
  }
}
