import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

import {
  DEFAULT_TENANT_SLUG,
  TENANT_COOKIE,
  TENANT_HEADER,
  resolveTenantSlugFromHost,
} from "@/lib/tenant";

const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/members",
  "/beneficiaries",
  "/crowdfunding",
  "/internships",
  "/donations",
  "/designations",
  "/documents",
  "/certificates",
  "/reports",
  "/settings",
  "/cms",
  "/profile",
  "/projects",
];

function isProtectedPath(pathname: string): boolean {
  if (
    pathname === "/cms/api" ||
    pathname.startsWith("/cms/api/") ||
    pathname === "/api" ||
    pathname.startsWith("/api/")
  ) {
    return false;
  }
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function tenantSlugFor(request: NextRequest): string {
  return resolveTenantSlugFromHost(request.headers.get("host")) || DEFAULT_TENANT_SLUG;
}

function nextWithTenant(request: NextRequest, tenantSlug: string): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(TENANT_HEADER, tenantSlug);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set(TENANT_COOKIE, tenantSlug, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}

const protectedProxy = withAuth(
  function onAuthorized(request) {
    return nextWithTenant(request, tenantSlugFor(request));
  },
  {
    pages: {
      signIn: "/login",
    },
  },
);

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const tenantSlug = tenantSlugFor(request);
  const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";

  if (requireAuth && isProtectedPath(request.nextUrl.pathname)) {
    const result = await protectedProxy(request as never, event);
    if (result instanceof NextResponse) {
      result.cookies.set(TENANT_COOKIE, tenantSlug, {
        path: "/",
        sameSite: "lax",
        httpOnly: false,
      });
      return result;
    }
    return nextWithTenant(request, tenantSlug);
  }

  return nextWithTenant(request, tenantSlug);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};
