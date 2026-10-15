"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Trophy, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { College } from "@/lib/types";

const categories = [
  "Engineering", "Management", "Commerce", "Medical", "Science", 
  "Hotel Management", "IT", "Arts", "Law", "Pharmacy"
];

const staticData = {
  exams: ["JEE Main", "JEE Advanced", "CLAT", "NEET UG", "CAT", "CUET"],
  courses: ["B.Tech", "M.Tech", "B.A. LL.B", "MBA", "MBBS", "B.Sc"],
};

export default function DiscoveryTabs({ colleges = [] }: { colleges?: College[] }) {
  const [activeTab, setActiveTab] = useState("Engineering");
  const [compareList, setCompareList] = useState<string[]>([]);
  const router = useRouter();

  const featured = useMemo(
    () => [...colleges].sort((a, b) => a.nirf_rank - b.nirf_rank).slice(0, 8),
    [colleges]
  );

  const states = useMemo(
    () => [...new Set(colleges.map((c) => c.state))].sort().slice(0, 8),
    [colleges]
  );

  const toggleCompare = (slug: string) =>
    setCompareList((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Find The Perfect College For You</h2>
        <p className="text-slate-500 mb-8">Discover top colleges, exams, and opportunities in your preferred field.</p>

        {/* SCROLLABLE TABS */}
        <div className="flex overflow-x-auto gap-4 mb-10 pb-2 scrollbar-hide">
            {categories.map((cat) => (
                <Link
                    key={cat}
                    href={`/colleges?q=${encodeURIComponent(cat + " colleges")}`}
                    onMouseEnter={() => setActiveTab(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                        activeTab === cat 
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200" 
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                >
                    {cat}
                </Link>
            ))}
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* COLUMN 1: REAL FEATURED COLLEGES (Wide) */}
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-500" /> Featured Colleges
                    </h3>
                    <Link href="/colleges" className="text-xs font-bold text-blue-600 hover:underline">View all</Link>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {featured.length > 0 ? (
                        featured.map((college) => (
                            <div key={college.id} className="p-4 border-b border-slate-100 hover:bg-blue-50 transition-colors flex justify-between items-center group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <input
                                        type="checkbox"
                                        checked={compareList.includes(college.slug)}
                                        onChange={() => toggleCompare(college.slug)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        aria-label={`Compare ${college.name}`}
                                    />
                                    <Link href={`/college/${college.slug}`} className="min-w-0">
                                        <span className="block text-sm font-bold text-slate-700 truncate group-hover:text-blue-600">
                                            {college.name}
                                        </span>
                                        <span className="block text-[11px] text-slate-400">
                                            {college.city}, {college.state} • NIRF #{college.nirf_rank}
                                        </span>
                                    </Link>
                                </div>
                                <Link href={`/college/${college.slug}`} className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    VIEW
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-sm text-slate-400 italic">No colleges added yet.</p>
                    )}
                </div>
            </div>

            {/* COLUMN 2: EXAMS & STATES */}
            <div className="space-y-8">
                {/* Exams */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900">Important Exams</h3>
                        <Link href="/exams" className="text-xs font-bold text-blue-600 hover:underline">View all</Link>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                        {staticData.exams.map((exam) => (
                            <Link key={exam} href={`/exams?q=${encodeURIComponent(exam)}`} className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span> {exam}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* States */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900">Top States</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {states.map((state) => (
                            <Link key={state} href={`/colleges?q=${encodeURIComponent("colleges in " + state)}`} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                                {state}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMN 3: RELATED COURSES */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900">Related Courses</h3>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2">
                    {staticData.courses.map((course) => (
                        <Link key={course} href={`/courses?q=${encodeURIComponent(course)}`} className="block p-3 hover:bg-slate-50 rounded-xl">
                            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen size={14} className="text-blue-500" /> {course}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">Full Time • Degree</div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>

      </div>

      {/* COMPARE FLOATING BAR */}
      {compareList.length >= 2 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-4">
            <span className="font-bold text-sm">{compareList.length} colleges selected</span>
            <button
                onClick={() => router.push(`/compare?${compareList.map((s) => `c=${s}`).join("&")}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 transition-colors"
            >
                Compare Now <ArrowRight size={16} />
            </button>
        </div>
      )}
    </div>
  );
}
