# 🏙️ BridgeAI — Civic Decision Engine

[![CUNY AI Challenge](https://img.shields.io/badge/4th%20CUNY%20AI%20Innovation%20Challenge-orange)](#)
[![Software Track](https://img.shields.io/badge/Track-Software-blue)](#)
[![Claude](https://img.shields.io/badge/AI-Claude%20by%20Anthropic-blueviolet)](#)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)](#)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](#)

> *"AI suggests — our system decides — and when needed, it connects you to real human help."*

**🌐 Live:** [bridgeai-silk.vercel.app](https://bridgeai-silk.vercel.app)

CUNY students leave over **$40M in aid unclaimed every year** because eligibility
rules are buried in fragmented systems and 80-page PDFs. BridgeAI fixes that in 15 seconds —
upload your transcript, get every scholarship, benefit, and internship you qualify for,
ranked and explained.

---

## ✨ What It Does

- **Upload a transcript, resume, or paste a LinkedIn URL** → AI extracts your profile instantly
- **Civic Ledger** matches you against 60+ scholarships, benefits, and programs (TAP, Excelsior, SNAP, CUNY ASAP, and more)
- **Live job matching** via NYC Open Data — AI tailors your resume per listing
- **Average match: $3,400/student** · Results in under 15 seconds · Free forever

---

## ⚙️ Architecture

The core design decision: **Claude handles NLP only — all eligibility decisions are deterministic.**
PDF / LinkedIn URL / Form input
│
▼
Claude API (Anthropic)
Extracts: GPA, credits, enrollment status, financials
│
▼
Urban-Sync Civic Ledger        ← rule-based Python engine, zero AI
Evaluates 60+ benefit programs
Returns verified, binary-qualified matches
│
▼
NYC Open Data (Socrata API)
Live job listings matched to major + skills
AI resume tailoring per listing
│
▼
FastAPI (7 REST endpoints) → Next.js frontend
Ranked results · plain-language explanations · one-click apply

Keeping AI out of the eligibility decision was intentional — a wrong answer
has real consequences for a student. Claude feeds structured data into the
Civic Ledger; it never makes the call.

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js · TypeScript · Tailwind CSS |
| Backend | Python · FastAPI |
| AI / NLP | Claude API (Anthropic) |
| Decision Engine | Custom deterministic Python (Urban-Sync Civic Ledger) |
| External Data | NYC Open Data — Socrata API |
| Deployment | Vercel (frontend) |

---

## 👤 My Role

I built the full technical stack — backend and frontend — end to end.

**Backend (FastAPI)**
- All 7 REST API endpoints (`/analyze`, `/benefits`, `/jobs`, `/tailor-resume`, and more)
- Claude integration for PDF + LinkedIn transcript parsing and NLP extraction
- Urban-Sync Civic Ledger: deterministic eligibility engine that separates AI inference from benefit decisions, eliminating hallucination risk
- NYC Open Data (Socrata) integration for live job matching
- AI resume tailoring pipeline per job listing

**Frontend (Next.js)**
- Full client from scratch: onboarding flow (LinkedIn URL, PDF upload, or form), ranked results dashboard, job match UI
- Three onboarding paths: LinkedIn URL (~5s), document upload (~15s), quick form (~3 min)
- Typed API client connecting all frontend views to FastAPI

**System Design**
- Designed the hybrid AI + deterministic architecture
- Chose to isolate Claude to extraction-only tasks — the key decision that makes the system trustworthy for high-stakes civic use

---

## 🚀 Running Locally

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add ANTHROPIC_API_KEY + SOCRATA_APP_TOKEN
uvicorn main:app --reload
# API → http://localhost:8000  |  Docs → http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # add NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# App → http://localhost:3000
```

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/analyze` | POST | Parse transcript/LinkedIn via Claude → student profile |
| `/benefits` | POST | Run Civic Ledger → return qualified benefits |
| `/jobs` | POST | Match profile to live NYC Open Data listings |
| `/tailor-resume` | POST | Generate AI-tailored resume bullets per listing |
| `/eligibility` | GET | Full eligibility ruleset (transparency) |
| `/resources` | GET | CUNY/NYC resource directory |
| `/connect-human` | POST | Route student to human support |

---

## 🔮 Roadmap

- [ ] Supabase auth + persistent student profiles
- [ ] pgvector semantic search across benefit documents
- [ ] Deadline reminder notifications
- [ ] Multilingual support (Spanish, Bengali, Mandarin)
- [ ] Expand beyond CUNY to all NYC public colleges

---

<p align="center">
  Built at the 4th CUNY AI Innovation Challenge · Spring 2026<br>
  <strong>Runner-Up, Software Track</strong>
</p>
