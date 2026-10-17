'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Award, ArrowRight, Home } from 'lucide-react';

export default function CertificatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full flex items-center justify-center outline-none">
        
        <div className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center space-y-6 w-full">
          
          {/* Concluded Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f0ede8] text-[#ff6b35] rounded-full flex items-center justify-center mx-auto border border-[#f0ede8]">
            <Award className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff6b35]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[10px] font-semibold tracking-[0.2em] uppercase">
              ARCHIVE NOTICE
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#141412] tracking-[-0.03em]">
              Certificate Distribution Closed
            </h1>

            <p className="text-xs sm:text-sm text-[#706e6a] max-w-lg mx-auto leading-relaxed pt-1 font-normal">
              The certificate download and issuance window for past events has concluded. Verified digital certificates for active and upcoming challenges will be distributed directly through participant portals.
            </p>
          </div>

          {/* Active Contest Highlight */}
          <div className="p-5 rounded-2xl bg-[#f0ede8]/70 border border-[#f0ede8] text-left space-y-2">
            <span className="text-[11px] font-mono font-semibold text-[#ff6b35] uppercase tracking-wider block">
              ACTIVE PROGRAMME
            </span>
            <h3 className="text-base sm:text-lg font-medium text-[#141412]">
              Digital Poster Creation Contest 2026
            </h3>
            <p className="text-xs text-[#706e6a] leading-relaxed">
              Registrations are open for our flagship creative challenge. Register now to receive your official Participant Pass and guidelines.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white px-7 py-3.5 rounded-full font-medium text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>Explore Poster Contest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] px-6 py-3.5 rounded-full font-medium text-xs sm:text-sm shadow-2xs transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
