import { z } from "zod";
import { idString, isoDateTimeString, nullableString } from "./common";

export const designationStatusSchema = z.enum(["active", "inactive", "archived"]);

export const designationLevelSchema = z.enum([
  "board",
  "leadership",
  "management",
  "coordination",
  "field",
  "volunteer",
  "intern",
]);

export const designationSchema = z.object({
  id: idString,
  title: z.string().min(1),
  code: z.string().min(1),
  department: z.string().min(1),
  level: designationLevelSchema,
  status: designationStatusSchema,
  reports_to: nullableString,
  description: z.string().min(1),
  assignment_scope: z.string().min(1),
  responsibilities: z.array(z.string()),
  required_documents: z.array(z.string()),
  staff_assigned: z.number().int().nonnegative(),
  volunteer_slots: z.number().int().nonnegative(),
  sort_order: z.number().int().nonnegative(),
  cms_slug: nullableString,
  notes: nullableString,
  created_at: isoDateTimeString,
  updated_at: isoDateTimeString,
});

export const designationListResponseSchema = z.object({
  items: z.array(designationSchema),
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  archived: z.number().int().nonnegative(),
  assigned_staff: z.number().int().nonnegative(),
  open_slots: z.number().int().nonnegative(),
});

export const designationFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(30),
  department: z.string().trim().min(2).max(80),
  level: designationLevelSchema,
  status: designationStatusSchema,
  reports_to: z.string().trim().max(120),
  description: z.string().trim().min(10).max(700),
  assignment_scope: z.string().trim().min(4).max(160),
  responsibilities: z.string(),
  required_documents: z.string(),
  staff_assigned: z.string().trim(),
  volunteer_slots: z.string().trim(),
  sort_order: z.string().trim(),
  cms_slug: z.string().trim().max(120),
  notes: z.string().trim().max(500),
});

export type DesignationParsed = z.infer<typeof designationSchema>;
export type DesignationListResponseParsed = z.infer<typeof designationListResponseSchema>;
