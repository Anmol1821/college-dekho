"use client";

import { ShieldAlert, TrendingDown, Briefcase, Info, CheckCircle } from "lucide-react";

// Define the shape of the data coming from the backend
interface Employer {
  name: string;
  count: number | string;
}

interface AuditData {
  alumni_audited_count: number;
  open_to_work_percent: number | string;
  avg_tenure_months: number | string;
  top_employers: Employer[];
  risk_score: number;
}

export default function AlumniDetectiveCard({ 
  auditData, 
  officialPlacement = 100 
}: { 
  auditData: AuditData; 
  officialPlacement?: number; 
}) {
  // Determine if this is a "Red Flag" college
  const isHighRisk = auditData.risk_score > 50;

  return (
    <div className="bg-white border-4 border-slate-900 rounded-3xl overflow-hidden shadow-2xl my-8">
      
      {/* --- HEADER: CONFIDENTIAL REPORT STYLE --- */}
      <div className="bg-slate-900 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <ShieldAlert className="text-yellow-400 w-5 h-5" />
            <h2 className="text-white font-black uppercase italic tracking-widest text-sm">
            Alumni Detective™ Audit
            </h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isHighRisk ? 'bg-red-600 text-white' : 'bg-green-500 text-slate-900'}`}>
          Risk Score: {auditData.risk_score}/100
        </div>
      </div>

      <div className="p-6">
        
        {/* --- COMPARISON GRID --- */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 1. The Marketing Lie */}
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 relative">
            <div className="absolute -top-3 left-3 bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                OFFICIAL CLAIM
            </div>
            <p className="text-2xl font-black text-slate-300 line-through mt-2">{officialPlacement}%</p>
            <p className="text-xs text-slate-400 font-bold uppercase">Placement Rate</p>
          </div>

          {/* 2. The Brutal Truth */}
          <div className={`p-4 rounded-xl border-2 relative ${isHighRisk ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`absolute -top-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded ${isHighRisk ? 'bg-red-600' : 'bg-green-600'}`}>
                REALITY CHECK
            </div>
            <p className={`text-2xl font-black mt-2 ${isHighRisk ? 'text-red-700' : 'text-green-700'}`}>
                {auditData.open_to_work_percent}%
            </p>
            <p className={`text-xs font-bold uppercase ${isHighRisk ? 'text-red-500' : 'text-green-500'}`}>
                Looking for Work
            </p>
          </div>
        </div>

        {/* --- REAL DATA: WHERE THEY WORK --- */}
        <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2 uppercase">
            <Briefcase size={14} className="text-blue-600"/> Top Actual Employers
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                {auditData.top_employers && auditData.top_employers.length > 0 ? (
                    auditData.top_employers.map((emp, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-2 last:pb-0">
                            <span className="font-bold text-slate-700">{emp.name}</span>
                            <span className="text-slate-500 text-xs bg-white px-2 py-1 rounded border shadow-sm">
                                {emp.count} Alumni
                            </span>
                        </div>
                    ))
                ) : (
                    <span className="text-xs text-slate-400 italic">No employer data available yet.</span>
                )}
            </div>
        </div>

        {/* --- AVG TENURE (RETENTION) --- */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 bg-white border rounded-lg p-2">
            <Info size={14} />
            <span>Avg. time spent in first job: <strong>{auditData.avg_tenure_months} months</strong></span>
        </div>

        {/* --- THE USP KILLER: THE UPSELL --- */}
        {isHighRisk ? (
          <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl p-5 text-white shadow-lg transform hover:scale-[1.02] transition-transform">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} className="animate-bounce" />
              <h3 className="font-black text-lg uppercase italic">Verdict: Trap Detected</h3>
            </div>
            <p className="text-xs opacity-90 leading-relaxed mb-4 font-medium">
              Data shows <strong>{auditData.open_to_work_percent}%</strong> of grads are struggling. 
              Private jobs here are unstable. Secure your future with a Government Job instead.
            </p>
            <a href="/test-series" className="block w-full bg-white text-red-600 font-black py-3 rounded-xl hover:bg-slate-100 transition-colors text-center shadow-xl uppercase tracking-wider text-sm">
              Start SSC/Bank Prep Now &rarr;
            </a>
          </div>
        ) : (
            <div className="bg-green-100 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-green-800 text-sm">Safe Choice</h4>
                    <p className="text-xs text-green-700 mt-1">This college has healthy placement stats. Proceed with confidence.</p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}