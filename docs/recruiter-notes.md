# Recruiter Notes — BridgeAI (candidate ready checklist)

Summary
- Purpose: BridgeAI matches CUNY students to scholarships/benefits/internships using a hybrid AI + rule-based decision engine.
- Status: Demo-ready prototype with production-like developer workflow, tests, and CI.

Key improvements
- Typed frontend API contracts: `lib/types.ts` and `lib/api.ts` reduce integration risk.
- Backend tests: `tests/test_health.py`, `tests/test_match.py` (pytest, TestClient).
- CI: `.github/workflows/ci.yml` runs frontend build, lint, TypeScript checks, Python py_compile, and pytest.
- Docker: `docker-compose.yml` with API healthcheck for reproducible local stacks.
- UX: Onboarding now uses typed client and has loading/error boundaries; onboarding uploads call `/extract-profile` then `/match/ledger`.

How to run locally (quick demo)
1. Copy environment variables:
   cp .env.example .env
   (optionally set `ANTHROPIC_API_KEY` for AI endpoints)
2. Start backend:
```bash
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
3. Start frontend (in repo root):
```bash
npm run dev
```
4. Open the app: frontend prints URL (e.g. http://localhost:3000 or 3002). Use `Get Started` → upload a sample PDF or fill the quick form.

How to verify (quick checks)
- Health: `curl http://127.0.0.1:8000/health`
- Match endpoint: `curl -X POST http://127.0.0.1:8000/match/ledger -H 'Content-Type: application/json' -d '{...}'`
- Run tests: `pytest -q`
- Build frontend: `npm run build`

Recommended next steps
- Add end-to-end tests (Playwright) for onboarding flow and dashboard.  
- Add persistent demo accounts (SQLite) to demonstrate saved dashboards.  
- Polish accessibility (ARIA) and add unit tests for key UI components.  
- Replace temporary process-wide warnings with an explicit startup `lifespan` check and fail fast if required secrets are missing in production.

Contact
- For a guided demo, run the above commands and I'll walk through the code and endpoints.
