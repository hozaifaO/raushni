"use client";

import { Brush, RefreshCw, Save, Settings, ShieldCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canAdmin, getStoredUser } from "@/lib/auth/permissions";
import { getSettingsDashboard, updatePlatformSettings, updateUserAccount } from "@/services/api/settings";
import type {
  PlatformSettings,
  SettingsDashboard,
  UserAccount,
  UserAccountUpdate,
} from "@/types/models/settings";
import type { UserRole } from "@/types/models/user";

const emptyPlatform: PlatformSettings = {
  organization_name: "Raushni Educational & Social Welfare Trust",
  support_email: "admin@raushni.com",
  cms_url: "/cms",
  timezone: "Asia/Kolkata",
  receipt_prefix: "RSH-DON",
  public_donations_enabled: true,
  maintenance_mode: false,
  theme_name: "Raushni Professional",
  primary_color: "#ea580c",
  accent_color: "#166534",
  header_theme: "dark",
  footer_theme: "dark",
  page_background: "#f9fafb",
  surface_radius: "8px",
  logo_diameter: "1.5in",
  public_logo_url: "/logo.png",
  stamp_logo_url: "/stamplogo.png",
};

function fallbackSettings(): SettingsDashboard {
  const current = getStoredUser();
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "local-user",
        name: current.name,
        email: current.email,
        role: current.role,
        status: "active",
        access_level: current.role === "GUEST" ? "read" : "write",
        last_login_at: now,
        profile_image: current.profileImage ?? null,
      },
    ],
    roles: [
      {
        role: "ADMIN",
        label: "Admin",
        description: "Full platform administration.",
        permissions: ["settings:read", "settings:write", "cms:write"],
        can_write: true,
        is_admin: true,
      },
      {
        role: "STAFF",
        label: "Staff",
        description: "Operational write access without settings administration.",
        permissions: ["dashboard:read", "members:write", "donations:write"],
        can_write: true,
        is_admin: false,
      },
      {
        role: "GUEST",
        label: "Guest",
        description: "Read-only review access.",
        permissions: ["dashboard:read"],
        can_write: false,
        is_admin: false,
      },
    ],
    platform: emptyPlatform,
    updated_at: now,
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function Page() {
  const [settingsData, setSettingsData] = useState<SettingsDashboard | null>(null);
  const [platform, setPlatform] = useState<PlatformSettings>(emptyPlatform);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSettingsDashboard();
      setSettingsData(response);
      setPlatform(response.platform);
    } catch (requestError) {
      const fallback = fallbackSettings();
      setSettingsData(fallback);
      setPlatform(fallback.platform);
      setError(
        requestError instanceof Error
          ? `${requestError.message} Showing local settings fallback.`
          : "Unable to load backend settings. Showing local settings fallback.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsAdmin(canAdmin(getStoredUser().role));
    void loadSettings();
  }, [loadSettings]);

  const stats = useMemo(() => {
    if (!settingsData) {
      return [];
    }
    return [
      { label: "Users", value: settingsData.users.length },
      { label: "Roles", value: settingsData.roles.length },
      { label: "Write roles", value: settingsData.roles.filter((role) => role.can_write).length },
      { label: "Admin users", value: settingsData.users.filter((user) => user.role === "ADMIN").length },
    ];
  }, [settingsData]);

  const updatePlatformField = <K extends keyof PlatformSettings>(field: K, value: PlatformSettings[K]) => {
    setPlatform((current) => ({ ...current, [field]: value }));
  };

  const savePlatform = async () => {
    if (!isAdmin) {
      setError("Administrator access is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updatePlatformSettings(platform);
      setPlatform(updated);
      setSettingsData((current) => (current ? { ...current, platform: updated } : current));
      setSuccess("Platform settings saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save platform settings.");
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async (user: UserAccount, values: UserAccountUpdate) => {
    if (!isAdmin) {
      setError("Administrator access is required.");
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUserAccount(user.id, values);
      setSettingsData((current) =>
        current
          ? { ...current, users: current.users.map((item) => (item.id === updated.id ? updated : item)) }
          : current,
      );
      setSuccess(`${updated.name} updated.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update user.");
    }
  };

  if (loading && !settingsData) {
    return (
      <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-semibold text-gray-600">Loading settings</p>
        </div>
      </section>
    );
  }

  if (!settingsData) {
    return null;
  }

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-orange-600">Administration</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Configure users, roles, permissions, and platform settings
              {settingsData.organization_name ? ` for ${settingsData.organization_name}` : " for this organization"}
              {settingsData.tenant_slug ? ` (${settingsData.tenant_slug})` : ""}.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {!isAdmin && (
              <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-800">
                Admin access required to edit
              </span>
            )}
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition hover:bg-white"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-950">{item.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
              <Settings size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">Platform settings</h2>
              <p className="text-sm text-gray-600">Branding, CMS, receipt, and access behavior.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Organization name
              <input
                disabled={!isAdmin}
                value={platform.organization_name}
                onChange={(event) => updatePlatformField("organization_name", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Support email
              <input
                disabled={!isAdmin}
                type="email"
                value={platform.support_email}
                onChange={(event) => updatePlatformField("support_email", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              CMS URL
              <input
                disabled={!isAdmin}
                value={platform.cms_url}
                onChange={(event) => updatePlatformField("cms_url", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Timezone
              <input
                disabled={!isAdmin}
                value={platform.timezone}
                onChange={(event) => updatePlatformField("timezone", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Receipt prefix
              <input
                disabled={!isAdmin}
                value={platform.receipt_prefix}
                onChange={(event) => updatePlatformField("receipt_prefix", event.target.value.toUpperCase())}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800">
                Public donations
                <input
                  disabled={!isAdmin}
                  type="checkbox"
                  checked={platform.public_donations_enabled}
                  onChange={(event) => updatePlatformField("public_donations_enabled", event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-gray-800">
                Maintenance mode
                <input
                  disabled={!isAdmin}
                  type="checkbox"
                  checked={platform.maintenance_mode}
                  onChange={(event) => updatePlatformField("maintenance_mode", event.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </label>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!isAdmin || saving}
              onClick={() => void savePlatform()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} aria-hidden="true" />
              {saving ? "Saving" : "Save settings"}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Brush size={20} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-950">Theme</h2>
              <p className="text-sm text-gray-600">Control brand colors, header/footer appearance, logo assets, and dashboard surface styling.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Theme name
              <input
                disabled={!isAdmin}
                value={platform.theme_name}
                onChange={(event) => updatePlatformField("theme_name", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <ColorField
              label="Primary color"
              disabled={!isAdmin}
              value={platform.primary_color}
              onChange={(value) => updatePlatformField("primary_color", value)}
            />
            <ColorField
              label="Accent color"
              disabled={!isAdmin}
              value={platform.accent_color}
              onChange={(value) => updatePlatformField("accent_color", value)}
            />
            <ColorField
              label="Page background"
              disabled={!isAdmin}
              value={platform.page_background}
              onChange={(value) => updatePlatformField("page_background", value)}
            />
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Header theme
              <select
                disabled={!isAdmin}
                value={platform.header_theme}
                onChange={(event) => updatePlatformField("header_theme", event.target.value as PlatformSettings["header_theme"])}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="brand">Brand</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Footer theme
              <select
                disabled={!isAdmin}
                value={platform.footer_theme}
                onChange={(event) => updatePlatformField("footer_theme", event.target.value as PlatformSettings["footer_theme"])}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="brand">Brand</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Surface radius
              <input
                disabled={!isAdmin}
                value={platform.surface_radius}
                onChange={(event) => updatePlatformField("surface_radius", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Logo diameter
              <input
                disabled={!isAdmin}
                value={platform.logo_diameter}
                onChange={(event) => updatePlatformField("logo_diameter", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Public logo URL
              <input
                disabled={!isAdmin}
                value={platform.public_logo_url}
                onChange={(event) => updatePlatformField("public_logo_url", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-gray-700">
              Stamp logo URL
              <input
                disabled={!isAdmin}
                value={platform.stamp_logo_url}
                onChange={(event) => updatePlatformField("stamp_logo_url", event.target.value)}
                className="min-h-11 rounded-lg border border-gray-300 px-3 text-gray-950 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
              />
            </label>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-2 xl:col-span-1">
              <p className="text-sm font-semibold text-gray-800">Preview</p>
              <div
                className="mt-3 overflow-hidden border border-gray-200 bg-white shadow-sm"
                style={{ borderRadius: platform.surface_radius }}
              >
                <div
                  className="px-4 py-3 text-sm font-bold text-white"
                  style={{ background: platform.header_theme === "light" ? "#ffffff" : platform.header_theme === "brand" ? platform.primary_color : "#111827", color: platform.header_theme === "light" ? "#111827" : "#ffffff" }}
                >
                  Header
                </div>
                <div className="px-4 py-5" style={{ background: platform.page_background }}>
                  <div className="h-14 w-14 rounded-full border border-gray-300 bg-white" />
                  <p className="mt-3 text-sm font-semibold text-gray-900">Dashboard surface</p>
                  <div className="mt-2 h-2 rounded-full" style={{ background: platform.primary_color }} />
                </div>
                <div
                  className="px-4 py-3 text-sm font-bold"
                  style={{ background: platform.footer_theme === "light" ? "#ffffff" : platform.footer_theme === "brand" ? platform.accent_color : "#111827", color: platform.footer_theme === "light" ? "#111827" : "#ffffff" }}
                >
                  Footer
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!isAdmin || saving}
              onClick={() => void savePlatform()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} aria-hidden="true" />
              {saving ? "Saving" : "Save theme"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Users size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">Users</h2>
                <p className="text-sm text-gray-600">Manage organization memberships for staff who can sign in with NextAuth.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Last login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {settingsData.users.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="font-semibold text-gray-950">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <select
                          disabled={!isAdmin}
                          value={user.role}
                          onChange={(event) => void updateUser(user, { role: event.target.value as UserRole })}
                          className="min-h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-950 outline-none focus:border-orange-500 disabled:bg-gray-50"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="STAFF">STAFF</option>
                          <option value="GUEST">GUEST</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <select
                          disabled={!isAdmin}
                          value={user.status}
                          onChange={(event) =>
                            void updateUser(user, {
                              status: event.target.value as UserAccountUpdate["status"],
                            })
                          }
                          className="min-h-10 rounded-lg border border-gray-300 px-3 text-sm capitalize text-gray-950 outline-none focus:border-orange-500 disabled:bg-gray-50"
                        >
                          <option value="active">Active</option>
                          <option value="invited">Invited</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                        {formatDate(user.last_login_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-950">Roles & permissions</h2>
                <p className="text-sm text-gray-600">Current access matrix by role.</p>
              </div>
            </div>
            <div className="grid gap-4">
              {settingsData.roles.map((role) => (
                <div key={role.role} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-950">{role.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{role.description}</p>
                    </div>
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                      {role.permissions.length}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissions.slice(0, 10).map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {permission}
                      </span>
                    ))}
                    {role.permissions.length > 10 && (
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        +{role.permissions.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-gray-700">
      {label}
      <span className="flex min-h-11 overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
        <input
          disabled={disabled}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer border-0 bg-transparent p-1 disabled:cursor-not-allowed"
          aria-label={label}
        />
        <input
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 text-gray-950 outline-none disabled:bg-gray-50"
        />
      </span>
    </label>
  );
}
