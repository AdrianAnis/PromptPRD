"use server";

import { createClient } from "@/lib/supabase/server";
import { generateJSON, friendlyAIError } from "@/lib/ai/gemini";
import { buildTaskListPrompt } from "@/lib/ai/prompts";
import { aiTaskListSchema } from "@/lib/tasks/schema";
import { MIN_PRD_FOR_DOWNSTREAM } from "@/lib/prd/schema";
import { newId } from "@/lib/utils";
import type { Epic, FeatureNode } from "@/types/database";

const TASKS_GENERATION_BUDGET_MS = 50_000;
const TASKS_ATTEMPTS = 2;
const TASKS_TIMEOUT_MS = TASKS_GENERATION_BUDGET_MS / TASKS_ATTEMPTS;
const TASKS_MAX_RETRIES = TASKS_ATTEMPTS - 1;

export async function generateTaskListAction(projectId: string): Promise<{ error?: string }> {
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

  const [{ data: prd }, { data: productStructure }] = await Promise.all([
    supabase.from("prds").select("content_markdown").eq("project_id", projectId).maybeSingle(),
    supabase
      .from("product_structures")
      .select("structure")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  const prdMarkdown = prd?.content_markdown?.trim() ?? "";
  if (prdMarkdown.length < MIN_PRD_FOR_DOWNSTREAM) {
    return { error: "Buat PRD dulu sebelum menghasilkan daftar task." };
  }

  const structure: FeatureNode[] = productStructure?.structure ?? [];

  let epics: Epic[];
  try {
    const { prompt, systemInstruction } = buildTaskListPrompt(prdMarkdown, structure);
    const raw = await generateJSON<unknown>(prompt, systemInstruction, {
      timeoutMs: TASKS_TIMEOUT_MS,
      maxRetries: TASKS_MAX_RETRIES,
    });

    if (!Array.isArray(raw)) {
      console.error("Task list AI response was not an array:", raw);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    const parsed = aiTaskListSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Task list AI response failed validation:", parsed.error.issues);
      return { error: "AI menghasilkan format yang tidak terduga. Coba lagi." };
    }

    epics = parsed.data.map((epic) => ({
      id: newId(),
      title: epic.title,
      stories: epic.stories.map((story) => ({
        id: newId(),
        title: story.title,
        tasks: story.tasks.map((task) => ({
          id: newId(),
          title: task.title,
          description: task.description || null,
        })),
      })),
    }));
  } catch (err) {
    return { error: friendlyAIError(err, "AI gagal menyusun daftar task. Coba lagi.") };
  }

  const { error: upsertError } = await supabase
    .from("task_lists")
    .upsert(
      { project_id: projectId, epics, updated_at: new Date().toISOString() },
      { onConflict: "project_id" }
    );

  if (upsertError) return { error: upsertError.message };
  return {};
}
