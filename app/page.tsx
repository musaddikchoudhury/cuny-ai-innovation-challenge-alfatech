"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import {
LinkIcon, Upload, FileText, ShieldCheck,
TrendingUp, Zap, Users, Clock, ArrowRight, CheckCircle2,
} from "lucide-react"

// ── DATA ─────────────────────────────────────────────────────────────────────
const CUNY_COLLEGES = [
"BMCC", "Hunter College", "Baruch College", "City College",
"Queens College", "Lehman College", "John Jay College",
"Brooklyn College", "Medgar Evers", "LaGuardia CC",
"Hostos CC", "Kingsborough CC", "York College",
]

const METHOD_CARDS = [
{
icon: LinkIcon,
title: "Paste LinkedIn URL",
description: "We extract your education, skills, and experience automatically in seconds.",
href: "/onboard?tab=link",
accent: "#1D4ED8",
accentBg: "#EFF6FF",
time: "~5 sec",
},
{
icon: Upload,
title: "Upload Documents",
description: "Drop your transcript, FAFSA, or resume PDF. Our AI reads it instantly.",
href: "/onboard?tab=upload",
accent: "#059669",
accentBg: "#F0FDF4",
time: "~15 sec",
featured: true,
},
{
icon: FileText,
title: "Quick Profile Form",
description: "Answer 6 questions and get a full resource match — no documents needed.",
href: "/onboard?tab=form",
accent: "#7C3AED",
accentBg: "#F5F3FF",
time: "~3 min",
},
]

const STATS = [
{ label: "Unclaimed CUNY Aid",   value: "$40M+",  icon: TrendingUp  },
{ label: "Avg Match Per Student", value: "$3,400", icon: Zap         },
{ label: "Resources Indexed",    value: "60+",    icon: Users       },
{ label: "Time to Results",      value: "< 15s",  icon: Clock       },
]

const HOW_IT_WORKS = [
{
step: "01",
title: "Upload your profile",
description: "Paste a LinkedIn URL, upload your transcript PDF, or answer our 6-question form.",
},
{
step: "02",
title: "AI matches your eligibility",
description: "Our engine checks 60+ programs against your real GPA, income, credits, and status.",
},
{
step: "03",
title: "Apply with one click",
description: "Every match includes a direct application link, deadline, and AI-written explanation.",
},
]

const PROGRAMS_PREVIEW = [
{ name: "NYS TAP", amount: "$5,665", category: "Financial Aid" },
{ name: "SNAP Benefits", amount: "$3,492/yr", category: "NYC Benefits" },
{ name: "Excelsior Scholarship", amount: "$5,500", category: "Scholarship" },
{ name: "CUNY ASAP", amount: "$1,200", category: "Program" },
{ name: "PTK Scholarship", amount: "$2,500", category: "Scholarship" },
{ name: "NYC SYEP", amount: "$3,500", category: "Internship" },
]

const FADE_UP = {
hidden:  { opacity: 0, y: 24 },
visible: (i = 0) => ({
opacity: 1,
y: 0,
transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
}),
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
return (
<main style={{ background: "var(--bg)", color: "var(--text-1)", overflow: "hidden" }}>
<Navbar />
{/* ── HERO ── */}
<section
className="relative"
style={{
paddingTop: 140,
paddingBottom: 80,
paddingLeft: 24,
paddingRight: 24,
background: "linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 60%)",
}}
>
{/* Decorative dots */}
<div
className="absolute inset-0 pointer-events-none"
style={{
backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)",
backgroundSize: "28px 28px",
opacity: 0.35,
}}
/>
<div className="relative max-w-4xl mx-auto text-center">
{/* Badge */}
<motion.div
initial={{ opacity: 0, scale: 0.92 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.4 }}
className="inline-flex items-center gap-2 mb-8"
style={{
padding: "6px 14px",
background: "var(--accent-3)",
border: "1px solid rgba(29,78,216,0.18)",
borderRadius: 99,
fontSize: 12,
fontWeight: 600,
color: "var(--accent-text)",
letterSpacing: "0.04em",
}}
>
<span
style={{
width: 7, height: 7,
background: "var(--accent)",
borderRadius: "50%",
display: "inline-block",
}}
/>
Built for CUNY Students · Brooklyn, NY
</motion.div>
{/* Headline */}
<motion.h1
initial={{ opacity: 0, y: 28 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.55, delay: 0.05 }}
style={{
fontSize: "clamp(40px, 7vw, 76px)",
fontWeight: 700,
lineHeight: 1.08,
letterSpacing: "-2px",
color: "var(--text-1)",
marginBottom: 28,
}}
>
Your resources.{" "}
<span style={{ color: "var(--accent)" }}>
Finally found.
</span>
</motion.h1>
{/* Subtext */}
<motion.p
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.2 }}
style={{
fontSize: 18,
color: "var(--text-3)",
maxWidth: 560,
margin: "0 auto 40px",
lineHeight: 1.7,
fontWeight: 400,
}}
>
CUNY students leave over{" "}
<strong style={{ color: "var(--text-2)", fontWeight: 600 }}>$40 million in aid</strong>{" "}
unclaimed every year — not because resources don&apos;t exist, but because they&apos;re impossible to navigate.
BridgeAI fixes that in 15 seconds.
</motion.p>
{/* CTAs */}
<motion.div
initial={{ opacity: 0, y: 12 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.3 }}
className="flex flex-col sm:flex-row items-center justify-center gap-4"
>
<Link href="/onboard" className="btn-primary" style={{ fontSize: 15, padding: "14px 32px", borderRadius: 14 }}>
Find My Resources <ArrowRight size={16} />
</Link>
<div
className="flex items-center gap-2"
style={{ fontSize: 13, fontWeight: 500, color: "var(--text-3)" }}
>
<ShieldCheck size={15} color="var(--success)" />
Your data is never sold or shared
</div>
</motion.div>
{/* Trust row */}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ delay: 0.45 }}
className="flex flex-wrap items-center justify-center gap-6 mt-10"
style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}
>
{["No account required to start", "Results in under 15 seconds", "Free forever for students"].map((t) => (
<span key={t} className="flex items-center gap-1.5">
<CheckCircle2 size={13} color="var(--success)" />
{t}
</span>
))}
</motion.div>
</div>
</section>
{/* ── CUNY MARQUEE ── */}
<div
className="relative overflow-hidden py-6"
style={{
borderTop: "1px solid var(--border)",
borderBottom: "1px solid var(--border)",
background: "var(--surface)",
}}
>
<div className="marquee-track flex" style={{ width: "max-content", gap: 0 }}>
{[...CUNY_COLLEGES, ...CUNY_COLLEGES].map((college, i) => (
<span
key={i}
style={{
padding: "0 40px",
fontSize: 13,
fontWeight: 700,
letterSpacing: "0.12em",
textTransform: "uppercase",
color: "var(--border-md)",
whiteSpace: "nowrap",
}}
>
{college}
</span>
))}
</div>
</div>
{/* ── STATS ── */}
<section className="max-w-5xl mx-auto px-6 py-20">
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
{STATS.map((stat, i) => (
<motion.div
key={stat.label}
custom={i}
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
variants={FADE_UP}
className="text-center"
style={{
padding: "28px 20px",
background: "var(--surface)",
borderRadius: "var(--r-xl)",
border: "1px solid var(--border)",
}}
>
<div
style={{
width: 40, height: 40,
background: "var(--accent-3)",
borderRadius: 12,
display: "flex", alignItems: "center", justifyContent: "center",
margin: "0 auto 16px",
}}
>
<stat.icon size={18} color="var(--accent)" />
</div>
<div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
{stat.value}
</div>
<div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
{stat.label}
</div>
</motion.div>
))}
</div>
</section>
{/* ── METHOD CARDS ── */}
<section
className="px-6 py-20"
style={{ background: "var(--surface-2)" }}
>
<div className="max-w-6xl mx-auto">
<motion.div
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
variants={FADE_UP}
className="text-center mb-14"
>
<p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
Three ways to start
</p>
<h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text-1)" }}>
Choose your path in
</h2>
</motion.div>
<div className="grid md:grid-cols-3 gap-6">
{METHOD_CARDS.map((card, i) => (
<motion.div
key={card.title}
custom={i}
initial="hidden"
whileInView="visible"
viewport={{ once: true }}
variants={FADE_UP}
whileHover={{ y: -4, transition: { duration: 0.2 } }}
>
<Link href={card.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
<div
className="card h-full"
style={{
padding: "36px 32px",
border: card.featured ? "2px solid var(--accent)" : "1px solid var(--border)",
position: "relative",
overflow: "hidden",
}}
>
{card.featured && (
<div
className="badge badge-blue"
style={{ position: "absolute", top: 20, right: 20 }}
>
Most Popular
</div>
)}
<div
style={{
width: 52, height: 52,
background: card.accentBg,
borderRadius: 16,
display: "flex", alignItems: "center", justifyContent: "center",
marginBottom: 24,
}}
>
<card.icon size={22} color={card.accent} />
</div>
<div style={{ marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
<h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>
{card.title}
</h3>
</div>
<p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.65, marginBottom: 28 }}>
{card.description}
</p>
<div className="flex items-center justify-between">
<span
style={{
fontSize: 12, fontWeight: 600,
color: card.accent,
background: card.accentBg,
padding: "4px 10px",
borderRadius: 99,
}}
>
{card.time}
</span>
<ArrowRight size={16} color="var(--text-muted)" />
</div>
</div>
</Link>
</motion.div>
))}
</div>
</div>
</section>
{/* ── HOW IT WORKS ── */}
<section className="max-w-5xl mx-auto px-6 py-24">
<motion.div
initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
className="text-center mb-16"
>
<p style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
How it works
</p>
<h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text-1)" }}>
From zero to matched in 3 steps
</h2>
</motion.div>
<div className="grid md:grid-cols-3 gap-8">
{HOW_IT_WORKS.map((step, i) => (
<motion.div
key={step.step}
custom={i}
initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
style={{ textAlign: "center", padding: "0 16px" }}
>
<div
style={{
fontSize: 11, fontWeight: 700,
color: "var(--accent)", letterSpacing: "0.1em",
background: "var(--accent-3)",
border: "1px solid rgba(29,78,216,0.15)",
padding: "4px 12px",
borderRadius: 99,
display: "inline-block",
marginBottom: 20,
}}
>
STEP {step.step}
</div>
<h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>
{step.title}
</h3>
<p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.65 }}>
{step.description}
</p>
</motion.div>
))}
</div>
</section>
{/* ── PROGRAMS PREVIEW ── */}
<section
className="px-6 py-20"
style={{ background: "var(--surface)" }}
>
<div className="max-w-5xl mx-auto">
<motion.div
initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
className="text-center mb-14"
>
<h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "var(--text-1)" }}>
Programs you might qualify for right now
</h2>
</motion.div>
<div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
{PROGRAMS_PREVIEW.map((prog, i) => (
<motion.div
key={prog.name}
custom={i}
initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
style={{
background: "var(--bg)",
border: "1px solid var(--border)",
borderRadius: "var(--r-lg)",
padding: "20px 24px",
display: "flex",
alignItems: "center",
justifyContent: "space-between",
gap: 12,
}}
>
<div>
<p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>{prog.name}</p>
<span className="badge badge-slate" style={{ fontSize: 11 }}>{prog.category}</span>
</div>
<span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap" }}>
{prog.amount}
</span>
</motion.div>
))}
</div>
<div className="text-center mt-12">
<Link href="/onboard" className="btn-primary" style={{ display: "inline-flex", fontSize: 15, padding: "14px 36px" }}>
See What You Qualify For <ArrowRight size={16} />
</Link>
</div>
</div>
</section>
{/* ── CTA BANNER ── */}
<section
className="mx-6 my-20 rounded-3xl p-16 text-center"
style={{
background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #3B82F6 100%)",
maxWidth: 960,
marginLeft: "auto",
marginRight: "auto",
}}
>
<motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}>
<h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "white", marginBottom: 16, letterSpacing: "-1px" }}>
Stop leaving money on the table.
</h2>
<p style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
The average CUNY student is eligible for over $3,400 in aid they haven&apos;t claimed. Find yours in 15 seconds.
</p>
<Link
href="/onboard"
style={{
display: "inline-flex",
alignItems: "center",
gap: 8,
padding: "14px 32px",
background: "white",
color: "var(--accent)",
fontWeight: 700,
fontSize: 15,
borderRadius: 14,
textDecoration: "none",
transition: "transform 0.15s",
boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
}}
>
Start Free Scan <ArrowRight size={16} />
</Link>
</motion.div>
</section>
{/* ── FOOTER ── */}
<footer
style={{
borderTop: "1px solid var(--border)",
padding: "40px 24px",
textAlign: "center",
background: "var(--surface)",
}}
>
<p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.05em" }}>
© 2026 BridgeAI · Built for CUNY Students · Brooklyn, NY
</p>
</footer>
</main>
)
}
