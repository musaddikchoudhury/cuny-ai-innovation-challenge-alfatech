export default function Loading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef8ff_0%,#ffffff_64%)] px-6 py-24 text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="space-y-4">
          <div className="h-4 w-40 rounded-full bg-slate-200/80" />
          <div className="h-12 w-full max-w-3xl rounded-3xl bg-slate-200/80" />
          <div className="h-6 w-full max-w-2xl rounded-full bg-slate-200/70" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-slate-200/80" />
              <div className="mt-8 h-8 w-24 rounded-full bg-slate-200/80" />
              <div className="mt-4 h-4 w-3/4 rounded-full bg-slate-200/70" />
              <div className="mt-3 h-4 w-1/2 rounded-full bg-slate-200/60" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}