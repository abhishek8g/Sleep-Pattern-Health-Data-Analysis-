export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 bg-white/5 rounded-lg" />
        <div className="h-4 w-64 bg-white/3 rounded-lg" />
      </div>
      <div className="h-40 rounded-2xl bg-white/3 border border-dashed border-white/10" />
      <div className="flex gap-3">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-10 w-32 bg-white/5 rounded-xl" />
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="h-12 bg-white/3 border-b border-white/5" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 border-b border-white/3 px-6 flex items-center gap-4">
            <div className="w-8 h-8 bg-white/5 rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-48 bg-white/5 rounded" />
              <div className="h-2 w-24 bg-white/3 rounded" />
            </div>
            <div className="h-6 w-16 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
