'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-8 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 outline-none">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            PAYMENT POLICY
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a]">
            {EVENT_CONFIG.organizer}
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6 text-[#706e6a] text-xs sm:text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">1. Registration Fee Overview</h2>
            <p>
              The registration fee for TKFK competitions and programmes is fixed at ₹99 (Rupees Ninety-Nine Only). This non-refundable fee covers administrative, platform server infrastructure, digital certificate issuance, and operational review costs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">2. Refund Conditions</h2>
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
            <h2 className="text-lg font-medium text-[#141412]">3. Processing & Timeline</h2>
            <p>
              Approved refunds will be processed via our payment processor (Razorpay) back to the original bank account, UPI ID, or card within 5–7 business days of request approval.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[#141412]">4. Grievance & Refund Requests</h2>
            <p>
              To request a duplicate payment refund, please email our support desk at <strong className="text-[#141412]">{EVENT_CONFIG.supportEmail}</strong> with your payment reference ID, registered mobile number, and transaction receipt.
            </p>
          </section>

        </div>

      </main>

      <Footer />
    </div>
  );
}
