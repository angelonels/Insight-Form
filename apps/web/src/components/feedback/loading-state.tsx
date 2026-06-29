import { Skeleton } from "../ui/skeleton.js";

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="rounded-xl border border-border bg-card p-5" key={index}>
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
