import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stepper */}
      <div className="flex items-center">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-1 items-center gap-2 last:flex-none">
            <LoadingSkeleton className="size-7 shrink-0 rounded-full" />
            <LoadingSkeleton className="hidden h-4 w-24 sm:block" />
            {i < 6 && <LoadingSkeleton className="mx-2 h-px flex-1" />}
          </div>
        ))}
      </div>

      {/* Content card */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        <LoadingSkeleton className="h-6 w-56" />
        <LoadingSkeleton className="h-4 w-full max-w-md" />
        <LoadingSkeleton className="h-40 w-full" />
        <div className="flex justify-end">
          <LoadingSkeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}
