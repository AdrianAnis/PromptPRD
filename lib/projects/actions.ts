"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/database";

export interface ProjectFormState {
  error?: string;
}

const createProjectSchema = z.object({
  idea: z.string().min(10, "Ceritakan idemu sedikit lebih detail"),
});

function deriveProjectName(idea: string): string {
  const trimmed = idea.trim();
  if (!trimmed) return "Untitled Project";
  if (trimmed.length <= 60) return trimmed;

  const cut = trimmed.slice(0, 60);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 20 ? cut.slice(0, lastSpace) : cut}…`;
}

export async function createProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const parsed = createProjectSchema.safeParse({ idea: formData.get("idea") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: deriveProjectName(parsed.data.idea),
      idea_prompt: parsed.data.idea,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create project" };

  redirect(`/dashboard/projects/${data.id}/prompt`);
}

export async function deleteProjectAction(projectId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  if (!count) return { error: "Project not found" };

  revalidatePath("/dashboard");
  return {};
}

export async function duplicateProjectAction(projectId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: original, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !original) return { error: "Project not found" };

  const { error: insertError } = await supabase.from("projects").insert({
    user_id: user.id,
    name: `${original.name} (copy)`,
    idea_prompt: original.idea_prompt,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard");
  return {};
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getProject(projectId: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", projectId).single();
  return data ?? null;
}

const updatableFields = z.object({
  name: z.string().min(2).optional(),
  idea_prompt: z.string().optional(),
  current_step: z.enum(["prompt", "requirement", "tech", "structure", "prd", "tasks", "diagram"]).optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
});


export async function updateProjectFieldsAction(
  projectId: string,
  patch: Partial<Pick<Project, "name" | "idea_prompt" | "current_step" | "status">>
) {
  const parsed = updatableFields.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) return { error: error.message };
  return {};
}
