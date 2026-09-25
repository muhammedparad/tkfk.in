'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Legal Terms
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service & Competition Rules
          </h1>
          <p className="text-xs text-slate-600">
            Gandhi Knowledge Challenge 2026 • {EVENT_CONFIG.organizer}
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Eligibility & Registration</h2>
            <p>
              The Gandhi Knowledge Challenge 2026 is open to all residents and citizens of India. Participants under 18 years of age confirm that they have obtained consent from a parent or legal guardian. Registration requires a fee of ₹99.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Competition Structure & Prize Rules</h2>
            <p>
              The competition consists of a 50-question multiple choice quiz on Mahatma Gandhi&apos;s life, history, and philosophy. The <strong>First Prize of {EVENT_CONFIG.firstPrizeDisplay}</strong> is awarded based on academic evaluation.
            </p>
            <p>
              <strong>Tie-Break Protocol:</strong> If multiple participants achieve equal scores, rankings are determined by:
            </p>
            <ol className="list-decimal pl-5 space-y-1 font-medium">
              <li>Highest Score Secured</li>
              <li>Shortest Time Taken (in seconds)</li>
              <li>Earliest Submission Timestamp</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Taxation & Legal Compliance</h2>
            <p>
              <strong>Tax Deductions:</strong> Cash prize winnings are subject to Indian tax regulations. Tax Deducted at Source (TDS) under Section 194B of the Income Tax Act 1961 will be withheld where required by law.
            </p>
            <p>
              <strong>Skill-Based Contest:</strong> This event is organized as an educational competition based on historical knowledge and skill. It complies with Indian prize competition laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Code of Conduct</h2>
            <p>
              Participants must complete their attempt independently. Any attempt to use automated scripts, multiple registrations under false identities, or cheat will result in immediate disqualification and account termination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Governing Law & Contact</h2>
            <p>
              These terms are governed by the laws of India. For questions, contact <strong className="text-slate-900">{EVENT_CONFIG.supportEmail}</strong>.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
