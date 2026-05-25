import type { AppUser, UserRole } from "@/types/models/user";

export const DEFAULT_GUEST_USER: AppUser = {
  name: "Guest User",
  email: "guest@raushni.com",
  role: "GUEST",
  accessLevel: "read",
  profileImage: null,
};

export const DEFAULT_ADMIN_USER: AppUser = {
  name: "Admin User",
  email: "admin@raushni.com",
  role: "ADMIN",
  accessLevel: "write",
  profileImage: null,
};

const WRITE_ROLES = new Set<UserRole>(["ADMIN", "STAFF"]);
const READ_ONLY_ROLES = new Set<UserRole>(["GUEST"]);

export function normalizeRole(value: unknown): UserRole {
  if (typeof value !== "string") {
    return "GUEST";
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === "ADMINISTRATOR") {
    return "ADMIN";
  }
  if (normalized === "READ_ONLY" || normalized === "READONLY" || normalized === "VIEWER") {
    return "GUEST";
  }
  if (normalized === "ADMIN" || normalized === "STAFF" || normalized === "GUEST") {
    return normalized;
  }

  return "GUEST";
}

export function normalizeUser(value: unknown): AppUser {
  if (!value || typeof value !== "object") {
    return DEFAULT_GUEST_USER;
  }

  const candidate = value as Partial<AppUser>;
  return {
    name: typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : DEFAULT_GUEST_USER.name,
    email:
      typeof candidate.email === "string" && candidate.email.trim()
        ? candidate.email
        : DEFAULT_GUEST_USER.email,
    role: normalizeRole(candidate.role),
    accessLevel: canWrite(candidate.role) ? "write" : "read",
    profileImage: candidate.profileImage ?? null,
  };
}

export function getStoredUser(): AppUser {
  if (typeof window === "undefined") {
    return DEFAULT_GUEST_USER;
  }

  const storedUser = window.localStorage.getItem("user");
  if (!storedUser) {
    window.localStorage.setItem("user", JSON.stringify(DEFAULT_GUEST_USER));
    return DEFAULT_GUEST_USER;
  }

  try {
    const user = normalizeUser(JSON.parse(storedUser));
    window.localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch {
    window.localStorage.setItem("user", JSON.stringify(DEFAULT_GUEST_USER));
    return DEFAULT_GUEST_USER;
  }
}

export function setStoredUser(user: AppUser): AppUser {
  const normalizedUser = normalizeUser(user);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("user", JSON.stringify(normalizedUser));
  }
  return normalizedUser;
}

export function signInAsAdmin(): AppUser {
  const user = setStoredUser(DEFAULT_ADMIN_USER);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("token", "local-admin-session");
  }
  return user;
}

export function signOutToGuest(): AppUser {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("accessToken");
  }
  return setStoredUser(DEFAULT_GUEST_USER);
}

export function canWrite(role: UserRole | string | undefined): boolean {
  return WRITE_ROLES.has(normalizeRole(role));
}

export function canAdmin(role: UserRole | string | undefined): boolean {
  return normalizeRole(role) === "ADMIN";
}

export function isReadOnly(role: UserRole | string | undefined): boolean {
  return READ_ONLY_ROLES.has(normalizeRole(role));
}

export function authHeaders(): HeadersInit {
  const user = getStoredUser();
  const headers: Record<string, string> = {
    "X-User-Role": user.role,
    "X-User-Email": user.email,
  };
  if (typeof window !== "undefined") {
    const accessToken = window.localStorage.getItem("accessToken");
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return headers;
}
