"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateJSON, AIGenerationError } from "@/lib/ai/gemini";
import { buildRequirementQuestionsPrompt } from "@/lib/ai/prompts";
import type { RequirementAnswer } from "@/types/database";

const ideaSchema = z.string().trim().min(10, "Ceritakan idemu sedikit lebih detail");

const generatedQuestionsSchema = z
  .array(
    z.object({
      category: z.string().trim().min(1),
      question: z.string().trim().min(1),
    })
  )
  .min(3)
  .max(10);

function friendlyAIError(err: unknown): string {
  if (err instanceof AIGenerationError) {
    return err.cause === "timeout"
      ? "AI butuh waktu terlalu lama merespons. Coba lagi."
      : "AI gagal menghasilkan pertanyaan. Coba lagi.";
  }
  return "Terjadi kesalahan tak terduga. Coba lagi.";
}

export async function generateRequirementQuestionsAction(
  projectId: string,
  ideaPrompt: string,
  options?: { force?: boolean }
): Promise<{ error?: string }> {
  const parsedIdea = ideaSchema.safeParse(ideaPrompt);
  if (!parsedIdea.success) {
    return { error: parsedIdea.error.issues[0]?.message ?? "Idea tidak valid" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) return { error: "Project not found" };

  if (!options?.force) {
    const { data: existing } = await supabase
      .from("requirements")
      .select("questions_and_answers")
      .eq("project_id", projectId)
      .maybeSingle();

    const existingQuestions = existing?.questions_and_answers;
    const hasQuestions = Array.isArray(existingQuestions) && existingQuestions.length > 0;

    if (hasQuestions) {
      const { error: advanceError } = await supabase
        .from("projects")
        .update({
          idea_prompt: parsedIdea.data,
          current_step: "requirement",
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      if (advanceError) return { error: advanceError.message };
      return {};
    }
  }

  let questions: RequirementAnswer[];
  try {
    const { prompt, systemInstruction } = buildRequirementQuestionsPrompt(parsedIdea.data);
    const raw = await generateJSON<unknown>(prompt, systemInstruction);
    const parsed = generatedQuestionsSchema.safeParse(raw);

    if (!parsed.success) {
      console.error("Requirement questions AI response failed validation:", raw);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    questions = parsed.data.map((q) => ({ ...q, answer: "" }));
  } catch (err) {
    return { error: friendlyAIError(err) };
  }

  const { error: upsertError } = await supabase
    .from("requirements")
    .upsert(
      { project_id: projectId, questions_and_answers: questions, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };

  // Unconditionally advances current_step to "requirement" and snapshots the
  // exact idea text that was analyzed. Only "prompt" -> "requirement" exists
  // today; invalidating downstream AI artifacts on a later regenerate is a
  // Phase 2+ concern once "tech"/"structure" etc. actually have content.
  const { error: projectUpdateError } = await supabase
    .from("projects")
    .update({ idea_prompt: parsedIdea.data, current_step: "requirement", updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (projectUpdateError) return { error: projectUpdateError.message };

  return {};
}

export async function saveRequirementAnswersAction(
  projectId: string,
  answers: RequirementAnswer[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("requirements")
    .update(
      { questions_and_answers: answers, updated_at: new Date().toISOString() },
      { count: "exact" }
    )
    .eq("project_id", projectId);

  if (error) return { error: error.message };
  if (!count) return { error: "Requirement tidak ditemukan" };
  return {};
}
