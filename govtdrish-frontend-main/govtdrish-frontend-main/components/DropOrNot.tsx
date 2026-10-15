"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DropOrNot() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const questions = [
    {
      q: "What was your JEE/NEET Percentile?",
      options: [
        { text: "Above 90%", val: 10 },
        { text: "75% - 90%", val: 5 },
        { text: "Below 75%", val: 0 },
      ]
    },
    {
      q: "Are you burnt out from studying?",
      options: [
        { text: "Yes, totally exhausted", val: -5 },
        { text: "A little, but can manage", val: 0 },
        { text: "No, I am fully charged", val: 5 },
      ]
    },
    {
      q: "Can you afford a private college (₹10L+)?",
      options: [
        { text: "Yes, easily", val: -5 }, // If rich, why drop? Just go.
        { text: "With Loan", val: 5 },     // Loan is risky, maybe drop.
        { text: "No", val: 10 },           // Must drop or find cheap govt.
      ]
    }
  ];

  const handleAnswer = (val: number) => {
    setScore(score + val);
    setStep(step + 1);
  };

  const getVerdict = () => {
    if (score >= 15) return { text: "TAKE A DROP", color: "text-green-600", desc: "You have high potential and financial need. One year can change your life." };
    if (score >= 5) return { text: "RISKY DROP", color: "text-yellow-600", desc: "Only drop if you join a strict coaching program. Otherwise, take a Tier-2 college." };
    return { text: "DON'T DROP", color: "text-red-600", desc: "You are burnt out or have options. Join a college and hustle there." };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-slate-900 text-white p-2 rounded-lg">
            <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Drop or Not?</h3>
      </div>

      {step < questions.length ? (
        <div>
          <h4 className="text-lg font-bold text-slate-800 mb-6">{questions[step].q}</h4>
          <div className="space-y-3">
            {questions[step].options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleAnswer(opt.val)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all font-medium text-slate-700 flex justify-between group"
              >
                {opt.text}
                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 animate-in zoom-in">
          <h4 className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">VERDICT</h4>
          <h2 className={`text-3xl font-black ${getVerdict().color} mb-4`}>{getVerdict().text}</h2>
          <p className="text-slate-600 font-medium leading-relaxed">{getVerdict().desc}</p>
          <button onClick={() => {setStep(0); setScore(0)}} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-900 underline">
            Check Again
          </button>
        </div>
      )}
    </div>
  );
}