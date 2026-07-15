import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-md">
      <LoadingSkeleton className="mb-4 h-4 w-44" />
      <div className="rounded-lg border border-border bg-surface p-5">
        <LoadingSkeleton className="h-6 w-24" />
        <LoadingSkeleton className="mt-2 h-4 w-40" />

        <div className="mt-6 flex items-center gap-3">
          <LoadingSkeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <LoadingSkeleton className="h-4 w-32" />
            <LoadingSkeleton className="h-3 w-48" />
          </div>
        </div>

        <div className="my-6 h-px bg-border" />

        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="mt-2 h-10 w-full" />
        <LoadingSkeleton className="mt-4 h-4 w-16" />
        <LoadingSkeleton className="mt-2 h-10 w-full" />
        <LoadingSkeleton className="mt-4 h-10 w-36" />
      </div>
    </div>
  );
}
