// Shared API types for the Govt Drish frontend.

export interface College {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  ownership_type: string;
  nirf_rank: number;
  cutoff_rank?: number;
  estd_year?: number;
}

export interface Course {
  id: number;
  name: string;
  seats: number;
  total_fees: number;
  eligibility: string;
}

// A course joined with its college (GET /api/colleges/courses/).
export interface CollegeCourse extends Course {
  college_name: string;
  college_slug: string;
  college_city: string;
}

// College as returned inside the AI search result (may include a short
// course list so the Courses page can show "college -> courses").
export interface AICollege extends College {
  courses?: { name: string; fees: number }[];
}

export interface Employer {
  name: string;
  count: number | string;
}

export interface CollegeOutcome {
  alumni_audited_count: number;
  open_to_work_percent: number | string;
  avg_tenure_months: number | string;
  top_employers: Employer[];
  risk_score: number;
}

export interface CollegeDetail extends College {
  courses: Course[];
  outcome: CollegeOutcome | null;
  related_colleges: College[];
}

export interface Scholarship {
  id: number;
  name: string;
  eligible_category: string;
  max_income: number;
  state: string;
  amount: string;
}

export interface AlumniProfile {
  id: number;
  name: string;
  course_name: string;
  passout_year: number;
  hometown_city: string;
}

export interface HometownResult {
  count: number;
  match_type: "City" | "State" | "None";
  profiles: AlumniProfile[];
  whatsapp_number?: string;
  lead_saved?: number;
}

export interface ScholarshipProfile {
  category: string;
  income: string;
  state: string;
}

export type AISearchMode =
  | "general"
  | "colleges"
  | "exams"
  | "courses"
  | "scholarships"
  | "test_series";

// Scholarship as returned inside the AI search result (note: `category`, not
// `eligible_category`, and no id — different from /api/colleges/scholarships/).
export interface AIScholarship {
  name: string;
  category: string;
  max_income: number;
  state: string;
  amount: string;
}

export interface AIResult {
  reply: string;
  action: "show_results" | "ask_details";
  source: "gemini" | "local";
  language: "hi" | "en";
  intent: "colleges" | "scholarships" | "both";
  mode?: AISearchMode;
  colleges: AICollege[];
  scholarships: AIScholarship[];
}
