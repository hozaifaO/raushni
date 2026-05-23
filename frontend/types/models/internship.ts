export type InternshipMode = "virtual" | "hybrid" | "in_person";
export type InternshipStatus = "draft" | "published" | "closed";
export type InternshipApplicationStatus = "registered" | "shortlisted" | "active" | "completed" | "rejected";
export type CertificateStatus = "draft" | "issued" | "revoked";

export type InternshipAnnouncement = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  event_date: string;
  event_time: string;
  location: string;
  mode: InternshipMode;
  status: InternshipStatus;
  poster_url: string;
  apply_url: string;
  github_url: string;
  contact_phone: string;
  benefits: string[];
  tracks: string[];
  eligibility: string[];
  created_at: string;
  updated_at: string;
};

export type InternshipApplication = {
  id: string;
  announcement_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  college: string;
  course: string;
  track: string;
  github_url: string | null;
  portfolio_url: string | null;
  motivation: string;
  status: InternshipApplicationStatus;
  completion_notes: string | null;
  registration_number: string;
  certificate_id: string | null;
  created_at: string;
  updated_at: string;
};

export type InternshipCertificate = {
  id: string;
  application_id: string;
  certificate_number: string;
  verification_code: string;
  verification_url: string;
  participant_name: string;
  program_title: string;
  track: string;
  issued_at: string;
  status: CertificateStatus;
  qr_code_svg: string;
  html_template: string;
};

export type InternshipListResponse = {
  announcements: InternshipAnnouncement[];
  applications: InternshipApplication[];
  certificates: InternshipCertificate[];
  total_announcements: number;
  total_applications: number;
  registered: number;
  active: number;
  completed: number;
  certificates_issued: number;
};

export type InternshipApplicationFormValues = {
  announcement_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  college: string;
  course: string;
  track: string;
  github_url: string;
  portfolio_url: string;
  motivation: string;
  status: InternshipApplicationStatus;
  completion_notes: string;
};

export type InternshipAnnouncementFormValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  event_date: string;
  event_time: string;
  location: string;
  mode: InternshipMode;
  status: InternshipStatus;
  poster_url: string;
  apply_url: string;
  github_url: string;
  contact_phone: string;
  benefits: string;
  tracks: string;
  eligibility: string;
};
