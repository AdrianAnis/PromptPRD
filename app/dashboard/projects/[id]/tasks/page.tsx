import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { MIN_PRD_FOR_DOWNSTREAM } from "@/lib/prd/schema";
import { WizardShell } from "@/components/wizard/WizardShell";
import { TaskList } from "@/components/wizard/TaskList";

export const maxDuration = 60;

export default async function TasksStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const [{ data: taskList }, { data: prd }] = await Promise.all([
    supabase.from("task_lists").select("*").eq("project_id", id).maybeSingle(),
    supabase.from("prds").select("content_markdown").eq("project_id", id).maybeSingle(),
  ]);

  const hasPrd = (prd?.content_markdown?.trim().length ?? 0) >= MIN_PRD_FOR_DOWNSTREAM;

  return (
    <WizardShell project={project}>
      <TaskList
        key={taskList?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        hasPrd={hasPrd}
        taskList={taskList}
      />
    </WizardShell>
  );
}
