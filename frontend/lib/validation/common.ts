import { z } from "zod";

/** ISO date (YYYY-MM-DD) or datetime string from the API. */
export const isoDateString = z.string().min(1);

/** ISO datetime string from the API. */
export const isoDateTimeString = z.string().min(1);

/** UUID string as returned by FastAPI. */
export const idString = z.string().uuid();

export const nullableString = z.string().nullable();
export const nullableEmail = z.union([z.string().email(), z.null()]);
