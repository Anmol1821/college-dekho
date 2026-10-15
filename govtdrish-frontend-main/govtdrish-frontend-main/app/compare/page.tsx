import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { API_URL } from '@/lib/config';
import type { CollegeDetail } from '@/lib/types';

// Helper to fetch details for a single college
async function getCollege(slug: string): Promise<CollegeDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/colleges/${slug}/`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ c: string | string[] }> }) {
  // 1. Unwrap the searchParams (Next.js 15 requirement)
  const params = await searchParams;
  
  // 2. Handle if 'c' is a string or an array (users might select 1 or multiple)
  const slugs = Array.isArray(params.c) ? params.c : [params.c].filter(Boolean);

  if (slugs.length < 2) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Not enough colleges selected</h1>
            <p className="text-slate-500 mb-6">Please select at least two colleges to compare.</p>
            <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Back to Home</Link>
        </div>
    );
  }

  // 3. Fetch data for all selected colleges in parallel
  const collegesData = await Promise.all(slugs.map(slug => getCollege(slug as string)));
  const colleges = collegesData.filter((college): college is CollegeDetail => college !== null);

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/search" className="text-sm font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Search
          </Link>
          <h1 className="font-bold text-lg text-slate-800">Compare Institutes</h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="p-4 w-48 bg-slate-50 border-b border-slate-200"></th>
                    {colleges.map((col) => (
                        <th key={col.id} className="p-4 min-w-[300px] bg-white border border-slate-200 rounded-t-xl text-center">
                            <div className="font-bold text-xl text-slate-900 mb-2">{col.name}</div>
                            <div className="text-sm text-slate-500">{col.city}, {col.state}</div>
                            <Link href={`/college/${col.slug}`} className="text-blue-600 text-xs font-bold uppercase mt-2 inline-block hover:underline">
                                View Profile
                            </Link>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="text-slate-700">
                {/* Ownership Row */}
                <tr className="bg-white hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-400 uppercase text-xs tracking-wider border-b">Type</td>
                    {colleges.map((col) => (
                        <td key={col.id} className="p-4 text-center border border-slate-100 border-b-slate-200 font-medium">
                            {col.ownership_type}
                        </td>
                    ))}
                </tr>

                {/* Rank Row */}
                <tr className="bg-white hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-400 uppercase text-xs tracking-wider border-b">NIRF Rank</td>
                    {colleges.map((col) => (
                        <td key={col.id} className="p-4 text-center border border-slate-100 border-b-slate-200">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold text-sm">#{col.nirf_rank}</span>
                        </td>
                    ))}
                </tr>

                {/* Founded Row */}
                <tr className="bg-white hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-400 uppercase text-xs tracking-wider border-b">Established</td>
                    {colleges.map((col) => (
                        <td key={col.id} className="p-4 text-center border border-slate-100 border-b-slate-200">
                            {col.estd_year}
                        </td>
                    ))}
                </tr>

                {/* Courses Count Row */}
                <tr className="bg-white hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-400 uppercase text-xs tracking-wider border-b">Courses Available</td>
                    {colleges.map((col) => (
                        <td key={col.id} className="p-4 text-center border border-slate-100 border-b-slate-200">
                            {col.courses ? col.courses.length : 0} Courses
                        </td>
                    ))}
                </tr>

                 {/* Fees Comparison (Shows range or first course fee) */}
                 <tr className="bg-white hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-400 uppercase text-xs tracking-wider border-b">Avg Fees</td>
                    {colleges.map((col) => (
                        <td key={col.id} className="p-4 text-center border border-slate-100 border-b-slate-200 font-bold text-slate-900">
                            {col.courses && col.courses.length > 0 
                                ? `₹ ${(col.courses[0].total_fees / 100000).toFixed(2)} Lakhs` 
                                : 'N/A'}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
      </div>
    </main>
  );
}
