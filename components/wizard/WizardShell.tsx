"use client";

import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/Stepper";
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
      <Stepper
        steps={WIZARD_STEPS.map((s) => s.label)}
        currentIndex={currentIndex}
        onStepClick={(index) =>
          router.push(`/dashboard/projects/${project.id}/${WIZARD_STEPS[index].path}`)
        }
      />
      <div>{children}</div>
    </div>
  );
}
