"use client";

import Link from "next/link";
import { MapPin, Trophy, ArrowRight } from "lucide-react";

interface CollegeProps {
  name: string;
  slug: string;
  city: string;
  state: string;
  nirf_rank: number;
  ownership_type: string;
}

export default function CollegeCard({ college }: { college: CollegeProps }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* Placeholder Image Header */}
      <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 relative">
        <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase">
                {college.ownership_type}
            </span>
            {college.nirf_rank > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Trophy size={10} /> #{college.nirf_rank}
                </span>
            )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
            {college.name}
        </h3>
        
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
            <MapPin size={14} />
            {college.city}, {college.state}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4 flex gap-2">
            <Link 
                href={`/college/${college.slug}`}
                className="flex-1 bg-blue-50 text-blue-600 text-sm font-bold py-2 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
                View Details
            </Link>
            <button className="bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                <ArrowRight size={18} />
            </button>
        </div>
      </div>
    </div>
  );
}