export type ProjectStatus = "draft" | "proposed" | "approved" | "active" | "completed" | "on_hold";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  location: string;
  focus_area: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  beneficiaries: number;
  schools_targeted: number;
  progress: number;
  manager: string;
  donor: string | null;
  proposal_url: string | null;
  cms_slug: string | null;
  objectives: string[];
  milestones: string[];
  risks: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectFormValues = {
  title: string;
  slug: string;
  summary: string;
  location: string;
  focus_area: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string;
  end_date: string;
  budget: string;
  currency: string;
  beneficiaries: string;
  schools_targeted: string;
  progress: string;
  manager: string;
  donor: string;
  proposal_url: string;
  cms_slug: string;
  objectives: string;
  milestones: string;
  risks: string;
  notes: string;
};

export type ProjectListResponse = {
  items: Project[];
  total: number;
  proposed: number;
  active: number;
  completed: number;
  total_budget: number;
  total_beneficiaries: number;
};
