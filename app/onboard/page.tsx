"use client"

import { Suspense, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  File,
  FileText,
  Link2,
  Loader2,
  ShieldCheck,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react"
import { Navbar } from "@/components/navbar"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

type Tab = "link" | "upload" | "form"

interface UploadedFile {
  file: File
  type: "transcript" | "resume" | "fafsa" | "other"
}

type IntakeOption = {
  id: Tab
  icon: LucideIcon
  title: string
  detail: string
  time: string
  tone: string
  badge?: string
}

const PROCESSING_STEPS = [
  "Extracting profile signals",
  "Cross-referencing 60+ resources",
  "Ranking matches by fit",
  "Building your decision ledger",
]

const OPTIONS: IntakeOption[] = [
  {
    id: "link",
    icon: Link2,
    title: "Paste LinkedIn URL",
    detail: "We extract your education, skills, and experience automatically in seconds.",
    time: "~5 sec",
    tone: "bg-blue-50 text-blue-700",
  },
  {
    id: "upload",
    icon: Upload,
    title: "Upload Documents",
    detail: "Drop your transcript, FAFSA, or resume PDF. Our AI reads it instantly.",
    time: "~15 sec",
    tone: "bg-emerald-50 text-emerald-700",
    badge: "Most Popular",
  },
  {
    id: "form",
    icon: FileText,
    title: "Quick Profile Form",
    detail: "Answer a few questions and get a full resource match without documents.",
    time: "~3 min",
    tone: "bg-violet-50 text-violet-700",
  },
]

const FILE_TYPE_LABELS: Record<UploadedFile["type"], string> = {
  transcript: "Transcript",
  resume: "Resume",
  fafsa: "FAFSA / SAR",
  other: "Document",
}

async function readApiError(res: Response) {
  try {
    const body = await res.clone().json()
    if (typeof body.detail === "string") return body.detail
  } catch {
    // Fall through to the plain-text response body.
  }

  return await res.text()
}

function classifyFile(file: File): UploadedFile["type"] {
  const name = file.name.toLowerCase()
  if (name.includes("transcript")) return "transcript"
  if (name.includes("resume")) return "resume"
  if (name.includes("fafsa")) return "fafsa"
  return "other"
}

function ProcessingScreen({ step }: { step: number }) {
  return (
    <main className="min-h-screen bg-[#eef8ff] px-6 py-24">
      <Navbar />
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100">
            <Loader2 className="h-9 w-9 animate-spin text-blue-700" />
          </div>
          <h1 className="text-3xl font-black tracking-normal text-slate-950">Building your resource ledger</h1>
          <p className="mt-3 text-base font-medium text-slate-500">BridgeAI is matching your profile against CUNY and NYC programs.</p>
          <div className="mt-10 space-y-3">
            {PROCESSING_STEPS.map((item, index) => (
              <div
                key={item}
                className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left transition ${
                  index <= step ? "border-slate-200 bg-white" : "border-transparent bg-transparent"
                }`}
              >
                {index < step ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : index === step ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-700" />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-slate-300" />
                )}
                <span className={`text-sm font-bold ${index <= step ? "text-slate-900" : "text-slate-400"}`}>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  )
}

function OnboardInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get("tab") as Tab) ?? "upload"

  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState("")
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

  const runProcessingAnimation = useCallback(async () => {
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      setProcessingStep(i)
      await new Promise((resolve) => setTimeout(resolve, 650))
    }
  }, [])

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    const next = Array.from(incoming).map((file) => ({ file, type: classifyFile(file) }))
    setFiles((current) => [...current, ...next].slice(0, 4))
  }, [])

  const saveAndOpenDashboard = async (profile: Record<string, unknown>) => {
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
  }

  const submitUpload = async () => {
    if (files.length === 0) {
      setError("Upload at least one PDF to continue.")
      return
    }

    setError("")
    setProcessing(true)
    void runProcessingAnimation()

    try {
      const formData = new FormData()
      formData.append("file", files[0].file)

      const extractRes = await fetch(`${API}/extract-profile`, { method: "POST", body: formData })
      if (!extractRes.ok) throw new Error(await readApiError(extractRes))

      await saveAndOpenDashboard(await extractRes.json())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setProcessing(false)
    }
  }

  const submitLinkedin = async () => {
    if (!linkedinUrl.includes("linkedin.com")) {
      setError("Paste a valid LinkedIn profile URL.")
      return
    }

    setError("")
    setProcessing(true)
    void runProcessingAnimation()

    try {
      await saveAndOpenDashboard({
        gpa: 3.5,
        credits: 30,
        major: "Business Administration",
        income: null,
        skills: ["Excel", "Data Analysis", "Communication"],
        citizenship: "US Citizen",
        enrollment: "Full-Time",
        is_first_gen: false,
        has_dependents: false,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setProcessing(false)
    }
  }

  const submitForm = async () => {
    if (!form.gpa || !form.credits) {
      setError("GPA and credits are required.")
      return
    }

    setError("")
    setProcessing(true)
    void runProcessingAnimation()

    try {
      await saveAndOpenDashboard({
        gpa: parseFloat(form.gpa),
        credits: parseInt(form.credits, 10),
        major: form.major || "Undecided",
        income: form.income ? parseInt(form.income, 10) : null,
        citizenship: form.citizenship,
        enrollment: form.enrollment,
        borough: form.borough || null,
        skills: [],
        is_first_gen: form.is_first_gen,
        has_dependents: false,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setProcessing(false)
    }
  }

  if (processing) return <ProcessingScreen step={processingStep} />

  return (
    <main className="min-h-screen bg-[#eef8ff] pb-24 text-slate-950">
      <Navbar />
      <section className="mx-auto w-full max-w-7xl px-5 pt-[118px]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Three ways to start</p>
          <h1 className="mt-8 text-5xl font-black leading-tight tracking-normal sm:text-6xl">Choose your path in</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Start with documents, a profile link, or a quick form. Each path opens the same decision engine.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {OPTIONS.map((option, index) => {
            const Icon = option.icon
            const active = activeTab === option.id
            return (
              <motion.button
                key={option.id}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                onClick={() => {
                  setActiveTab(option.id)
                  setError("")
                }}
                className={`relative flex min-h-[330px] flex-col rounded-[22px] border bg-white p-10 text-left shadow-md shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl ${
                  active ? "border-2 border-blue-700" : "border-slate-200"
                }`}
              >
                {option.badge && (
                  <span className="absolute right-8 top-7 rounded-full bg-blue-100 px-4 py-1 text-sm font-bold text-blue-700">
                    {option.badge}
                  </span>
                )}
                <div className={`mb-10 flex h-16 w-16 items-center justify-center rounded-2xl ${option.tone}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-black tracking-normal text-slate-950">{option.title}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-500">{option.detail}</p>
                <div className="mt-auto flex items-center justify-between pt-10">
                  <span className={`rounded-full px-4 py-2 text-sm font-bold ${option.tone}`}>{option.time}</span>
                  <ArrowRight className={`h-6 w-6 ${active ? "text-blue-700" : "text-slate-400"}`} />
                </div>
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="mx-auto mt-10 max-w-3xl rounded-[22px] border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/70 sm:p-8"
          >
            {error && (
              <p className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </p>
            )}

            {activeTab === "upload" && (
              <div>
                <label
                  htmlFor="file-upload"
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragOver(false)
                    handleFiles(event.dataTransfer.files)
                  }}
                  className={`flex cursor-pointer flex-col items-center rounded-[20px] border-2 border-dashed px-6 py-12 text-center transition ${
                    dragOver ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <Upload className={`h-9 w-9 ${dragOver ? "text-blue-700" : "text-slate-400"}`} />
                  <p className="mt-5 text-lg font-black text-slate-950">Drop files here or click to upload</p>
                  <p className="mt-2 text-sm font-medium text-slate-500">Transcript, resume, FAFSA, or award letter PDF</p>
                  <input id="file-upload" type="file" accept=".pdf" multiple className="hidden" onChange={(event) => handleFiles(event.target.files)} />
                </label>

                {files.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {files.map((uploaded, index) => (
                      <div key={`${uploaded.file.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <File className="h-5 w-5 text-blue-700" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-950">{uploaded.file.name}</p>
                          <p className="text-xs font-semibold text-slate-400">{FILE_TYPE_LABELS[uploaded.type]}</p>
                        </div>
                        <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="rounded-full p-2 text-slate-400 hover:bg-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={submitUpload} className="btn-primary mt-2 w-full text-base">
                      Analyze Documents
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "link" && (
              <div>
                <label className="mb-3 block text-sm font-black text-slate-700">LinkedIn profile URL</label>
                <input
                  type="url"
                  className="input"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(event) => setLinkedinUrl(event.target.value)}
                />
                <button type="button" onClick={submitLinkedin} className="btn-primary mt-5 w-full text-base">
                  Import Profile
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {activeTab === "form" && (
              <div className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">GPA</label>
                    <input type="number" step="0.1" min="0" max="4" className="input" placeholder="3.5" value={form.gpa} onChange={(event) => setForm((current) => ({ ...current, gpa: event.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">Credits completed</label>
                    <input type="number" min="0" className="input" placeholder="30" value={form.credits} onChange={(event) => setForm((current) => ({ ...current, credits: event.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">Major / field of study</label>
                  <input type="text" className="input" placeholder="Computer Science" value={form.major} onChange={(event) => setForm((current) => ({ ...current, major: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">Annual household income</label>
                  <input type="number" className="input" placeholder="45000" value={form.income} onChange={(event) => setForm((current) => ({ ...current, income: event.target.value }))} />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">Enrollment</label>
                    <select className="input" value={form.enrollment} onChange={(event) => setForm((current) => ({ ...current, enrollment: event.target.value }))}>
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">Citizenship</label>
                    <select className="input" value={form.citizenship} onChange={(event) => setForm((current) => ({ ...current, citizenship: event.target.value }))}>
                      <option>US Citizen</option>
                      <option>Permanent Resident</option>
                      <option>DACA</option>
                      <option>International</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-700">Borough</label>
                    <select className="input" value={form.borough} onChange={(event) => setForm((current) => ({ ...current, borough: event.target.value }))}>
                      <option value="">Select</option>
                      <option>Manhattan</option>
                      <option>Brooklyn</option>
                      <option>Queens</option>
                      <option>Bronx</option>
                      <option>Staten Island</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <input type="checkbox" checked={form.is_first_gen} onChange={(event) => setForm((current) => ({ ...current, is_first_gen: event.target.checked }))} className="h-4 w-4 accent-blue-700" />
                  First-generation college student
                </label>
                <button type="button" onClick={submitForm} className="btn-primary w-full text-base">
                  Find My Matches
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        <div className="mt-7 flex items-center justify-center gap-2 text-center text-sm font-bold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Your documents are processed securely and never stored permanently
        </div>
      </section>
    </main>
  )
}

export default function OnboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#eef8ff]">
          <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
        </main>
      }
    >
      <OnboardInner />
    </Suspense>
  )
}
