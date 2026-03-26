export default function Loading() {
  return (
    <main className="flex-1 flex flex-col gap-5 animate-pulse">
      <div>
        <div className="h-3 w-12 bg-border rounded mb-3" />
        <div className="h-7 w-48 bg-border rounded" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-border rounded-full" />
        <div className="h-8 w-20 bg-border rounded-full" />
        <div className="h-8 w-14 bg-border rounded-full" />
      </div>
      <div className="h-12 bg-border rounded-xl" />
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="h-3 w-16 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-3/4 bg-border rounded" />
      </div>
      <div className="bg-card rounded-xl p-4 border border-border space-y-3">
        <div className="h-3 w-20 bg-border rounded" />
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-2/3 bg-border rounded" />
      </div>
    </main>
  );
}
