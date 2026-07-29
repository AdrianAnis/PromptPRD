import { cn } from "@/lib/utils";

interface StepperProps {
  steps: readonly string[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}

export function Stepper({ steps, currentIndex, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-center overflow-x-auto" aria-label="Progress">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isClickable = onStepClick && (isCompleted || isCurrent);

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick?.(index)}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 text-sm font-medium",
                isClickable && "cursor-pointer",
                !isClickable && "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-border text-foreground-muted"
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </span>
              <span
                className={cn(
                  "hidden whitespace-nowrap lg:inline",
                  !isCompleted && !isCurrent && "text-foreground-muted"
                )}
              >
                {step}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mx-2 h-px flex-1",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
