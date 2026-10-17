'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function RegistrationStatusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full space-y-8 outline-none">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            STATUS CHECK
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-[#141412] tracking-[-0.04em]">
            Check Registration Status
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a]">
            Participant records and entry passes are protected to ensure data privacy.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center space-y-6">
          <div className="w-16 h-16 bg-[#f0ede8] text-[#ff6b35] rounded-full flex items-center justify-center mx-auto shadow-2xs border border-[#f0ede8]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-medium text-[#141412] tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-md mx-auto font-normal">
              To check your registration status, verified payment pass, or access contest submissions, log into your participant account using your Participant ID (e.g. TKFK26-004821) and registered phone number.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to View Registration</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm shadow-2xs transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Don&apos;t have an account? Register Now</span>
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
