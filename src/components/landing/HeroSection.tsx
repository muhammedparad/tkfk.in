'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, FileText, Trophy, ShieldCheck, Flame } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';
import { useParticipantSession } from '@/hooks/useParticipantSession';

export const HeroSection: React.FC = () => {
  const { isLoggedIn, participant } = useParticipantSession();
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 border-b border-slate-100 min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100dvh-4rem)] flex items-center py-2 md:py-16">
      
      {/* Background Graphic Overlay for Mobile Hero - Exact Generated Artwork Matching Mockup */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-[360px] overflow-hidden pointer-events-none z-0 flex justify-center items-start opacity-85">
        <div className="relative w-full h-[360px] max-w-md mx-auto">
          <Image
            src="/images/gandhi_hero_bg.jpg"
            alt="Gandhi Watermark Background Illustration"
            fill
            className="object-cover object-top filter contrast-[1.02]"
            priority
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-white/80 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Mobile View - 1:1 Exact Match to User Mockup Screenshot with Bottom Nav Clearance */}
        <div className="md:hidden flex flex-col justify-between items-center text-center space-y-2 py-2 px-1 min-h-[calc(100dvh-3.5rem)] pb-6 max-w-sm mx-auto relative z-10">
          
          {/* 1. Flame Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-[#d97706] flex-shrink-0" />
            <span>Gandhi Jayanti National Quiz 2026</span>
          </div>

          {/* 2. Main Title - Enlarged font size formatted across 3 lines */}
          <h1 className="text-4xl sm:text-[38px] font-extrabold text-[#0f172a] tracking-tight leading-[1.08] mt-1">
            Gandhi Jayanti 2026 <br />
            <span className="text-[#00966b]">Knowledge</span> <br />
            <span className="text-[#00966b]">Challenge</span>
          </h1>

          {/* Green Horizontal Accent Bar */}
          <div className="w-12 h-1 bg-[#00966b] rounded-full mx-auto my-0.5" />

          {/* 3. Subtitle - Significantly Enlarged Font Size */}
          <div className="text-base text-[#334155] font-semibold leading-relaxed max-w-[340px] mx-auto px-1 space-y-1">
            <p>An online national-level quiz on the life,</p>
            <p>principles and legacy of Mahatma Gandhi —</p>
            <p className="font-extrabold text-[#0f172a] text-[15px] sm:text-base">Open to all residents of India.</p>
          </div>

          {/* 4. 2 Feature Cards Side-by-Side - Significantly Enlarged Cards */}
          <div className="grid grid-cols-2 gap-3.5 w-full max-w-sm pt-1">
            
            {/* Card 1: All India / Open to all */}
            <div className="bg-[#edf8f3] border border-[#d1f2e4] p-3.5 rounded-2xl flex items-center gap-3 text-left shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#c2f0dc] text-[#00835d] flex items-center justify-center font-bold flex-shrink-0">
                <Users className="w-5 h-5 text-[#00835d]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#0f172a] leading-tight">All India</h4>
                <p className="text-xs font-semibold text-[#475569]">Open to all</p>
              </div>
            </div>

            {/* Card 2: 50 MCQs / 25 Mins Duration */}
            <div className="bg-[#fdf2f4] border border-[#fce7f3] p-3.5 rounded-2xl flex items-center gap-3 text-left shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#fbcfe8] text-[#be185d] flex items-center justify-center font-bold flex-shrink-0">
                <FileText className="w-5 h-5 text-[#be185d]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-[#0f172a] leading-tight">{EVENT_CONFIG.totalQuestions} MCQs</h4>
                <p className="text-xs font-semibold text-[#475569]">25 Mins Duration</p>
              </div>
            </div>

          </div>

          {/* 5. Action Buttons Stack */}
          <div className="w-full max-w-sm space-y-2 pt-0.5 mb-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#00966b] hover:bg-[#00835d] active:bg-[#007050] text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] group"
                >
                  <span>Open Participant Portal</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Link>

                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center text-center text-xs font-bold text-[#0f172a] py-3.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {participant?.participant_id ? `ID: ${participant.participant_id} • View Dashboard →` : 'Go to My Dashboard →'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center gap-3 bg-[#00966b] hover:bg-[#00835d] active:bg-[#007050] text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] group"
                >
                  <span>Register Now</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </Link>

                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center text-center text-xs font-bold text-[#0f172a] py-3.5 px-4 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  Already Registered? Log In →
                </Link>
              </>
            )}
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
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] group"
                >
                  <span>Open Participant Portal</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-md transition-all active:scale-[0.98] group"
                  >
                    <span>Register Now</span>
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>

                  <Link
                    href="/login"
                    className="text-center text-xs sm:text-sm font-bold text-slate-700 py-3.5 px-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    Already Registered? Log In →
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Registration Open • Quiz Date: <strong>2 October 2026</strong></span>
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
