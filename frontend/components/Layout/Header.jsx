'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown, Bell, User, LogOut, Settings } from 'lucide-react';
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
    <header className={`fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-[#120f0b]/95 text-white backdrop-blur-xl transition-all duration-300 ${
      scrolled ? 'shadow-lg shadow-black/20' : 'shadow-sm shadow-black/10'
    }`}>
      <div className="flex min-h-40 items-center justify-between gap-4 px-4 py-3 lg:px-6">
        {/* Left section - Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-4">
            <img
              src="/assets/brand/raushni-logo.png"
              alt="Raushni Educational and Social Welfare Trust logo"
              className="rounded-full object-contain ring-2 ring-white/15"
              style={{ width: "1.5in", height: "1.5in" }}
            />
            <span className="hidden text-xl font-black uppercase leading-tight tracking-wide text-white sm:inline">
              RAUSHNI-ESWT<br/>
              <span className="text-sm font-semibold text-amber-200">The Educational & Social Welfare</span>
            </span>
          </Link>
        </div>

        {/* Center - Search bar (optional) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-amber-300 focus:ring-2 focus:ring-amber-200/30"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-amber-200/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right section - Notifications and User */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Notifications */}
          <button className="relative rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10" aria-label="Notifications">
            <Bell size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-300"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 font-semibold text-stone-950">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden max-w-32 whitespace-normal break-words text-left text-sm font-medium leading-tight md:inline">{displayUser.name}</span>
              {readOnly && (
                <span className="hidden rounded-full border border-amber-200/30 bg-amber-300/15 px-2 py-0.5 text-xs font-semibold text-amber-100 lg:inline">
                  Read only
                </span>
              )}
              <ChevronDown size={16} className="hidden md:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-white/10 bg-[#120f0b] py-2 text-white shadow-xl shadow-black/30">
                  <div className="px-4 py-2 text-xs text-white/55">
                    <p className="font-semibold text-white">{displayUser.email}</p>
                    <p className="text-amber-200">{readOnly ? 'Guest read-only access' : `${displayUser.role} access`}</p>
                  </div>
                  <hr className="my-1 border-white/10" />
                  <Link href="/profile" className="flex items-center gap-3 whitespace-normal break-words px-4 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-amber-100">
                    <User size={16} /> Profile
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 whitespace-normal break-words px-4 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-amber-100">
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
