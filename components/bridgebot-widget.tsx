"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

interface Msg { role: "user" | "assistant"; content: string }

// Parse markdown bold (**text**) and links ([text](url)) into JSX
function FormattedMessage({ text }: { text: string }) {
  // Split by markdown links and bold
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/\S+)/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > last) {
      parts.push(<span key={last}>{text.slice(last, match.index)}</span>)
    }

    if (match[1]) {
      // **bold**
      parts.push(<strong key={match.index} style={{ fontWeight: 600, color: "#0F172A" }}>{match[1]}</strong>)
    } else if (match[2] && match[3]) {
      // [link text](url)
      parts.push(
        <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: "#1D4ED8", textDecoration: "underline", fontWeight: 500 }}>
          {match[2]}
        </a>
      )
    } else if (match[4]) {
      // bare URL
      parts.push(
        <a key={match.index} href={match[4]} target="_blank" rel="noopener noreferrer"
          style={{ color: "#1D4ED8", textDecoration: "underline", fontWeight: 500 }}>
          {match[4]}
        </a>
      )
    }
    last = match.index + match[0].length
  }

  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>)

  // Split by newlines and render paragraphs
  const withNewlines: React.ReactNode[] = []
  parts.forEach((part, i) => {
    if (typeof part === "string" || (part as React.ReactElement).type === "span") {
      const str = typeof part === "string" ? part : (part as React.ReactElement).props.children as string
      if (typeof str === "string" && str.includes("\n")) {
        str.split("\n").forEach((line, j) => {
          if (j > 0) withNewlines.push(<br key={`br-${i}-${j}`} />)
          if (line) withNewlines.push(<span key={`${i}-${j}`}>{line}</span>)
        })
        return
      }
    }
    withNewlines.push(part)
  })

  return <span style={{ lineHeight: 1.6 }}>{withNewlines}</span>
}

const LANDING_SYSTEM = `You are BridgeBot, a friendly AI resource advisor for CUNY students on the BridgeAI platform.
BridgeAI helps CUNY students discover scholarships, financial aid, internships, NYC benefits, and campus programs they qualify for.

Your job is to:
1. Answer eligibility questions with specific, actionable information
2. Recommend real programs with real links
3. Guide students to use BridgeAI to get their full personalized match list

Key programs you know about:
- NYS TAP Grant: up to $5,665/yr for full-time CUNY students with income under $80k. Apply at https://www.hesc.ny.gov/pay-for-college/apply-for-aid/nys-tap.html
- Federal Pell Grant: up to $7,395/yr for income under $60k. Apply via FAFSA at https://studentaid.gov
- Excelsior Scholarship: tuition-free for income under $125k with 30+ credits. Apply at https://www.hesc.ny.gov
- CUNY ASAP: free MetroCards, textbooks, tutors for students under 15 credits with income under $45k. Apply at https://www.bmcc.cuny.edu/asap/
- SNAP food benefits: monthly EBT for students with income under $19k. Apply at https://access.nyc.gov/programs/snap/
- Fair Fares NYC: 50% subway discount for income under $14,580. Apply at https://www.nyc.gov/site/fairfares/index.page
- BMCC Emergency Fund: up to $1,500 for unexpected hardship. Apply at https://www.bmcc.cuny.edu/student-affairs/emergency-grant/
- NYC Summer Youth Employment (SYEP): paid 6-week summer job for ages 14-24. Apply at https://www.nyc.gov/site/dycd/services/jobs-internships/summer-youth-employment-program-syep.page
- Google STEP Internship: paid internship for CS students. Apply at https://buildyourfuture.withgoogle.com/programs/step
- Goldman Sachs Engineering: paid summer internship. Apply at https://www.goldmansachs.com/careers/students/programs/
- PTK Transfer Scholarship: $2,500 for PTK members with 3.5+ GPA transferring to 4-year CUNY. Apply at https://www.ptk.org/scholarships/
- Handshake: CUNY job and internship platform. Browse at https://joinhandshake.com
- BMCC Career Services: resume help, interview prep, job fairs. Visit https://www.bmcc.cuny.edu/student-affairs/career-development/

RULES:
- Always give a specific, direct answer — never say "it depends" without following up with what it depends on
- Include at least one clickable link per response formatted as [Link Text](https://url.com)
- If a student asks about SNAP or financial aid and hasn't provided income/GPA, ask ONE specific follow-up question
- If a student asks how to use BridgeAI, tell them: "Click [Get Started](http://localhost:3000/onboard) to upload your transcript or fill out a quick form — we'll match you to every program you qualify for in 15 seconds."
- Format key program names in **bold**
- Keep responses to 3-5 sentences maximum
- Always end with one clear next step`

const SUGGESTED = [
  "What scholarships can I get with a 3.5 GPA?",
  "Am I eligible for SNAP benefits?",
  "How do I find internships at CUNY?",
  "What is the Excelsior Scholarship?",
]

export function LandingBridgeBot() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]       = useState("")
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, thinking])

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return
    const userMsg: Msg = { role: "user", content: text }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setThinking(true)

    try {
      const res = await fetch(`${API}/chat/landing-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I couldn't connect right now. Try [uploading your documents](/onboard) to get your full resource match.",
      }])
    } finally {
      setThinking(false)
    }
  }, [messages])

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 90,
          width: 60, height: 60,
          background: "#1D4ED8",
          border: "none", borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(29,78,216,0.4)",
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X size={24} color="white" />
              </motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle size={24} color="white" />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring when closed */}
      {!open && (
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: "fixed", bottom: 32, right: 32, zIndex: 89,
            width: 60, height: 60,
            borderRadius: 20,
            background: "#1D4ED8",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "fixed", bottom: 104, right: 32, zIndex: 90,
              width: 380, height: 560,
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 24,
              boxShadow: "0 20px 60px rgba(15,23,42,0.14)",
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", gap: 12,
              background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
            }}>
              <div style={{
                width: 38, height: 38, background: "rgba(255,255,255,0.2)",
                borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "white" }}>BridgeBot</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                  &#9679; Ask me anything about CUNY resources
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: "16px 16px 8px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {messages.length === 0 && (
                <div>
                  <div style={{
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "12px 14px", marginBottom: 16,
                    fontSize: 13, color: "#334155", lineHeight: 1.6,
                  }}>
                    Hi! I&apos;m BridgeBot. I can help you discover scholarships, benefits, and
                    internships you qualify for as a CUNY student. What would you like to know?
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                    Try asking:
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {SUGGESTED.map(s => (
                      <button key={s} onClick={() => send(s)}
                        style={{
                          padding: "9px 13px",
                          background: "#F0F9FF",
                          border: "1px solid #DBEAFE",
                          borderRadius: 10,
                          fontSize: 12, color: "#1D4ED8",
                          cursor: "pointer", textAlign: "left",
                          fontWeight: 500,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#DBEAFE")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#F0F9FF")}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{
                    padding: "10px 14px",
                    fontSize: 13, lineHeight: 1.6,
                    maxWidth: "88%",
                    ...(m.role === "user"
                      ? {
                          alignSelf: "flex-end",
                          background: "#1D4ED8", color: "white",
                          borderRadius: "16px 16px 4px 16px",
                        }
                      : {
                          alignSelf: "flex-start",
                          background: "#F8FAFC", color: "#334155",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px 16px 16px 4px",
                        }
                    ),
                  }}>
                    {m.role === "assistant"
                      ? <FormattedMessage text={m.content} />
                      : m.content
                    }
                  </div>
                </div>
              ))}

              {thinking && (
                <div style={{
                  alignSelf: "flex-start",
                  background: "#F8FAFC", border: "1px solid #E2E8F0",
                  borderRadius: "16px 16px 16px 4px",
                  padding: "12px 16px",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "12px 14px",
              borderTop: "1px solid #E2E8F0",
              display: "flex", gap: 8,
              background: "#fff",
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
                placeholder="Ask about scholarships, SNAP, internships..."
                style={{
                  flex: 1,
                  padding: "10px 13px",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  fontSize: 13, color: "#0F172A",
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "#1D4ED8")}
                onBlur={e => (e.target.style.borderColor = "#E2E8F0")}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: input.trim() && !thinking ? "#1D4ED8" : "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: input.trim() && !thinking ? "pointer" : "default",
                  transition: "background 0.15s",
                }}
              >
                <Send size={15} color={input.trim() && !thinking ? "white" : "#94A3B8"} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Also export the system prompt so the backend endpoint can use it
export const LANDING_BOT_SYSTEM = LANDING_SYSTEM
