'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  Globe, 
  ChevronDown, 
  User, 
  LayoutDashboard
} from 'lucide-react';
import { useParticipantSession } from '@/hooks/useParticipantSession';

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { isLoggedIn } = useParticipantSession();

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#f8f5f0]/85 backdrop-blur-md border-b border-[#f0ede8] transition-all">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[64px] sm:h-[70px]">
          
          {/* Left: Geometric Logo + Brand name */}
          <Link href="/" className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-xl p-0.5">
            <div className="w-8 h-8 rounded-lg bg-[#141412] text-white flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
              {/* Geometric emblem similar to Kairu */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <path d="m9 9 6 6" />
                <path d="m15 9-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#141412] tracking-tight leading-none">
                TKFK
              </span>
              <span className="text-[9px] font-semibold text-[#9c9a97] tracking-wider uppercase leading-none mt-1">
                The Knowledge Community
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Kairu Anatomy: Why, Curriculum, Instructor, FAQ) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-8 text-[13px] font-medium text-[#706e6a]">
            <Link href="/#why" className="hover:text-[#141412] transition-colors py-1">
              Why
            </Link>
            <Link href="/#curriculum" className="hover:text-[#141412] transition-colors py-1">
              Curriculum
            </Link>
            <Link href="/#timeline" className="hover:text-[#141412] transition-colors py-1">
              Timeline
            </Link>
            <Link href="/#community" className="hover:text-[#141412] transition-colors py-1">
              Community
            </Link>
            <Link href="/#faq" className="hover:text-[#141412] transition-colors py-1">
              FAQ
            </Link>
          </nav>

          {/* Right Action: Kairu Capsule Button with Embedded Arrow Circle */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Language / Portal Link */}
            {mounted && isLoggedIn ? (
              <Link 
                href="/dashboard"
                className="text-xs font-semibold text-[#141412] hover:text-[#ff6b35] transition-colors px-2 py-1 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>Portal</span>
              </Link>
            ) : (
              <Link 
                href="/login"
                className="text-xs font-medium text-[#706e6a] hover:text-[#141412] transition-colors px-2 py-1 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#9c9a97]" />
                <span>Login</span>
              </Link>
            )}

            {/* Kairu Capsule CTA Button */}
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs tracking-wide shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
            >
              <span>Get access</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-1 rounded-full bg-[#ff6b35] text-white text-[11px] font-semibold shadow-xs"
            >
              <span>Get access</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </Link>
            
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-8 h-8 rounded-full border border-[#f0ede8] bg-white/80 hover:bg-white text-[#141412] flex items-center justify-center active:scale-95 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#f8f5f0] border-b border-[#f0ede8] px-5 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-1 text-sm font-medium text-[#706e6a]">
            <Link 
              href="/#why" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Why
            </Link>
            <Link 
              href="/#curriculum" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Curriculum
            </Link>
            <Link 
              href="/#timeline" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Timeline
            </Link>
            <Link 
              href="/#community" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Community
            </Link>
            <Link 
              href="/#faq" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              FAQ
            </Link>
            <Link 
              href="/rules" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Guidelines
            </Link>
            <Link 
              href="/login" 
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#f0ede8] hover:text-[#141412]"
            >
              Participant Portal
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#f0ede8] flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center bg-[#ff6b35] text-white font-medium py-3 rounded-full text-xs shadow-xs"
            >
              Register for Contest
            </Link>
          </div>
        </div>
      )}

    </header>
  );
};
