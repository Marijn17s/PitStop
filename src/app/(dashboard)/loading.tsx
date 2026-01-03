export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-slate-700 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 bg-slate-700 rounded-lg"></div>
          <div className="h-64 bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

