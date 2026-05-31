"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Eye, KeyRound, ShieldCheck } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { signOutToGuest } from "@/lib/auth/permissions";

export default function Page() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("admin@raushni.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });
    setSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = result?.url ?? "/dashboard";
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
          Sign in with your Raushni admin or staff account for role-based dashboard access.
        </p>

        {status === "authenticated" && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Signed in as <span className="font-semibold">{session.user?.email}</span>.
          </div>
        )}

        <form onSubmit={login} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-gray-800">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </label>
          <label className="block text-sm font-semibold text-gray-800">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <KeyRound size={18} aria-hidden="true" />
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

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
