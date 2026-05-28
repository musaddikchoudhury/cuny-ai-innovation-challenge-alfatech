"use client"

import Link from "next/link"
import { useEffect } from "react"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eef8ff_0%,#ffffff_64%)] px-6 py-24 text-slate-950">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Application error</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">We hit a runtime problem.</h1>
        <p className="mt-4 text-base leading-7 text-slate-500">
          The page failed to render correctly. You can retry the current route or return home and
          continue from there.
        </p>

        <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {error.message || "An unexpected error occurred."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-outline">
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}