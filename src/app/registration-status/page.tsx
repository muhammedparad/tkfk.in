'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Lock, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function RegistrationStatusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full space-y-6 outline-none">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3.5 py-1 rounded-full">
            Protected Participant Portal
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Check Registration Status
          </h1>
          <p className="text-sm text-slate-600">
            Registration details are protected to ensure participant privacy.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              Authentication Required
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              To check your registration status, fee payment receipt, or access study materials, please log into your participant account using your Participant ID (e.g. TKFK26-004821) and registered 10-digit phone number.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <LogIn className="w-5 h-5" />
              <span>Log In to View Registration Status</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>

            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl text-sm transition-all focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <UserPlus className="w-5 h-5" />
              <span>Don&apos;t have an account? Register Now</span>
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
