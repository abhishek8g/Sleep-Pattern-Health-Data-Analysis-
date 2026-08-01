export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-white/5 rounded-lg" />
        <div className="h-4 w-48 bg-white/3 rounded-lg" />
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-white/3 border border-white/5" />
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/3 border border-white/5" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white/3 border border-white/5" />
        <div className="h-64 rounded-2xl bg-white/3 border border-white/5" />
      </div>

      {/* Table */}
      <div className="h-64 rounded-2xl bg-white/3 border border-white/5" />
    </div>
  );
}
