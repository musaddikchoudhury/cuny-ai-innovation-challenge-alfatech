export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"

export async function readApiError(res: Response) {
  try {
    const body = await res.clone().json()
    if (typeof body.detail === "string") return body.detail
  } catch {
    // Some FastAPI errors are plain text, especially proxy and gateway failures.
  }

  const text = await res.text()
  return text || `${res.status} ${res.statusText}`.trim()
}

import type { StudentProfile, MatchData, TailorResponse } from "./types"

export async function postMatch(profile: StudentProfile): Promise<MatchData> {
  const res = await fetch(`${API_BASE_URL}/match/ledger`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  })

  if (!res.ok) throw new Error(await readApiError(res))
  return res.json() as Promise<MatchData>
}

export async function postTailor(body: {
  job_title: string
  job_description: string
  student_skills: string[]
  student_experience?: string
}): Promise<TailorResponse> {
  const res = await fetch(`${API_BASE_URL}/tailor-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(await readApiError(res))
  return res.json() as Promise<TailorResponse>
}

export async function extractProfileFromFormData(formData: FormData): Promise<StudentProfile> {
  const res = await fetch(`${API_BASE_URL}/extract-profile`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) throw new Error(await readApiError(res))
  return res.json() as Promise<StudentProfile>
}

