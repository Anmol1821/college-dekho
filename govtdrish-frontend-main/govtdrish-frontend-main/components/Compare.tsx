"use client";
import Link from "next/link";
import { ArrowRightLeft } from "lucide-react";

export default function Compare() {
  return (
    <div className="flex flex-col items-center text-center h-full justify-center p-4">
      <div className="bg-orange-100 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <ArrowRightLeft size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Compare Master</h3>
      <p className="text-slate-500 text-sm mb-6">
        Don&apos;t get fooled by ads. Put colleges side-by-side to reveal the truth about Fees &amp; ROI.
      </p>
      <Link
        href="/search"
        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
      >
        Start Comparison
      </Link>
    </div>
  );
}