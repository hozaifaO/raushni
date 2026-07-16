"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  defaultSiteSettings,
  type CmsSiteSettings,
  type PublicLink,
} from "@/lib/cms/publicContentShared";

type PublicTheme = "light" | "dark";

type StrapiMediaLike = {
  data?: { attributes?: { url?: string } };
  url?: string;
};

type SiteSettingAttributes = {
  siteName?: string;
  brandShortName?: string;
  brandTagline?: string;
  logo?: StrapiMediaLike;
  navItems?: unknown;
};

function isPublicLink(value: unknown): value is PublicLink {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.label === "string" && typeof item.href === "string";
}

function parseNavItems(value: unknown, fallback: PublicLink[]): PublicLink[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(isPublicLink);
  return items.length > 0 ? items : fallback;
}

function resolveCmsMediaUrl(media: StrapiMediaLike | undefined, fallback: string): string {
  const url = media?.data?.attributes?.url ?? media?.url;
  if (!url) return fallback;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  const base = (process.env.NEXT_PUBLIC_CMS_URL ?? "").replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

function applyPublicTheme(theme: PublicTheme) {
  if (theme === "dark") {
    document.documentElement.dataset.publicTheme = "dark";
  } else {
    delete document.documentElement.dataset.publicTheme;
  }
}

function NavLinks({
  items,
  pathname,
  className,
  linkClassName,
}: {
  items: PublicLink[];
  pathname: string | null;
  className: string;
  linkClassName: (active: boolean) => string;
}) {
  return (
    <nav className={className} aria-label="Primary">
      {items.map((item) => {
        const active = pathname === item.href || (item.href === "/news" && Boolean(pathname?.startsWith("/blog")));
        return (
          <Link key={item.href} href={item.href} className={linkClassName(active)}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<CmsSiteSettings>(defaultSiteSettings);
  const [theme, setTheme] = useState<PublicTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("raushni-public-theme");
    const nextTheme: PublicTheme = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyPublicTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme: PublicTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("raushni-public-theme", nextTheme);
      applyPublicTheme(nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadSettings() {
      try {
        const response = await fetch("/cms/api/site-settings?populate=*", { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          data?: { attributes?: SiteSettingAttributes } | Array<{ attributes?: SiteSettingAttributes }>;
        };
        const attributes = Array.isArray(payload.data)
          ? payload.data[0]?.attributes
          : payload.data?.attributes;
        if (!attributes) return;
        setSettings((current) => ({
          ...current,
          siteName: attributes.siteName ?? current.siteName,
          brandShortName: attributes.brandShortName ?? current.brandShortName,
          brandTagline: attributes.brandTagline ?? current.brandTagline,
          logo: resolveCmsMediaUrl(attributes.logo, current.logo),
          navItems: parseNavItems(attributes.navItems, current.navItems),
        }));
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSettings(defaultSiteSettings);
      }
    }
    void loadSettings();
    return () => controller.abort();
  }, []);

  const desktopLinkClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-semibold transition xl:px-2.5 xl:text-xs ${
      active ? "bg-amber-400 text-stone-950" : "text-white/75 hover:bg-white/10 hover:text-amber-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120f0b]/95 text-white shadow-sm shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label={`${settings.brandShortName} home`}>
          <img
            src={settings.logo}
            alt={`${settings.siteName} logo`}
            className="h-10 w-10 rounded-full object-contain ring-2 ring-white/15"
          />
          <span className="hidden min-w-0 max-w-[11rem] truncate text-sm font-black uppercase tracking-wide text-white sm:block lg:max-w-[14rem]">
            {settings.brandShortName}
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
          <NavLinks
            items={settings.navItems}
            pathname={pathname}
            className="hidden min-w-0 max-w-[28rem] items-center gap-0.5 overflow-x-auto lg:flex xl:max-w-none"
            linkClassName={desktopLinkClass}
          />

          <Link
            href="/donate"
            className="hidden h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-amber-400 px-3.5 text-xs font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] md:inline-flex"
          >
            <HeartHandshake size={14} aria-hidden="true" />
            Donate
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className={`hidden h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] sm:inline-flex ${
              theme === "dark"
                ? "border-amber-200 bg-white text-stone-950 hover:bg-amber-50"
                : "border-amber-300 bg-amber-400 text-stone-950 hover:bg-amber-300"
            }`}
            aria-label={theme === "dark" ? "Switch public pages to light mode" : "Switch public pages to dark mode"}
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? <Sun size={14} aria-hidden="true" /> : <Moon size={14} aria-hidden="true" />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#120f0b] px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="grid gap-1.5">
            {settings.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold leading-tight text-white/75 transition hover:bg-white/10 hover:text-amber-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
            >
              <HeartHandshake size={16} aria-hidden="true" />
              Donate
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
                theme === "dark"
                  ? "border-amber-200 bg-white text-stone-950 hover:bg-amber-50"
                  : "border-amber-300 bg-amber-400 text-stone-950 hover:bg-amber-300"
              }`}
              aria-label={theme === "dark" ? "Switch public pages to light mode" : "Switch public pages to dark mode"}
              aria-pressed={theme === "dark"}
            >
              {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
