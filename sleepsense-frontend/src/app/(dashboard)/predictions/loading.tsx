export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-7 w-40 bg-white/5 rounded-lg" />
      <div className="h-10 w-36 bg-white/5 rounded-xl" />
      <div className="rounded-2xl border border-white/5 bg-white/3">
        <div className="h-12 bg-white/3 border-b border-white/5" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-white/3 px-6 flex items-center gap-6">
            <div className="w-8 h-8 bg-white/5 rounded-lg" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-36 bg-white/5 rounded" />
              <div className="h-2 w-20 bg-white/3 rounded" />
            </div>
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
            <div className="h-6 w-20 bg-white/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
