export type CmsProjectContent = {
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  rationale: string;
  location: string;
  duration: string;
  budget: string;
  beneficiaries: string;
  status: string;
  focusArea: string;
  coverImageUrl: string;
  proposalDocumentUrl: string;
  objectives: string[];
  activities: Array<{ title: string; phase?: string; text?: string }>;
  outcomes: string[];
  sdgs: string[];
  timeline: Array<{ quarter: string; milestone: string }>;
  budgetBreakdown: Array<{ head: string; amount: number }>;
};

const CMS_BASE_URL =
  process.env.CMS_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_CMS_URL ??
  "http://localhost:1337";

export const fallbackProjectContent: CmsProjectContent = {
  slug: "project-sparsh-watsan-muzaffarpur",
  title: "Project Sparsh: WATSAN Intervention Programme in Marginalized Schools",
  shortTitle: "Project Sparsh",
  summary: "A 12-month school WATSAN intervention for marginalized schools in Muzaffarpur, Bihar.",
  rationale: "The project addresses unsafe drinking water, poor sanitation, menstrual hygiene challenges, and hygiene-related absenteeism through infrastructure, awareness, and community ownership.",
  location: "Muzaffarpur District, Bihar",
  duration: "12 months",
  budget: "INR 48,11,136",
  beneficiaries: "2,500 school children, 100 teachers and staff, and 10,000+ community members",
  status: "proposed",
  focusArea: "Education, WATSAN, health, gender inclusion",
  coverImageUrl: "/assets/brand/raushni-banner.png",
  proposalDocumentUrl: "/cms/project-proposals/project-sparsh-watsan-muzaffarpur.docx",
  objectives: [
    "Install RO-based drinking water systems, gender-segregated toilets, and handwashing stations in 10 schools.",
    "Conduct hygiene awareness, MHM counselling, and teacher sensitization programmes.",
    "Build capacity for operation and maintenance.",
  ],
  activities: [],
  outcomes: [],
  sdgs: ["SDG 3", "SDG 4", "SDG 5", "SDG 6", "SDG 10"],
  timeline: [],
  budgetBreakdown: [],
};

async function fetchCmsJson(path: string) {
  try {
    const response = await fetch(`${CMS_BASE_URL}/api${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function getProjectContent(slug = "project-sparsh-watsan-muzaffarpur"): Promise<CmsProjectContent> {
  const payload = await fetchCmsJson(`/project-contents?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`);
  const attrs = payload?.data?.[0]?.attributes;
  if (!attrs) return fallbackProjectContent;
  return {
    ...fallbackProjectContent,
    slug: attrs.slug ?? fallbackProjectContent.slug,
    title: attrs.title ?? fallbackProjectContent.title,
    shortTitle: attrs.shortTitle ?? fallbackProjectContent.shortTitle,
    summary: attrs.summary ?? fallbackProjectContent.summary,
    rationale: attrs.rationale ?? fallbackProjectContent.rationale,
    location: attrs.location ?? fallbackProjectContent.location,
    duration: attrs.duration ?? fallbackProjectContent.duration,
    budget: attrs.budget ?? fallbackProjectContent.budget,
    beneficiaries: attrs.beneficiaries ?? fallbackProjectContent.beneficiaries,
    status: attrs.status ?? fallbackProjectContent.status,
    focusArea: attrs.focusArea ?? fallbackProjectContent.focusArea,
    coverImageUrl: attrs.coverImageUrl ?? fallbackProjectContent.coverImageUrl,
    proposalDocumentUrl: attrs.proposalDocumentUrl ?? fallbackProjectContent.proposalDocumentUrl,
    objectives: Array.isArray(attrs.objectives) ? attrs.objectives : fallbackProjectContent.objectives,
    activities: Array.isArray(attrs.activities) ? attrs.activities : fallbackProjectContent.activities,
    outcomes: Array.isArray(attrs.outcomes) ? attrs.outcomes : fallbackProjectContent.outcomes,
    sdgs: Array.isArray(attrs.sdgs) ? attrs.sdgs : fallbackProjectContent.sdgs,
    timeline: Array.isArray(attrs.timeline) ? attrs.timeline : fallbackProjectContent.timeline,
    budgetBreakdown: Array.isArray(attrs.budgetBreakdown) ? attrs.budgetBreakdown : fallbackProjectContent.budgetBreakdown,
  };
}
