"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultSiteSettings, type CmsSiteSettings } from "@/lib/cms/publicContent";

type PublicTheme = "light" | "dark";

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<CmsSiteSettings>(defaultSiteSettings);
  const [theme, setTheme] = useState<PublicTheme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("raushni-public-theme");
    const nextTheme: PublicTheme = stored === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.dataset.publicTheme = "dark";
    } else {
      delete document.documentElement.dataset.publicTheme;
    }
    return () => {
      delete document.documentElement.dataset.publicTheme;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const nextTheme: PublicTheme = current === "dark" ? "light" : "dark";
      window.localStorage.setItem("raushni-public-theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.dataset.publicTheme = "dark";
      } else {
        delete document.documentElement.dataset.publicTheme;
      }
      return nextTheme;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadSettings() {
      try {
        const response = await fetch("/cms/api/site-setting?populate=*", { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        const attributes = payload?.data?.attributes;
        if (!attributes) return;
        const mediaUrl = attributes.logo?.data?.attributes?.url ?? attributes.logo?.url;
        setSettings((current) => ({
          ...current,
          siteName: attributes.siteName ?? current.siteName,
          brandShortName: attributes.brandShortName ?? current.brandShortName,
          brandTagline: attributes.brandTagline ?? current.brandTagline,
          logo: mediaUrl ? (mediaUrl.startsWith("http") ? mediaUrl : `${process.env.NEXT_PUBLIC_CMS_URL ?? ""}${mediaUrl}`) : current.logo,
          navItems: Array.isArray(attributes.navItems) ? attributes.navItems : current.navItems,
        }));
      } catch {
        if (!controller.signal.aborted) {
          setSettings(defaultSiteSettings);
        }
      }
    }
    loadSettings();
    return () => controller.abort();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120f0b]/95 text-white shadow-sm shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex min-h-40 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-4" aria-label="Raushni home">
          <img
            src={settings.logo}
            alt="Raushni Educational and Social Welfare Trust logo"
            className="rounded-full object-contain ring-2 ring-white/15"
            style={{ width: "1.5in", height: "1.5in" }}
          />
          <span className="hidden min-w-0 max-w-56 whitespace-normal text-xl font-black uppercase leading-tight tracking-wide text-white sm:block">
            {settings.brandShortName}
            <span className="block text-sm font-semibold text-amber-200">
              {settings.brandTagline}
            </span>
          </span>
        </Link>

        <nav className="hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-1 lg:flex">
          {settings.navItems.map((item) => {
            const active = pathname === item.href || (item.href === "/news" && pathname?.startsWith("/blog"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`max-w-36 whitespace-normal rounded-full px-3 py-2 text-center text-sm font-semibold leading-tight transition ${
                  active
                    ? "bg-amber-400 text-stone-950"
                    : "text-white/75 hover:bg-white/10 hover:text-amber-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/donate"
          className="hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] md:inline-flex"
        >
          <HeartHandshake size={16} aria-hidden="true" />
          Donate
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          className={`hidden min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] sm:inline-flex ${
            theme === "dark"
              ? "border-amber-200 bg-white text-stone-950 hover:bg-amber-50"
              : "border-amber-300 bg-amber-400 text-stone-950 hover:bg-amber-300"
          }`}
          aria-label={theme === "dark" ? "Switch public pages to light mode" : "Switch public pages to dark mode"}
          aria-pressed={theme === "dark"}
        >
          {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-[#120f0b] px-4 py-3 lg:hidden">
          <div className="grid gap-2">
            {settings.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="whitespace-normal break-words rounded-lg px-3 py-3 text-sm font-semibold leading-tight text-white/75 transition hover:bg-white/10 hover:text-amber-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/donate"
              onClick={() => setOpen(false)}
              className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 text-sm font-bold text-stone-950 transition hover:bg-amber-300"
            >
              <HeartHandshake size={16} aria-hidden="true" />
              Donate
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition ${
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
