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

export const DEFAULT_STAFF_USER: AppUser = {
  name: "Staff User",
  email: "staff@raushni.com",
  role: "STAFF",
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
    return DEFAULT_GUEST_USER;
  }

  try {
    return normalizeUser(JSON.parse(storedUser));
  } catch {
    window.localStorage.removeItem("user");
    return DEFAULT_GUEST_USER;
  }
}

export function setStoredUser(user: AppUser): AppUser {
  const normalizedUser = normalizeUser(user);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("user", JSON.stringify(normalizedUser));
    window.dispatchEvent(new CustomEvent("raushni:user-change", { detail: normalizedUser }));
  }
  return normalizedUser;
}

export function signInAsAdmin(): AppUser {
  // UI-only mirror for local demos. API auth goes through NextAuth session + BFF.
  return setStoredUser(DEFAULT_ADMIN_USER);
}

export function signOutToGuest(): AppUser {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("accessToken");
    window.localStorage.removeItem("user");
  }
  return DEFAULT_GUEST_USER;
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

/** @deprecated Client role headers are no longer used; the Next.js BFF asserts identity. */
export function authHeaders(): HeadersInit {
  return {};
}
