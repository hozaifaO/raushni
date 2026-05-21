import { authHeaders } from "@/lib/auth/permissions";
import type {
  AccountProfile,
  PlatformSettings,
  SettingsDashboard,
  UserAccount,
  UserAccountUpdate,
} from "@/types/models/settings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYTHON_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === "string" ? body.detail : fallbackMessage;
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function getAccountProfile(): Promise<AccountProfile> {
  const response = await fetch(`${API_BASE_URL}/api/v1/account/profile`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<AccountProfile>(response, "Unable to load profile.");
}

export async function getSettingsDashboard(): Promise<SettingsDashboard> {
  const response = await fetch(`${API_BASE_URL}/api/v1/settings`, {
    cache: "no-store",
    headers: authHeaders(),
  });
  return parseResponse<SettingsDashboard>(response, "Unable to load settings.");
}

export async function updatePlatformSettings(values: PlatformSettings): Promise<PlatformSettings> {
  const response = await fetch(`${API_BASE_URL}/api/v1/settings/platform`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  return parseResponse<PlatformSettings>(response, "Unable to update platform settings.");
}

export async function updateUserAccount(id: string, values: UserAccountUpdate): Promise<UserAccount> {
  const response = await fetch(`${API_BASE_URL}/api/v1/settings/users/${id}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  return parseResponse<UserAccount>(response, "Unable to update user account.");
}
