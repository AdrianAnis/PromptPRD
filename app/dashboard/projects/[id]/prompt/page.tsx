import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { WizardShell } from "@/components/wizard/WizardShell";
import { PromptStepForm } from "@/components/wizard/PromptStepForm";

export default async function PromptStepPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <WizardShell project={project}>
      <PromptStepForm project={project} />
    </WizardShell>
  );
}
