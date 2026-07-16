"use client";

import Link from "next/link";
import { ExternalLink, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { canAdmin, getStoredUser } from "@/lib/auth/permissions";
import { getBrowserTenantSlug } from "@/lib/tenant";

const DEFAULT_CMS_URL = "http://localhost:1337";

function resolveCmsPublicUrl() {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // Prefer direct Strapi port locally; nginx TLS path is https://localhost/admin
      return "http://localhost:1337";
    }

    const configuredUrl = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
    if (configuredUrl && !configuredUrl.includes("localhost")) {
      return configuredUrl;
    }

    const rootHost = hostname.startsWith("www.") ? hostname.slice(4) : hostname;
    return `${protocol}//${rootHost.startsWith("cms.") ? rootHost : `cms.${rootHost}`}`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  return configuredUrl || DEFAULT_CMS_URL;
}

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [cmsBaseUrl, setCmsBaseUrl] = useState(DEFAULT_CMS_URL);
  const [tenantSlug, setTenantSlug] = useState("raushni");
  const cmsAdminUrl = useMemo(() => `${cmsBaseUrl}/admin`, [cmsBaseUrl]);
  const cmsApiUrl = useMemo(
    () =>
      `${cmsBaseUrl}/api/landing-pages?filters[tenantSlug][$eq]=${encodeURIComponent(tenantSlug)}&populate=*`,
    [cmsBaseUrl, tenantSlug],
  );

  useEffect(() => {
    setIsAdmin(canAdmin(getStoredUser().role));
    setCmsBaseUrl(resolveCmsPublicUrl());
    setTenantSlug(getBrowserTenantSlug());
  }, []);

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            {isAdmin ? <ShieldCheck size={28} aria-hidden="true" /> : <Lock size={28} aria-hidden="true" />}
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-orange-600">
            Administration
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950">CMS</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Manage the Raushni project content, media, and publishing workflows in Strapi with the configured admin account.
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Tenant:</span>{" "}
              {tenantSlug}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Admin email:</span>{" "}
              admin@raushni.com
            </p>
            <p className="mt-1">
              <span className="font-semibold text-gray-900">Local CMS:</span>{" "}
              {cmsAdminUrl}
            </p>
            <p className="mt-1">
              <span className="font-semibold text-gray-900">Landing content:</span>{" "}
              {cmsApiUrl}
            </p>
          </div>

          {isAdmin ? (
            <Link
              href={cmsAdminUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              Open CMS Admin
              <ExternalLink size={18} aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              Login as Admin
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
