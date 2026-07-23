"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError } from "@/lib/ai/gemini";
import { buildPrdPrompt } from "@/lib/ai/prompts";
import { MIN_PRD_LENGTH, savedPrdSchema } from "@/lib/prd/schema";
import { findMissingSectionHeadings, isMissingOnlyTrailingSections } from "@/lib/prd/markdown";
import { stripWrappingCodeFence } from "@/lib/ai/output";
import type { FeatureNode, RequirementAnswer } from "@/types/database";

const PRD_GENERATION_BUDGET_MS = 50_000;
const PRD_ATTEMPTS = 2;
const PRD_TIMEOUT_MS = PRD_GENERATION_BUDGET_MS / PRD_ATTEMPTS;
const PRD_MAX_RETRIES = PRD_ATTEMPTS - 1;

export async function generatePrdAction(
  projectId: string,
  instruction?: string
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

  const [{ data: requirement }, { data: techStack }, { data: productStructure }] =
    await Promise.all([
      supabase
        .from("requirements")
        .select("questions_and_answers")
        .eq("project_id", projectId)
        .maybeSingle(),
      supabase.from("tech_stacks").select("*").eq("project_id", projectId).maybeSingle(),
      supabase
        .from("product_structures")
        .select("structure")
        .eq("project_id", projectId)
        .maybeSingle(),
    ]);

  const answers: RequirementAnswer[] = requirement?.questions_and_answers ?? [];
  const structure: FeatureNode[] = productStructure?.structure ?? [];

  let markdown: string;
  try {
    const { prompt, systemInstruction } = buildPrdPrompt(
      idea,
      answers,
      techStack,
      structure,
      instruction
    );
    const raw = await generateText(prompt, systemInstruction, {
      timeoutMs: PRD_TIMEOUT_MS,
      maxRetries: PRD_MAX_RETRIES,
    });

    markdown = stripWrappingCodeFence(raw);

    if (markdown.length < MIN_PRD_LENGTH) {
      console.error("PRD AI response too short:", markdown.length);
      return { error: "AI menghasilkan PRD yang terlalu pendek. Coba lagi." };
    }

    const missing = findMissingSectionHeadings(markdown);
    if (missing.length > 0) {
      console.error("PRD AI response missing sections:", missing);
      return {
        error: isMissingOnlyTrailingSections(missing)
          ? "AI menghasilkan PRD yang tidak lengkap. Coba lagi."
          : "AI menghasilkan format yang tidak terduga. Coba lagi.",
      };
    }
  } catch (err) {
    return { error: friendlyAIError(err, "AI gagal menyusun PRD. Coba lagi.") };
  }

  const { error: upsertError } = await supabase
    .from("prds")
    .upsert(
      { project_id: projectId, content_markdown: markdown, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };
  return {};
}

export async function savePrdAction(
  projectId: string,
  markdown: string
): Promise<{ error?: string }> {
  const parsed = savedPrdSchema.safeParse(markdown);
  if (!parsed.success) {
    return { error: "PRD melewati batas panjang maksimal." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("prds")
    .upsert(
      {
        project_id: projectId,
        content_markdown: parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" }
    );

  if (error) return { error: error.message };
  return {};
}
