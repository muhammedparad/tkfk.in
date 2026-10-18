'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-8 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 outline-none">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            LEGAL NOTICE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a]">
            {EVENT_CONFIG.organizer}
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6 text-[#706e6a] text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">1. Eligibility & Registration</h2>
            <p>
              TKFK competitions and programmes are open to all residents and citizens of India. Participants under 18 years of age confirm that they have obtained consent from a parent or legal guardian. Registration requires a fee of ₹99.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">2. Competition Structure & Prize Rules</h2>
            <p>
              Competitions consist of skill-based evaluations, talent challenges, or academic assessments organized by TKFK. The <strong>First Prize of {EVENT_CONFIG.firstPrizeDisplay}</strong> and accolades are awarded based on merit and evaluation criteria.
            </p>
            <p>
              <strong>Evaluation Protocol:</strong> Submissions and performances are assessed by expert panels. The decisions of the organisers and evaluating committees are final and binding.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">3. Taxation & Legal Compliance</h2>
            <p>
              <strong>Tax Deductions:</strong> Cash prize winnings are subject to Indian tax regulations. Tax Deducted at Source (TDS) under Section 194B of the Income Tax Act 1961 will be withheld where required by law.
            </p>
            <p>
              <strong>Skill-Based Contest:</strong> This event is organized as a creative and educational competition based on visual communication, skill, and original design. It complies with Indian prize competition laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">4. Code of Conduct</h2>
            <p>
              Participants must create and submit their artwork independently. Any attempt to submit plagiarized content, multiple registrations under false identities, or infringe copyright will result in immediate disqualification and account termination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">5. Governing Law & Contact</h2>
            <p>
              These terms are governed by the laws of India. For questions, contact <strong className="text-[#141412]">{EVENT_CONFIG.supportEmail}</strong>.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
