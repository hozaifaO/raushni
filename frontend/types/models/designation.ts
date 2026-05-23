export type DesignationStatus = "active" | "inactive" | "archived";
export type DesignationLevel = "board" | "leadership" | "management" | "coordination" | "field" | "volunteer" | "intern";

export type Designation = {
  id: string;
  title: string;
  code: string;
  department: string;
  level: DesignationLevel;
  status: DesignationStatus;
  reports_to: string | null;
  description: string;
  assignment_scope: string;
  responsibilities: string[];
  required_documents: string[];
  staff_assigned: number;
  volunteer_slots: number;
  sort_order: number;
  cms_slug: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DesignationFormValues = {
  title: string;
  code: string;
  department: string;
  level: DesignationLevel;
  status: DesignationStatus;
  reports_to: string;
  description: string;
  assignment_scope: string;
  responsibilities: string;
  required_documents: string;
  staff_assigned: string;
  volunteer_slots: string;
  sort_order: string;
  cms_slug: string;
  notes: string;
};

export type DesignationListResponse = {
  items: Designation[];
  total: number;
  active: number;
  inactive: number;
  archived: number;
  assigned_staff: number;
  open_slots: number;
};
