"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import {
  Calendar, Clock, ExternalLink, Bell,
  AlertTriangle, CheckCircle2, ArrowRight, RotateCcw,
} from "lucide-react"

interface Resource {
  id: string
  name: string
  category: string
  value: number
  description: string
  link: string
  fit_score: number
  match_reason: string
  deadline?: string
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

const CATEGORY_COLORS: Record<string, string> = {
  "Financial Aid": "#059669",
  "Scholarship":   "#1D4ED8",
  "NYC Benefits":  "#D97706",
  "Program":       "#7C3AED",
  "Internship":    "#059669",
}

function getDaysLeft(deadline: string, now: number): number {
  return Math.ceil((new Date(deadline).getTime() - now) / 86400000)
}

function readUserEmail(): string {
  if (typeof window === "undefined") return ""
  const raw = window.localStorage.getItem("bridge_user")
  if (!raw) return ""
  try {
    return JSON.parse(raw).email || ""
  } catch {
    return ""
  }
}

function readResources(): Resource[] {
  if (typeof window === "undefined") return []
  const raw = window.localStorage.getItem("bridge_matches")
  if (!raw) return []

  try {
    const data = JSON.parse(raw)
    const all: Resource[] = data.matches || []
    return [...all].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0
      if (!a.deadline) return 1
      if (!b.deadline) return -1
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  } catch {
    return []
  }
}

function readReminded(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const raw = window.localStorage.getItem("bridge_reminded")
  if (!raw) return new Set()
  try {
    return new Set(JSON.parse(raw))
  } catch {
    return new Set()
  }
}

function DeadlineChip({ days }: { days: number }) {
  const color = days < 0 ? "#6B7280" : days < 7 ? "#DC2626" : days < 30 ? "#D97706" : "#059669"
  const bg    = days < 0 ? "#F3F4F6" : days < 7 ? "#FEE2E2" : days < 30 ? "#FEF3C7" : "#D1FAE5"
  const label = days < 0 ? "Closed" : days === 0 ? "Due today" : days === 1 ? "1 day left" : `${days} days left`

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      color, background: bg,
    }}>
      <Clock size={11} />
      {label}
    </span>
  )
}

export default function DeadlinesPage() {
  const [resources]               = useState<Resource[]>(readResources)
  const [reminded, setReminded]   = useState<Set<string>>(readReminded)
  const [userEmail]               = useState<string>(readUserEmail)
  const [filter, setFilter]       = useState<"all" | "urgent" | "upcoming" | "open">("all")
  const [now]                      = useState(() => Date.now())

  const scheduleReminder = async (res: Resource) => {
    if (!userEmail) {
      alert("Please log in first to receive deadline reminders.")
      return
    }
    if (!res.deadline) {
      alert("This program has no fixed deadline - it is rolling, so apply anytime.")
      return
    }
    try {
      await fetch(`${API}/schedule-gmail-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: userEmail,
          resource_name: res.name,
          deadline: res.deadline,
          resource_link: res.link,
        }),
      })
      const next = new Set(reminded)
      next.add(res.id)
      setReminded(next)
      localStorage.setItem("bridge_reminded", JSON.stringify([...next]))
    } catch {
      alert("Could not schedule reminder. Make sure the backend is running.")
    }
  }

  const withDeadline    = resources.filter(r => r.deadline)
  const withoutDeadline = resources.filter(r => !r.deadline)

  const filtered = (() => {
    if (filter === "urgent")   return withDeadline.filter(r => getDaysLeft(r.deadline!, now) < 30)
    if (filter === "upcoming") return withDeadline.filter(r => getDaysLeft(r.deadline!, now) >= 30)
    if (filter === "open")     return withoutDeadline
    return resources
  })()

  const urgent = withDeadline.filter(r => {
    const d = getDaysLeft(r.deadline!, now)
    return d >= 0 && d < 14
  }).length

  if (resources.length === 0) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--surface-2)" }}>
        <Navbar />
        <div style={{ paddingTop: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 40px" }}>
          <div style={{ width: 56, height: 56, background: "var(--accent-3)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Calendar size={24} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 10 }}>No deadlines yet</h1>
          <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 28 }}>Complete onboarding first to see your matched program deadlines.</p>
          <Link href="/onboard" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--surface)", paddingBottom: 80 }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6" style={{ paddingTop: 88 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.5px", marginBottom: 6 }}>
            Deadline Tracker
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-3)" }}>
            {resources.length} matched programs · {urgent > 0 ? `${urgent} closing within 14 days` : "No urgent deadlines"}
          </p>
        </div>

        {/* Urgent banner */}
        {urgent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "14px 18px", marginBottom: 24,
              background: "#FEE2E2", border: "1px solid #FCA5A5",
              borderRadius: "var(--r-lg)",
            }}
          >
            <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#991B1B" }}>
              {urgent} program{urgent > 1 ? "s" : ""} you qualify for {urgent > 1 ? "are" : "is"} closing within 14 days.
              {!userEmail && " Log in to set a reminder."}
            </p>
            {!userEmail && (
              <Link href="/login" style={{ marginLeft: "auto", textDecoration: "none" }}>
                <span className="btn-primary" style={{ padding: "7px 16px", fontSize: 12, whiteSpace: "nowrap" }}>
                  Log in
                </span>
              </Link>
            )}
          </motion.div>
        )}

        {/* Filter tabs */}
        <div className="tab-bar mb-6" style={{ width: "fit-content" }}>
          {([
            { key: "all",      label: `All (${resources.length})` },
            { key: "urgent",   label: `Urgent (${withDeadline.filter(r => getDaysLeft(r.deadline!, now) < 30).length})` },
            { key: "upcoming", label: "Upcoming" },
            { key: "open",     label: `Rolling (${withoutDeadline.length})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`tab-item ${filter === key ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Resource list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((res, i) => {
            const daysLeft  = res.deadline ? getDaysLeft(res.deadline, now) : null
            const catColor  = CATEGORY_COLORS[res.category] ?? "#64748B"
            const isReminded = reminded.has(res.id)

            return (
              <motion.div
                key={res.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{ padding: "20px 24px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                        background: `${catColor}18`, color: catColor,
                      }}>
                        {res.category}
                      </span>
                      {daysLeft !== null
                        ? <DeadlineChip days={daysLeft} />
                        : <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>Rolling deadline</span>
                      }
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 4 }}>
                      {res.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.55 }}>
                      {res.description}
                    </p>

                    {/* Deadline date */}
                    {res.deadline && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={12} />
                        Deadline: {new Date(res.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>

                  {/* Right side */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)" }}>
                      ${res.value.toLocaleString()}
                    </p>

                    <div style={{ display: "flex", gap: 8 }}>
                      {/* Reminder button */}
                      <button
                        onClick={() => scheduleReminder(res)}
                        title={isReminded ? "Reminder set" : "Set reminder"}
                        style={{
                          width: 36, height: 36,
                          background: isReminded ? "var(--success-bg)" : "var(--surface)",
                          border: `1px solid ${isReminded ? "transparent" : "var(--border)"}`,
                          borderRadius: 10,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isReminded
                          ? <CheckCircle2 size={15} color="var(--success)" />
                          : <Bell size={15} color="var(--text-muted)" />
                        }
                      </button>

                      {/* Google Calendar link */}
                      {res.deadline && (
                        <a
                          href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(res.name + " Deadline")}&dates=${res.deadline.replace(/-/g, "")}/${res.deadline.replace(/-/g, "")}&details=${encodeURIComponent("Apply at: " + res.link)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Add to Google Calendar"
                          style={{
                            width: 36, height: 36,
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            textDecoration: "none",
                          }}
                        >
                          <Calendar size={15} color="var(--text-muted)" />
                        </a>
                      )}

                      {/* Apply button */}
                      <a
                        href={res.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none", height: 36, display: "inline-flex", alignItems: "center", gap: 5 }}
                      >
                        Apply <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No programs in this category.</p>
            <button onClick={() => setFilter("all")} className="btn-outline" style={{ marginTop: 16, display: "inline-flex" }}>
              <RotateCcw size={14} /> View All
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
