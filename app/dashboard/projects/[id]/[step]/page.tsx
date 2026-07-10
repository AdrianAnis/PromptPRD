import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects/actions";
import { WizardShell } from "@/components/wizard/WizardShell";
import { WIZARD_STEPS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";

export default async function ProjectStepPage({
  params,
}: {
  params: Promise<{ id: string; step: string }>;
}) {
  const { id, step } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const stepConfig = WIZARD_STEPS.find((s) => s.path === step);
  if (!stepConfig) notFound();

  return (
    <WizardShell project={project}>
      <Card>
        <h2 className="mb-2 text-lg font-semibold">{stepConfig.label}</h2>
        <p className="text-sm text-foreground/60">
          This step will be implemented in the next development phase.
        </p>
      </Card>
    </WizardShell>
  );
}
