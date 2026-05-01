"use client"

import Link from "next/link"
import { useEffect, useState, useRef, useCallback, useMemo, useSyncExternalStore } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Navbar } from "@/components/navbar"
import {
  ExternalLink, BookmarkPlus, BookmarkCheck, ChevronRight,
  AlertTriangle, MessageCircle, X, Send, Sparkles,
  Briefcase, GraduationCap, Building, Landmark,
  RotateCcw, ArrowUpRight, CheckCircle2, PenLine,
} from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

interface Resource {
  id: string; name: string; category: string; value: number
  description: string; link: string; fit_score: number
  match_reason: string; deadline?: string
}
interface MatchData {
  matches: Resource[]; access_score: number; unclaimed_value: number
  warnings: Array<{ type: string; title: string; message: string }>
  profile: Record<string, unknown>
}
interface ChatMessage { role: "user" | "assistant"; content: string }
interface TailorData {
  headline: string; skills_to_highlight: string[]; skills_to_add: string[]
  bullet_suggestions: string[]; cover_letter_opener: string
}

const CATEGORIES = ["All", "Financial Aid", "Scholarship", "NYC Benefits", "Program", "Internship"]

const CATEGORY_META: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "Financial Aid": { color: "#065f46", bg: "#D1FAE5", icon: Landmark },
  "Scholarship":   { color: "#1e40af", bg: "#DBEAFE", icon: GraduationCap },
  "NYC Benefits":  { color: "#92400e", bg: "#FEF3C7", icon: Building },
  "Program":       { color: "#5b21b6", bg: "#EDE9FE", icon: Sparkles },
  "Internship":    { color: "#065f46", bg: "#D1FAE5", icon: Briefcase },
}

type DashboardSnapshot = {
  data: MatchData | null
  error: string | null
  profile: Record<string, unknown>
  savedIds: Set<string>
}

const EMPTY_PROFILE_ERROR =
  "No profile data is saved in this browser yet. Complete onboarding or load a demo profile to open the decision ledger."

const DEMO_PROFILE = {
  gpa: 3.42,
  credits: 31,
  income: 38000,
  major: "Computer Information Systems",
  skills: ["Python", "Data Analysis", "Public Speaking", "Excel"],
  citizenship: "US Citizen",
  enrollment: "Full-Time",
  borough: "Queens",
  is_first_gen: true,
  has_dependents: false,
}

function readDashboardStorageSnapshot(): string {
  if (typeof window === "undefined") return ""

  return JSON.stringify({
    profile: window.localStorage.getItem("bridge_profile"),
    matches: window.localStorage.getItem("bridge_matches"),
    saved: window.localStorage.getItem("bridge_saved"),
  })
}

function subscribeDashboardStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  window.addEventListener("bridge-dashboard-storage", callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener("bridge-dashboard-storage", callback)
  }
}

function parseDashboardSnapshot(storageSnapshot: string): DashboardSnapshot {
  const fallback = {
    data: null,
    error: EMPTY_PROFILE_ERROR,
    profile: {},
    savedIds: new Set<string>(),
  }

  if (!storageSnapshot) return fallback

  let stored: { profile?: string | null; matches?: string | null; saved?: string | null }
  try {
    stored = JSON.parse(storageSnapshot)
  } catch {
    return fallback
  }

  if (!stored.profile || !stored.matches) return fallback

  try {
    const saved = stored.saved ? JSON.parse(stored.saved) : []
    return {
      data: JSON.parse(stored.matches) as MatchData,
      error: null,
      profile: JSON.parse(stored.profile),
      savedIds: Array.isArray(saved) ? new Set(saved) : new Set<string>(),
    }
  } catch {
    return {
      data: null,
      error: "Saved profile data could not be loaded. Start onboarding again or load the demo profile to refresh the ledger.",
      profile: {},
      savedIds: new Set<string>(),
    }
  }
}

// -- SKELETON -----------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="card p-6" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 99, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: 200, height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 160, height: 16 }} />
        </div>
        <div className="skeleton" style={{ width: 72, height: 32, borderRadius: 10 }} />
      </div>
      <div className="skeleton" style={{ width: "100%", height: 16 }} />
      <div className="skeleton" style={{ width: "75%", height: 16 }} />
      <div className="skeleton" style={{ width: "100%", height: 4, borderRadius: 99 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton" style={{ flex: 1, height: 36, borderRadius: 10 }} />
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
      </div>
    </div>
  )
}

// -- ACCESS SCORE RING --------------------------------------------------------
function AccessScoreRing({ score, animated = false }: { score: number; animated?: boolean }) {
  const R    = 54
  const CIRC = 2 * Math.PI * R
  const offset = CIRC - (CIRC * score) / 100
  const [current, setCurrent] = useState(animated ? CIRC : offset)

  useEffect(() => {
    if (!animated) return
    const raf = requestAnimationFrame(() => { setTimeout(() => setCurrent(offset), 100) })
    return () => cancelAnimationFrame(raf)
  }, [animated, offset])

  const color = score >= 70 ? "#059669" : score >= 40 ? "#D97706" : "#1D4ED8"

  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={R} fill="none" stroke="#E2E8F0" strokeWidth="8" />
      <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={CIRC}
        strokeDashoffset={animated ? current : offset}
        transform="rotate(-90 60 60)"
        style={{ transition: animated ? "stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}
      />
      <text x="60" y="56" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 22, fontWeight: 700, fill: "#0F172A", fontFamily: "inherit" }}>
        {score}
      </text>
      <text x="60" y="76" textAnchor="middle"
        style={{ fontSize: 10, fill: "#94A3B8", fontFamily: "inherit", fontWeight: 500 }}>
        /100
      </text>
    </svg>
  )
}

// -- RESUME MODAL -------------------------------------------------------------
function ResumeCurationModal({ resource, profile, onClose }: {
  resource: Resource; profile: Record<string, unknown>; onClose: () => void
}) {
  const [tailor, setTailor]   = useState<TailorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved]     = useState(false)
  const skills = useMemo(() => (profile.skills as string[] | undefined) ?? [], [profile.skills])

  useEffect(() => {
    async function fetchTailor() {
      try {
        const res = await fetch(`${API}/tailor-resume`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_title: resource.name, job_description: resource.description, student_skills: skills, student_experience: "" }),
        })
        if (res.ok) setTailor(await res.json())
      } catch {
        setTailor({
          headline: `Motivated ${(profile.major as string) || "Student"} seeking ${resource.name}`,
          skills_to_highlight: skills.slice(0, 3),
          skills_to_add: ["Communication", "Microsoft Office", "Research"],
          bullet_suggestions: [
            `Maintained ${profile.gpa} GPA demonstrating strong academic performance`,
            `Completed ${profile.credits} college credits with focus on relevant coursework`,
            "Collaborated in team environments on multiple academic and professional projects",
          ],
          cover_letter_opener: `As a CUNY student passionate about ${resource.category.toLowerCase()}, I am excited to apply for ${resource.name}. My academic record and skills make me a strong candidate.`,
        })
      } finally { setLoading(false) }
    }
    fetchTailor()
  }, [resource, profile, skills])

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end" }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: "min(540px,100vw)", height: "100vh", background: "#fff", borderLeft: "1px solid #E2E8F0", overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <PenLine size={16} color="#1D4ED8" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1D4ED8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Resume Curation</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{resource.name}</h2>
              <p style={{ fontSize: 13, color: "#64748B" }}>{resource.description}</p>
            </div>
            <button onClick={onClose} style={{ padding: 8, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, cursor: "pointer" }}>
              <X size={16} color="#64748B" />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: 28, flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 24 : 80, borderRadius: 10 }} />)
            ) : tailor ? (
              <>
                <Sect title="Suggested Resume Headline">
                  <div style={{ padding: "14px 16px", background: "#DBEAFE", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#1E40AF" }}>
                    {tailor.headline}
                  </div>
                </Sect>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Sect title="Highlight These Skills">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {tailor.skills_to_highlight.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
                    </div>
                  </Sect>
                  <Sect title="Consider Adding">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {tailor.skills_to_add.map(s => <span key={s} className="badge badge-amber">{s}</span>)}
                    </div>
                  </Sect>
                </div>
                <Sect title="Tailored Resume Bullets">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {tailor.bullet_suggestions.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "12px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13, color: "#334155", lineHeight: 1.55 }}>
                        <span style={{ color: "#1D4ED8", flexShrink: 0, marginTop: 2 }}>&#9658;</span>{b}
                      </div>
                    ))}
                  </div>
                </Sect>
                <Sect title="Cover Letter Opener">
                  <div style={{ padding: "14px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, color: "#334155", lineHeight: 1.65, fontStyle: "italic" }}>
                    &ldquo;{tailor.cover_letter_opener}&rdquo;
                  </div>
                </Sect>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div style={{ padding: "20px 28px", borderTop: "1px solid #E2E8F0", display: "flex", gap: 10 }}>
            <button onClick={() => setSaved(true)} className={saved ? "btn-outline" : "btn-primary"} style={{ flex: 1, justifyContent: "center" }}>
              {saved ? <><CheckCircle2 size={15} /> Saved</> : <><BookmarkPlus size={15} /> Save Curation</>}
            </button>
            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="btn-primary"
              style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}>
              Apply Now <ArrowUpRight size={15} />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Sect({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{title}</p>
      {children}
    </div>
  )
}

// -- BRIDGEBOT ----------------------------------------------------------------
function BridgeBot({ profile }: { profile: Record<string, unknown> }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput]     = useState("")
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const SUGGESTED = ["Am I eligible for SNAP?", "What should I apply to first?", "How do I improve my Access Score?"]

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: ChatMessage = { role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setThinking(true)
    try {
      const res = await fetch(`${API}/chat/bridge-bot`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I could not connect right now." }])
    } finally { setThinking(false) }
  }, [messages, profile])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, thinking])

  return (
    <>
      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }} onClick={() => setOpen(o => !o)}
        style={{ position: "fixed", bottom: 32, right: 32, zIndex: 90, width: 56, height: 56, background: "#1D4ED8", border: "none", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(29,78,216,0.35)" }}>
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ position: "fixed", bottom: 100, right: 32, zIndex: 90, width: 360, height: 520, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.12)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, background: "#1D4ED8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>BridgeBot</p>
                <p style={{ fontSize: 11, color: "#059669", fontWeight: 500 }}>&#9679; Knows your profile</p>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Hi! I know your GPA and credits. Ask me anything about your eligibility.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {SUGGESTED.map(s => (
                      <button key={s} onClick={() => send(s)}
                        style={{ padding: "8px 12px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 99, fontSize: 12, color: "#334155", cursor: "pointer", textAlign: "left" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "chat-user" : "chat-ai"}
                  style={{ padding: "9px 13px", fontSize: 13, lineHeight: 1.55, maxWidth: "85%", alignSelf: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.content}
                </div>
              ))}
              {thinking && (
                <div className="chat-ai" style={{ padding: "12px 14px", display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            <div style={{ padding: "12px 14px", borderTop: "1px solid #E2E8F0", display: "flex", gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
                placeholder="Ask about your eligibility..." className="input" style={{ fontSize: 13, padding: "9px 12px" }} />
              <button onClick={() => send(input)} disabled={!input.trim() || thinking}
                style={{ width: 38, height: 38, background: input.trim() && !thinking ? "#1D4ED8" : "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !thinking ? "pointer" : "default" }}>
                <Send size={14} color={input.trim() && !thinking ? "white" : "#94A3B8"} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// -- RESOURCE CARD ------------------------------------------------------------
function ResourceCard({ resource, onCurate, isSaved, onSave, now }: {
  resource: Resource; onCurate: (r: Resource) => void; isSaved: boolean; onSave: (id: string) => void; now: number
}) {
  const meta   = CATEGORY_META[resource.category] ?? { color: "#64748B", bg: "#F8FAFC", icon: Landmark }
  const Icon   = meta.icon
  const isJob  = resource.category === "Internship"
  const daysLeft = resource.deadline
    ? Math.ceil((new Date(resource.deadline).getTime() - now) / 86400000)
    : null
  const deadlineColor = daysLeft === null ? "#94A3B8" : daysLeft < 0 ? "#94A3B8" : daysLeft < 7 ? "#DC2626" : daysLeft < 30 ? "#D97706" : "#059669"

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="badge" style={{ background: meta.bg, color: meta.color }}>
              <Icon size={11} style={{ marginRight: 4 }} />{resource.category}
            </span>
            {daysLeft !== null && (
              <span style={{ fontSize: 11, fontWeight: 600, color: deadlineColor }}>
                {daysLeft < 0 ? "Closed" : daysLeft < 1 ? "Due today" : `${daysLeft}d left`}
              </span>
            )}
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{resource.name}</h3>
          <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.55 }}>{resource.description}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#0F172A" }}>${resource.value.toLocaleString()}</p>
          <p style={{ fontSize: 11, color: "#94A3B8" }}>est. value</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
        <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}>{resource.match_reason}</p>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Fit Score</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8" }}>{resource.fit_score}%</span>
        </div>
        <div className="fit-bar-track">
          <motion.div className="fit-bar-fill" initial={{ width: 0 }}
            animate={{ width: `${resource.fit_score}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {isJob && (
          <button onClick={() => onCurate(resource)} className="btn-outline" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>
            <PenLine size={14} /> Curate Resume
          </button>
        )}
        <a href={resource.link} target="_blank" rel="noopener noreferrer" className="btn-primary"
          style={{ flex: 1, justifyContent: "center", fontSize: 13, textDecoration: "none" }}>
          Apply Now <ExternalLink size={13} />
        </a>
        <button onClick={() => onSave(resource.id)}
          style={{ width: 40, height: 40, background: isSaved ? "#D1FAE5" : "#F8FAFC", border: `1px solid ${isSaved ? "transparent" : "#E2E8F0"}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {isSaved ? <BookmarkCheck size={16} color="#059669" /> : <BookmarkPlus size={16} color="#94A3B8" />}
        </button>
      </div>
    </motion.div>
  )
}

// -- STAT CARD ----------------------------------------------------------------
function StatCard({ label, value, accent, delay = 0 }: {
  label: string; value: string | null; accent: string; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card p-6" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {value === null
        ? <><div className="skeleton" style={{ height: 32, width: "70%", marginBottom: 10 }} /><div className="skeleton" style={{ height: 14, width: "50%" }} /></>
        : <><p style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{value}</p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <div style={{ width: 28, height: 3, background: accent, borderRadius: 99, marginTop: 10 }} /></>
      }
    </motion.div>
  )
}

// -- DASHBOARD PAGE -----------------------------------------------------------
export default function DashboardPage() {
  const storageSnapshot = useSyncExternalStore(
    subscribeDashboardStorage,
    readDashboardStorageSnapshot,
    () => "",
  )
  const snapshot = useMemo(() => parseDashboardSnapshot(storageSnapshot), [storageSnapshot])
  const { data, error, profile, savedIds } = snapshot
  const [activeTab, setActiveTab]   = useState("All")
  const [curateTarget, setCurateTarget] = useState<Resource | null>(null)
  const [scoreAnimated, setScoreAnimated] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)
  const [now]                       = useState(() => Date.now())

  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setScoreAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [data])

  const seedDemoProfile = async () => {
    setDemoLoading(true)
    setDemoError(null)

    try {
      const matchRes = await fetch(`${API}/match/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_PROFILE),
      })

      if (!matchRes.ok) throw new Error(await matchRes.text())
      const matchData = await matchRes.json()

      localStorage.setItem("bridge_profile", JSON.stringify(DEMO_PROFILE))
      localStorage.setItem("bridge_matches", JSON.stringify(matchData))
      localStorage.removeItem("bridge_saved")
      window.dispatchEvent(new Event("bridge-dashboard-storage"))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setDemoError(`Could not reach the decision engine: ${message}`)
    } finally {
      setDemoLoading(false)
    }
  }

  const toggleSave = (id: string) => {
    const next = new Set(savedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    localStorage.setItem("bridge_saved", JSON.stringify([...next]))
    window.dispatchEvent(new Event("bridge-dashboard-storage"))
  }

  if (error) return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Navbar />
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-24 text-center">
        <div className="w-full rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-md bg-amber-50 ring-1 ring-amber-200">
            <AlertTriangle size={24} color="#D97706" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Decision ledger
          </p>
          <h1 className="text-2xl font-semibold text-slate-950">
            {error === EMPTY_PROFILE_ERROR ? "No Profile Loaded" : "Profile Needs Refresh"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">{error}</p>
          {demoError && (
            <p className="mx-auto mt-4 max-w-xl rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {demoError}
            </p>
          )}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/onboard" className="btn-primary">
              <RotateCcw size={15} /> Start Onboarding
            </Link>
            <button onClick={seedDemoProfile} disabled={demoLoading} className="btn-outline justify-center disabled:cursor-not-allowed disabled:opacity-60">
              <Sparkles size={15} className={demoLoading ? "animate-spin" : ""} />
              {demoLoading ? "Loading Demo" : "Load Demo Profile"}
            </button>
          </div>
        </div>
      </section>
    </main>
  )

  const isLoading = !data && !error
  const filteredMatches = data?.matches.filter(m => activeTab === "All" ? true : m.category === activeTab) ?? []

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFC", paddingBottom: 80 }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: 88 }}>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 col-span-2 md:col-span-1"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            {isLoading
              ? <div className="skeleton" style={{ width: 120, height: 120, borderRadius: "50%" }} />
              : <AccessScoreRing score={data?.access_score ?? 0} animated={scoreAnimated} />
            }
            <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Access Score</p>
          </motion.div>
          <StatCard label="Unclaimed Value"   value={isLoading ? null : `$${(data?.unclaimed_value ?? 0).toLocaleString()}`} accent="#059669" delay={0.1} />
          <StatCard label="Programs Matched"  value={isLoading ? null : String(data?.matches.length ?? 0)} accent="#1D4ED8" delay={0.15} />
          <StatCard label="Your GPA"          value={isLoading ? null : String((profile.gpa as number) ?? "--")} accent="#D97706" delay={0.2} />
        </div>

        {/* Warnings */}
        {data?.warnings && data.warnings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {data.warnings.map((w, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 18px", background: w.type === "CRITICAL" ? "#FEE2E2" : "#FEF3C7", border: `1px solid ${w.type === "CRITICAL" ? "#FCA5A5" : "#FCD34D"}`, borderRadius: 16 }}>
                <AlertTriangle size={16} color={w.type === "CRITICAL" ? "#DC2626" : "#D97706"} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2 }}>{w.title}</p>
                  <p style={{ fontSize: 12, color: "#334155" }}>{w.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="tab-bar mb-6" style={{ overflowX: "auto" }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`tab-item ${activeTab === cat ? "active" : ""}`}>
              {cat}
              {data && cat !== "All" && (
                <span style={{ fontSize: 10, background: "#E2E8F0", color: "#94A3B8", borderRadius: 99, padding: "1px 5px", marginLeft: 4 }}>
                  {data.matches.filter(m => m.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 20 }}>
          {isLoading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
            : filteredMatches.length > 0
              ? filteredMatches.map((m, i) => (
                  <motion.div key={m.id} custom={i} initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }) }}>
                    <ResourceCard resource={m} onCurate={setCurateTarget} isSaved={savedIds.has(m.id)} onSave={toggleSave} now={now} />
                  </motion.div>
                ))
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 15, color: "#94A3B8" }}>No matches in this category.</p>
                  <button onClick={() => setActiveTab("All")} className="btn-outline" style={{ marginTop: 16, display: "inline-flex" }}>
                    <ChevronRight size={14} /> View All
                  </button>
                </div>
              )
          }
        </div>
      </div>

      <AnimatePresence>
        {curateTarget && <ResumeCurationModal resource={curateTarget} profile={profile} onClose={() => setCurateTarget(null)} />}
      </AnimatePresence>
      <BridgeBot profile={profile} />
    </main>
  )
}
