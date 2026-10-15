"use client";

import { useState } from "react";
import { MapPin, Users, MessageCircle, Send, AlertCircle, CheckCircle } from "lucide-react";
import { API_URL } from "@/lib/config";
import type { HometownResult } from "@/lib/types";

export default function HometownAlumniCard({ collegeId }: { collegeId: number }) {
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [result, setResult] = useState<HometownResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [studentPhone, setStudentPhone] = useState("");
  const [connectMsg, setConnectMsg] = useState("");

  const checkPadosi = async () => {
    if (!city.trim() && !state.trim()) {
      setErrorMsg("Enter at least your city or state.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setConnectMsg("");
    setResult(null);

    try {
      const params = new URLSearchParams();
      if (city.trim()) params.set("city", city.trim());
      if (state.trim()) params.set("state", state.trim());

      const res = await fetch(
        `${API_URL}/api/colleges/${collegeId}/hometown-alumni/?${params.toString()}`
      );
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      setResult(await res.json());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect to backend");
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    if (!/^\d{10,15}$/.test(studentPhone.trim())) {
      setErrorMsg("Enter a valid 10-digit WhatsApp number.");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/colleges/${collegeId}/hometown-alumni/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: city.trim(),
          state: state.trim(),
          phone: studentPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`Server Error: ${res.status}`);

      setResult(data);

      const message = `Hi, I am from ${city || state} and saw you studied here. Can you give me a vibe check?`;
      if (data.whatsapp_number) {
        window.open(
          `https://wa.me/${String(data.whatsapp_number).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        setConnectMsg("Opening WhatsApp so you can talk to a senior...");
      } else {
        setConnectMsg(
          "No verified senior is available right now. We saved your number — our team will connect you within 24 hours."
        );
      }
      setShowLeadForm(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 shadow-sm my-8">

      {!result ? (
        // STATE 1: INPUT
        <div className="text-center">
            <h3 className="text-lg font-bold text-indigo-900 mb-2">🏠 The &quot;Padosi&quot; Check</h3>
            <p className="text-indigo-600 text-sm mb-4">See if anyone from your hometown is studying here.</p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-2">
                <input
                    type="text"
                    placeholder="City (e.g. Patna)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 px-4 rounded-full border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                    type="text"
                    placeholder="State (e.g. Bihar)"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 px-4 rounded-full border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                    onClick={checkPadosi}
                    disabled={loading}
                    className="bg-indigo-600 text-white rounded-full p-2 px-5 hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                    {loading ? "..." : <Send size={18} />}
                </button>
            </div>

            {/* ERROR MESSAGE DISPLAY */}
            {errorMsg && (
                <div className="text-red-500 text-xs font-bold flex items-center justify-center gap-1 mt-2">
                    <AlertCircle size={12} /> {errorMsg}
                </div>
            )}
        </div>
      ) : (
        // STATE 2: RESULTS
        <div className="animate-in fade-in zoom-in duration-300">
             <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                        <MapPin className="text-indigo-500 w-5 h-5" />
                        {result.count > 0 ? `${result.count} Seniors found!` : `Be the first from ${city || state}!`}
                    </h3>
                    <p className="text-xs text-indigo-600 mt-1">
                        {result.match_type === "City"
                          ? `Direct match from ${city}`
                          : result.match_type === "State"
                            ? "Matches from the same state"
                            : "No matching seniors yet"}
                    </p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <Users className="text-indigo-400 w-6 h-6" />
                </div>
             </div>

             {/* Alumni Avatars */}
             {result.profiles.length > 0 && (
                 <div className="flex -space-x-3 mb-6">
                    {result.profiles.map((p) => (
                        <div key={p.id} className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700" title={`${p.name} • ${p.course_name} • ${p.passout_year}`}>
                            {p.name[0]}
                        </div>
                    ))}
                 </div>
             )}

             {/* Connect message */}
             {connectMsg && (
                 <div className="bg-white p-3 rounded-xl border border-green-100 text-xs font-semibold text-green-700 flex items-start gap-2 mb-4">
                     <CheckCircle size={14} className="mt-0.5 shrink-0" /> {connectMsg}
                 </div>
             )}

             {/* Call to Action */}
             {!showLeadForm ? (
                 <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => setShowLeadForm(true)}
                        className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={18} /> Request Vibe Check
                    </button>
                    <button
                        onClick={() => { setResult(null); setConnectMsg(""); }}
                        className="px-4 py-3 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-bold hover:bg-white transition-colors"
                    >
                        Search Again
                    </button>
                 </div>
             ) : (
                 <div className="bg-white p-3 rounded-xl border border-indigo-100">
                    <p className="text-xs font-bold text-slate-500 mb-2">Enter your WhatsApp number to connect with a senior:</p>
                    <div className="flex gap-2">
                        <input
                            type="tel"
                            placeholder="9876543210"
                            value={studentPhone}
                            onChange={(e) => setStudentPhone(e.target.value)}
                            className="w-full p-2 border rounded-lg text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className="bg-green-500 text-white px-4 rounded-lg font-bold text-sm disabled:opacity-60"
                        >
                            {loading ? "..." : "Connect"}
                        </button>
                    </div>
                    {errorMsg && (
                        <div className="text-red-500 text-xs font-bold flex items-center gap-1 mt-2">
                            <AlertCircle size={12} /> {errorMsg}
                        </div>
                    )}
                 </div>
             )}
        </div>
      )}
    </div>
  );
}
