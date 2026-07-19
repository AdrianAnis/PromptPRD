import { z } from "zod";

export const MAX_PRD_LENGTH = 60_000;
export const MIN_PRD_LENGTH = 400;

export const REQUIRED_SECTION_HEADINGS = [
  "Ikhtisar",
  "Latar Belakang Masalah",
  "Tujuan",
  "Persona Pengguna",
  "User Stories",
  "Kebutuhan Fungsional",
  "Kebutuhan Non-Fungsional",
  "Metrik Keberhasilan",
] as const;

export const savedPrdSchema = z.string().max(MAX_PRD_LENGTH);
