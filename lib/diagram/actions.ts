"use server";

import { createClient } from "@/lib/supabase/server";
import { generateText, friendlyAIError } from "@/lib/ai/gemini";
import { stripWrappingCodeFence } from "@/lib/ai/output";
import { buildClassDiagramPrompt } from "@/lib/ai/prompts";
import {
  MIN_MERMAID_LENGTH,
  looksLikeClassDiagram,
  savedDiagramSchema,
} from "@/lib/diagram/schema";
import type { FeatureNode } from "@/types/database";

const DIAGRAM_GENERATION_BUDGET_MS = 50_000;
const DIAGRAM_ATTEMPTS = 2;
const DIAGRAM_TIMEOUT_MS = DIAGRAM_GENERATION_BUDGET_MS / DIAGRAM_ATTEMPTS;
const DIAGRAM_MAX_RETRIES = DIAGRAM_ATTEMPTS - 1;

const MIN_PRD_FOR_DIAGRAM = 200;

export async function generateClassDiagramAction(
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
  if ((project.idea_prompt?.trim().length ?? 0) < 10) {
    return { error: "Selesaikan step Prompt dulu." };
  }

  const [{ data: prd }, { data: productStructure }, { data: techStack }] = await Promise.all([
    supabase.from("prds").select("content_markdown").eq("project_id", projectId).maybeSingle(),
    supabase
      .from("product_structures")
      .select("structure")
      .eq("project_id", projectId)
      .maybeSingle(),
    supabase.from("tech_stacks").select("*").eq("project_id", projectId).maybeSingle(),
  ]);

  const prdMarkdown = prd?.content_markdown?.trim() ?? "";
  if (prdMarkdown.length < MIN_PRD_FOR_DIAGRAM) {
    return { error: "Buat PRD dulu sebelum menghasilkan diagram." };
  }

  const structure: FeatureNode[] = productStructure?.structure ?? [];

  let code: string;
  try {
    const { prompt, systemInstruction } = buildClassDiagramPrompt(prdMarkdown, structure, techStack);
    const raw = await generateText(prompt, systemInstruction, {
      timeoutMs: DIAGRAM_TIMEOUT_MS,
      maxRetries: DIAGRAM_MAX_RETRIES,
    });

    code = stripWrappingCodeFence(raw);

    if (code.length < MIN_MERMAID_LENGTH || !looksLikeClassDiagram(code)) {
      console.error("Class diagram AI response invalid:", code.slice(0, 200));
      return { error: "AI menghasilkan diagram yang tidak valid. Coba lagi." };
    }
  } catch (err) {
    return { error: friendlyAIError(err, "AI gagal menyusun diagram. Coba lagi.") };
  }

  const { error: upsertError } = await supabase
    .from("class_diagrams")
    .upsert(
      { project_id: projectId, mermaid_code: code, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };
  return {};
}

export async function saveClassDiagramAction(
  projectId: string,
  code: string
): Promise<{ error?: string }> {
  const parsed = savedDiagramSchema.safeParse(code);
  if (!parsed.success) {
    return { error: "Kode diagram melewati batas panjang maksimal." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("class_diagrams")
    .upsert(
      { project_id: projectId, mermaid_code: parsed.data, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (error) return { error: error.message };
  return {};
}
