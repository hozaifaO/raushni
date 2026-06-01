export type SimpleRecordStatus = "draft" | "active" | "published" | "closed" | "archived";

export type SimpleRecord = {
  id: string;
  module: string;
  title: string;
  category: string;
  summary: string;
  status: SimpleRecordStatus;
  record_date: string;
  contact_name: string | null;
  contact_email: string | null;
  amount: number | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SimpleRecordFormValues = {
  title: string;
  category: string;
  summary: string;
  status: SimpleRecordStatus;
  record_date: string;
  contact_name: string;
  contact_email: string;
  amount: string;
  location: string;
  notes: string;
};

export type SimpleRecordListResponse = {
  items: SimpleRecord[];
  total: number;
  active: number;
  published: number;
  archived: number;
};
