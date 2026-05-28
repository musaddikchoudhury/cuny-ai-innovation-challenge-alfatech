"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, Mail, User, ArrowRight, ShieldCheck, LogIn } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router  = useRouter()
  const [mode, setMode]     = useState<"login" | "signup">("signup")
  const [name, setName]     = useState("")
  const [email, setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState("")

  const handleSubmit = () => {
    setError("")
    if (!email.includes("@")) { setError("Please enter a valid email."); return }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return }

    setLoading(true)
    // Store user in localStorage — simple demo auth
    // In production: replace with Supabase supabase.auth.signInWithOtp({ email })
    const user = { name: name || email.split("@")[0], email }
    localStorage.setItem("bridge_user", JSON.stringify(user))

    setTimeout(() => {
      // If they have matches, go to dashboard; otherwise onboard
      const hasMatches = !!localStorage.getItem("bridge_matches")
      router.push(hasMatches ? "/dashboard" : "/onboard")
    }, 800)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: "linear-gradient(180deg, var(--surface-2) 0%, white 60%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: "var(--accent)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(29,78,216,0.3)" }}>
              <Sparkles size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>
              Bridge<span style={{ color: "var(--accent)" }}>AI</span>
            </span>
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 8 }}>
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {mode === "signup"
              ? "Save your matches and get deadline reminders"
              : "Sign in to view your saved resources"
            }
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "36px 32px" }}>

          {/* Mode toggle */}
          <div className="tab-bar mb-8">
            <button type="button" onClick={() => setMode("signup")} className={`tab-item flex-1 ${mode === "signup" ? "active" : ""}`}>
              Sign Up
            </button>
            <button type="button" onClick={() => setMode("login")} className={`tab-item flex-1 ${mode === "login" ? "active" : ""}`}>
              Log In
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div>
                <label htmlFor="full-name" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 7 }}>
                  Full name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input
                    type="text"
                    id="full-name"
                    className="input"
                    placeholder="Musa Diallo"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 7 }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  type="email"
                  id="email"
                  className="input"
                  placeholder="you@bmcc.cuny.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p style={{ fontSize: 13, color: "var(--danger)", fontWeight: 500 }}>{error}</p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ justifyContent: "center", opacity: loading ? 0.7 : 1, marginTop: 4 }}
            >
              {loading
                ? "Saving..."
                : mode === "signup"
                ? <><LogIn size={15} /> Create Account & Continue</>
                : <><ArrowRight size={15} /> Sign In</>
              }
            </button>
          </div>

          {/* Benefits (signup mode) */}
          {mode === "signup" && (
            <div style={{ marginTop: 24, padding: "16px", background: "var(--surface)", borderRadius: "var(--r-md)", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Deadline reminders sent to your email",
                "Your matches saved across sessions",
                "Personalized BridgeBot advisor",
              ].map(b => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "var(--text-2)" }}>
                  <ShieldCheck size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy note */}
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
          Your data is never sold or shared · Free forever for students
        </p>
      </motion.div>
    </div>
  )
}
