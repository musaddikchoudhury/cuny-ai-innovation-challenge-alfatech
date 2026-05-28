export type Resource = {
  id: string
  name: string
  category: string
  value: number
  description: string
  link: string
  fit_score: number
  match_reason: string
  deadline?: string | null
}

export type MatchData = {
  matches: Resource[]
  access_score: number
  unclaimed_value: number
  warnings: Array<{ type: string; title: string; message: string }>
  profile: Record<string, unknown>
}

export type StudentProfile = {
  gpa: number
  credits: number
  income?: number | null
  major?: string
  skills?: string[]
  citizenship?: string
  enrollment?: string
  borough?: string | null
  is_first_gen?: boolean
  has_dependents?: boolean
}

export type TailorResponse = {
  headline: string
  skills_to_highlight: string[]
  skills_to_add: string[]
  bullet_suggestions: string[]
  cover_letter_opener: string
}
