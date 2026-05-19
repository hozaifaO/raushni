import type { UserRole } from "@/types/models/user";

export const USER_ROLES: Record<UserRole, string> = {
  ADMIN: "Administrator",
  STAFF: "Staff",
  GUEST: "Guest",
};

export const DEFAULT_USER_ROLE: UserRole = "GUEST";
