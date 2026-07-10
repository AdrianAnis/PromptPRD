import type { Project, ProjectStep } from "@/types/database";

export const WIZARD_STEPS: readonly { step: ProjectStep; label: string; path: string }[] = [
  { step: "prompt", label: "Prompt", path: "prompt" },
  { step: "requirement", label: "Requirement Gathering", path: "requirement" },
  { step: "tech", label: "Technology Selection", path: "tech" },
  { step: "structure", label: "Product Structure", path: "structure" },
  { step: "prd", label: "Generate PRD", path: "prd" },
  { step: "tasks", label: "Generate Tasks", path: "tasks" },
  { step: "diagram", label: "Class Diagram", path: "diagram" },
];

export function wizardStepIndex(step: ProjectStep): number {
  return WIZARD_STEPS.findIndex((s) => s.step === step);
}

export function resumePath(project: Project): string {
  const step = WIZARD_STEPS.find((s) => s.step === project.current_step) ?? WIZARD_STEPS[0];
  return `/dashboard/projects/${project.id}/${step.path}`;
}
