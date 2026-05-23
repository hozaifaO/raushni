"use client";

import { CalendarDays, FileText, FolderKanban, IndianRupee, MapPin, Plus, RefreshCw, School, Search, Target, Trash2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canWrite, getStoredUser } from "@/lib/auth/permissions";
import { fallbackProjectContent, type CmsProjectContent } from "@/lib/cms/projectContent";
import { createProject, deleteProject, listProjects, updateProject } from "@/services/api/projects";
import type { Project, ProjectFormValues, ProjectListResponse, ProjectStatus } from "@/types/models/project";

type FilterStatus = ProjectStatus | "all";

const emptyList: ProjectListResponse = {
  items: [],
  total: 0,
  proposed: 0,
  active: 0,
  completed: 0,
  total_budget: 0,
  total_beneficiaries: 0,
};

const emptyForm: ProjectFormValues = {
  title: "Project Sparsh: WATSAN Intervention Programme",
  slug: "project-sparsh-watsan-muzaffarpur",
  summary: fallbackProjectContent.summary,
  location: "Muzaffarpur District, Bihar",
  focus_area: "Education, WATSAN, health, gender inclusion",
  status: "proposed",
  priority: "high",
  start_date: "2026-06-01",
  end_date: "2027-05-31",
  budget: "4811136",
  currency: "INR",
  beneficiaries: "2500",
  schools_targeted: "10",
  progress: "12",
  manager: "Project Manager",
  donor: "CSR / institutional partner",
  proposal_url: "/cms/project-proposals/project-sparsh-watsan-muzaffarpur.docx",
  cms_slug: "project-sparsh-watsan-muzaffarpur",
  objectives: fallbackProjectContent.objectives.join("\n"),
  milestones: "Baseline assessment and school selection\nInfrastructure procurement and installation\nHygiene, MHM, teacher, and community sessions\nEndline assessment and closure report",
  risks: "Seasonal floods may affect infrastructure timelines\nLong-term maintenance requires school and community ownership",
  notes: "Seeded from the Project Sparsh WATSAN proposal.",
};

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function projectToForm(project: Project): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    location: project.location,
    focus_area: project.focus_area,
    status: project.status,
    priority: project.priority,
    start_date: project.start_date,
    end_date: project.end_date,
    budget: String(project.budget),
    currency: project.currency,
    beneficiaries: String(project.beneficiaries),
    schools_targeted: String(project.schools_targeted),
    progress: String(project.progress),
    manager: project.manager,
    donor: project.donor ?? "",
    proposal_url: project.proposal_url ?? "",
    cms_slug: project.cms_slug ?? "",
    objectives: project.objectives.join("\n"),
    milestones: project.milestones.join("\n"),
    risks: project.risks.join("\n"),
    notes: project.notes ?? "",
  };
}

export default function Page() {
  const [projects, setProjects] = useState<ProjectListResponse>(emptyList);
  const [cmsProject, setCmsProject] = useState<CmsProjectContent>(fallbackProjectContent);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [form, setForm] = useState<ProjectFormValues>(emptyForm);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProjects(await listProjects({ search, status }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    setReadOnly(!canWrite(getStoredUser().role));
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadCmsContent() {
      try {
        const response = await fetch("/cms/api/project-contents?filters[slug][$eq]=project-sparsh-watsan-muzaffarpur&populate=*", {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const attrs = (await response.json())?.data?.[0]?.attributes;
        if (!attrs) return;
        setCmsProject({
          ...fallbackProjectContent,
          ...attrs,
          objectives: Array.isArray(attrs.objectives) ? attrs.objectives : fallbackProjectContent.objectives,
          activities: Array.isArray(attrs.activities) ? attrs.activities : fallbackProjectContent.activities,
          outcomes: Array.isArray(attrs.outcomes) ? attrs.outcomes : fallbackProjectContent.outcomes,
          sdgs: Array.isArray(attrs.sdgs) ? attrs.sdgs : fallbackProjectContent.sdgs,
          timeline: Array.isArray(attrs.timeline) ? attrs.timeline : fallbackProjectContent.timeline,
          budgetBreakdown: Array.isArray(attrs.budgetBreakdown) ? attrs.budgetBreakdown : fallbackProjectContent.budgetBreakdown,
        });
      } catch (requestError) {
        if (!controller.signal.aborted) console.warn("Unable to load CMS project proposal", requestError);
      }
    }
    void loadCmsContent();
    return () => controller.abort();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Total projects", value: projects.total, icon: FolderKanban },
      { label: "Active", value: projects.active, icon: Target },
      { label: "Budget", value: money(projects.total_budget), icon: IndianRupee },
      { label: "Beneficiaries", value: projects.total_beneficiaries.toLocaleString("en-IN"), icon: School },
    ],
    [projects],
  );

  const updateField = <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openCreate = () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (project: Project) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setEditing(project);
    setForm(projectToForm(project));
    setIsFormOpen(true);
  };

  const submit = async () => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editing) {
        await updateProject(editing.id, form);
      } else {
        await createProject(form);
      }
      setIsFormOpen(false);
      setEditing(null);
      await loadProjects();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save project.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeProject = async (project: Project) => {
    if (readOnly) {
      setError("Guest users have read-only access.");
      return;
    }
    if (!window.confirm(`Delete project ${project.title}?`)) return;
    await deleteProject(project.id);
    await loadProjects();
  };

  return (
    <section className="min-h-[calc(100vh-7rem)] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-600">CMS proposal + dashboard workflow</p>
              <h1 className="mt-2 text-3xl font-black text-gray-950">{cmsProject.shortTitle}: Projects</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{cmsProject.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {cmsProject.sdgs.slice(0, 6).map((sdg) => (
                  <span key={sdg} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{sdg}</span>
                ))}
              </div>
            </div>
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
              <Info icon={MapPin} label="Location" value={cmsProject.location} />
              <Info icon={CalendarDays} label="Duration" value={cmsProject.duration} />
              <Info icon={IndianRupee} label="Budget" value={cmsProject.budget} />
              <Info icon={School} label="Beneficiaries" value={cmsProject.beneficiaries} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <Icon size={20} className="text-orange-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-gray-500">{item.label}</p>
                <p className="mt-1 text-2xl font-black text-gray-950">{item.value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-h-11 w-full rounded-lg border border-gray-300 pl-10 pr-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" placeholder="Search projects, location, focus area" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value as FilterStatus)} className="min-h-11 rounded-lg border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 lg:w-44">
            <option value="all">All statuses</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On hold</option>
          </select>
          <button type="button" onClick={() => void loadProjects()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <RefreshCw size={18} aria-hidden="true" />
            Refresh
          </button>
          {!readOnly && (
            <button type="button" onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700">
              <Plus size={18} aria-hidden="true" />
              New project
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        {isFormOpen && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-gray-950">{editing ? "Edit project" : "Create project"}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} wide />
              <Field label="Slug" value={form.slug} onChange={(value) => updateField("slug", value)} />
              <Field label="Location" value={form.location} onChange={(value) => updateField("location", value)} />
              <Field label="Focus area" value={form.focus_area} onChange={(value) => updateField("focus_area", value)} />
              <Field label="Start date" value={form.start_date} onChange={(value) => updateField("start_date", value)} type="date" />
              <Field label="End date" value={form.end_date} onChange={(value) => updateField("end_date", value)} type="date" />
              <Field label="Budget" value={form.budget} onChange={(value) => updateField("budget", value)} type="number" />
              <Field label="Beneficiaries" value={form.beneficiaries} onChange={(value) => updateField("beneficiaries", value)} type="number" />
              <Field label="Schools targeted" value={form.schools_targeted} onChange={(value) => updateField("schools_targeted", value)} type="number" />
              <Field label="Progress %" value={form.progress} onChange={(value) => updateField("progress", value)} type="number" />
              <label>
                <span className="text-sm font-semibold text-gray-800">Status</span>
                <select value={form.status} onChange={(event) => updateField("status", event.target.value as ProjectStatus)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3">
                  <option value="draft">Draft</option>
                  <option value="proposed">Proposed</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On hold</option>
                </select>
              </label>
              <Field label="Manager" value={form.manager} onChange={(value) => updateField("manager", value)} />
              <TextArea label="Summary" value={form.summary} onChange={(value) => updateField("summary", value)} wide />
              <TextArea label="Objectives (one per line)" value={form.objectives} onChange={(value) => updateField("objectives", value)} />
              <TextArea label="Milestones (one per line)" value={form.milestones} onChange={(value) => updateField("milestones", value)} />
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => void submit()} disabled={submitting} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Saving..." : "Save project"}</button>
              <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm font-semibold text-gray-600">Loading projects</div>
          ) : projects.items.map((project) => (
            <article key={project.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-gray-950">{project.title}</h2>
                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold capitalize text-orange-700">{project.status.replace("_", " ")}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{project.summary}</p>
                  <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-4">
                    <Info icon={MapPin} label="Location" value={project.location} />
                    <Info icon={IndianRupee} label="Budget" value={money(project.budget)} />
                    <Info icon={School} label="Schools" value={String(project.schools_targeted)} />
                    <Info icon={Target} label="Progress" value={`${project.progress}%`} />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${project.progress}%` }} />
                  </div>
                  {project.objectives.length > 0 && (
                    <div className="mt-4 grid gap-2 md:grid-cols-2">
                      {project.objectives.slice(0, 4).map((objective) => (
                        <p key={objective} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">{objective}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                  {project.proposal_url && (
                    <a href={project.proposal_url} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-gray-700">
                      <FileText size={16} aria-hidden="true" />
                      Proposal
                    </a>
                  )}
                  {!readOnly && (
                    <>
                      <button type="button" onClick={() => openEdit(project)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700">Edit</button>
                      <button type="button" onClick={() => void removeProject(project)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700">
                        <Trash2 size={16} aria-hidden="true" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="CMS proposal activities">
            {cmsProject.activities.slice(0, 6).map((activity) => (
              <div key={activity.title} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold uppercase text-orange-600">{activity.phase}</p>
                <h3 className="mt-1 font-bold text-gray-950">{activity.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{activity.text}</p>
              </div>
            ))}
          </Panel>
          <Panel title="Expected outcomes">
            {cmsProject.outcomes.slice(0, 8).map((outcome) => (
              <p key={outcome} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">{outcome}</p>
            ))}
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <Icon size={16} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
      <div>
        <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
        <p className="mt-0.5 font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", wide = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}

function TextArea({ label, value, onChange, wide = false }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <label className={wide ? "md:col-span-2" : undefined}>
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
    </label>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h2 className="text-xl font-black text-gray-950">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}
