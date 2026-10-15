"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, X, ArrowRight } from "lucide-react";
import type { College } from "@/lib/types";

export default function CollegeDirectory({ colleges }: { colleges: College[] }) {
  const router = useRouter();
  
  // -- STATE --
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [compareList, setCompareList] = useState<string[]>([]);

  // -- FILTER LOGIC --
  const states = useMemo(() => {
    const allStates = colleges.map(c => c.state);
    return [...new Set(allStates)].sort();
  }, [colleges]);

  const types = useMemo(() => {
    const allTypes = colleges.map(c => c.ownership_type);
    return [...new Set(allTypes)].sort();
  }, [colleges]);

  const filteredColleges = colleges.filter((college) => {
    const matchesSearch = 
      college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState ? college.state === selectedState : true;
    const matchesType = selectedType ? college.ownership_type === selectedType : true;
    return matchesSearch && matchesState && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedState("");
    setSelectedType("");
  };

  // -- COMPARE LOGIC --
  const toggleCompare = (slug: string) => {
    if (compareList.includes(slug)) {
      setCompareList(compareList.filter(s => s !== slug));
    } else {
      if (compareList.length >= 5) {
        alert("You can compare up to 5 colleges at once.");
        return;
      }
      setCompareList([...compareList, slug]);
    }
  };

  const handleCompareClick = () => {
    if (compareList.length < 2) return;
    const queryString = compareList.map(slug => `c=${slug}`).join('&');
    router.push(`/compare?${queryString}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 pb-32" id="colleges">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Top Colleges</h2>
          <p className="text-slate-500 mt-1">Showing {filteredColleges.length} institutes</p>
        </div>
        {(searchTerm || selectedState || selectedType) && (
          <button onClick={clearFilters} className="text-red-600 text-sm font-bold flex items-center gap-1 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors">
            <X size={16} /> Reset Filters
          </button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <input type="text" className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search college name or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative md:w-48">
            <select className="w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                <option value="">All States</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
        </div>
        <div className="relative md:w-48">
            <select className="w-full pl-3 pr-8 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">All Types</option>
                {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
        </div>
      </div>

      {/* GRID RESULTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredColleges.map((college) => {
            const isSelected = compareList.includes(college.slug);
            return (
                <div key={college.id} className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col ${isSelected ? 'border-blue-500 ring-2 ring-blue-500 shadow-xl' : 'border-slate-200 hover:shadow-xl'}`}>
                
                    {/* Header Gradient */}
                    <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl relative">
                        <div className="absolute -bottom-6 left-6">
                            <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
                                <Building2 className="text-slate-700 w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="pt-10 p-6 flex-grow flex flex-col">
                        <div className="mb-4">
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                {college.ownership_type}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{college.name}</h3>
                        <div className="flex items-center text-slate-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-1" />
                            {college.city}, {college.state}
                        </div>
                        <div className="text-sm text-slate-500 mb-6">
                            Rank: <span className="font-bold text-slate-800">#{college.nirf_rank}</span>
                        </div>
                        
                        {/* --- NEW FOOTER: TWO BIG BUTTONS --- */}
                        <div className="mt-auto pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                            {/* 1. COMPARE BUTTON */}
                            <button 
                                onClick={() => toggleCompare(college.slug)}
                                className={`text-xs font-bold py-2.5 px-2 rounded-lg border transition-colors text-center ${
                                    isSelected 
                                    ? 'bg-blue-600 text-white border-blue-600' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                {isSelected ? 'Selected ✓' : '+ Compare'}
                            </button>

                            {/* 2. VIEW DETAILS LINK */}
                            <Link 
                                href={`/college/${college.slug}`} 
                                className="text-xs font-bold py-2.5 px-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 text-center hover:bg-blue-100 transition-colors"
                            >
                                View Details &rarr;
                            </Link>
                        </div>
                        {/* ----------------------------------- */}
                    </div>

                </div>
            );
        })}
      </div>

      {/* FLOATING ACTION BAR */}
      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="flex flex-col">
                <span className="text-sm text-slate-400 font-medium">Comparison</span>
                <span className="font-bold text-white">{compareList.length} colleges selected</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            {compareList.length < 2 ? (
                <span className="text-sm text-slate-400 italic pr-2">Select at least 2</span>
            ) : (
                <button onClick={handleCompareClick} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-colors">
                    Compare Now <ArrowRight size={16} />
                </button>
            )}
            <button onClick={() => setCompareList([])} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        </div>
      )}

    </div>
  );
}