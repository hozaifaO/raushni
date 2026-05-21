"use client";

import { RefreshCw, ShieldCheck, UserCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/lib/auth/permissions";
import { getAccountProfile } from "@/services/api/settings";
import type { AccountProfile } from "@/types/models/settings";

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function localProfile(): AccountProfile {
  const user = getStoredUser();
  const canWrite = user.role === "ADMIN" || user.role === "STAFF";
  return {
    user: {
      id: "local-session",
      name: user.name,
      email: user.email,
      role: user.role,
      status: "active",
      access_level: canWrite ? "write" : "read",
      last_login_at: new Date().toISOString(),
      profile_image: user.profileImage ?? null,
    },
    permissions: canWrite ? ["dashboard:read", "members:write", "donations:write"] : ["dashboard:read"],
    role: {
      role: user.role,
      label: user.role === "ADMIN" ? "Admin" : user.role === "STAFF" ? "Staff" : "Guest",
      description:
        user.role === "ADMIN"
          ? "Full local administrator access."
          : user.role === "STAFF"
            ? "Operational write access."
            : "Read-only review access.",
      permissions: [],
      can_write: canWrite,
      is_admin: user.role === "ADMIN",
    },
    session_started_at: new Date().toISOString(),
    auth_mode: "local-browser-session",
  };
}

export default function Page() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getAccountProfile());
    } catch (requestError) {
      setProfile(localProfile());
      setError(
        requestError instanceof Error
          ? `${requestError.message} Showing local browser session.`
          : "Unable to load backend profile. Showing local browser session.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const summary = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [
      { label: "Role", value: profile.user.role },
      { label: "Access", value: profile.user.access_level },
      { label: "Status", value: profile.user.status },
      { label: "Permissions", value: String(profile.permissions.length) },
    ];
  }, [profile]);

  if (loading && !profile) {
    return (
      <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-600">Loading profile</p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-orange-600">Local session</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950">Profile & Account Access</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Review the current local session, account identity, role, and active permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadProfile()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-white"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold capitalize text-gray-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                <UserCircle size={28} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-950">{profile.user.name}</h2>
                <p className="mt-1 text-sm text-gray-600">{profile.user.email}</p>
                <span className="mt-3 inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase text-orange-700">
                  {profile.auth_mode}
                </span>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                <dt className="text-gray-500">Last login</dt>
                <dd className="font-semibold text-gray-900">{formatDate(profile.user.last_login_at)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                <dt className="text-gray-500">Session started</dt>
                <dd className="font-semibold text-gray-900">{formatDate(profile.session_started_at)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-100 pt-3">
                <dt className="text-gray-500">Write access</dt>
                <dd className="font-semibold text-gray-900">{profile.role.can_write ? "Enabled" : "Read only"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">{profile.role.label} permissions</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">{profile.role.description}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {profile.permissions.map((permission) => (
                <span
                  key={permission}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
