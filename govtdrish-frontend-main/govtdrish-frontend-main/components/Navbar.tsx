"use client";
import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, Facebook, Twitter, Youtube, Users, PenLine, ChevronDown, User, Menu, X, Globe, GraduationCap, Award } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ApplyModal from "./ApplyModal"; 

export default function Navbar() {
  const { lang, toggleLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const TEST_SERIES_URL = "https://preparation.govtdrish.com";

  const navLinks: { href: string; label: string; icon: React.ReactNode; external?: boolean }[] = [
    { href: "/colleges", label: "Colleges", icon: <GraduationCap size={16} /> },
    { href: "/exams", label: "Exams", icon: <PenLine size={16} /> },
    { href: "/courses", label: "Courses", icon: <Users size={16} /> },
    { href: "/scholarships", label: "Scholarships", icon: <Award size={16} /> },
    { href: TEST_SERIES_URL, label: "Test Series", icon: <PenLine size={16} />, external: true },
  ];

  return (
    <header className="font-sans shadow-sm z-50 relative bg-white">
      {/* 1. TOP GRAY BAR (Contact) */}
      <div className="bg-[#f0f3f6] border-b border-[#e0e4e9] text-[11px] text-[#566573] py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="tel:08044187303" className="flex items-center gap-1 hover:text-blue-600">
              <Phone size={12} strokeWidth={2.5} /> <span className="font-semibold">08044187303</span>
            </a>
            <span className="text-slate-300">|</span>
            <a href="mailto:hello@govtdrish.com" className="flex items-center gap-1 hover:text-blue-600">
              <Mail size={12} strokeWidth={2.5} /> <span className="font-semibold">hello@govtdrish.com</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
             <span className="font-medium opacity-80">We&apos;re on your favourite socials!</span>
             <div className="flex gap-2 text-slate-400">
                <Facebook size={12} className="hover:text-[#3b5998] cursor-pointer" />
                <Twitter size={12} className="hover:text-[#1da1f2] cursor-pointer" />
                <Youtube size={12} className="hover:text-[#ff0000] cursor-pointer" />
             </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAV BAR */}
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
             <div className="w-9 h-9 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-lg">G</div>
             <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-800 leading-none tracking-tight">Govt<span className="text-blue-600">Drish</span></span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Honest Reviews</span>
             </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-bold text-[#424242] uppercase tracking-wide">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 py-6 border-b-2 border-transparent hover:border-blue-600 transition-all"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="hover:text-blue-600 py-6 border-b-2 border-transparent hover:border-blue-600 transition-all">
                  {link.label}
                </Link>
              )
            )}
            <div className="group relative py-6">
                <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">MORE <ChevronDown size={12} /></span>
                <div className="absolute top-full right-0 w-52 bg-white border border-slate-100 shadow-xl rounded-xl p-2 hidden group-hover:block z-50 normal-case tracking-normal">
                    <button onClick={toggleLanguage} className="w-full text-left px-4 py-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm font-medium">
                        <Globe size={14} /> {lang === 'en' ? 'हिंदी में देखें' : 'English'}
                    </button>
                    <Link href="/contact" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">Contact Us</Link>
                    <Link href="/compare" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm font-medium">Compare Colleges</Link>
                </div>
            </div>
        </nav>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} title="Change language" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <Globe size={18} />
            </button>
            <Link href="/contact" className="hidden sm:flex w-9 h-9 rounded-full bg-slate-100 items-center justify-center text-slate-500 hover:bg-slate-200">
                <User size={18} />
            </Link>
            <div className="hidden md:block">
                <ApplyModal collegeName="General" />
            </div>
            <button
              className="lg:hidden text-slate-700"
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-1 absolute w-full shadow-xl z-50">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="flex items-center gap-3 font-bold text-slate-700 py-3 px-2 rounded-lg hover:bg-slate-50"
              >
                {link.icon} {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center gap-3 font-bold text-slate-700 py-3 px-2 rounded-lg hover:bg-slate-50"
              >
                {link.icon} {link.label}
              </Link>
            )
          )}
          <Link href="/contact" onClick={closeMenu} className="flex items-center gap-3 font-bold text-slate-700 py-3 px-2 rounded-lg hover:bg-slate-50">
            <Mail size={16} /> Contact Us
          </Link>
          <div className="pt-2">
            <ApplyModal collegeName="General" />
          </div>
        </div>
      )}
    </header>
  );
}
