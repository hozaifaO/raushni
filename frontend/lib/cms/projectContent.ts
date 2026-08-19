import { cmsFetchJson } from "@/lib/cms/client";
import {
  fallbackProjectContent,
  type CmsProjectContent,
} from "@/lib/cms/projectContentShared";

export type { CmsProjectContent } from "@/lib/cms/projectContentShared";
export { fallbackProjectContent } from "@/lib/cms/projectContentShared";

type CmsListPayload = {
  data?: Array<{ attributes?: Record<string, unknown> }>;
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

export async function getProjectContent(
  slug = "project-sparsh-watsan-muzaffarpur",
): Promise<CmsProjectContent> {
  const payload = (await cmsFetchJson(
    `/project-contents?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
  )) as CmsListPayload | null;
  const attrs = payload?.data?.[0]?.attributes;
  if (!attrs) return fallbackProjectContent;
  return {
    ...fallbackProjectContent,
    slug: asString(attrs.slug, fallbackProjectContent.slug),
    title: asString(attrs.title, fallbackProjectContent.title),
    shortTitle: asString(attrs.shortTitle, fallbackProjectContent.shortTitle),
    summary: asString(attrs.summary, fallbackProjectContent.summary),
    rationale: asString(attrs.rationale, fallbackProjectContent.rationale),
    location: asString(attrs.location, fallbackProjectContent.location),
    duration: asString(attrs.duration, fallbackProjectContent.duration),
    budget: asString(attrs.budget, fallbackProjectContent.budget),
    beneficiaries: asString(attrs.beneficiaries, fallbackProjectContent.beneficiaries),
    status: asString(attrs.status, fallbackProjectContent.status),
    focusArea: asString(attrs.focusArea, fallbackProjectContent.focusArea),
    coverImageUrl: asString(attrs.coverImageUrl, fallbackProjectContent.coverImageUrl),
    proposalDocumentUrl: asString(
      attrs.proposalDocumentUrl,
      fallbackProjectContent.proposalDocumentUrl,
    ),
    objectives: Array.isArray(attrs.objectives)
      ? (attrs.objectives as string[])
      : fallbackProjectContent.objectives,
    activities: Array.isArray(attrs.activities)
      ? (attrs.activities as CmsProjectContent["activities"])
      : fallbackProjectContent.activities,
    outcomes: Array.isArray(attrs.outcomes)
      ? (attrs.outcomes as string[])
      : fallbackProjectContent.outcomes,
    sdgs: Array.isArray(attrs.sdgs) ? (attrs.sdgs as string[]) : fallbackProjectContent.sdgs,
    timeline: Array.isArray(attrs.timeline)
      ? (attrs.timeline as CmsProjectContent["timeline"])
      : fallbackProjectContent.timeline,
    budgetBreakdown: Array.isArray(attrs.budgetBreakdown)
      ? (attrs.budgetBreakdown as CmsProjectContent["budgetBreakdown"])
      : fallbackProjectContent.budgetBreakdown,
  };
}
