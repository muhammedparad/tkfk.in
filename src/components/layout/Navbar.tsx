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

  const { isLoggedIn } = useParticipantSession();

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
        setLangOpen(false);
        setEventsDropdown(false);
        setProgDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#f8f5f0]/85 backdrop-blur-md border-b border-[#f0ede8] transition-all">
      
      {/* ── TOP UTILITY BAR (Hidden on mobile) ── */}
      <div className="hidden md:block bg-[#f8f5f0]/90 border-b border-[#f0ede8] text-[11px] text-[#9c9a97] py-1.5 px-4 sm:px-6">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between font-sans">
          
          {/* Left Tagline */}
          <div className="flex items-center gap-2 font-medium tracking-wide text-[#706e6a]">
            <span>Knowledge</span>
            <span className="text-[#9c9a97]/50">•</span>
            <span>Community</span>
            <span className="text-[#9c9a97]/50">•</span>
            <span>Opportunities</span>
          </div>

          {/* Right Utility Group (Language, Socials, Login/Register) */}
          <div className="flex items-center gap-5">
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="inline-flex items-center gap-1 text-[#706e6a] hover:text-[#141412] transition-colors font-medium cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#9c9a97]" />
                <span>English</span>
                <ChevronDown className="w-3 h-3 text-[#9c9a97]" />
              </button>

              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#fafafb] rounded-xl shadow-lg border border-[#f0ede8] py-1 z-50 text-xs">
                  <button 
                    onClick={() => setLangOpen(false)} 
                    className="w-full text-left px-3 py-1.5 hover:bg-[#f0ede8] text-[#ff6b35] font-semibold flex items-center justify-between"
                  >
                    <span>English</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
                  </button>
                  <button 
                    onClick={() => setLangOpen(false)} 
                    className="w-full text-left px-3 py-1.5 hover:bg-[#f0ede8] text-[#141412]"
                  >
                    മലയാളം
                  </button>
                </div>
              )}
            </div>

            {/* Social Icons */}
            <div className="hidden md:flex items-center gap-2.5 text-[#9c9a97]">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#ff6b35] transition-colors" title="Instagram">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#ff6b35] transition-colors" title="YouTube">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://chat.whatsapp.com/B8eZA7FCO9wGSYzLfQfBjc" target="_blank" rel="noreferrer" className="hover:text-[#ff6b35] transition-colors" title="WhatsApp Community">
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
                  className="inline-flex items-center gap-1.5 text-[#ff6b35] hover:text-[#e85926] font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Portal</span>
                </Link>
              ) : (
                <Link 
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-[#706e6a] hover:text-[#141412] font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#9c9a97]" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[64px] sm:h-[72px]">
          
          {/* Logo Brand: TKFK A KNOWLEDGE COMMUNITY with exact logo */}
          <Link href="/" className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-xl p-0.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 border border-[#f0ede8] shadow-2xs flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
              <Image 
                src="/images/tkfk_logo.png" 
                alt="TKFK Logo" 
                width={36} 
                height={36} 
                priority
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-[#141412] tracking-tight leading-none">
                TKFK
              </span>
              <span className="text-[9px] font-medium text-[#9c9a97] tracking-wider uppercase leading-none mt-1">
                A Knowledge Community
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Kairu Minimalist Typography) */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center space-x-7 text-[13px] font-medium text-[#706e6a]">
            
            {/* Home */}
            <Link 
              href="/" 
              className="text-[#141412] font-semibold relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#ff6b35] after:rounded-full"
            >
              Home
            </Link>

            {/* Events Dropdown */}
            <div className="relative group" onMouseLeave={() => setEventsDropdown(false)}>
              <button 
                type="button"
                onClick={() => setEventsDropdown(!eventsDropdown)}
                className="flex items-center gap-1 hover:text-[#141412] transition-colors py-1 cursor-pointer"
              >
                <span>Events</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9c9a97] group-hover:text-[#141412]" />
              </button>

              {eventsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#fafafb] rounded-2xl shadow-xl border border-[#f0ede8] py-2 z-50">
                  <Link href="/register" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-[#f0ede8] text-[#ff6b35] font-semibold text-xs">
                    🎨 Digital Poster Contest 2026 (Open)
                  </Link>
                  <Link href="/#events-section" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-[#f0ede8] text-[#706e6a] text-xs">
                    📜 Gandhi Jayanti Quiz 2026 (History)
                  </Link>
                  <Link href="/#events-section" onClick={() => setEventsDropdown(false)} className="block px-4 py-2 hover:bg-[#f0ede8] text-[#706e6a] text-xs">
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
                className="flex items-center gap-1 hover:text-[#141412] transition-colors py-1 cursor-pointer"
              >
                <span>Programmes</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#9c9a97] group-hover:text-[#141412]" />
              </button>

              {progDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-[#fafafb] rounded-2xl shadow-xl border border-[#f0ede8] py-2 z-50">
                  <Link href="/register" onClick={() => setProgDropdown(false)} className="block px-4 py-2 hover:bg-[#f0ede8] text-[#141412] text-xs font-medium">
                    Contests & Challenges
                  </Link>
                  <Link href="/#about-section" onClick={() => setProgDropdown(false)} className="block px-4 py-2 hover:bg-[#f0ede8] text-[#706e6a] text-xs">
                    Mentorship & Cohorts
                  </Link>
                </div>
              )}
            </div>

            <Link href="/rules" className="hover:text-[#141412] transition-colors py-1">
              Guidelines
            </Link>

            <Link href="/login" className="hover:text-[#141412] transition-colors py-1">
              Portal
            </Link>

            <Link href="/#about-section" className="hover:text-[#141412] transition-colors py-1">
              About
            </Link>

            <Link href="/contact" className="hover:text-[#141412] transition-colors py-1">
              Contact
            </Link>
          </nav>

          {/* Right Action Buttons: Search & Kairu Burnt Orange Pill CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Icon */}
            <button 
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-9 h-9 rounded-full border border-[#f0ede8] bg-white/70 hover:bg-white text-[#706e6a] hover:text-[#141412] flex items-center justify-center transition-all cursor-pointer"
              aria-label="Search events"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Kairu Burnt Orange Button */}
            <Link
              href="/#events-section"
              className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white px-5 py-2.5 rounded-full font-medium text-xs tracking-wide shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 transition-all duration-300 active:scale-95"
            >
              <span>Explore Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Right Bar: Search + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/register"
              className="bg-[#ff6b35] text-white text-[11px] font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-xs active:scale-95"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 rounded-full border border-[#f0ede8] bg-white/80 hover:bg-white text-[#141412] flex items-center justify-center active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Search Bar Drawer */}
      {searchOpen && (
        <div className="border-t border-[#f0ede8] bg-[#f8f5f0]/95 px-4 py-3 animate-in fade-in-50">
          <div className="max-w-[1100px] mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#9c9a97]" />
            <input 
              type="text" 
              placeholder="Search competitions, guidelines, or events..." 
              className="flex-1 bg-transparent border-none text-xs sm:text-sm focus:outline-none placeholder:text-[#9c9a97] text-[#141412]"
              autoFocus
            />
            <button 
              onClick={() => setSearchOpen(false)}
              className="text-xs text-[#9c9a97] hover:text-[#141412] px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#f8f5f0] border-b border-[#f0ede8] px-5 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-[#706e6a]">
            <Link 
              href="/" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl text-[#141412] font-semibold bg-[#f0ede8]/70"
            >
              Home
            </Link>
            <Link 
              href="/register" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] text-[#ff6b35] font-semibold"
            >
              🎨 Digital Poster Contest (Open)
            </Link>
            <Link 
              href="/#events-section" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              All Events & Contests
            </Link>
            <Link 
              href="/rules" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Guidelines
            </Link>
            <Link 
              href="/login" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Participant Portal
            </Link>
            <Link 
              href="/#about-section" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              About TKFK
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Contact Support
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#f0ede8] flex flex-col gap-2">
            {mounted && isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center bg-[#141412] text-white font-medium py-3 rounded-full text-xs shadow-xs"
              >
                Go to My Portal
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center bg-white border border-[#f0ede8] text-[#141412] font-medium py-3 rounded-full text-xs"
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
