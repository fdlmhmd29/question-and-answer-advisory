export default function ProfileLoading() {
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
      <div className="w-full px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Back button skeleton */}
          <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>

          {/* Card skeleton */}
          <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="h-7 w-40 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-56 bg-muted rounded animate-pulse"></div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-2 sm:gap-3 pt-4">
              <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
              <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
