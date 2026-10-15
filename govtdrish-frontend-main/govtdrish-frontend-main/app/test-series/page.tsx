import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import TestSeriesList, { ExamSeries } from "@/components/TestSeriesList";

const TEST_SERIES_URL = "https://preparation.govtdrish.com";

export const metadata: Metadata = {
  title: "Free Test Series | Govt Drish",
  description:
    "Free mock tests for SSC, Banking, Railways and state government exams. Practice in Hindi and English.",
};

const EXAMS: ExamSeries[] = [
  {
    id: "ssc-cgl",
    exam: "SSC CGL",
    tests: 40,
    level: "Graduate",
    description:
      "Full-length Tier 1 and Tier 2 mocks with previous-year papers and detailed solutions.",
    free: true,
  },
  {
    id: "ssc-chsl",
    exam: "SSC CHSL",
    tests: 30,
    level: "10+2",
    description:
      "Sectional and full-length mocks covering Reasoning, Quant, English and GK.",
    free: true,
  },
  {
    id: "ibps-po",
    exam: "IBPS PO / Clerk",
    tests: 35,
    level: "Graduate",
    description:
      "Prelims and Mains mock tests with high-level DI, puzzles and computer awareness.",
    free: true,
  },
  {
    id: "rrb-ntpc",
    exam: "RRB NTPC",
    tests: 25,
    level: "10+2 / Graduate",
    description:
      "CBT-1 and CBT-2 practice sets tuned to the latest Railways exam pattern.",
    free: true,
  },
  {
    id: "state-psc",
    exam: "State PSC (Bihar, UP, MP)",
    tests: 20,
    level: "Graduate",
    description:
      "State-specific GK and current affairs mocks prepared with exam-wise weightage.",
    free: true,
  },
  {
    id: "police",
    exam: "Police & Defence",
    tests: 18,
    level: "10+2",
    description:
      "Written exam mocks for state police, CAPF and defence recruitment drives.",
    free: true,
  },
];

export default function TestSeriesPage() {
  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-900 py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
            Free Government Exam Test Series
          </h1>
          <p className="text-slate-400">
            Practice with exam-pattern mocks in Hindi and English. 100% free for students.
          </p>
          <a
            href={TEST_SERIES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Open Test Series Platform <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <TestSeriesList exams={EXAMS} seriesUrl={TEST_SERIES_URL} />
      </div>
    </main>
  );
}
