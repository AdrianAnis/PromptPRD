import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { MIN_PRD_FOR_DOWNSTREAM } from "@/lib/prd/schema";
import { WizardShell } from "@/components/wizard/WizardShell";
import { DiagramEditor } from "@/components/wizard/DiagramEditor";

export const maxDuration = 60;

export default async function DiagramStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const [{ data: diagram }, { data: prd }] = await Promise.all([
    supabase.from("class_diagrams").select("*").eq("project_id", id).maybeSingle(),
    supabase.from("prds").select("content_markdown").eq("project_id", id).maybeSingle(),
  ]);

  const hasPrd = (prd?.content_markdown?.trim().length ?? 0) >= MIN_PRD_FOR_DOWNSTREAM;

  return (
    <WizardShell project={project}>
      <DiagramEditor
        key={diagram?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        hasPrd={hasPrd}
        diagram={diagram}
      />
    </WizardShell>
  );
}
