import type { UserRole } from "@/types/models/user";

export type UserStatus = "active" | "invited" | "suspended";

export type UserAccount = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  access_level: "read" | "write";
  last_login_at: string | null;
  profile_image: string | null;
};

export type RoleAccess = {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
  can_write: boolean;
  is_admin: boolean;
};

export type PlatformSettings = {
  organization_name: string;
  support_email: string;
  cms_url: string;
  timezone: string;
  receipt_prefix: string;
  public_donations_enabled: boolean;
  maintenance_mode: boolean;
  theme_name: string;
  primary_color: string;
  accent_color: string;
  header_theme: "light" | "dark" | "brand";
  footer_theme: "light" | "dark" | "brand";
  page_background: string;
  surface_radius: string;
  logo_diameter: string;
  public_logo_url: string;
  stamp_logo_url: string;
};

export type AccountProfile = {
  user: UserAccount;
  permissions: string[];
  role: RoleAccess;
  session_started_at: string;
  auth_mode: string;
};

export type SettingsDashboard = {
  users: UserAccount[];
  roles: RoleAccess[];
  platform: PlatformSettings;
  updated_at: string;
};

export type UserAccountUpdate = {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
};
