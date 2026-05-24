import { z } from "zod";
import {
  DISPLAY_NAME_MAX,
  KNOWN_FOR_MAX,
  MAX_JOINING_YEAR,
  MAX_PROGRAM_LENGTH,
  MIN_JOINING_YEAR,
  MIN_PROGRAM_LENGTH,
  ONE_LINER_MAX,
  PHOTO_ALLOWED_TYPES,
  PHOTO_MAX_BYTES,
  STATES_OF_INDIA,
} from "./constants";

export const emailLocalpartSchema = z
  .string()
  .min(1, "Required")
  .max(64, "Too long")
  .regex(/^[a-zA-Z0-9._%+-]+$/, "Invalid characters in email")
  .transform((s) => s.toLowerCase());

export const collegeSlugSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]*$/i, "Invalid college slug")
  .max(40);

export const socialsSchema = z
  .object({
    instagram: z.string().max(40).optional().or(z.literal("")),
    linkedin: z.string().max(80).optional().or(z.literal("")),
    github: z.string().max(40).optional().or(z.literal("")),
    x: z.string().max(40).optional().or(z.literal("")),
  })
  .transform((s) => ({
    instagram: trimHandle(s.instagram),
    linkedin: trimLinkedin(s.linkedin),
    github: trimHandle(s.github),
    x: trimHandle(s.x),
  }));

function trimHandle(v: string | undefined) {
  if (!v) return undefined;
  const t = v.trim().replace(/^@/, "");
  return t === "" ? undefined : t;
}

function trimLinkedin(v: string | undefined) {
  if (!v) return undefined;
  const t = v.trim().replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/i, "");
  return t === "" ? undefined : t.replace(/\/$/, "");
}

export const profileFormSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(DISPLAY_NAME_MAX),
  oneLiner: z.string().max(ONE_LINER_MAX, `Max ${ONE_LINER_MAX} characters`).default(""),
  knownFor: z.string().max(KNOWN_FOR_MAX, `Max ${KNOWN_FOR_MAX} characters`).default(""),
  branchId: z.string().uuid("Pick a branch"),
  joiningYear: z.coerce
    .number()
    .int()
    .min(MIN_JOINING_YEAR)
    .max(MAX_JOINING_YEAR),
  graduatingYear: z.coerce
    .number()
    .int()
    .min(MIN_JOINING_YEAR + MIN_PROGRAM_LENGTH)
    .max(MAX_JOINING_YEAR + MAX_PROGRAM_LENGTH),
  currentState: z
    .enum(STATES_OF_INDIA)
    .optional()
    .nullable(),
  currentCity: z.string().max(80).optional().nullable(),
  socials: socialsSchema.default({} as never),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

export const photoFileSchema = z
  .instanceof(File)
  .refine((f) => f.size <= PHOTO_MAX_BYTES, "File is larger than 5 MB")
  .refine(
    (f) => (PHOTO_ALLOWED_TYPES as readonly string[]).includes(f.type),
    "Only JPEG, PNG, or WebP",
  );
