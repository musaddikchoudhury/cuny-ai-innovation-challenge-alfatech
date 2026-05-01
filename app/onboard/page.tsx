"use client"

import { useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, LinkIcon, FileText, CheckCircle2, Loader2, X, File, ShieldCheck, ArrowRight } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

type Tab = "link" | "upload" | "form"

interface UploadedFile {
  file: File
  type: "transcript" | "resume" | "fafsa" | "other"
  status: "idle" | "processing" | "done" | "error"
}

const PROCESSING_STEPS = [
  "Extracting document text…",
  "Parsing eligibility signals…",
  "Cross-referencing 60+ programs…",
  "Ranking matches by fit…",
  "Generating your Access Score…",
]

async function readApiError(res: Response) {
  try {
    const body = await res.clone().json()
    if (typeof body.detail === "string") return body.detail
  } catch {
    // Fall through to the plain-text response body.
  }

  return await res.text()
}

// ── INNER COMPONENT (needs useSearchParams) ───────────────────────────────────

function OnboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) ?? "upload"

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [files, setFiles]         = useState<UploadedFile[]>([])
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [dragOver, setDragOver]   = useState(false)

  // Quick form state
  const [form, setForm] = useState({
    gpa: "",
    credits: "",
    major: "",
    income: "",
    citizenship: "US Citizen",
    enrollment: "Full-Time",
    borough: "",
    is_first_gen: false,
  })

  // ── PROCESSING ANIMATION ──
  const runProcessingAnimation = useCallback(async () => {
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingStep(i)
      await new Promise(r => setTimeout(r, 700))
    }
  }, [])

  // ── HANDLE PDF UPLOAD ──
  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const newFiles: UploadedFile[] = Array.from(incoming).map(file => ({
      file,
      type: file.name.toLowerCase().includes("transcript") ? "transcript"
          : file.name.toLowerCase().includes("resume")     ? "resume"
          : file.name.toLowerCase().includes("fafsa")      ? "fafsa"
          : "other",
      status: "idle",
    }))
    setFiles(prev => [...prev, ...newFiles].slice(0, 4))
  }, [])

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  // ── SUBMIT: UPLOAD ──
  const submitUpload = async () => {
    if (files.length === 0) return
    setProcessing(true)

    try {
      runProcessingAnimation()

      const primaryFile = files[0].file
      const formData = new FormData()
      formData.append("file", primaryFile)

      const extractRes = await fetch(`${API}/extract-profile`, {
        method: "POST",
        body: formData,
      })

      if (!extractRes.ok) throw new Error(await readApiError(extractRes))
      const profile = await extractRes.json()

      const matchRes = await fetch(`${API}/match/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (!matchRes.ok) throw new Error(await readApiError(matchRes))
      const matchData = await matchRes.json()

      localStorage.setItem("bridge_profile", JSON.stringify(profile))
      localStorage.setItem("bridge_matches", JSON.stringify(matchData))

      await new Promise(r => setTimeout(r, 400))
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      alert(`Error: ${msg}\n\nIs the Python backend running on port 8000?`)
      setProcessing(false)
    }
  }

  // ── SUBMIT: LINKEDIN ──
  const submitLinkedin = async () => {
    if (!linkedinUrl.includes("linkedin.com")) {
      alert("Please paste a valid LinkedIn profile URL.")
      return
    }
    setProcessing(true)
    runProcessingAnimation()

    try {
      // For demo: parse LinkedIn URL domain to a basic profile
      // In production: call Proxycurl endpoint
      const mockProfile = {
        gpa: 3.5, credits: 30, major: "Business Administration",
        income: null, skills: ["Excel", "Data Analysis", "Communication"],
        citizenship: "US Citizen", enrollment: "Full-Time",
        is_first_gen: false, has_dependents: false,
      }

      const matchRes = await fetch(`${API}/match/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockProfile),
      })

      if (!matchRes.ok) throw new Error(await readApiError(matchRes))
      const matchData = await matchRes.json()

      localStorage.setItem("bridge_profile", JSON.stringify(mockProfile))
      localStorage.setItem("bridge_matches", JSON.stringify(matchData))
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      alert(`Error: ${msg}`)
      setProcessing(false)
    }
  }

  // ── SUBMIT: FORM ──
  const submitForm = async () => {
    if (!form.gpa || !form.credits) {
      alert("GPA and credits are required.")
      return
    }
    setProcessing(true)
    runProcessingAnimation()

    try {
      const profile = {
        gpa: parseFloat(form.gpa),
        credits: parseInt(form.credits),
        major: form.major || "Undecided",
        income: form.income ? parseInt(form.income) : null,
        citizenship: form.citizenship,
        enrollment: form.enrollment,
        skills: [],
        is_first_gen: form.is_first_gen,
        has_dependents: false,
        borough: form.borough || null,
      }

      const matchRes = await fetch(`${API}/match/ledger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (!matchRes.ok) throw new Error(await readApiError(matchRes))
      const matchData = await matchRes.json()

      localStorage.setItem("bridge_profile", JSON.stringify(profile))
      localStorage.setItem("bridge_matches", JSON.stringify(matchData))
      router.push("/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      alert(`Error: ${msg}`)
      setProcessing(false)
    }
  }

  const FILE_TYPE_LABELS: Record<string, string> = {
    transcript: "Transcript",
    resume: "Resume",
    fafsa: "FAFSA / SAR",
    other: "Document",
  }

  // ── PROCESSING SCREEN ──
  if (processing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--surface-2)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div
            style={{
              width: 72, height: 72,
              background: "var(--accent-3)",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
            }}
          >
            <Loader2 size={32} color="var(--accent)" className="animate-spin" />
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
            Analyzing Your Profile
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-3)", marginBottom: 40 }}>
            Our AI is matching you against 60+ programs
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROCESSING_STEPS.map((step, i) => (
              <div
                key={step}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  background: i <= processingStep ? "var(--bg)" : "transparent",
                  border: `1px solid ${i <= processingStep ? "var(--border)" : "transparent"}`,
                  borderRadius: "var(--r-md)",
                  transition: "all 0.3s ease",
                }}
              >
                {i < processingStep ? (
                  <CheckCircle2 size={16} color="var(--success)" />
                ) : i === processingStep ? (
                  <Loader2 size={16} color="var(--accent)" className="animate-spin" />
                ) : (
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px solid var(--border)" }} />
                )}
                <span
                  style={{
                    fontSize: 13, fontWeight: 500,
                    color: i <= processingStep ? "var(--text-1)" : "var(--text-muted)",
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ── MAIN ONBOARD UI ──
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-24"
      style={{ background: "linear-gradient(180deg, var(--surface-2) 0%, white 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.8px", marginBottom: 8 }}>
            Let&apos;s build your profile
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-3)" }}>
            Choose the fastest option for you. All paths lead to your personalized matches.
          </p>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar mb-8">
          {([
            { id: "upload", icon: Upload,   label: "Upload Docs" },
            { id: "link",   icon: LinkIcon,  label: "LinkedIn URL" },
            { id: "form",   icon: FileText,  label: "Quick Form"  },
          ] as const).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-item flex-1 flex items-center justify-center gap-2 ${activeTab === id ? "active" : ""}`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: UPLOAD ── */}
        <AnimatePresence mode="wait">
          {activeTab === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div
                className="card p-8"
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
              >
                <label
                  htmlFor="file-upload"
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "40px 20px",
                    border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--r-lg)",
                    background: dragOver ? "var(--accent-3)" : "var(--surface)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    marginBottom: files.length > 0 ? 20 : 0,
                  }}
                >
                  <Upload size={28} color={dragOver ? "var(--accent)" : "var(--text-muted)"} style={{ marginBottom: 14 }} />
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>
                    Drop files here or click to upload
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
                    Transcript · Resume · FAFSA · Financial Aid Award Letter
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>PDF only · Max 4 files</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="hidden"
                    onChange={e => handleFiles(e.target.files)}
                  />
                </label>

                {/* File list */}
                {files.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {files.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 14px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--r-md)",
                        }}
                      >
                        <File size={15} color="var(--accent)" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {f.file.name}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{FILE_TYPE_LABELS[f.type]}</p>
                        </div>
                        <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                          <X size={14} color="var(--text-muted)" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={submitUpload}
                      className="btn-primary w-full mt-2"
                      style={{ justifyContent: "center" }}
                    >
                      Analyze {files.length} File{files.length > 1 ? "s" : ""} <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── TAB: LINKEDIN ── */}
          {activeTab === "link" && (
            <motion.div key="link" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div className="card p-8">
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "20px",
                    background: "var(--accent-3)",
                    borderRadius: "var(--r-lg)",
                    marginBottom: 28,
                  }}
                >
                  <LinkIcon size={22} color="var(--accent)" />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>LinkedIn Profile URL</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>We extract education, skills, and experience automatically</p>
                  </div>
                </div>

                <input
                  type="url"
                  className="input mb-4"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 24 }}>
                  Also works with Handshake profile text — just paste it below.
                </p>

                <button
                  onClick={submitLinkedin}
                  disabled={!linkedinUrl}
                  className="btn-primary w-full"
                  style={{ justifyContent: "center", opacity: linkedinUrl ? 1 : 0.4 }}
                >
                  Import Profile <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── TAB: FORM ── */}
          {activeTab === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
              <div className="card p-8" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                      GPA *
                    </label>
                    <input type="number" step="0.1" min="0" max="4" className="input" placeholder="3.5"
                      value={form.gpa} onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                      Credits Completed *
                    </label>
                    <input type="number" min="0" className="input" placeholder="30"
                      value={form.credits} onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                    Major / Field of Study
                  </label>
                  <input type="text" className="input" placeholder="Computer Science"
                    value={form.major} onChange={e => setForm(f => ({ ...f, major: e.target.value }))} />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                    Annual Household Income (optional)
                  </label>
                  <input type="number" className="input" placeholder="45000"
                    value={form.income} onChange={e => setForm(f => ({ ...f, income: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                      Enrollment
                    </label>
                    <select className="input" value={form.enrollment} onChange={e => setForm(f => ({ ...f, enrollment: e.target.value }))}>
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                      Citizenship Status
                    </label>
                    <select className="input" value={form.citizenship} onChange={e => setForm(f => ({ ...f, citizenship: e.target.value }))}>
                      <option>US Citizen</option>
                      <option>Permanent Resident</option>
                      <option>DACA</option>
                      <option>International</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", display: "block", marginBottom: 6 }}>
                    NYC Borough
                  </label>
                  <select className="input" value={form.borough} onChange={e => setForm(f => ({ ...f, borough: e.target.value }))}>
                    <option value="">Select borough</option>
                    <option>Manhattan</option>
                    <option>Brooklyn</option>
                    <option>Queens</option>
                    <option>Bronx</option>
                    <option>Staten Island</option>
                  </select>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: "var(--text-2)" }}>
                  <input type="checkbox" checked={form.is_first_gen} onChange={e => setForm(f => ({ ...f, is_first_gen: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
                  First-generation college student
                </label>

                <button onClick={submitForm} className="btn-primary" style={{ justifyContent: "center" }}>
                  Find My Matches <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 mt-6"
          style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
          <ShieldCheck size={14} color="var(--success)" />
          Your documents are processed securely and never stored permanently
        </div>
      </motion.div>
    </div>
  )
}

// ── PAGE EXPORT (Suspense required for useSearchParams) ───────────────────────

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-2)" }}>
      <Loader2 size={24} className="animate-spin" color="var(--accent)" />
    </div>}>
      <OnboardInner />
    </Suspense>
  )
}
