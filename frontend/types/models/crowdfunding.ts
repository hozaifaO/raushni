export type CampaignStatus = "draft" | "review" | "published" | "paused" | "funded" | "closed";
export type CampaignCategory = "education" | "health" | "watsan" | "relief" | "livelihood" | "other";

export type Campaign = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: CampaignCategory;
  status: CampaignStatus;
  target_amount: number;
  amount_raised: number;
  remaining_amount: number;
  progress_percent: number;
  donation_count: number;
  currency: string;
  start_date: string;
  end_date: string;
  location: string;
  beneficiary_count: number;
  cover_image_url: string | null;
  public_url: string | null;
  cms_slug: string | null;
  owner: string;
  highlights: string[];
  impact_metrics: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignFormValues = {
  title: string;
  slug: string;
  summary: string;
  category: CampaignCategory;
  status: CampaignStatus;
  target_amount: string;
  amount_raised: string;
  currency: string;
  start_date: string;
  end_date: string;
  location: string;
  beneficiary_count: string;
  cover_image_url: string;
  public_url: string;
  cms_slug: string;
  owner: string;
  highlights: string;
  impact_metrics: string;
  notes: string;
};

export type CampaignDonationFormValues = {
  donor_name: string;
  amount: string;
  payment_method: string;
  receipt_no: string;
  note: string;
};

export type CampaignListResponse = {
  items: Campaign[];
  total: number;
  draft: number;
  published: number;
  funded: number;
  total_target: number;
  total_raised: number;
  overall_progress_percent: number;
};
