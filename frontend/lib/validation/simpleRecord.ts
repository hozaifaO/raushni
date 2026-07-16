import { z } from "zod";
import { idString, isoDateString, isoDateTimeString, nullableEmail, nullableString } from "./common";

export const simpleRecordStatusSchema = z.enum([
  "draft",
  "active",
  "published",
  "closed",
  "archived",
]);

export const simpleRecordSchema = z.object({
  id: idString,
  module: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  status: simpleRecordStatusSchema,
  record_date: isoDateString,
  contact_name: nullableString,
  contact_email: nullableEmail,
  amount: z.number().nonnegative().nullable(),
  location: nullableString,
  notes: nullableString,
  created_at: isoDateTimeString,
  updated_at: isoDateTimeString,
});

export const simpleRecordListResponseSchema = z.object({
  items: z.array(simpleRecordSchema),
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
  archived: z.number().int().nonnegative(),
});

export const simpleRecordFormSchema = z.object({
  title: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(5).max(1200),
  status: simpleRecordStatusSchema,
  record_date: isoDateString,
  contact_name: z.string().trim().max(140),
  contact_email: z.string().trim().email().or(z.literal("")),
  amount: z.string().trim(),
  location: z.string().trim().max(180),
  notes: z.string().trim().max(1200),
});

export type SimpleRecordParsed = z.infer<typeof simpleRecordSchema>;
export type SimpleRecordListResponseParsed = z.infer<typeof simpleRecordListResponseSchema>;
