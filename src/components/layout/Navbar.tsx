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
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const { isLoggedIn } = useParticipantSession();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['why', 'curriculum', 'timeline', 'community', 'faq'];
      const scrollPos = window.scrollY + 120;
      let current = '';
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = sectionId;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {/* Floating Liquid Glass Navbar Container */}
      <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center">
        <div
          className={`liquid-glass-navbar ${
            isScrolled ? 'is-scrolled' : ''
          } max-w-[1060px] w-full pointer-events-auto relative rounded-full px-3.5 sm:px-5 transition-all duration-300`}
        >
          {/* Specular Liquid Light Reflection along Top Curve */}
          <div className="liquid-glass-specular" aria-hidden="true" />

          <div className="flex items-center justify-between h-[54px] sm:h-[62px]">
            
            {/* Left: Geometric Logo Mark */}
            <Link href="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-full p-1 outline-none">
              <svg 
                viewBox="0 0 50 40" 
                fill="currentColor" 
                className="w-7 h-5.5 sm:w-8 sm:h-6 text-[#141412] group-hover:scale-105 transition-transform"
                aria-label="TKFK Logo"
              >
                <path d="M 43 31 L 31 40 L 5 40 L 7 35 L 12 31 L 29 31 L 32 35 L 40 11 L 45 7 L 50 7 Z M 43 5 L 38 9 L 21 9 L 18 5 L 10 29 L 5 33 L 0 33 L 7 9 L 19 0 L 45 0 Z M 24 13 L 35 13 L 29 31 L 26 27 L 15 27 L 21 9 Z" />
              </svg>
              <span className="hidden sm:inline font-bold text-base text-[#141412] tracking-tight ml-1">
                TKFK
              </span>
            </Link>

            {/* Center Navigation Links with Active State & Focus (Desktop) */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-6 text-[13px] font-medium text-[#706e6a]">
              {[
                { id: 'why', label: 'Why' },
                { id: 'curriculum', label: 'Curriculum' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'community', label: 'Community' },
                { id: 'faq', label: 'FAQ' },
              ].map((link) => {
                const isActive = activeSection === link.id;
                return (
                  <Link
                    key={link.id}
                    href={`/#${link.id}`}
                    className={`relative py-1.5 transition-colors focus-visible:outline-none focus-visible:text-[#ff6b35] ${
                      isActive ? 'text-[#141412] font-semibold' : 'hover:text-[#141412]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#ff6b35] rounded-full animate-in fade-in" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Kairu Capsule Button with Embedded Arrow Circle (Desktop) */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Portal Link */}
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
                className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs tracking-[-0.01em] shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
              >
                <span>Get access</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </div>

            {/* Mobile Right Bar: Exact 2 Horizontal Lines Hamburger Button from Reference */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 p-1 text-[#141412] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                <span
                  className={`w-5 h-[1.75px] bg-[#141412] rounded-full transition-all duration-300 ${
                    mobileOpen ? 'rotate-45 translate-y-[3.75px]' : ''
                  }`}
                />
                <span
                  className={`w-5 h-[1.75px] bg-[#141412] rounded-full transition-all duration-300 ${
                    mobileOpen ? '-rotate-45 -translate-y-[3.75px]' : ''
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Floating Mobile Drawer */}
          {mobileOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#f8f5f0]/95 backdrop-blur-2xl border border-white/80 rounded-[28px] p-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2">
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

        </div>
      </header>

      {/* Layout Spacer so page content begins smoothly below floating bar */}
      <div className="h-[68px] sm:h-[76px] w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </>
  );
};
