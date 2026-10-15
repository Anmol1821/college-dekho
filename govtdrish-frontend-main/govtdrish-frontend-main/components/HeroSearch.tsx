"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { lang } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    // CHANGE 1: Dark Background (bg-slate-900) to confirm update
    <div className="bg-slate-900 py-8 px-4 shadow-md"> 
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
        
        {/* Left Side: Headline */}
        <div className="text-center md:text-left flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            {lang === 'en' ? "Find Your Dream College" : "अपने सपनों का कॉलेज खोजें"}
            </h1>
            <p className="text-slate-400 text-xs">
                {lang === 'en' ? "Ask in English or Hindi — live AI answers" : "अंग्रेज़ी या हिंदी में पूछें — तुरंत AI जवाब"}
            </p>
        </div>

        {/* Right Side: AI Search Bar (AI search is the default) */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Sparkles className="text-blue-500" size={18} />
            </div>
            
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === 'en' ? "Ask AI: best colleges, cutoffs, fees..." : "AI से पूछें: कॉलेज, कट-ऑफ, फीस..."}
                className="w-full h-12 pl-10 pr-28 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
            
            <button 
                type="submit"
                className="absolute inset-y-1.5 right-1.5 bg-blue-600 text-white px-4 rounded-md text-xs font-bold hover:bg-blue-700 uppercase tracking-wide"
            >
                {lang === 'en' ? 'Ask AI' : 'AI से पूछें'}
            </button>
        </form>

      </div>
    </div>
  );
}