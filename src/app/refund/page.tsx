'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { ShieldCheck, RefreshCw, CreditCard } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full">
            Official Policy
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-600">
            Gandhi Knowledge Challenge 2026 Registration Fee (₹99)
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">1. Registration Fee Overview</h2>
            <p>
              The registration fee for the Gandhi Knowledge Challenge 2026 is fixed at ₹99 (Rupees Ninety-Nine Only). This non-refundable fee covers administrative, platform server infrastructure, digital certificate issuance, and academic review operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">2. Refund Conditions</h2>
            <p>
              Registration fees are generally non-refundable once payment is completed. Refunds will only be granted under the following exceptional circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Duplicate Payments:</strong> If a participant is charged more than once for the same registration due to technical or gateway errors, the duplicate amount will be refunded in full.
              </li>
              <li>
                <strong>Event Cancellation:</strong> In the unlikely event that the competition is cancelled by the organizer ({EVENT_CONFIG.organizer}), 100% of the registration fee will be refunded to the original payment source.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Processing & Timeline</h2>
            <p>
              Approved refunds will be processed via our payment processor (Razorpay) back to the original bank account, UPI ID, or card within 5–7 business days of request approval.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">4. Grievance & Refund Requests</h2>
            <p>
              To request a duplicate payment refund, please email our support desk at <strong className="text-slate-900">{EVENT_CONFIG.supportEmail}</strong> with your payment reference ID, registered mobile number, and transaction receipt.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
