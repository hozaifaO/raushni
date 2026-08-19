/**
 * Server-side CMS Content API client.
 * Always attaches CMS_API_TOKEN — never expose that token via NEXT_PUBLIC_*.
 * Tenant-scoped collections get filters[tenantSlug][$eq]=… automatically.
 */

import "server-only";

import { isTenantScopedCmsPath, withTenantFilter } from "@/lib/tenant";
import { getRequestTenantSlug } from "@/lib/tenant/request";



function cmsBaseUrl(): string {

  return (

    process.env.CMS_INTERNAL_URL ||

    process.env.NEXT_PUBLIC_CMS_URL ||

    "http://localhost:1337"

  ).replace(/\/$/, "");

}



function cmsApiToken(): string {

  return (process.env.CMS_API_TOKEN || "").trim();

}



export function cmsAuthHeaders(): HeadersInit {

  const token = cmsApiToken();

  if (!token) {

    return { Accept: "application/json" };

  }

  return {

    Accept: "application/json",

    "X-CMS-API-Key": token,

  };

}



function cmsPathRoot(path: string): string[] {

  const withoutQuery = path.split("?")[0] || "";

  return withoutQuery.replace(/^\//, "").split("/").filter(Boolean);

}



/**

 * Fetch JSON from Strapi Content API (`path` should start with `/` after `/api`, e.g. `/landing-pages?...`).

 * Returns null on network/non-OK responses (callers keep static fallbacks).

 */

export async function cmsFetchJson(path: string): Promise<unknown | null> {

  const normalized = path.startsWith("/") ? path : `/${path}`;

  const segments = cmsPathRoot(normalized);

  let resolvedPath = normalized;

  if (isTenantScopedCmsPath(segments)) {

    const tenantSlug = await getRequestTenantSlug();

    resolvedPath = withTenantFilter(normalized, tenantSlug);

  }

  const url = `${cmsBaseUrl()}/api${resolvedPath}`;

  try {

    const response = await fetch(url, {

      cache: "no-store",

      headers: cmsAuthHeaders(),

    });

    if (!response.ok) return null;

    return response.json();

  } catch {

    return null;

  }

}


