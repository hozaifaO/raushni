import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/auth-options";
import { isPublicApiBffPath } from "@/lib/auth/bff-allowlist";
import { canWrite, normalizeRole } from "@/lib/auth/permissions";
import { DEFAULT_TENANT_SLUG, TENANT_COOKIE, TENANT_HEADER, normalizeTenantSlug } from "@/lib/tenant";
import { enforceBffRateLimit } from "@/lib/security/rate-limit";

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
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_PYTHON_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://backend:8000"
  ).replace(/\/$/, "");
}

function serviceApiKey(): string {
  return (process.env.INTERNAL_API_KEY || "").trim();
}

function resolveTenantSlug(
  request: NextRequest,
  sessionTenantSlug?: string | null,
): string {
  const fromHeader = request.headers.get(TENANT_HEADER);
  if (fromHeader?.trim()) {
    return normalizeTenantSlug(fromHeader);
  }
  const fromCookie = request.cookies.get(TENANT_COOKIE)?.value;
  if (fromCookie?.trim()) {
    return normalizeTenantSlug(fromCookie);
  }
  if (sessionTenantSlug?.trim()) {
    return normalizeTenantSlug(sessionTenantSlug);
  }
  return DEFAULT_TENANT_SLUG;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

async function proxyRequest(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const apiKey = serviceApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { detail: "INTERNAL_API_KEY is not configured on the frontend BFF." },
      { status: 500 },
    );
  }

  const method = request.method.toUpperCase();
  if (method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  const publicPath = isPublicApiBffPath(pathSegments);
  const session = await getServerSession(authOptions);
  const role = normalizeRole(session?.user?.role);
  const hasSession = Boolean(session?.user?.email);

  if (!publicPath && !hasSession) {
    return NextResponse.json({ detail: "Authentication required." }, { status: 401 });
  }

  // Public paths stay open for marketing forms; authenticated paths need a real staff role.
  if (!publicPath && !canWrite(role) && role !== "ADMIN") {
    return NextResponse.json({ detail: "Insufficient permissions." }, { status: 403 });
  }

  const rate = await enforceBffRateLimit({
    key: `api:${publicPath ? "public" : "auth"}:${clientIp(request)}`,
    limit: publicPath ? 10 : 60,
    windowSeconds: 60,
  });
  if (!rate.ok) {
    return NextResponse.json(
      { detail: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }

  const email =
    typeof session?.user?.email === "string" && session.user.email.trim()
      ? session.user.email.trim()
      : "";
  const tenantSlug = resolveTenantSlug(request, session?.user?.tenantSlug);
  const organizationId =
    typeof session?.user?.organizationId === "string" && session.user.organizationId.trim()
      ? session.user.organizationId.trim()
      : "";

  const path = pathSegments.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${upstreamBase()}/api/v1/${path}${search}`;

  const headers = new Headers();
  headers.set("X-API-Key", apiKey);
  headers.set("X-User-Role", publicPath && !hasSession ? "GUEST" : role);
  headers.set("X-Tenant-Slug", tenantSlug);
  if (organizationId) {
    headers.set("X-Organization-Id", organizationId);
  }
  if (email) {
    headers.set("X-User-Email", email);
  }

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  const accept = request.headers.get("accept");
  if (accept) {
    headers.set("accept", accept);
  }

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
    const message = error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json({ detail: message }, { status: 502 });
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
