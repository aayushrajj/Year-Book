export const APP_NAME = "Yearbook";

// Range allowed for joining_year. v1 launch focuses on the 2018-joined batch,
// but we accept a wider band so future cohorts work without code changes.
export const MIN_JOINING_YEAR = 2010;
export const MAX_JOINING_YEAR = new Date().getFullYear() + 1;

// Graduation is typically 4 years after joining (5 for some programs).
export const MIN_PROGRAM_LENGTH = 3;
export const MAX_PROGRAM_LENGTH = 7;

export const ONE_LINER_MAX = 200;
export const KNOWN_FOR_MAX = 140;
export const DISPLAY_NAME_MAX = 60;

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PHOTO_TARGET_MAX_BYTES = 600 * 1024; // post-compression target
export const PHOTO_TARGET_MAX_DIMENSION = 1600;

export const PROFILE_PHOTOS_BUCKET = "profile-photos";

export const STATES_OF_INDIA = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = (typeof STATES_OF_INDIA)[number];
