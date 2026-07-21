"use server";

import { createClient } from "@/lib/supabase/server";
import type { Epic } from "@/types/database";

export interface ExportBundle {
  projectName: string;
  prdMarkdown: string;
  epics: Epic[];
  mermaidCode: string;
}

export async function getExportBundleAction(
  projectId: string
): Promise<{ bundle?: ExportBundle; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (projectError || !project) return { error: "Project not found" };

  const [{ data: prd }, { data: taskList }, { data: diagram }] = await Promise.all([
    supabase.from("prds").select("content_markdown").eq("project_id", projectId).maybeSingle(),
    supabase.from("task_lists").select("epics").eq("project_id", projectId).maybeSingle(),
    supabase
      .from("class_diagrams")
      .select("mermaid_code")
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  return {
    bundle: {
      projectName: project.name,
      prdMarkdown: prd?.content_markdown ?? "",
      epics: taskList?.epics ?? [],
      mermaidCode: diagram?.mermaid_code ?? "",
    },
  };
}
