export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
        </div>
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  )
}
