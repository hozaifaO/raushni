'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { DASHBOARD_MODULES } from '@/lib/auth/modules';
import { canAdmin, getStoredUser, isReadOnly, signOutToGuest } from '@/lib/auth/permissions';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    syncUser();
    setLoading(false);
    window.addEventListener('raushni:user-change', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('raushni:user-change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const isActive = (href) => {
    const cleanHref = href.split('?')[0];
    return pathname === cleanHref || pathname?.startsWith(cleanHref + '/');
  };

  const canSeeModule = (item) => {
    if (!user) return item.access !== 'admin';
    return item.access !== 'admin' || canAdmin(user.role);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-72 bg-white border-l border-stone-200 z-40 overflow-y-auto shadow-xl transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:shadow-none`}
      >
        <div className="p-6">
          {/* Logo and User Avatar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              {/* Logo Image 
               
              <img
                src="/assets/images/o4uL2.png"
                alt="Raushni logo"
                className="rounded-full object-cover"
                style={{ width: "50px", height: "50px" }}
              />
              */}
              {/* Dynamic User Profile Image */}
              <div className="relative">
                {loading ? (
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                ) : user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "Profile"}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-accent shadow-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                )}
                {/* Online status indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </Link>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info Section (Optional) */}
          {!loading && user && (
            <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{user.name || 'Guest User'}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {isReadOnly(user.role) ? 'Guest - read only' : user.role || 'Guest'}
                  </p>
                  <p className="mt-0.5 break-all text-xs text-gray-400">{user.email || 'guest@raushni.com'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-6">
            {DASHBOARD_MODULES.map((category, idx) => {
              const visibleItems = category.items.filter(canSeeModule);
              if (visibleItems.length === 0) return null;

              return (
              <div key={idx}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {category.category}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2 transition-all duration-200 group ${
                          active
                            ? 'bg-brand text-white shadow-md'
                            : 'text-stone-700 hover:bg-amber-50 hover:text-brand'
                        }`}
                      >
                        <Icon size={18} className={`mt-0.5 shrink-0 ${active ? 'text-accent' : 'text-stone-400 group-hover:text-amber-600'}`} />
                        <span className="min-w-0 flex-1 whitespace-normal break-words text-sm font-medium leading-tight">{item.name}</span>
                        {item.access === 'admin' && (
                          <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            active ? 'bg-white/15 text-accent' : 'bg-amber-50 text-amber-800'
                          }`}>
                            Admin
                          </span>
                        )}
                        {active && <span className="ml-auto mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={() => {
                signOutToGuest();
                void signOut({ callbackUrl: '/login' });
              }}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
            >
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
