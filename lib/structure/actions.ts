"use server";

import { createClient } from "@/lib/supabase/server";
import { generateJSON, friendlyAIError } from "@/lib/ai/gemini";
import { buildProductStructurePrompt } from "@/lib/ai/prompts";
import { aiStructureSchema, savedStructureSchema } from "@/lib/structure/schema";
import { newId } from "@/lib/utils";
import type { FeatureNode, RequirementAnswer } from "@/types/database";

export async function generateProductStructureAction(
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

  const [{ data: requirement }, { data: techStack }] = await Promise.all([
    supabase
      .from("requirements")
      .select("questions_and_answers")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase.from("tech_stacks").select("*").eq("project_id", projectId).maybeSingle(),
  ]);

  const answers: RequirementAnswer[] = requirement?.questions_and_answers ?? [];

  let structure: FeatureNode[];
  try {
    const { prompt, systemInstruction } = buildProductStructurePrompt(idea, answers, techStack);
    const raw = await generateJSON<unknown>(prompt, systemInstruction);

    if (!Array.isArray(raw)) {
      console.error("Product structure AI response was not an array:", raw);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    const parsed = aiStructureSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Product structure AI response failed validation:", raw);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    structure = parsed.data.map((mod) => ({
      id: newId(),
      name: mod.name,
      children: mod.features.map((feature) => ({
        id: newId(),
        name: feature,
        children: [],
      })),
    }));
  } catch (err) {
    return { error: friendlyAIError(err, "AI gagal menyusun struktur. Coba lagi.") };
  }

  const { error: upsertError } = await supabase
    .from("product_structures")
    .upsert(
      { project_id: projectId, structure, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };
  return {};
}

export async function saveProductStructureAction(
  projectId: string,
  structure: FeatureNode[]
): Promise<{ error?: string }> {
  const parsed = savedStructureSchema.safeParse(structure);
  if (!parsed.success) return { error: "Struktur tidak valid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_structures")
    .upsert(
      { project_id: projectId, structure: parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (error) return { error: error.message };
  return {};
}
