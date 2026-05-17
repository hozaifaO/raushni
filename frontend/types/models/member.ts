export type MemberStatus = "active" | "inactive" | "pending";

export type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: string;
  status: MemberStatus;
  joined_on: string;
  address: string | null;
  emergency_contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberFormValues = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: MemberStatus;
  joined_on: string;
  address: string;
  emergency_contact: string;
  notes: string;
};

export type MemberListResponse = {
  items: Member[];
  total: number;
  active: number;
  inactive: number;
  pending: number;
};
