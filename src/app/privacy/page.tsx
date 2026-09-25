'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Legal Document
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-600">
            Last Updated: September 2026 • {EVENT_CONFIG.organizer}
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              We collect personal information necessary for competition management and identity verification:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Full Name, Email Address, and 10-Digit Mobile Number</li>
              <li>State, City, and Academic Institution / College (Optional)</li>
              <li>Payment Transaction References (processed via Razorpay)</li>
              <li>Quiz Session timestamps, responses, and evaluated scores</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Data Processors & Third-Party Infrastructure</h2>
            <p>
              Your data is processed strictly for the administration of the competition using authorized third-party service providers:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase Inc.:</strong> Cloud database hosting and server infrastructure.</li>
              <li><strong>Razorpay Software Pvt. Ltd.:</strong> Payment gateway processing for registration fees.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Data Retention Policy</h2>
            <p>
              Participant personal data and score records are retained for a period of 12 months following the conclusion of the event on 2 October 2026 to facilitate winner verification, certificate re-downloads, and audit compliance, after which data is securely archived or anonymized.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Grievance Officer & Contact</h2>
            <p>
              If you have privacy concerns or wish to request data updates, please contact our Grievance Officer at:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-slate-900">
              <strong className="block">Privacy Grievance Officer — TKFK Bureau</strong>
              <p>Email: {EVENT_CONFIG.supportEmail}</p>
              <p>Phone: {EVENT_CONFIG.supportPhone}</p>
              <p>Address: {EVENT_CONFIG.address}</p>
            </div>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
