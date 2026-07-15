import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4">
        <LoadingSkeleton className="h-10 w-64" />
        <LoadingSkeleton className="h-5 w-full max-w-md" />
        <LoadingSkeleton className="h-44 w-full rounded-lg" />
      </div>
    </div>
  );
}
