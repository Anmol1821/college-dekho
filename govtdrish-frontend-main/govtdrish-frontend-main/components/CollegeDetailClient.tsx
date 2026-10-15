"use client";

import Link from 'next/link';
import { MapPin, Trophy, Building2, Calendar, CheckCircle, BookOpen, ArrowLeft } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import ApplyModal from "@/components/ApplyModal";
import AlumniDetectiveCard from "@/components/AlumniDetectiveCard";
import HometownAlumniCard from "@/components/HometownAlumniCard";
import AdmissionPredictor from "@/components/AdmissionPredictor"; 
import CourseCard from "@/components/CourseCard";
import CollegeCard from "@/components/CollegeCard";
import type { CollegeDetail } from "@/lib/types";

export default function CollegeDetailClient({ college }: { college: CollegeDetail }) {
  const { t } = useLanguage(); // <--- Hook for translations

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      
      {/* College action bar (the global Navbar above already shows branding/links) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/search" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft size={16} /> All colleges
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm font-bold text-slate-700 truncate max-w-[240px]">{college.name}</span>
            <ApplyModal collegeName={college.name} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Banner Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-slate-100 w-64 h-64 rounded-full -mr-32 -mt-32 z-0 opacity-50"></div>
            
            <div className="relative z-10">
                <div className="flex gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                        {college.ownership_type}
                    </span>
                    {college.nirf_rank > 0 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 flex items-center gap-1">
                            <Trophy size={12} /> NIRF #{college.nirf_rank}
                        </span>
                    )}
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{college.name}</h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin size={20} className="text-slate-400" /> {college.city}, {college.state}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* About Section */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{t.about}</h3> {/* Translated */}
                    <p className="text-slate-600 leading-relaxed text-lg">
                        <span className="font-semibold"> {college.name}</span> is a premier institution located in {college.city}. 
                        It is renowned for its academic excellence and state-of-the-art infrastructure.
                    </p>
                </div>

                {/* --- 🕵️ ALUMNI DETECTIVE CARD --- */}
                {college.outcome ? (
                    <AlumniDetectiveCard 
                        auditData={college.outcome} 
                        officialPlacement={100} 
                    />
                ) : (
                    <div className="hidden">Audit Loading...</div>
                )}
                
                {/* --- 🏠 HOMETOWN ALUMNI CARD --- */}
                <HometownAlumniCard collegeId={college.id} />
                
                {/* --- 📚 COURSES SECTION --- */}
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <BookOpen className="text-blue-600" /> {t.courses} {/* Translated */}
                    </h3>
                    
                    {college.courses && college.courses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {college.courses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-100 rounded-xl p-8 text-center text-slate-500">
                            No specific course details available.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
                
                {/* --- 🎯 ADMISSION PREDICTOR --- */}
                <AdmissionPredictor cutoff={college.cutoff_rank || 5000} />

                {/* Quick Highlights Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm sticky top-24">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        {t.highlights} {/* Translated */}
                    </h3>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">{t.ownership}</div>
                                <div className="text-base font-bold text-slate-800">{college.ownership_type}</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">{t.established}</div>
                                <div className="text-base font-bold text-slate-800">{college.estd_year}</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">{t.status}</div>
                                <div className="text-base font-bold text-green-600">Approved</div>
                            </div>
                        </li>
                    </ul>
                    
                    <button className="w-full mt-8 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                        {t.downloadBrochure} {/* Translated */}
                    </button>
                </div>
            </div>

        </div>
      </div>
      
      {/* Similar Colleges Section */}
      {college.related_colleges && college.related_colleges.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t.similar} ({college.state})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {college.related_colleges.map((related) => (
              <CollegeCard key={related.slug} college={related} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}