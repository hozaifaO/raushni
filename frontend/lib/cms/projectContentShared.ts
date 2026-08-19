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

export const fallbackProjectContent: CmsProjectContent = {
  slug: "project-sparsh-watsan-muzaffarpur",
  title: "Project Sparsh: WATSAN Intervention Programme in Marginalized Schools",
  shortTitle: "Project Sparsh",
  summary: "A 12-month school WATSAN intervention for marginalized schools in Muzaffarpur, Bihar.",
  rationale:
    "The project addresses unsafe drinking water, poor sanitation, menstrual hygiene challenges, and hygiene-related absenteeism through infrastructure, awareness, and community ownership.",
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
