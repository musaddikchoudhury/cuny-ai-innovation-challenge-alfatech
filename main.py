"""
BridgeAI -- Analytics Engine v3.4 Final
Anthropic Claude API + null-safe validation + fixed AI ranking + landing bot
endpoint.
"""

import io
import json
import logging
import os
import re
import requests
import pdfplumber
import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from functools import lru_cache
from pathlib import Path
import db

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
APP_VERSION = "3.4.0"
DEFAULT_DEV_FRONTEND_URL = "http://localhost:3000"

logger = logging.getLogger("bridgeai")
if not logging.getLogger().handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

app = FastAPI(title="BridgeAI Engine", version="3.4.0")


def cors_origins() -> List[str]:
    raw = os.getenv("FRONTEND_URL", "").strip()
    if not raw:
        return [DEFAULT_DEV_FRONTEND_URL, "http://127.0.0.1:3000"]

    return [
        origin.strip().rstrip("/")
        for origin in raw.split(",")
        if origin.strip()
    ]


def primary_frontend_url() -> str:
    raw = os.getenv("FRONTEND_URL", "").split(",")[0].strip().rstrip("/")
    if raw and raw != "*":
        return raw
    return DEFAULT_DEV_FRONTEND_URL


def runtime_configuration_summary() -> dict[str, object]:
    resources_loaded = len(get_resources())
    ai_configured = bool(os.getenv(ANTHROPIC_KEY_ENV))
    return {
        "version": APP_VERSION,
        "resources_loaded": resources_loaded,
        "ai_configured": ai_configured,
        "frontend_url": PUBLIC_APP_URL,
        "allowed_origins": cors_origins(),
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = "claude-haiku-4-5-20251001"
PUBLIC_APP_URL = primary_frontend_url()
ANTHROPIC_KEY_ENV = "ANTHROPIC_API_KEY"


class MissingAIConfigurationError(RuntimeError):
    """Raised when an endpoint needs Claude but Railway is missing the API key."""


def ai_configuration_error(feature: str) -> HTTPException:
    return HTTPException(
        status_code=503,
        detail=(
            f"{feature} is temporarily unavailable because the BridgeAI AI service "
            f"is not configured. Add {ANTHROPIC_KEY_ENV} in Railway Variables, "
            "redeploy the service, and try again."
        ),
    )


def anthropic_client() -> anthropic.Anthropic:
    api_key = os.getenv(ANTHROPIC_KEY_ENV)
    if not api_key:
        raise MissingAIConfigurationError(f"{ANTHROPIC_KEY_ENV} is not configured.")
    return anthropic.Anthropic(api_key=api_key)


@app.on_event("startup")
def log_startup_configuration() -> None:
    summary = runtime_configuration_summary()
    if not summary["ai_configured"]:
        logger.warning(
            "%s is not set; AI-powered endpoints will return 503 until it is configured.",
            ANTHROPIC_KEY_ENV,
        )

    logger.info(
        "BridgeAI backend ready: version=%s resources=%s frontend=%s",
        summary["version"],
        summary["resources_loaded"],
        summary["frontend_url"],
    )
    # Initialize simple persistence DB for demo saved profiles
    try:
        db.init_db()
        logger.info("Persistence DB initialized: %s", db.DB_PATH)
    except Exception:
        logger.exception("Could not initialize persistence DB")


@app.exception_handler(Exception)
def global_exception_handler(request, exc):
    logger.exception("Unhandled exception during request %s %s", request.method, request.url)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.post("/save")
def save_profile_endpoint(payload: dict):
    """Save profile and match results to a simple SQLite DB for demo persistence."""
    try:
        profile = payload.get("profile") or payload.get("profile_data") or payload
        matches = payload.get("matches") or {}
        rowid = db.save_profile(profile, matches)
        return {"id": rowid}
    except Exception as e:
        logger.exception("Failed to save profile: %s", e)
        raise HTTPException(status_code=500, detail="Failed to save profile")


LANDING_BOT_SYSTEM = f"""You are BridgeBot, a friendly AI resource advisor for CUNY students on the BridgeAI platform.
BridgeAI helps CUNY students discover scholarships, financial aid, internships, and NYC benefits in 15 seconds.

Programs and links you know:
- NYS TAP Grant: up to $5,665/yr, full-time CUNY, income under $80k -> https://www.hesc.ny.gov/pay-for-college/apply-for-aid/nys-tap.html
- Federal Pell Grant: up to $7,395/yr, income under $60k, apply via FAFSA -> https://studentaid.gov
- Excelsior Scholarship: tuition-free, income under $125k, 30+ credits -> https://www.hesc.ny.gov
- CUNY ASAP: free MetroCards + textbooks + tutor, under 15 credits, income under $45k -> https://www.bmcc.cuny.edu/asap/
- SNAP food benefits: monthly EBT card, income under $19k -> https://access.nyc.gov/programs/snap/
- Fair Fares NYC: 50% subway discount, income under $14,580 -> https://www.nyc.gov/site/fairfares/index.page
- BMCC Emergency Fund: up to $1,500 for hardship, rolling basis -> https://www.bmcc.cuny.edu/student-affairs/emergency-grant/
- NYC Summer Youth Employment: paid 6-week summer job, ages 14-24 -> https://www.nyc.gov/site/dycd/services/jobs-internships/summer-youth-employment-program-syep.page
- Google STEP Internship: paid CS internship, underrepresented groups -> https://buildyourfuture.withgoogle.com/programs/step
- Goldman Sachs Engineering: paid 10-week internship, 3.0+ GPA -> https://www.goldmansachs.com/careers/students/programs/
- PTK Transfer Scholarship: $2,500, 3.5+ GPA, PTK members -> https://www.ptk.org/scholarships/
- BMCC Career Services: resume help, job fairs, interview prep -> https://www.bmcc.cuny.edu/student-affairs/career-development/
- Handshake: CUNY internship and job listings -> https://joinhandshake.com

RULES:
- Give specific, direct answers. Never be vague.
- Always include at least one clickable link formatted as [Link Text](https://url.com)
- Format program names in **bold**
- If a student asks how to find what they qualify for, say: "Click [Get Started]({PUBLIC_APP_URL}/onboard) to upload your transcript or fill a quick form -- we match you to everything you qualify for in 15 seconds."
- If a student asks about skills or career prep and mentions their campus, recommend BMCC Career Services and Handshake with links
- Keep responses to 4 sentences max
- End with one clear next step the student can take right now
- Never say "I don't have enough information" without first giving general guidance based on what you do know"""


def ai(prompt: str, max_tokens: int = 1024) -> str:
    message = anthropic_client().messages.create(
        model=MODEL, max_tokens=max_tokens,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()


def ai_with_system(system: str, messages: list, max_tokens: int = 512) -> str:
    message = anthropic_client().messages.create(
        model=MODEL, max_tokens=max_tokens,
        system=system, messages=messages
    )
    return message.content[0].text.strip()


@lru_cache(maxsize=1)
def get_resources() -> List[dict]:
    with open(BASE_DIR / "resources.json", "r", encoding="utf-8") as f:
        return json.load(f)


# -- SCHEMAS ------------------------------------------------------------------

class StudentProfile(BaseModel):
    gpa: float = Field(..., ge=0.0, le=4.0)
    credits: int = Field(..., ge=0)
    income: Optional[int] = Field(None, ge=0)
    major: Optional[str] = "Undecided"
    skills: List[str] = []
    citizenship: Optional[str] = "US Citizen"
    enrollment: Optional[str] = "Full-Time"
    borough: Optional[str] = None
    is_first_gen: bool = False
    has_dependents: bool = False
    name: Optional[str] = None
    email: Optional[str] = None

class ResourceMatch(BaseModel):
    id: str; name: str; category: str; value: int
    description: str; link: str; fit_score: int
    match_reason: str; deadline: Optional[str] = None

class MatchResponse(BaseModel):
    matches: List[ResourceMatch]; access_score: int
    unclaimed_value: int; warnings: List[dict]; profile: StudentProfile

class ChatMessage(BaseModel):
    role: str; content: str

class ChatRequest(BaseModel):
    profile: StudentProfile; messages: List[ChatMessage]

class LandingChatRequest(BaseModel):
    messages: List[ChatMessage]

class GmailReminderRequest(BaseModel):
    user_email: str; resource_name: str; deadline: str; resource_link: str

class TailorRequest(BaseModel):
    job_title: str; job_description: str
    student_skills: List[str]; student_experience: Optional[str] = ""


# -- EXTRACT PROFILE ----------------------------------------------------------

@app.post("/extract-profile", response_model=StudentProfile)
async def extract_profile(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    try:
        contents = await file.read()
        raw_text = ""
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                raw_text += (page.extract_text() or "") + "\n"
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read PDF: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="PDF appears to be empty or image-only.")

    prompt = f"""You are an academic document parser for a CUNY student aid platform.
Extract the following fields and return ONLY valid JSON. No markdown. No explanations. Use defaults if not found.

Fields: name (string or null), gpa (float 0.0-4.0, default 2.0), credits (int, default 0),
major (string, default "Undecided"), income (int or null), skills (array, default []),
enrollment ("Full-Time" or "Part-Time", default "Full-Time"),
citizenship ("US Citizen"/"Permanent Resident"/"DACA"/"International", default "US Citizen"),
is_first_gen (bool, default false), has_dependents (bool, default false), borough (string or null)

Document text:
{raw_text[:4000]}

Return only JSON:
{{"name":"Jane Smith","gpa":3.7,"credits":45,"major":"Computer Science","income":null,"skills":["Python","Java"],"enrollment":"Full-Time","citizenship":"US Citizen","is_first_gen":false,"has_dependents":false,"borough":null}}"""

    try:
        text  = ai(prompt)
        clean = text.strip().strip("```json").strip("```").strip()
        data  = json.loads(clean)
        data["major"]          = data.get("major")          or "Undecided"
        data["citizenship"]    = data.get("citizenship")    or "US Citizen"
        data["enrollment"]     = data.get("enrollment")     or "Full-Time"
        data["skills"]         = data.get("skills")         or []
        data["gpa"]            = data.get("gpa")            or 2.0
        data["credits"]        = data.get("credits")        or 0
        data["is_first_gen"]   = data.get("is_first_gen")   or False
        data["has_dependents"] = data.get("has_dependents") or False
        return StudentProfile(**data)
    except MissingAIConfigurationError:
        raise ai_configuration_error("AI profile extraction")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned malformed JSON. Please try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI extraction failed: {str(e)}")


# -- MATCH RESOURCES ----------------------------------------------------------

@app.post("/match/ledger", response_model=MatchResponse)
def match_ledger(profile: StudentProfile):
    profile.citizenship = profile.citizenship or "US Citizen"
    profile.enrollment  = profile.enrollment  or "Full-Time"
    profile.major       = profile.major       or "Undecided"
    profile.skills      = profile.skills      or []

    resources  = get_resources()
    candidates = []
    warnings   = []

    for res in resources:
        if res.get("min_gpa")     and profile.gpa     < res["min_gpa"]:     continue
        if res.get("min_credits") and profile.credits  < res["min_credits"]: continue
        if res.get("max_credits") and profile.credits  > res["max_credits"]: continue
        if res.get("income_limit") and profile.income  and profile.income > res["income_limit"]: continue
        if res.get("requires_citizenship") and profile.citizenship not in ["US Citizen", "Permanent Resident"]: continue
        candidates.append(res)

    if 24 <= profile.credits < 30:
        warnings.append({"type": "CRITICAL", "title": "Excelsior Scholarship at Risk",
            "message": f"You need 30 credits for the Excelsior Scholarship. You have {profile.credits}. Enroll in enough courses next semester."})
    if 2.0 <= profile.gpa < 2.5:
        warnings.append({"type": "WARNING", "title": "GPA Threshold Alert",
            "message": "Several scholarships require a 2.5 GPA. You are close -- one strong semester unlocks significant aid."})

    profile_summary = (
        f"Student: {profile.major} major, {profile.gpa} GPA, {profile.credits} credits, "
        f"{profile.enrollment} enrollment, {profile.citizenship}, "
        f"Income: {'$' + str(profile.income) if profile.income else 'not provided'}, "
        f"Skills: {', '.join(profile.skills[:5]) if profile.skills else 'none listed'}, "
        f"First-gen: {profile.is_first_gen}"
    )

    candidate_names = [f"{r['name']} ({r['category']}, ${r['value']})" for r in candidates]

    ranking_prompt = f"""You are a financial aid counselor at BMCC (CUNY).
Rank these programs by fit for this student. Return a JSON array with fit_score (50-100) and one-sentence match_reason.

Student: {profile_summary}

Programs (rank ALL {len(candidate_names)} in the SAME ORDER listed):
{json.dumps(candidate_names)}

Return ONLY a JSON array with exactly {len(candidate_names)} objects. No markdown.
Example: [{{"name":"NYS TAP (Tuition Assistance)","fit_score":95,"match_reason":"Your full-time enrollment and GPA above 2.0 make you a strong candidate for this $5,665 grant."}}]"""

    ranked   = []
    rank_map = {}
    try:
        text     = ai(ranking_prompt, max_tokens=2048)
        clean    = text.strip().strip("```json").strip("```").strip()
        ranked   = json.loads(clean)
        rank_map = {item["name"]: item for item in ranked}
    except Exception:
        ranked = []; rank_map = {}

    matches        = []
    total_unclaimed = 0

    for i, res in enumerate(candidates):
        ranked_data = rank_map.get(res["name"], {})
        if not ranked_data and i < len(ranked):
            ranked_data = ranked[i]  # positional fallback

        fit_score    = int(ranked_data.get("fit_score", 70))
        match_reason = ranked_data.get("match_reason",
            f"You meet the eligibility criteria for {res['name']}.")

        total_unclaimed += res.get("value", 0)
        matches.append(ResourceMatch(
            id=res["id"], name=res["name"], category=res["category"],
            value=res.get("value", 0), description=res["description"],
            link=res["link"], fit_score=fit_score, match_reason=match_reason,
            deadline=res.get("deadline"),
        ))

    matches.sort(key=lambda x: x.fit_score, reverse=True)
    access_score = int((len(matches) / max(len(resources), 1)) * 100)

    return MatchResponse(matches=matches, access_score=access_score,
        unclaimed_value=total_unclaimed, warnings=warnings, profile=profile)


# -- LANDING BOT (no profile required) ----------------------------------------

@app.post("/chat/landing-bot")
def landing_bot_chat(req: LandingChatRequest):
    """Public chatbot on the landing page -- no student profile needed."""
    claude_messages = []
    for msg in req.messages:
        claude_messages.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content
        })
    if not claude_messages or claude_messages[-1]["role"] != "user":
        claude_messages.append({"role": "user", "content": "Hello"})

    try:
        reply = ai_with_system(LANDING_BOT_SYSTEM, claude_messages, max_tokens=512)
        return {"reply": reply}
    except MissingAIConfigurationError:
        raise ai_configuration_error("BridgeBot")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BridgeBot error: {str(e)}")


# -- DASHBOARD BOT (has student profile) --------------------------------------

@app.post("/chat/bridge-bot")
def bridge_bot_chat(req: ChatRequest):
    system_prompt = f"""You are BridgeBot, a friendly financial aid advisor for CUNY students.
Student profile:
- GPA: {req.profile.gpa}
- Credits: {req.profile.credits}
- Major: {req.profile.major or 'Not specified'}
- Enrollment: {req.profile.enrollment or 'Full-Time'}
- Citizenship: {req.profile.citizenship or 'US Citizen'}
- Income: {'$' + str(req.profile.income) if req.profile.income else 'Not provided'}
- Skills: {', '.join(req.profile.skills[:5]) if req.profile.skills else 'None listed'}
- First-gen: {req.profile.is_first_gen}

Help with CUNY aid, NYC benefits, and internships. Be specific, reference their actual GPA/credits.
Format program names in **bold**. Include clickable links as [Text](url). Max 4 sentences.
Always end with one actionable next step."""

    claude_messages = []
    for msg in req.messages:
        claude_messages.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content
        })
    if not claude_messages or claude_messages[-1]["role"] != "user":
        claude_messages.append({"role": "user", "content": "Hello"})

    try:
        reply = ai_with_system(system_prompt, claude_messages, max_tokens=512)
        return {"reply": reply}
    except MissingAIConfigurationError:
        raise ai_configuration_error("BridgeBot")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BridgeBot error: {str(e)}")


# -- NYC JOBS -----------------------------------------------------------------

@app.get("/nyc-jobs")
def get_nyc_jobs(major: str = "Technology", limit: int = 6):
    try:
        safe_major = re.sub(r"[^a-zA-Z0-9 ]", "", major)[:30]
        url = "https://data.cityofnewyork.us/resource/kpav-sd4t.json"
        params = {
            "$where": f"UPPER(business_title) LIKE UPPER('%{safe_major}%') OR career_level='Student'",
            "$limit": limit,
            "$select": "business_title,civil_service_title,agency,salary_range_from,salary_range_to,work_location,job_description",
        }
        r = requests.get(url, params=params, timeout=5)
        r.raise_for_status()
        jobs = r.json()
        for job in jobs:
            title = job.get("business_title", "").replace(" ", "+")
            job["handshake_url"] = f"https://joinhandshake.com/search?query={title}"
            job["indeed_url"]    = f"https://www.indeed.com/jobs?q={title}&l=New+York%2C+NY"
        return {"jobs": jobs, "source": "NYC Open Data"}
    except requests.Timeout:
        raise HTTPException(status_code=504, detail="NYC Jobs API timed out.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"NYC Jobs unavailable: {str(e)}")


# -- TAILOR RESUME ------------------------------------------------------------

@app.post("/tailor-resume")
def tailor_resume(req: TailorRequest):
    prompt = f"""Resume coach for a CUNY student applying for: {req.job_title}

Job description: {req.job_description[:800]}
Student skills: {', '.join(req.student_skills) if req.student_skills else 'Not provided'}
Experience: {req.student_experience or 'Not provided'}

Return valid JSON only (no markdown):
{{"headline":"...","skills_to_highlight":["..."],"skills_to_add":["..."],"bullet_suggestions":["..."],"cover_letter_opener":"..."}}"""

    try:
        text  = ai(prompt, max_tokens=1024)
        clean = text.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except MissingAIConfigurationError:
        raise ai_configuration_error("Resume tailoring")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume tailoring failed: {str(e)}")


# -- GMAIL REMINDER -----------------------------------------------------------

@app.post("/schedule-gmail-reminder")
async def schedule_gmail_reminder(req: GmailReminderRequest, background_tasks: BackgroundTasks):
    def send_reminder(email: str, resource_name: str, deadline: str, link: str):
        print(f"[Gmail Queue] Reminder for {email}: '{resource_name}' deadline {deadline}")
    background_tasks.add_task(send_reminder, req.user_email, req.resource_name, req.deadline, req.resource_link)
    return {"status": "queued", "message": f"Reminder set for '{req.resource_name}' on {req.deadline}."}


# -- HEALTH -------------------------------------------------------------------

@app.get("/health")
def health_check():
    summary = runtime_configuration_summary()
    return {
        "status": "online",
        "version": summary["version"],
        "resources_loaded": summary["resources_loaded"],
        "ai_model": MODEL,
        "ai_configured": summary["ai_configured"],
        "ai_key_env": ANTHROPIC_KEY_ENV,
        "frontend_url": summary["frontend_url"],
        "allowed_origins": summary["allowed_origins"],
    }
