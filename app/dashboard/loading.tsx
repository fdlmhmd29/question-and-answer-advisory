export default function DashboardLoading() {
  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-card p-3 sm:p-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="grid gap-4 md:gap-6">
          {/* Cards skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-lg p-4 space-y-3">
                <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* List skeleton */}
          <div className="bg-card border rounded-lg p-4">
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
