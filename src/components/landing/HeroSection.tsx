'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, FileText, Trophy, ShieldCheck, Flame } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-50/60 pt-4 pb-8 md:pt-16 md:pb-20 border-b border-slate-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Mobile View - EXACT Match to User Screenshot */}
        <div className="md:hidden flex flex-col items-center text-center space-y-4 py-2">
          
          {/* Centered Flame Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-bold shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>Gandhi Jayanti National Quiz 2026</span>
          </div>

          {/* Centered TKFK 2026 Tag */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <span className="text-[11px] font-extrabold text-emerald-700 font-mono tracking-wider">TKFK 2026</span>
          </div>

          {/* Centered Title */}
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Gandhi Jayanti 2026 <br />
            <span className="text-emerald-600">Knowledge Challenge</span>
          </h1>

          {/* Centered Subtitle */}
          <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-sm px-2">
            An online national-level quiz on the life, principles and legacy of Mahatma Gandhi — <strong className="text-slate-800 font-semibold">Open to all residents and citizens of India.</strong>
          </p>

          {/* 2 Feature Cards Side-by-Side */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-1">
            
            {/* Card 1: All India / Open to All */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 p-3.5 rounded-2xl flex flex-col items-start text-left space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-emerald-200/70 text-emerald-800 flex items-center justify-center font-bold">
                <Users className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">All India</h4>
                <p className="text-[10px] font-semibold text-slate-500">Open to All</p>
              </div>
            </div>

            {/* Card 2: 50 MCQs / 25 Mins Duration */}
            <div className="bg-rose-50/60 border border-rose-200/80 p-3.5 rounded-2xl flex flex-col items-start text-left space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-rose-200/70 text-rose-800 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4 text-rose-800" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{EVENT_CONFIG.totalQuestions} MCQs</h4>
                <p className="text-[10px] font-semibold text-slate-500">25 Mins Duration</p>
              </div>
            </div>

          </div>

          {/* Registration Details Pill */}
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 w-full max-w-sm justify-center shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
            <span>Registration Fee: <strong className="text-slate-900">₹99</strong> • Quiz Date: <strong className="text-slate-900">2 October 2026</strong></span>
          </div>

          {/* Action Buttons Stacked */}
          <div className="w-full max-w-sm space-y-2.5 pt-1">
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-[0.98] group"
            >
              <span>Register Now (₹99)</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/#how-it-works"
              className="w-full inline-flex items-center justify-center text-center text-xs font-bold text-slate-700 py-3.5 px-4 rounded-full border border-slate-200 bg-white active:bg-slate-100 shadow-xs"
            >
              Learn How to Participate →
            </Link>
          </div>

        </div>

        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 md:space-y-6 text-left">
            
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">Gandhi Jayanti National Quiz 2026</span>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                <span className="text-[11px] font-extrabold text-emerald-700 font-mono">TKFK 2026</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Gandhi Jayanti 2026 <br />
              <span className="text-emerald-600">Knowledge Challenge</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
              An online national-level quiz on the life, principles and legacy of Mahatma Gandhi — <strong className="text-slate-900 font-semibold">Open to all residents and citizens of India.</strong>
            </p>

            <div className="pt-1 flex items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] group"
              >
                <span>Register Now (₹99)</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <Link
                href="/#how-it-works"
                className="text-center text-xs sm:text-sm font-bold text-slate-700 py-3.5 px-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
              >
                Learn How to Participate →
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Registration Fee: <strong>₹99</strong> • Quiz Date: <strong>2 October 2026</strong></span>
            </div>

            <div className="pt-2 grid grid-cols-4 gap-4 max-w-xl">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">All India</h4>
                  <p className="text-[10px] font-semibold text-slate-500">Open to All</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-1">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">{EVENT_CONFIG.totalQuestions} MCQs</h4>
                  <p className="text-[10px] font-semibold text-slate-500">25 Mins Duration</p>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-1">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-amber-950 leading-tight">{EVENT_CONFIG.firstPrizeDisplay}</h4>
                  <p className="text-[10px] font-semibold text-amber-800">Grand First Prize</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-1">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">Certificate</h4>
                  <p className="text-[10px] font-semibold text-slate-500">For All Completed</p>
                </div>
              </div>

            </div>

          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-white">
              <Image
                src="/images/gandhi_hero_3d.png"
                alt="TKFK Gandhi Knowledge Challenge 3D Graphic"
                fill
                sizes="(max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
