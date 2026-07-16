import { z } from "zod";
import { idString, isoDateString, isoDateTimeString, nullableEmail, nullableString } from "./common";

export const memberStatusSchema = z.enum(["active", "inactive", "pending"]);

export const memberSchema = z.object({
  id: idString,
  full_name: z.string().min(1),
  email: nullableEmail,
  phone: z.string().min(1),
  role: z.string().min(1),
  status: memberStatusSchema,
  joined_on: isoDateString,
  address: nullableString,
  emergency_contact: nullableString,
  notes: nullableString,
  created_at: isoDateTimeString,
  updated_at: isoDateTimeString,
});

export const memberListResponseSchema = z.object({
  items: z.array(memberSchema),
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
});

export const memberFormSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().min(7).max(20),
  role: z.string().trim().min(2).max(80),
  status: memberStatusSchema,
  joined_on: isoDateString,
  address: z.string().trim().max(240),
  emergency_contact: z.string().trim().max(120),
  notes: z.string().trim().max(500),
});

export type MemberParsed = z.infer<typeof memberSchema>;
export type MemberListResponseParsed = z.infer<typeof memberListResponseSchema>;
