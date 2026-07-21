"use client";

import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
import { ExportMenu } from "@/components/wizard/ExportMenu";
import { WIZARD_STEPS, wizardStepIndex } from "@/lib/constants";
import type { Project } from "@/types/database";

interface WizardShellProps {
  project: Project;
  children: React.ReactNode;
}

export function WizardShell({ project, children }: WizardShellProps) {
  const router = useRouter();
  const currentIndex = wizardStepIndex(project.current_step);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Stepper
            steps={WIZARD_STEPS.map((s) => s.label)}
            currentIndex={currentIndex}
            onStepClick={(index) =>
              router.push(`/dashboard/projects/${project.id}/${WIZARD_STEPS[index].path}`)
            }
          />
        </div>
        <ExportMenu projectId={project.id} />
      </div>
      <div>{children}</div>
    </div>
  );
}
