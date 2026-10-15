"use client";

import { useState } from "react";
import { Search, Banknote, MapPin, Users, Sparkles, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { Scholarship } from "@/lib/types";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export default function ScholarshipSniper() {
  const [category, setCategory] = useState("General");
  const [income, setIncome] = useState("");
  const [state, setState] = useState("Uttar Pradesh");
  const [results, setResults] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const findMoney = async () => {
    setLoading(true);
    setSearched(true);
    setAiNote("");

    const params = new URLSearchParams({ category, state });
    if (income.trim()) params.set("income", income.trim());

    try {
      const res = await fetch(`${API_URL}/api/colleges/scholarships/?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: Scholarship[] = await res.json();
      setResults(data);
      setLoading(false);

      // Ask the AI why these fit (non-blocking; shows up when ready).
      setAiLoading(true);
      try {
        const aiRes = await fetch(`${API_URL}/api/ai-search/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `Which of these scholarships best fit a ${category} student with family income ${income || "unknown"} in ${state}?`,
            intent: "scholarships",
            profile: { category, income, state },
          }),
        });
        const aiData = await aiRes.json();
        if (aiRes.ok) setAiNote(aiData.reply || "");
      } catch {
        // AI is a bonus — silently skip if unavailable.
      }
      setAiLoading(false);
    } catch (error) {
      console.error("Failed to fetch scholarships", error);
      setResults([]);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8 shadow-sm my-12">

      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-emerald-900 mb-2">💰 Scholarship Sniper</h2>
        <p className="text-emerald-700">Don&apos;t pay full fees. Our database finds hidden financial aid matched to your profile.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:flex-row gap-4 items-end">

        <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Your Category</label>
            <div className="relative">
                <Users className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="Minority">Minority</option>
                </select>
            </div>
        </div>

        <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Family Income</label>
            <div className="relative">
                <Banknote className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                <input type="number" placeholder="e.g. 250000" value={income} onChange={e => setIncome(e.target.value)} className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
        </div>

        <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Domicile State</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                <select value={state} onChange={e => setState(e.target.value)} className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
        </div>

        <button onClick={findMoney} disabled={loading} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-60">
            {loading ? "Scanning..." : "Find Aid"}
        </button>
      </div>

      {/* --- AI MATCH NOTE --- */}
      {aiLoading && (
        <div className="mt-6 flex items-center gap-2 text-emerald-700 text-sm font-semibold">
            <Loader2 className="animate-spin w-4 h-4" /> AI is checking which scheme fits you best...
        </div>
      )}
      {aiNote && !aiLoading && (
        <div className="mt-6 bg-white/70 border border-emerald-100 rounded-2xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 leading-relaxed">{aiNote}</p>
        </div>
      )}

      {/* --- RESULTS SECTION --- */}
      {searched && !loading && (
        <div className="mt-8 animate-in slide-in-from-bottom duration-500">
            {results.length > 0 ? (
                <div>
                    <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full">{results.length} Found</span>
                        Schemes you can apply for:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((sch) => (
                            <div key={sch.id} className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                <div>
                                    <h4 className="font-bold text-slate-800">{sch.name}</h4>
                                    <div className="text-xs text-slate-500 mt-1">For {sch.eligible_category} • {sch.state}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Max family income: ₹{sch.max_income.toLocaleString("en-IN")}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-extrabold text-emerald-600 text-lg">{sch.amount}</div>
                                    <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Approved</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border">
                        <Search className="text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-medium">No direct matches found.</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your income or checking &apos;All&apos; categories.</p>
                </div>
            )}
        </div>
      )}

    </div>
  );
}
