import Link from "next/link";
import { Facebook, Twitter, Youtube, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center text-slate-900 font-black text-lg">
              G
            </div>
            <span className="text-xl font-bold text-white">
              Govt<span className="text-blue-500">Drish</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-md">
            Honest college reviews, fee transparency and free government exam prep for Indian
            students. We tell you what the brochures hide.
          </p>
          <div className="flex gap-3 mt-5">
            <Facebook size={18} className="hover:text-white cursor-pointer" />
            <Twitter size={18} className="hover:text-white cursor-pointer" />
            <Youtube size={18} className="hover:text-white cursor-pointer" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/search" className="hover:text-white">Colleges</Link></li>
            <li><Link href="/search?q=scholarship" className="hover:text-white">Scholarships</Link></li>
            <li><Link href="/test-series" className="hover:text-white">Test Series</Link></li>
            <li><Link href="/compare" className="hover:text-white">Compare Colleges</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li className="flex items-center gap-2"><Phone size={14} /> 08044187303</li>
            <li className="flex items-center gap-2"><Mail size={14} /> hello@govtdrish.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Govt Drish. All rights reserved. Verify all fees and deadlines
        with official sources before applying.
      </div>
    </footer>
  );
}
