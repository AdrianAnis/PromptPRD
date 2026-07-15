import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <LoadingSkeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
          >
            <LoadingSkeleton className="h-5 w-3/4" />
            <LoadingSkeleton className="h-3 w-1/3" />
            <div className="mt-2 flex gap-2">
              <LoadingSkeleton className="h-8 w-20" />
              <LoadingSkeleton className="h-8 w-20" />
              <LoadingSkeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
