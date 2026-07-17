import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import { TechStackForm } from "@/components/wizard/TechStackForm";

export default async function TechStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const { data: techStack } = await supabase
    .from("tech_stacks")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  return (
    <WizardShell project={project}>
      <TechStackForm
        key={techStack?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        techStack={techStack}
      />
    </WizardShell>
  );
}
