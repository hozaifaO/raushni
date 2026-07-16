import { NextRequest, NextResponse } from "next/server";

import {
  DEFAULT_TENANT_SLUG,
  TENANT_COOKIE,
  TENANT_HEADER,
  isTenantScopedCmsPath,
  normalizeTenantSlug,
  withTenantFilter,
} from "@/lib/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

function upstreamBase(): string {
  return (
    process.env.CMS_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    "http://strapi:1337"
  ).replace(/\/$/, "");
}

function cmsApiToken(): string {
  return (process.env.CMS_API_TOKEN || "").trim();
}

function resolveTenantSlug(request: NextRequest): string {
  const fromHeader = request.headers.get(TENANT_HEADER);
  if (fromHeader?.trim()) {
    return normalizeTenantSlug(fromHeader);
  }
  const fromCookie = request.cookies.get(TENANT_COOKIE)?.value;
  if (fromCookie?.trim()) {
    return normalizeTenantSlug(fromCookie);
  }
  return DEFAULT_TENANT_SLUG;
}

async function proxyRequest(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const token = cmsApiToken();
  if (!token) {
    return NextResponse.json(
      { error: { status: 500, message: "CMS_API_TOKEN is not configured on the frontend CMS BFF." } },
      { status: 500 },
    );
  }

  const path = pathSegments.map(encodeURIComponent).join("/");
  const tenantSlug = resolveTenantSlug(request);
  let search = request.nextUrl.search;
  if (isTenantScopedCmsPath(pathSegments)) {
    search = withTenantFilter(search, tenantSlug);
  }

  const targetUrl = `${upstreamBase()}/api/${path}${search}`;

  const headers = new Headers();
  headers.set("X-CMS-API-Key", token);
  headers.set("Accept", request.headers.get("accept") || "application/json");
  headers.set("X-Tenant-Slug", tenantSlug);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const method = request.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, {
      method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CMS upstream request failed";
    return NextResponse.json({ error: { status: 502, message } }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      responseHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(request, path ?? []);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
