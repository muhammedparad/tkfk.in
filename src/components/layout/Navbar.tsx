'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keyboard navigation & custom event handling for accessible mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };

    const handleToggleMenu = () => {
      setMobileOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-mobile-menu', handleToggleMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-mobile-menu', handleToggleMenu);
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand: TKFK 2026 */}
          <Link href="/" className="flex items-center gap-3.5 group focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl p-1">
            <div className="relative w-11 h-11 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-100 p-1 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <Image 
                src="/images/tkfk_logo.png" 
                alt="TKFK Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">TKFK <span className="text-emerald-600">2026</span></span>
              </div>
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
                Gandhi Knowledge Challenge
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Main Desktop Navigation" className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1">
              Home
            </Link>
            <Link href="/#about" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1">
              About
            </Link>
            <Link href="/#how-it-works" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1">
              How it Works
            </Link>
            <Link href="/faq" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-md p-1">
              Contact
            </Link>
          </nav>

          {/* Action Buttons: Login / Register Now */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-all focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Login</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-3 bg-emerald-600 text-white hover:bg-emerald-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all group focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>Register Now</span>
              <span className="w-6 h-6 rounded-full bg-white/20 group-hover:bg-white text-white group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link 
              href="/login"
              className="p-2 text-slate-600 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-full"
              aria-label="Participant Login"
              title="Participant Login"
            >
              <UserCheck className="w-6 h-6" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Accessible Mobile Nav Slide-out Drawer */}
      {mobileOpen && (
        <div 
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2"
        >
          <nav aria-label="Mobile Drawer Navigation" className="flex flex-col space-y-2 pt-2">
            <Link 
              href="/" 
              onClick={() => setMobileOpen(false)} 
              className="px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Home
            </Link>
            <Link 
              href="/#about" 
              onClick={() => setMobileOpen(false)} 
              className="px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              About
            </Link>
            <Link 
              href="/#how-it-works" 
              onClick={() => setMobileOpen(false)} 
              className="px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              How it Works
            </Link>
            <Link 
              href="/faq" 
              onClick={() => setMobileOpen(false)} 
              className="px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              onClick={() => setMobileOpen(false)} 
              className="px-4 py-2.5 text-base font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Contact
            </Link>
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-between bg-emerald-600 text-white px-5 py-3 rounded-full font-bold text-base shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span>Register Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-xl"
            >
              Participant Login (TKFK26-004821)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
