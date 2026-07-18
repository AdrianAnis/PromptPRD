import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { createClient } from "@/lib/supabase/server";
import { WizardShell } from "@/components/wizard/WizardShell";
import { StructureForm } from "@/components/wizard/StructureForm";

export default async function StructureStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const supabase = await createClient();
  const { data: productStructure } = await supabase
    .from("product_structures")
    .select("*")
    .eq("project_id", id)
    .maybeSingle();

  return (
    <WizardShell project={project}>
      <StructureForm
        key={productStructure?.updated_at ?? "empty"}
        projectId={project.id}
        ideaPrompt={project.idea_prompt}
        productStructure={productStructure}
      />
    </WizardShell>
  );
}
