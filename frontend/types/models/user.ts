export type UserRole = "ADMIN" | "STAFF" | "GUEST";

export type AppUser = {
  name: string;
  email: string;
  role: UserRole;
  accessLevel?: "read" | "write";
  profileImage?: string | null;
};
