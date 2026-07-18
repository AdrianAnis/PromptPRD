"use server";

import { createClient } from "@/lib/supabase/server";
import { generateJSON, friendlyAIError } from "@/lib/ai/gemini";
import { buildTechRecommendationPrompt } from "@/lib/ai/prompts";
import { TECH_CATEGORIES, TECH_OPTIONS, type TechCategory } from "@/lib/tech/options";
import type { RequirementAnswer } from "@/types/database";

type TechFields = Record<TechCategory, string | null>;

const MIN_UNAMBIGUOUS_SUBSTRING_LEN = 4;

function coerceToOption(category: TechCategory, value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const options = TECH_OPTIONS[category];
  const exact = options.find((o) => o === trimmed);
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  const ci = options.find((o) => o.toLowerCase() === lower);
  if (ci) return ci;

  if (lower.length >= MIN_UNAMBIGUOUS_SUBSTRING_LEN) {
    const partial = options.find((o) => {
      const ol = o.toLowerCase();
      if (ol.length < MIN_UNAMBIGUOUS_SUBSTRING_LEN) return false;
      return ol.includes(lower) || lower.includes(ol);
    });
    if (partial) return partial;
  }

  console.warn(`Tech recommendation: dropping unmatched ${category} value:`, value);
  return null;
}

export async function generateTechRecommendationAction(
  projectId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("idea_prompt")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) return { error: "Project not found" };
  const idea = project.idea_prompt?.trim() ?? "";
  if (idea.length < 10) return { error: "Selesaikan step Prompt dulu." };

  const { data: requirement } = await supabase
    .from("requirements")
    .select("questions_and_answers")
    .eq("project_id", projectId)
    .maybeSingle();
  const answers: RequirementAnswer[] = requirement?.questions_and_answers ?? [];

  let fields: TechFields;
  try {
    const { prompt, systemInstruction } = buildTechRecommendationPrompt(idea, answers, TECH_OPTIONS);
    const raw = await generateJSON<Record<string, unknown>>(prompt, systemInstruction);

    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      console.error("Tech recommendation AI response was not an object:", raw);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    fields = Object.fromEntries(
      TECH_CATEGORIES.map((cat) => [cat, coerceToOption(cat, raw[cat])])
    ) as TechFields;

    if (TECH_CATEGORIES.every((cat) => fields[cat] === null)) {
      console.error("Tech recommendation coerced every field to null:", raw);
      return { error: "AI gagal merekomendasikan teknologi. Coba lagi." };
    }
  } catch (err) {
    return { error: friendlyAIError(err, "AI gagal merekomendasikan teknologi. Coba lagi.") };
  }

  const { error: upsertError } = await supabase
    .from("tech_stacks")
    .upsert(
      { project_id: projectId, ...fields, source: "ai", updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };
  return {};
}

export async function saveTechStackAction(
  projectId: string,
  fields: TechFields
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const patch = Object.fromEntries(
    TECH_CATEGORIES.map((cat) => [cat, fields[cat] || null])
  ) as TechFields;

  const { error } = await supabase
    .from("tech_stacks")
    .upsert(
      { project_id: projectId, ...patch, source: "manual", updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (error) return { error: error.message };
  return {};
}
