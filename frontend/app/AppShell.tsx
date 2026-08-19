"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import { getStoredUser, isReadOnly, setStoredUser } from "@/lib/auth/permissions";

export default function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/reset-password") ||
    pathname?.startsWith("/verify-email");
  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/about") ||
    pathname?.startsWith("/activities") ||
    pathname?.startsWith("/blog") ||
    pathname?.startsWith("/careers") ||
    pathname?.startsWith("/contact") ||
    pathname?.startsWith("/donate") ||
    pathname?.startsWith("/events") ||
    pathname?.startsWith("/gallery") ||
    pathname?.startsWith("/internship-registration") ||
    pathname?.startsWith("/news") ||
    pathname?.startsWith("/certificates/verify") ||
    pathname?.startsWith("/volunteer");
  const isDashboardHome = pathname === "/dashboard";

  useEffect(() => {
    if (session?.user) {
      const user = setStoredUser({
        name: session.user.name ?? "Raushni User",
        email: session.user.email ?? "user@raushni.com",
        role: session.user.role ?? "GUEST",
        accessLevel: session.user.accessLevel,
        profileImage: session.user.image ?? null,
      });
      setReadOnly(isReadOnly(user.role));
    } else {
      setReadOnly(isReadOnly(getStoredUser().role));
    }
  }, [session]);

  useEffect(() => {
    const syncDesktopState = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    syncDesktopState();
    window.addEventListener("resize", syncDesktopState);
    return () => window.removeEventListener("resize", syncDesktopState);
  }, []);

  if (isAuthRoute || isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main
        className={`mt-16 min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isDashboardHome ? "bg-surface" : ""
        } ${sidebarOpen ? "lg:mr-72" : "lg:mr-0"}`}
      >
        {readOnly && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-900">
            Read-only access. Create, edit, delete, and admin actions are disabled for this account.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
