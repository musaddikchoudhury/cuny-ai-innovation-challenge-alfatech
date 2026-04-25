# 🏙️ AlfaTech AI Copilot
### Powered by Urban-Sync (The Civic Ledger)

[![Software Track](https://img.shields.io/badge/Track-Software-blue)](#)
[![Public Interest Tech](https://img.shields.io/badge/Category-Public%20Interest%20Tech-green)](#)
[![CUNY Innovation](https://img.shields.io/badge/Challenge-CUNY%20AI%20Innovation-orange)](#)
[![Powered by Claude](https://img.shields.io/badge/AI-Claude%20by%20Anthropic-blueviolet)](#)

> **"AI suggests — our system decides — and when needed, it connects you to real human help."**

🌐 [Project Website & Demo](https://sites.google.com/view/alfatech-ai-copilot/home)

---

## 📌 The Problem: The $1.5 Billion Opportunity Gap

In New York City, over **$1.5 Billion** in municipal aid goes unclaimed annually because 
eligibility rules are buried in fragmented systems and 80-page bureaucratic PDFs.

- **The Burden:** Students spend hours searching for help with no clear answers
- **The Impact:** 82% higher dropout risk for students with unmet basic needs
- **The Gap:** Students don't fail eligibility — they fail the paperwork

---

## 🚀 The Solution: AlfaTech Civic Decision Engine

AlfaTech is not a chatbot — it is **Civic Middleware**. Upload your transcript. 
Get every scholarship, benefit, and internship you qualify for in seconds — verified, 
ranked, and explained.



---

## ⚙️ How It Works (Technical Pipeline)

1. **Ingest** — Student uploads an unofficial transcript or FAFSA summary (PDF)
2. **Extract** — Claude (Anthropic) parses the PDF and extracts GPA, credits, income,
   major, enrollment status, and citizenship into structured JSON
3. **Validate** — The Civic Ledger runs deterministic Python eligibility rules against
   18 real CUNY/NYC programs using hard-coded government thresholds
4. **Rank** — Claude scores each matched program by fit (50–100) with a
   one-sentence explanation tailored to the student's profile
5. **Surface** — NYC Open Data (Socrata API) returns live job listings matched
   to the student's major, enriched with Handshake and Indeed links
6. **Advise** — BridgeBot (Claude-powered) answers follow-up questions with
   full profile context in real time

---

## 🏛️ Core Innovation: The Civic Ledger

Unlike AI assistants that hallucinate rules, our **Civic Ledger** is a deterministic 
Python rule engine that encodes real NYC and CUNY policy into executable logic:

- **Accuracy** — Decisions are based on hard-coded government thresholds 
  (income limits, GPA floors, credit requirements)
- **Transparency** — Every match includes a Logic Trace explaining exactly 
  why the student qualifies, citing the specific rule used
- **Safety** — Claude handles interpretation and extraction only; 
  the Ledger holds final eligibility decision authority
- **Coverage** — 18 programs across Financial Aid, NYC Benefits, 
  Scholarships, and Internships — totalling up to **$63,000+** in potential value

---

## 💻 Technical Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.10+) |
| AI Engine | Claude Haiku — Anthropic API |
| Decision Engine | Custom Python Civic Ledger (`resources.json`) |
| PDF Parsing | pdfplumber |
| Data Layer | NYC Open Data via Socrata API |
| Frontend | Next.js 16 + TypeScript + Tailwind CSS |
| Job Matching | NYC Citywide Jobs API + Handshake + Indeed |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/extract-profile` | POST | Upload PDF → Claude extracts student profile |
| `/match` | POST | Run Civic Ledger → return ranked resource matches |
| `/chat/landing-bot` | POST | Public BridgeBot — no profile required |
| `/chat/bridge-bot` | POST | Dashboard BridgeBot — profile-aware advisor |
| `/nyc-jobs` | GET | Live NYC jobs matched to student's major |
| `/tailor-resume` | POST | Claude tailors resume bullets to a job description |
| `/health` | GET | System status check |

---

## ⚖️ Public Interest Technology (PIT) Alignment

- **Accessibility** — Translates bureaucratic jargon into plain English
- **Equity** — Directs resources to the most vulnerable who aren't aware 
  of their eligibility
- **Transparency** — The Logic Trace provides auditable, explainable decisions
- **Accountability** — Deterministic code ensures no student is left 
  to AI guesswork
- **Safety** — AI handles interpretation only; the Ledger holds final 
  decision authority

---

## 🚀 Running Locally

```bash
# Backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
npm install
npm run dev
```

Set your environment variables:
ANTHROPIC_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000

---

## 👥 Team Alfa Tech

| Name | Role |
|------|------|
| Dhimy Jean | Team Lead |
| Musaddik Choudhury | AI & Backend |
| Rafiatou Kone | Research & PIT |
| Jorys Koutiebou | Frontend & Demo |

*Built for the 4th CUNY AI Innovation Challenge | Spring 2026 | CUNY BMCC*
