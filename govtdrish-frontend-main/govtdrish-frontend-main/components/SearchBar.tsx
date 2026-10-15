"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

const SUGGESTIONS = [
  "Best engineering colleges in Bihar",
  "NEET government medical colleges",
  "Scholarships for OBC students",
  "Low fee MBA colleges",
  "Law colleges with CLAT cutoff",
];

export default function SearchBar({
  initialQuery = "",
  autoFocus = false,
  basePath = "/search",
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  basePath?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { lang } = useLanguage();

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    router.push(`${basePath}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="relative w-full"
      >
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={20} />
        </div>
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            lang === "en"
              ? "Ask anything: colleges, cutoffs, fees, scholarships..."
              : "कुछ भी पूछें: कॉलेज, कट-ऑफ, फीस, स्कॉलरशिप..."
          }
          className="w-full h-14 pl-12 pr-36 bg-white rounded-2xl text-slate-900 outline-none border border-slate-200 focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute inset-y-2 right-2 bg-blue-600 text-white px-5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors uppercase tracking-wide flex items-center gap-2 disabled:opacity-70"
        >
          <Sparkles size={16} /> {loading ? "..." : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuery(s);
              runSearch(s);
            }}
            className="text-xs font-semibold bg-white/80 hover:bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
