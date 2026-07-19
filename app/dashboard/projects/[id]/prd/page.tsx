import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import { PrdEditor } from "@/components/wizard/PrdEditor";

export const maxDuration = 60;

export default async function PrdStepPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const [{ data: prd }, { data: productStructure }] = await Promise.all([
    supabase.from("prds").select("*").eq("project_id", id).maybeSingle(),
    supabase.from("product_structures").select("structure").eq("project_id", id).maybeSingle(),
  ]);

  const structure = productStructure?.structure ?? [];

  return (
    <WizardShell project={project}>
      <PrdEditor
        key={prd?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        hasStructure={structure.length > 0}
        prd={prd}
      />
    </WizardShell>
  );
}
