"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartHandshake, Menu, X } from "lucide-react";
import { useState } from "react";
import { publicNavItems } from "@/lib/public/content";

export default function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120f0b]/95 text-white shadow-sm shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Raushni home">
          <img
            src="/assets/brand/raushni-logo.png"
            alt="Raushni Educational and Social Welfare Trust logo"
            className="h-14 w-14 rounded-2xl object-contain ring-1 ring-white/15"
          />
          <span className="hidden text-sm font-black uppercase leading-tight tracking-wide text-white sm:block">
            Raushni
            <span className="block text-[11px] font-semibold text-amber-200">
              Educational & Social Welfare Trust
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {publicNavItems.map((item) => {
            const active = pathname === item.href || (item.href === "/news" && pathname?.startsWith("/blog"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
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
          className="hidden min-h-10 items-center justify-center gap-2 rounded-full bg-amber-400 px-4 text-sm font-bold text-stone-950 shadow-sm shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 focus:ring-offset-[#120f0b] md:inline-flex"
        >
          <HeartHandshake size={16} aria-hidden="true" />
          Donate
        </Link>

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
            {publicNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-amber-100"
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
          </div>
        </nav>
      )}
    </header>
  );
}
