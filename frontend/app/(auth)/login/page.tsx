"use client";

import Link from "next/link";
import { Eye, KeyRound, ShieldCheck } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { signOutToGuest } from "@/lib/auth/permissions";

export default function Page() {
  const { data: session, status } = useSession();

  const continueWithKeycloak = () => {
    void signIn("keycloak", { callbackUrl: "/dashboard" });
  };

  const continueAsGuest = () => {
    signOutToGuest();
  };

  const logout = () => {
    signOutToGuest();
    void signOut({ callbackUrl: "/login" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-950">Secure dashboard login</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Sign in with Keycloak/OIDC for role-based access across dashboard modules, CMS links, and protected API actions.
        </p>

        {status === "authenticated" && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Signed in as <span className="font-semibold">{session.user?.email}</span>.
          </div>
        )}

        <button
          type="button"
          onClick={continueWithKeycloak}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <KeyRound size={18} aria-hidden="true" />
          Sign in with Keycloak
        </button>

        <Link
          href="/dashboard"
          onClick={continueAsGuest}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Eye size={18} aria-hidden="true" />
          Continue as read-only guest
        </Link>

        {status === "authenticated" && (
          <button
            type="button"
            onClick={logout}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            Sign out
          </button>
        )}
      </section>
    </main>
  );
}
