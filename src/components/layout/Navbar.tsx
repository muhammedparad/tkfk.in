'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowUpRight, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useParticipantSession, clearParticipantSessionCache } from '@/hooks/useParticipantSession';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_LINKS: NavItem[] = [
  { id: 'why', label: 'Why', href: '/#why' },
  { id: 'events-section', label: 'Events', href: '/#events-section' },
  { id: 'timeline', label: 'Pathway', href: '/#timeline' },
  { id: 'who', label: 'Who Belongs', href: '/#who' },
  { id: 'community', label: 'Community', href: '/#community' },
  { id: 'faq', label: 'FAQ', href: '/#faq' },
];

export const Navbar: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const { isLoggedIn } = useParticipantSession();

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tkfk_logged_out', '1');
      }
      clearParticipantSessionCache();
      await fetch('/api/participant/logout', {
        method: 'POST',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
    } catch (e) {
      console.error('Navbar logout error:', e);
    } finally {
      if (typeof window !== 'undefined') {
        window.location.replace('/login?logged_out=1');
      }
    }
  };

  // Scrollspy to detect active on-page anchor section
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (window.location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      const sectionIds = ['why', 'events-section', 'timeline', 'who', 'community', 'faq'];
      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active when element's upper boundary passes under header area
          if (rect.top <= 160 && rect.bottom >= 160) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Prevent background scrolling behind mobile overlay without layout jump
  useEffect(() => {
    if (mobileOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [mobileOpen]);

  // Support Escape to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  // Smooth scroll handler for anchor links
  const handleNavLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (mobileOpen) {
      setMobileOpen(false);
    }

    if (href.startsWith('/#') && window.location.pathname === '/') {
      e.preventDefault();
      const id = href.replace('/#', '');
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${id}`);
        setActiveSection(id);
      }
    }
  }, [mobileOpen]);

  return (
    <>
      {/* 
        ========================================================================
        1. Fixed Navigation Header (Pinned/Freezed on Top with Frosted Blur)
        ========================================================================
      */}
      <header 
        className={`kairu-nav-blur ${
          isScrolled ? 'kairu-nav-scrolled' : ''
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 lg:px-10 h-[62px] sm:h-[68px] flex items-center justify-between">
          
          {/* Brand Logo (Left) */}
          <Link 
            href="/"
            onClick={(e) => handleNavLinkClick(e, '/')}
            className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-full p-1 outline-none"
            aria-label="TKFK Home"
          >
            <svg 
              viewBox="0 0 50 40" 
              fill="currentColor" 
              className="w-[32px] h-[26px] sm:w-[38px] sm:h-[30px] text-[#141412] group-hover:scale-105 transition-transform duration-200"
              aria-hidden="true"
            >
              <path d="M 43 31 L 31 40 L 5 40 L 7 35 L 12 31 L 29 31 L 32 35 L 40 11 L 45 7 L 50 7 Z M 43 5 L 38 9 L 21 9 L 18 5 L 10 29 L 5 33 L 0 33 L 7 9 L 19 0 L 45 0 Z M 24 13 L 35 13 L 29 31 L 26 27 L 15 27 L 21 9 Z" />
            </svg>
            <span className="hidden sm:inline-block font-bold text-base text-[#141412] tracking-tight">
              TKFK
            </span>
          </Link>

          {/* Desktop Center Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-6 lg:space-x-7 text-[13px] font-medium text-[#706e6a]">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(e, link.href)}
                  className={`relative py-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-sm outline-none ${
                    isActive 
                      ? 'text-[#141412] font-semibold' 
                      : 'hover:text-[#141412]'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span 
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#ff6b35] rounded-full" 
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Login/Portal + Kairu Pill CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dynamic Participant Portal / Login Button */}
            {mounted && isLoggedIn ? (
              <div className="flex items-center space-x-1.5">
                <Link 
                  href="/dashboard"
                  className="text-xs font-semibold text-[#141412] hover:text-[#ff6b35] transition-colors px-2 py-1 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-md outline-none"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-medium text-[#706e6a] hover:text-[#d93829] transition-colors px-2 py-1 flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#d93829] rounded-md outline-none cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="text-xs font-medium text-[#706e6a] hover:text-[#141412] transition-colors px-2 py-1 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-md outline-none"
              >
                <User className="w-3.5 h-3.5 text-[#9c9a97]" />
                <span>Login</span>
              </Link>
            )}

            {/* Kairu Pill CTA with Embedded Circular Arrow Area */}
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs tracking-[-0.01em] shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff6b35] outline-none"
            >
              <span>Register</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Closed Header: Minimal 2-Line Hamburger Button (Right) */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] p-2 text-[#141412] hover:opacity-75 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-lg outline-none transition-opacity"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-overlay"
            >
              <span className="w-[22px] h-[2px] bg-[#141412] rounded-full block pointer-events-none" />
              <span className="w-[22px] h-[2px] bg-[#141412] rounded-full block pointer-events-none" />
            </button>
          </div>

        </div>
      </header>

      {/* Persistent Layout Spacer so page content begins cleanly below the fixed header */}
      <div className="h-[62px] sm:h-[68px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* 
        ========================================================================
        2. Mobile Open Navigation Overlay (Full Viewport, Kairu Heritage Modal)
        ========================================================================
      */}
      <div
        id="mobile-navigation-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        className={`md:hidden fixed inset-0 z-[100] h-screen h-[100dvh] w-full bg-[#f8f5f0] flex flex-col justify-between px-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        {/* Top: Brand Logo Centered */}
        <div className="w-full flex items-center justify-center pt-6 sm:pt-8 shrink-0">
          <Link 
            href="/"
            onClick={(e) => handleNavLinkClick(e, '/')}
            className="flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-full p-1 outline-none"
            aria-label="TKFK Home"
          >
            <svg 
              viewBox="0 0 50 40" 
              fill="currentColor" 
              className="w-[36px] h-[28px] text-[#141412]"
              aria-hidden="true"
            >
              <path d="M 43 31 L 31 40 L 5 40 L 7 35 L 12 31 L 29 31 L 32 35 L 40 11 L 45 7 L 50 7 Z M 43 5 L 38 9 L 21 9 L 18 5 L 10 29 L 5 33 L 0 33 L 7 9 L 19 0 L 45 0 Z M 24 13 L 35 13 L 29 31 L 26 27 L 15 27 L 21 9 Z" />
            </svg>
            <span className="font-bold text-lg text-[#141412] tracking-tight">
              TKFK
            </span>
          </Link>
        </div>

        {/* Center: Centered Vertical List with Generous Consistent Spacing */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-7 py-4 overflow-y-auto">
          {NAV_LINKS.map((link, idx) => {
            const isActive = activeSection === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className={`font-display text-3xl sm:text-4xl font-medium tracking-tight transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-lg px-4 py-1 outline-none ${
                  isActive 
                    ? 'text-[#ff6b35]' 
                    : 'text-[#141412] hover:text-[#ff6b35]'
                }`}
                style={{
                  transitionDelay: mobileOpen ? `${idx * 40}ms` : '0ms',
                  transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: mobileOpen ? 1 : 0,
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Participant Portal / Login */}
          {mounted && isLoggedIn ? (
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#ff6b35] hover:text-[#e85926] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-lg px-4 py-1 outline-none"
                style={{
                  transitionDelay: mobileOpen ? `${NAV_LINKS.length * 40}ms` : '0ms',
                  transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: mobileOpen ? 1 : 0,
                }}
              >
                Participant Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 font-display text-lg sm:text-xl font-medium tracking-tight text-[#706e6a] hover:text-[#d93829] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#d93829] rounded-lg px-4 py-1 outline-none cursor-pointer"
                style={{
                  transitionDelay: mobileOpen ? `${(NAV_LINKS.length + 0.5) * 40}ms` : '0ms',
                  transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
                  opacity: mobileOpen ? 1 : 0,
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#706e6a] hover:text-[#141412] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-lg px-4 py-1 outline-none"
              style={{
                transitionDelay: mobileOpen ? `${NAV_LINKS.length * 40}ms` : '0ms',
                transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
                opacity: mobileOpen ? 1 : 0,
              }}
            >
              Login
            </Link>
          )}

          {/* Mobile Get Access CTA Pill */}
          <div
            className="pt-2 transition-all duration-300"
            style={{
              transitionDelay: mobileOpen ? `${(NAV_LINKS.length + 1) * 40}ms` : '0ms',
              transform: mobileOpen ? 'translateY(0)' : 'translateY(12px)',
              opacity: mobileOpen ? 1 : 0,
            }}
          >
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="group inline-flex items-center gap-2 pl-5 pr-2 py-2.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-sm tracking-tight shadow-md shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ff6b35] outline-none"
            >
              <span>Register</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom: Clearly Visible Close Control Near Bottom (Adaptive Safe Areas) */}
        <div className="w-full flex items-center justify-center pb-safe pt-2 pb-10 sm:pb-12 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="font-display text-2xl sm:text-3xl font-medium text-[#141412] hover:text-[#ff6b35] transition-colors focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-xl px-8 py-2.5 outline-none"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
};
