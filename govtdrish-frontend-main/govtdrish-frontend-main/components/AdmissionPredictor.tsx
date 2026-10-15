"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function AdmissionPredictor({ cutoff }: { cutoff: number }) {
  const [rank, setRank] = useState("");
  const [chance, setChance] = useState<"High" | "Medium" | "Low" | null>(null);

  const checkChance = () => {
    const userRank = parseInt(rank);
    if (!userRank) return;

    // Logic: 
    // If rank is better (lower) than cutoff: High Chance
    // If rank is within 20% of cutoff: Medium Chance
    // If rank is way worse (higher) than cutoff: Low Chance
    
    if (userRank <= cutoff) {
      setChance("High");
    } else if (userRank <= cutoff * 1.2) {
      setChance("Medium");
    } else {
      setChance("Low");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
        Admission Predictor
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">
            Enter your Rank
        </label>
        <div className="flex gap-2">
            <input 
                type="number" 
                value={rank}
                onChange={(e) => {
                    setRank(e.target.value);
                    setChance(null); // Reset when typing
                }}
                placeholder="e.g. 4500"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-bold text-slate-900"
            />
            <button 
                onClick={checkChance}
                className="bg-blue-600 text-white font-bold px-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
                Check
            </button>
        </div>
      </div>

      {/* Result Display */}
      {chance && (
        <div className={`p-4 rounded-xl border-2 flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
            chance === "High" ? "bg-green-50 border-green-200 text-green-800" :
            chance === "Medium" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
            "bg-red-50 border-red-200 text-red-800"
        }`}>
            {chance === "High" && <CheckCircle className="w-6 h-6" />}
            {chance === "Medium" && <AlertTriangle className="w-6 h-6" />}
            {chance === "Low" && <XCircle className="w-6 h-6" />}
            
            <div>
                <div className="font-black text-lg uppercase">{chance} Chance</div>
                <div className="text-xs opacity-80 font-bold">
                    {chance === "High" ? "You are likely to get a seat!" :
                     chance === "Medium" ? "It's close. Apply carefully." :
                     "Very difficult. Check other colleges."}
                </div>
            </div>
        </div>
      )}

      <div className="mt-4 text-[10px] text-slate-400 text-center">
        Based on previous year cutoff: <strong>#{cutoff}</strong>
      </div>
    </div>
  );
}