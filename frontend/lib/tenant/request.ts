import { cookies, headers } from "next/headers";

import { DEFAULT_TENANT_SLUG, TENANT_COOKIE, TENANT_HEADER, normalizeTenantSlug } from "@/lib/tenant";

/** Read tenant slug set by proxy (request header preferred, cookie fallback). */
export async function getRequestTenantSlug(): Promise<string> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(TENANT_HEADER);
  if (fromHeader?.trim()) {
    return normalizeTenantSlug(fromHeader);
  }

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(TENANT_COOKIE)?.value;
  if (fromCookie?.trim()) {
    return normalizeTenantSlug(fromCookie);
  }

  return DEFAULT_TENANT_SLUG;
}
