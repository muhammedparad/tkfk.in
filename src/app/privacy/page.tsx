'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-8 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 outline-none">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            DATA PROTECTION
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a]">
            {EVENT_CONFIG.organizer}
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6 text-[#706e6a] text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">1. Information We Collect</h2>
            <p>
              We collect personal information necessary for competition management and identity verification:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name, Email Address, and 10-Digit Mobile Number</li>
              <li>State, City, and Academic Institution / College (Optional)</li>
              <li>Payment Transaction References (processed via Razorpay)</li>
              <li>Contest submissions, file uploads, timestamps, and evaluated scores</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">2. Data Processors & Third-Party Infrastructure</h2>
            <p>
              Your data is processed strictly for the administration of the competition using authorized third-party service providers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase Inc.:</strong> Cloud database hosting and server infrastructure.</li>
              <li><strong>Razorpay Software Pvt. Ltd.:</strong> Payment gateway processing for registration fees.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">3. Data Retention Policy</h2>
            <p>
              Participant personal data and evaluation records are retained for a period of 12 months following the conclusion of the contest on 15 November 2026 to facilitate winner verification, certificate re-downloads, and audit compliance, after which data is securely archived or anonymized.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">4. Grievance Officer & Contact</h2>
            <p>
              If you have privacy concerns or wish to request data updates, please contact our Grievance Officer at:
            </p>
            <div className="p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-1.5 text-[#141412]">
              <strong className="block text-sm font-medium">Privacy Grievance Officer — TKFK Bureau</strong>
              <p className="text-xs text-[#706e6a]">Email: {EVENT_CONFIG.supportEmail}</p>
              <p className="text-xs text-[#706e6a]">Phone: {EVENT_CONFIG.supportPhone}</p>
              <p className="text-xs text-[#706e6a]">Address: {EVENT_CONFIG.address}</p>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
