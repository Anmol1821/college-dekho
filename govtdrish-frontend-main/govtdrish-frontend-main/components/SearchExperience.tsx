import Link from "next/link";
import { Award, GraduationCap, ExternalLink, PenLine, Sparkles } from "lucide-react";
import { API_URL } from "@/lib/config";
import SearchBar from "@/components/SearchBar";
import AIAnswerCard from "@/components/AIAnswerCard";
import CollegeCard from "@/components/CollegeCard";
import CollegeDirectory from "@/components/CollegeDirectory";
import CourseDirectory from "@/components/CourseDirectory";
import ScholarshipSniper from "@/components/ScholarshipSniper";
import type { AIResult, AISearchMode, College, CollegeCourse } from "@/lib/types";

export const TEST_SERIES_URL = "https://preparation.govtdrish.com";

const POPULAR_EXAMS = [
  "JEE Main",
  "JEE Advanced",
  "NEET UG",
  "CUET UG",
  "CLAT",
  "CAT",
];

async function getColleges(): Promise<College[]> {
  try {
    const res = await fetch(`${API_URL}/api/colleges/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCourses(): Promise<CollegeCourse[]> {
  try {
    const res = await fetch(`${API_URL}/api/colleges/courses/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getAIResult(query: string, mode: AISearchMode): Promise<AIResult | null> {
  try {
    const res = await fetch(`${API_URL}/api/ai-search/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, mode }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface SearchExperienceProps {
  mode: AISearchMode;
  title: string;
  subtitle: string;
  /** Query used for the automatic AI search when the visitor has not typed one. */
  defaultQuery: string;
  /** The visitor's own query from ?q= (wins over defaultQuery). */
  userQuery?: string;
  showDirectory?: boolean;
  showCourses?: boolean;
  showScholarships?: boolean;
  showExams?: boolean;
  showTestSeriesCta?: boolean;
}

const MODE_PATHS: Record<AISearchMode, string> = {
  general: "/search",
  colleges: "/colleges",
  exams: "/exams",
  courses: "/courses",
  scholarships: "/scholarships",
  test_series: "/test-series",
};

export default async function SearchExperience({
  mode,
  title,
  subtitle,
  defaultQuery,
  userQuery,
  showDirectory = false,
  showCourses = false,
  showScholarships = false,
  showExams = false,
  showTestSeriesCta = false,
}: SearchExperienceProps) {
  const typed = (userQuery ?? "").trim();
  const query = typed || defaultQuery;
  const isAuto = !typed;

  const [colleges, ai, courses] = await Promise.all([
    getColleges(),
    query ? getAIResult(query, mode) : Promise.resolve(null),
    showCourses ? getCourses() : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* SEARCH HERO */}
      <div className="bg-slate-900 pt-10 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-1 text-center">{title}</h1>
          <p className="text-slate-400 text-sm text-center mb-6">{subtitle}</p>
          <SearchBar initialQuery={typed} autoFocus={!typed} basePath={MODE_PATHS[mode]} />
          <p className="text-slate-500 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="text-blue-400" />
            AI search is on by default — results load automatically.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* AI RESULT */}
        {query && (
          <div className="mt-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              {isAuto ? (
                <>
                  Live AI result for <span className="text-slate-600">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                <>Results for &ldquo;{query}&rdquo;</>
              )}
            </p>
            {ai ? (
              <AIAnswerCard result={ai} />
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-500 text-sm">
                AI answer is unavailable right now. You can still browse everything below.
              </div>
            )}
          </div>
        )}

        {/* POPULAR EXAMS (exams mode) */}
        {showExams && (
          <section className="mt-8">
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXAMS.map((exam) => (
                <Link
                  key={exam}
                  href={`/exams?q=${encodeURIComponent(exam)}`}
                  className="text-xs font-semibold bg-white hover:bg-blue-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                >
                  <PenLine size={12} /> {exam}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* MATCHING COLLEGES */}
        {ai && ai.colleges.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={22} /> Matching colleges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ai.colleges.slice(0, 6).map((college) => (
                <CollegeCard key={college.slug} college={college} />
              ))}
            </div>
          </section>
        )}

        {/* MATCHING SCHOLARSHIPS */}
        {ai && ai.scholarships.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-emerald-600" size={22} /> Matching scholarships
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ai.scholarships.slice(0, 6).map((scholarship) => (
                <div
                  key={scholarship.name}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{scholarship.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      For {scholarship.category} • {scholarship.state} • income up to ₹
                      {Number(scholarship.max_income).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right font-extrabold text-emerald-600">{scholarship.amount}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TEST SERIES CTA */}
        {showTestSeriesCta && (
          <section className="mt-10">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black mb-1">Ready to practice?</h2>
                <p className="text-white/90 text-sm">
                  Take free exam-pattern mock tests on our dedicated test-series platform.
                </p>
              </div>
              <a
                href={TEST_SERIES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-orange-700 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Start Test Series <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}
      </div>

      {/* COURSES DIRECTORY (free, no AI cost) */}
      {showCourses && courses.length > 0 && <CourseDirectory courses={courses} />}

      {/* SCHOLARSHIP TOOL (free, no AI cost until used) */}
      {showScholarships && (
        <div className="max-w-6xl mx-auto px-4">
          <ScholarshipSniper />
        </div>
      )}

      {/* FULL COLLEGE DIRECTORY */}
      {showDirectory && colleges.length > 0 && <CollegeDirectory colleges={colleges} />}
    </main>
  );
}
