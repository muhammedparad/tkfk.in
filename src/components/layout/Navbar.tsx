'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Globe, 
  ChevronDown, 
  Search, 
  User, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Award, 
  HelpCircle,
  LayoutDashboard
} from 'lucide-react';
import { useParticipantSession } from '@/hooks/useParticipantSession';

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [eventsDropdown, setEventsDropdown] = useState(false);
  const [progDropdown, setProgDropdown] = useState(false);

  const { isLoggedIn, participant } = useParticipantSession();

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-xs transition-all">
      
      {/* ── TOP UTILITY BAR (Knowledge • Community • Opportunities) ── */}
      <div className="bg-slate-50/90 border-b border-slate-100/80 text-[11px] sm:text-xs text-slate-500 py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left Tagline */}
          <div className="flex items-center gap-2 font-medium tracking-wide text-slate-600">
            <span>Knowledge</span>
            <span className="text-slate-300">•</span>
            <span>Community</span>
            <span className="text-slate-300">•</span>
            <span>Opportunities</span>
          </div>

          {/* Right Utility Group (Language, Socials, Login/Register) */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors font-medium cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>English</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-1.5 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 text-xs">
                  <button 
                    onClick={() => setLangOpen(false)} 
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-600 font-semibold flex items-center justify-between"
                  >
                    <span>English</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  </button>
                  <button 
                    onClick={() => setLangOpen(false)} 
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                  >
                    മലയാളം
                  </button>
                </div>
              )}
            </div>

            {/* Social Icons (Instagram, YouTube, Twitter/X, WhatsApp) */}
            <div className="hidden md:flex items-center gap-2.5 text-slate-400">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-600 transition-colors" title="Instagram">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors" title="YouTube">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-slate-800 transition-colors" title="Twitter / X">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://chat.whatsapp.com/B8eZA7FCO9wGSYzLfQfBjc" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors" title="WhatsApp Community">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.984.582 3.834 1.583 5.397L2.14 21.86l4.633-1.42a10.007 10.007 0 0 0 5.258 1.488c5.536 0 10.031-4.495 10.031-10.031C22.062 6.495 17.567 2 12.031 2zm5.787 14.385c-.242.684-1.405 1.309-1.95 1.353-.518.04-1.185.06-3.876-1.054-3.442-1.423-5.632-4.945-5.803-5.176-.17-.231-1.39-1.85-1.39-3.528 0-1.678.88-2.502 1.192-2.845.312-.343.684-.429.912-.429.228 0 .456.002.656.012.213.01.498-.08.779.596.285.684.969 2.368 1.054 2.54.085.17.142.37.028.598-.114.228-.171.37-.342.57-.171.2-.36.446-.514.6-.171.171-.349.358-.15.702.199.342.885 1.458 1.897 2.36 1.304 1.162 2.404 1.522 2.746 1.693.342.171.541.142.74-.085.2-.228.855-.997 1.083-1.34.228-.342.456-.285.769-.171.313.114 1.993.94 2.335 1.111.342.171.57.257.655.399.085.143.085.827-.157 1.511z"/>
                </svg>
              </a>
            </div>

            {/* Login / Register Link */}
            <div className="flex items-center">
              {mounted && isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-blue-600 font-semibold transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo Brand: TKFK A KNOWLEDGE COMMUNITY */}
          <Link href="/" className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl p-0.5">
            <div className="w-10 h-10 rounded-xl bg-[#0f2444] text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="8" y1="6" x2="16" y2="6" />
                <line x1="8" y1="10" x2="14" y2="10" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-[#0b172a] tracking-tight leading-tight">
                TKFK
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase leading-none mt-0.5">
                A Knowledge Community
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-7 text-[13px] font-semibold text-slate-700">
            
            {/* Home (Active with blue indicator) */}
            <Link 
              href="/" 
              className="text-blue-600 font-bold relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-full"
            >
              Home
            </Link>

            {/* Events Dropdown */}
            <div className="relative group" onMouseLeave={() => setEventsDropdown(false)}>
              <button 
                type="button"
                onClick={() => setEventsDropdown(!eventsDropdown)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                <span>Events</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>

              {eventsDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <Link href="/register" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-blue-50 text-blue-600 font-bold text-xs">
                    🎨 Digital Poster Contest 2026 (Open)
                  </Link>
                  <Link href="/#events-section" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs">
                    ✓ Gandhi Jayanti Quiz 2026 (Finished)
                  </Link>
                  <Link href="/#events-section" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-slate-50 text-slate-600 text-xs">
                    🔔 Republic Day Quiz 2027 (Upcoming)
                  </Link>
                </div>
              )}
            </div>

            {/* Programmes Dropdown */}
            <div className="relative group" onMouseLeave={() => setProgDropdown(false)}>
              <button 
                type="button"
                onClick={() => setProgDropdown(!progDropdown)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2 cursor-pointer"
              >
                <span>Programmes</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </button>

              {progDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <Link href="/study" onClick={() => setProgDropdown(false)} className="block px-4 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold">
                    Study Modules & Booklets
                  </Link>
                  <Link href="/#community" onClick={() => setProgDropdown(false)} className="block px-4 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs">
                    Mentorship & Learning Circles
                  </Link>
                </div>
              )}
            </div>

            <Link href="/study" className="hover:text-blue-600 transition-colors py-2">
              Resources
            </Link>

            <Link href="/login" className="hover:text-blue-600 transition-colors py-2">
              Participant Portal
            </Link>

            <Link href="/#about" className="hover:text-blue-600 transition-colors py-2">
              About
            </Link>

            <Link href="/contact" className="hover:text-blue-600 transition-colors py-2">
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons: Search & Explore Events */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Icon */}
            <button 
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-10 h-10 rounded-full border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Search events and resources"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Explore Events Button */}
            <Link
              href="/#events"
              className="inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Right Bar: Search + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/#events"
              className="bg-[#0066FF] text-white text-[11px] font-bold px-3.5 py-2 rounded-full flex items-center gap-1 shadow-sm"
            >
              <span>Events</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Search Bar Drawer */}
      {searchOpen && (
        <div className="border-t border-slate-100 bg-slate-50/95 px-4 py-3 animate-in fade-in-50">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search quizzes, study modules, learning programs, or certificates..." 
              className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 text-slate-800"
              autoFocus
            />
            <button 
              onClick={() => setSearchOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
            <Link 
              href="/" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-blue-600 font-bold"
            >
              Home
            </Link>
            <Link 
              href="/#events" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600"
            >
              Events & Competitions
            </Link>
            <Link 
              href="/study" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600"
            >
              Programmes & Resources
            </Link>
            <Link 
              href="/login" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600"
            >
              Participant Portal
            </Link>
            <Link 
              href="/#about" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600"
            >
              About TKFK Community
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-600"
            >
              Contact Support
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {mounted && isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center bg-blue-600 text-white font-bold py-3 rounded-full text-xs shadow-sm"
              >
                Go to My Portal
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center bg-slate-100 text-slate-800 font-bold py-3 rounded-full text-xs"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
