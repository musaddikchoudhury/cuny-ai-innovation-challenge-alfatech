"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LandingBridgeBot } from "@/components/bridgebot-widget"

type IntakeMethod = {
  icon: LucideIcon
  title: string
  detail: string
  href: string
  color: string
}

type ProgramPreview = {
  name: string
  category: string
  value: string
  status: string
}

const metrics = [
  { label: "Unclaimed CUNY aid", value: "$40M+", icon: TrendingUp, color: "text-emerald-600" },
  { label: "Indexed programs", value: "60+", icon: Landmark, color: "text-blue-600" },
  { label: "Average match", value: "$3.4K", icon: GraduationCap, color: "text-amber-600" },
  { label: "Decision time", value: "<15s", icon: Clock, color: "text-rose-600" },
]

const intakeMethods: IntakeMethod[] = [
  {
    icon: Upload,
    title: "Secure document intake",
    detail: "Transcript, resume, FAFSA, or award letter",
    href: "/onboard?tab=upload",
    color: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    icon: Search,
    title: "Guided eligibility form",
    detail: "GPA, credits, income, status, and borough",
    href: "/onboard?tab=form",
    color: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  {
    icon: FileText,
    title: "Profile import",
    detail: "LinkedIn or Handshake-ready profile signals",
    href: "/onboard?tab=link",
    color: "bg-amber-50 text-amber-700 ring-amber-200",
  },
]

const programPreview: ProgramPreview[] = [
  { name: "NYS TAP", category: "Financial Aid", value: "$5,665", status: "Strong match" },
  { name: "SNAP Benefits", category: "NYC Benefits", value: "$3,492/yr", status: "Likely eligible" },
  { name: "Excelsior Scholarship", category: "Scholarship", value: "$5,500", status: "Credit check" },
  { name: "CUNY ASAP", category: "Program", value: "$1,200", status: "Advisor review" },
]

const workflow = [
  "Normalize student profile signals",
  "Evaluate program rules and deadline risk",
  "Rank by fit, value, and urgency",
  "Return explainable next steps",
]

function fadeIn(index = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" as const },
  }
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Navbar />

      <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-28">
        <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,#0f766e,#2563eb,#f59e0b,#e11d48)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Public benefit eligibility layer
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal text-slate-950 md:text-6xl">
              BridgeAI Civic Decision Engine
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              A high-trust eligibility engine for CUNY students that turns transcripts,
              income signals, deadlines, and program rules into explainable resource decisions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/onboard"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Start eligibility scan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View decision ledger
              </Link>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {["No account required", "Explainable matches", "Student-first privacy"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="rounded-lg border border-slate-200 bg-slate-950 p-4 shadow-xl shadow-slate-200"
          >
            <div className="rounded-md bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Decision queue
                  </p>
                  <h2 className="text-base font-semibold text-slate-950">
                    Student resource determination
                  </h2>
                </div>
                <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  Ready
                </span>
              </div>

              <div className="grid gap-4 p-5">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["GPA", "3.42"],
                    ["Credits", "31"],
                    ["Income", "$38K"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-md border border-slate-200">
                  {programPreview.map((program, index) => (
                    <div
                      key={program.name}
                      className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 px-4 py-3 last:border-b-0"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">{program.name}</p>
                        <p className="text-xs text-slate-500">{program.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-950">{program.value}</p>
                        <p className={index === 0 ? "text-xs font-medium text-emerald-700" : "text-xs font-medium text-blue-700"}>
                          {program.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-md bg-slate-950 p-4 text-white">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-5 w-5 text-amber-300" />
                    <div>
                      <p className="text-sm font-semibold">Recommended first action</p>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Apply for NYS TAP first. The profile meets the enrollment and
                        income checks, and the deadline window is active.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-6 py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                {...fadeIn(index)}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <p className="text-2xl font-semibold text-slate-950">{metric.value}</p>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {metric.label}
                </p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div {...fadeIn()} className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Decision infrastructure
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
              Built for real eligibility work, not generic search.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              BridgeAI evaluates CUNY and NYC resource rules against student signals,
              then returns ranked matches with values, deadlines, and a plain-language reason.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((item, index) => (
              <motion.div
                key={item}
                {...fadeIn(index)}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-950 ring-1 ring-slate-200">
                  {index + 1}
                </div>
                <p className="font-semibold text-slate-950">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f6f8fb] px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Intake options
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
                Three verified paths into the engine.
              </h2>
            </div>
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 self-start rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 md:self-auto"
            >
              Open intake
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {intakeMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div key={method.title} {...fadeIn(index)}>
                  <Link
                    href={method.href}
                    className="block h-full rounded-lg border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200"
                  >
                    <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-md ring-1 ${method.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-950">{method.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{method.detail}</p>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div {...fadeIn()} className="rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Program ledger
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Explainable matches surfaced in seconds
              </h2>
            </div>
            <div className="divide-y divide-slate-200">
              {programPreview.map((program) => (
                <div key={program.name} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-950">{program.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{program.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-950">{program.value}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">{program.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeIn(1)} className="flex flex-col justify-center">
            <div className="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white">
              <Users className="h-7 w-7 text-amber-300" />
              <h2 className="mt-5 text-3xl font-semibold tracking-normal">
                Student-centered by default.
              </h2>
              <p className="mt-4 leading-7 text-slate-300">
                The engine prioritizes benefits students can actually act on: direct
                links, deadline context, match reasons, and follow-up reminders.
              </p>
              <Link
                href="/onboard"
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Run a scan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold text-slate-700">BridgeAI Civic Decision Engine</p>
          <p>Built for the CUNY AI Innovation Challenge.</p>
        </div>
      </footer>

      <LandingBridgeBot />
    </main>
  )
}
