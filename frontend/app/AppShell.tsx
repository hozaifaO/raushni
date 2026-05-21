"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";
import Footer from "@/components/Layout/Footer";
import { getStoredUser, isReadOnly } from "@/lib/auth/permissions";

export default function AppShell({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password") || pathname?.startsWith("/verify-email");
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
    pathname?.startsWith("/news") ||
    pathname?.startsWith("/volunteer");
  const isDashboardHome = pathname === "/dashboard";

  useEffect(() => {
    setReadOnly(isReadOnly(getStoredUser().role));
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
    <div className="min-h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main
        className={`mt-28 transition-all duration-300 ${
          isDashboardHome ? "bg-[#f7f7f7]" : ""
        } ${
          sidebarOpen ? "lg:mr-72" : "lg:mr-0"
        }`}
      >
        {readOnly && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800">
            Guest mode is read-only. You can view every module, but create, edit, delete, and admin actions are disabled.
          </div>
        )}
        {children}
      </main>

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:mr-72" : "lg:mr-0"}`}>
        <Footer />
      </div>
    </div>
  );
}
