import Link from "next/link";
import { ArrowRight } from "lucide-react";

// 1. IMPORT YOUR COMPONENTS
import HeroSearch from "@/components/HeroSearch";
import FeatureHighlights from "@/components/FeatureHighlights";
import DiscoveryTabs from "@/components/DiscoveryTabs";
import CollegeCard from "@/components/CollegeCard";
import DropOrNot from "@/components/DropOrNot";
// Assuming these exist from previous work (if names differ, update them here)
import ScholarshipSniper from "@/components/ScholarshipSniper"; 
import Compare from "@/components/Compare"; 
import { API_URL } from "@/lib/config";
import type { College } from "@/lib/types";

async function getFeaturedColleges(): Promise<College[]> {
  try {
    const res = await fetch(`${API_URL}/api/colleges/`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const colleges = await getFeaturedColleges();

  return (
    <main className="min-h-screen bg-slate-50">
      
      {/* 1. COMPACT HERO */}
      <HeroSearch />

      {/* 3. DISCOVERY ENGINE (Engineering/Medical Tabs) */}
      <DiscoveryTabs colleges={colleges} />

      {/* 4. THE TOOL BELT (Real Functional Widgets) */}
      <div className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900">Tools for Smart Students</h2>
                <p className="text-slate-500 mt-2">Don&apos;t guess. Calculate your future.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* TOOL 1: DROP OR NOT (New) */}
                <div className="h-full">
                    <DropOrNot />
                </div>

                {/* TOOL 2: SCHOLARSHIP SNIPER (Existing) */}
                <div className="h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-lg text-white">
                   <div className="bg-white/10 h-full rounded-[20px] p-6 backdrop-blur-sm">
                       {/* Embedding the existing component here */}
                       <ScholarshipSniper /> 
                   </div>
                </div>

                {/* TOOL 3: COMPARE (Existing) */}
                <div className="h-full">
                    {/* Assuming Compare is a card-like widget. If it's a full page, we link to it instead */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full flex flex-col justify-center items-center text-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Compare Master</h3>
                        <p className="text-slate-500 mb-6">Put colleges side-by-side to expose the truth.</p>
                        {/* We can embed the widget or a button to open it */}
                        <Compare /> 
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 4. TRUST FEATURES */}
      <FeatureHighlights />

      {/* 5. DATA CARDS */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Recommended Institutes</h2>
            </div>
            <Link href="/colleges" className="text-blue-600 font-bold flex items-center gap-1">
                View All <ArrowRight size={18} />
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {colleges.length > 0 ? (
                colleges.slice(0, 3).map((college) => (
                    <CollegeCard key={college.slug} college={college} />
                ))
            ) : (
                <p className="text-slate-400 italic">No colleges found.</p>
            )}
        </div>
      </div>
    </main>
  );
} 