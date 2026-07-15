import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import { RequirementForm } from "@/components/wizard/RequirementForm";

export default async function RequirementStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const { data: requirement } = await supabase
    .from("requirements")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  return (
    <WizardShell project={project}>
      <RequirementForm
        key={requirement?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        requirement={requirement}
      />
    </WizardShell>
  );
}
