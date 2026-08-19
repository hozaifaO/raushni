'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Bell, User, LogOut, Settings, Search } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { getStoredUser, isReadOnly, signOutToGuest } from '@/lib/auth/permissions';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('raushni:user-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('raushni:user-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const displayUser = user ?? {
    name: 'Guest User',
    email: 'guest@raushni.com',
    role: 'GUEST',
  };
  const readOnly = isReadOnly(displayUser.role);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 h-16 border-b border-white/10 bg-brand/95 text-white backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-lg shadow-black/20' : 'shadow-sm shadow-black/10'
      }`}
    >
      <div className="flex h-full items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
            <img
              src="/assets/brand/raushni-logo.png"
              alt="Raushni Educational and Social Welfare Trust logo"
              className="h-10 w-10 shrink-0 rounded-full object-contain ring-2 ring-white/15"
            />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-black uppercase tracking-wide text-white">
                RAUSHNI-ESWT
              </span>
              <span className="block truncate text-xs font-semibold text-accent">
                Educational & Social Welfare
              </span>
            </span>
          </Link>
        </div>

        <div className="mx-2 hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search…"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/80" aria-hidden />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            type="button"
            className="relative rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1.5 pr-2 text-white transition-colors hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-semibold text-accent-ink">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-28 truncate text-sm font-medium md:inline">
                {displayUser.name}
              </span>
              {readOnly && (
                <span className="hidden rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent lg:inline">
                  Read only
                </span>
              )}
              <ChevronDown size={16} className="hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-white/10 bg-brand py-2 text-white shadow-xl shadow-black/30">
                <div className="px-4 py-2 text-xs text-white/55">
                  <p className="font-semibold text-white">{displayUser.email}</p>
                  <p className="text-accent">
                    {readOnly ? 'Guest read-only access' : `${displayUser.role} access`}
                  </p>
                </div>
                <hr className="my-1 border-white/10" />
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-accent"
                >
                  <User size={16} /> Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-accent"
                >
                  <Settings size={16} /> Settings
                </Link>
                <hr className="my-1 border-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    signOutToGuest();
                    void signOut({ callbackUrl: '/login' });
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-200 hover:bg-white/10"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
