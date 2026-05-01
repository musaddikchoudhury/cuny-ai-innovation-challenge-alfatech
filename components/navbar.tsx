"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sparkles, LogOut, User } from "lucide-react"

const NAV_LINKS = [
  { label: "Home",      href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Deadlines", href: "/deadlines" },
]

export function Navbar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("bridge_user")
    if (raw) setUser(JSON.parse(raw))
  }, [pathname]) // re-check on every navigation

  const logout = () => {
    localStorage.removeItem("bridge_user")
    setUser(null)
    router.push("/")
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "64px" }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(29,78,216,0.3)", flexShrink: 0 }}>
            <Sparkles size={16} color="white" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px", color: "var(--text-1)" }}>
            Bridge<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </Link>

        {/* Centre links */}
        <div className="hidden md:flex items-center" style={{ gap: 2 }}>
          {NAV_LINKS.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "7px 14px", borderRadius: 10,
                  fontSize: 14, fontWeight: 500,
                  color: active ? "var(--accent)" : "var(--text-3)",
                  background: active ? "var(--surface-3)" : "transparent",
                  textDecoration: "none", transition: "color 0.15s, background 0.15s",
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right side — auth */}
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ width: 24, height: 24, background: "var(--accent-3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={12} color="var(--accent)" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)" }}>
                {user.name}
              </span>
            </div>
            <button
              onClick={logout}
              style={{ padding: "7px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-3)" }}
            >
              <LogOut size={13} />
              Log out
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/login"
              style={{ padding: "9px 16px", fontSize: 14, fontWeight: 500, color: "var(--text-2)", background: "transparent", border: "1px solid var(--border)", borderRadius: 12, textDecoration: "none" }}
            >
              Log in
            </Link>
            <Link
              href="/onboard"
              className="btn-primary"
              style={{ padding: "9px 20px", fontSize: 14, borderRadius: 12, textDecoration: "none" }}
            >
              Get Started →
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
