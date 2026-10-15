"use client";

import { useState } from "react";
import { CheckCircle, Loader2, PenLine, X, ExternalLink } from "lucide-react";
import { API_URL } from "@/lib/config";

export interface ExamSeries {
  id: string;
  exam: string;
  tests: number;
  level: string;
  description: string;
  free: boolean;
}

export default function TestSeriesList({
  exams,
  seriesUrl = "https://preparation.govtdrish.com",
}: {
  exams: ExamSeries[];
  seriesUrl?: string;
}) {
  const [activeExam, setActiveExam] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doneExam, setDoneExam] = useState<string | null>(null);

  const startExam = async (exam: ExamSeries) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/colleges/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          college_name: "Test Series",
          note: `Test series access: ${exam.exam} (${exam.tests} tests, ${exam.level})`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.phone?.[0] || "Could not register. Try again.");
      }

      setDoneExam(exam.exam);
      setActiveExam(null);
      setForm({ name: "", phone: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {exam.level}
            </span>
            {exam.free && (
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                Free
              </span>
            )}
          </div>

          <h3 className="text-lg font-black text-slate-900">{exam.exam}</h3>
          <p className="text-slate-500 text-sm mt-2 flex-1">{exam.description}</p>
          <p className="text-xs font-bold text-slate-400 mt-3 mb-5">
            {exam.tests} mock tests • Hindi + English
          </p>

          {doneExam === exam.exam ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                <CheckCircle size={18} /> You&apos;re registered!
              </div>
              <a
                href={seriesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Start practising now <ExternalLink size={16} />
              </a>
            </div>
          ) : activeExam === exam.exam ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="WhatsApp number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-600 text-xs font-semibold">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => startExam(exam)}
                  disabled={loading || !form.name || !form.phone}
                  className="flex-1 bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : null} Start
                </button>
                <button
                  onClick={() => setActiveExam(null)}
                  className="px-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveExam(exam.exam);
                setError("");
              }}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <PenLine size={16} /> Start Free Test Series
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
