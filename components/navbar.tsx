"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, LogOut, Sparkles, User } from "lucide-react"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Deadlines", href: "/deadlines" },
]

function readStoredUser(): { name: string; email: string } | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem("bridge_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(readStoredUser)

  const logout = () => {
    localStorage.removeItem("bridge_user")
    setUser(null)
    router.push("/")
  }

  return (
    <nav aria-label="Primary navigation" className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="BridgeAI home" className="flex items-center gap-2.5 text-slate-950">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 shadow-lg shadow-blue-700/25 sm:h-11 sm:w-11">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-base font-bold tracking-normal sm:text-lg">
            Bridge<span className="text-blue-700">AI</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-xl px-5 py-3 text-base font-semibold transition ${
                  active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {user ? (
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <User className="h-3.5 w-3.5" />
              </span>
              {user.name}
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:px-5 sm:text-base"
            >
              Log in
            </Link>
            <Link
              href="/onboard"
              className="hidden items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-600 sm:inline-flex sm:px-5 sm:text-base"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
