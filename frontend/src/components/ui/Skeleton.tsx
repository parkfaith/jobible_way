export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-[var(--color-border)] animate-pulse ${className}`}
    />
  )
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
