export default function SearchSkeleton() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24 animate-pulse">
      <div className="bg-slate-900 pt-10 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 w-2/3 mx-auto bg-slate-700 rounded-lg" />
          <div className="h-4 w-1/2 mx-auto bg-slate-700 rounded-lg" />
          <div className="h-14 w-full bg-slate-700 rounded-2xl" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="mt-8 h-40 bg-white border border-slate-200 rounded-3xl" />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-white border border-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
