"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import resourceCatalog from "@/resources.json"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  ShieldCheck,
  TrendingUp,
  Upload,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { LandingBridgeBot } from "@/components/bridgebot-widget"

const RESOURCE_COUNT = Array.isArray(resourceCatalog) ? resourceCatalog.length : 18

type Metric = {
  label: string
  value: string
  icon: LucideIcon
}

type PathCard = {
  icon: LucideIcon
  title: string
  detail: string
  href: string
  time: string
  badge?: string
  tone: string
}

const metrics: Metric[] = [
  { label: "Unclaimed CUNY aid", value: "$40M+", icon: TrendingUp },
  { label: "Avg match per student", value: "$3,400", icon: Zap },
  { label: "Resources indexed", value: `${RESOURCE_COUNT}`, icon: Users },
  { label: "Time to results", value: "< 15s", icon: Clock3 },
]

const paths: PathCard[] = [
  {
    icon: Link2,
    title: "Paste LinkedIn URL",
    detail: "We extract your education, skills, and experience automatically in seconds.",
    href: "/onboard?tab=link",
    time: "~5 sec",
    tone: "bg-blue-50 text-blue-700",
  },
  {
    icon: Upload,
    title: "Upload Documents",
    detail: "Drop your transcript, FAFSA, or resume PDF. Our AI reads it instantly.",
    href: "/onboard?tab=upload",
    time: "~15 sec",
    badge: "Most Popular",
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: FileText,
    title: "Quick Profile Form",
    detail: "Answer a few questions and get a full resource match without documents.",
    href: "/onboard?tab=form",
    time: "~3 min",
    tone: "bg-violet-50 text-violet-700",
  },
]

const proofPoints = [
  "No account required to start",
  "Results in under 15 seconds",
  "Free forever for students",
]

function fadeUp(index = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.45, delay: index * 0.06, ease: "easeOut" as const },
  }
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <Navbar />

      <section className="relative border-b border-slate-200 bg-[radial-gradient(circle_at_1px_1px,#dbeafe_1px,transparent_0)] bg-[length:36px_36px] px-5 pt-[122px]">
        <div className="mx-auto flex min-h-[735px] w-full max-w-7xl flex-col items-center justify-center pb-20 text-center">
          <div className="inline-flex max-w-full items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold tracking-wide text-blue-700 sm:px-5 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-700" />
            Built for CUNY Students<span className="hidden sm:inline"> · Brooklyn, NY</span>
          </div>

          <h1 className="mt-14 max-w-[350px] text-4xl font-black leading-[1.02] tracking-normal text-slate-950 sm:max-w-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block">Your resources.</span>
            <span className="block text-blue-700">Finally found.</span>
          </h1>

          <p className="mt-10 max-w-[340px] text-lg leading-8 text-slate-500 sm:mt-12 sm:max-w-3xl sm:text-2xl sm:leading-9">
            CUNY students leave over <span className="font-bold text-slate-900">$40 million in aid</span> unclaimed every year
            because resources are hard to navigate. BridgeAI fixes that in 15 seconds.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link href="/onboard" className="btn-primary min-h-16 min-w-[270px] text-lg">
              Find My Resources
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="inline-flex items-center gap-3 text-sm font-bold text-slate-500">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Your data is never sold or shared
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-5 text-sm font-bold text-slate-400 sm:flex-row sm:gap-9">
            {proofPoints.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-28">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                {...fadeUp(index)}
                className="flex min-h-[225px] flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50/70 p-8 text-center"
              >
                <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-4xl font-black tracking-normal text-slate-950">{metric.value}</p>
                <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">{metric.label}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="bg-[#eef8ff] px-5 py-28">
        <div className="mx-auto w-full max-w-7xl">
          <motion.div {...fadeUp()} className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Three ways to start</p>
            <h2 className="mt-8 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              Choose your path in seconds
            </h2>
          </motion.div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {paths.map((path, index) => {
              const Icon = path.icon
              const featured = Boolean(path.badge)
              return (
                <motion.div key={path.title} {...fadeUp(index)}>
                  <Link
                    href={path.href}
                    className={`group relative flex min-h-[360px] flex-col rounded-[22px] border bg-white p-10 text-left shadow-md shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl ${
                      featured ? "border-2 border-blue-700" : "border-slate-200"
                    }`}
                  >
                    {path.badge && (
                      <span className="absolute right-8 top-7 rounded-full bg-blue-100 px-4 py-1 text-sm font-bold text-blue-700">
                        {path.badge}
                      </span>
                    )}
                    <div className={`mb-10 flex h-16 w-16 items-center justify-center rounded-2xl ${path.tone}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-black tracking-normal text-slate-950">{path.title}</h3>
                    <p className="mt-4 max-w-sm text-lg leading-8 text-slate-500">{path.detail}</p>
                    <div className="mt-auto flex items-center justify-between pt-10">
                      <span className={`rounded-full px-4 py-2 text-sm font-bold ${path.tone}`}>{path.time}</span>
                      <ArrowRight className="h-6 w-6 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...fadeUp()}>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Civic decision engine</p>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-tight tracking-normal text-slate-950">
              Ranked matches with reasons, values, and deadlines.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-500">
              BridgeAI turns scattered student signals into an explainable ledger of financial aid,
              public benefits, internships, and campus support.
            </p>
            <Link href="/onboard" className="btn-primary mt-8">
              Start matching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div {...fadeUp(1)} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5 shadow-lg shadow-slate-200/70">
            <div className="rounded-2xl bg-white p-6">
              {[
                ["NYS TAP", "Financial Aid", "$5,665", "Strong match"],
                ["Excelsior Scholarship", "Scholarship", "$5,500", "Credit check"],
                ["SNAP Benefits", "NYC Benefits", "$3,492/yr", "Likely eligible"],
                ["CUNY ASAP", "Program", "$1,200", "Advisor review"],
              ].map(([name, category, value, status], index) => (
                <div key={name} className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 py-4 last:border-b-0">
                  <div>
                    <p className="font-black text-slate-950">{name}</p>
                    <p className="mt-1 text-sm text-slate-400">{category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-950">{value}</p>
                    <p className={index === 0 ? "mt-1 text-sm font-bold text-emerald-600" : "mt-1 text-sm font-bold text-blue-700"}>
                      {status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-semibold text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>BridgeAI</p>
          <p>Built for the CUNY AI Innovation Challenge.</p>
        </div>
      </footer>

      <LandingBridgeBot />
    </main>
  )
}
