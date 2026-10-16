'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  User, 
  MessageCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const MobileHomeView: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen">
      
      {/* ── 1. MINIMAL HERO (FULL FIRST SCREEN ONLY) ── */}
      <section className="bg-white px-5 py-6 min-h-[calc(100svh-68px)] min-h-[calc(100dvh-68px)] flex flex-col justify-between border-b border-slate-100 shadow-xs">
        
        {/* Top Spacer */}
        <div className="pt-1" />

        {/* Center Content Block (Hero Exactly as Requested) */}
        <div className="space-y-4 max-w-md mx-auto w-full my-auto">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#0066FF] text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-[#0066FF]" />
            <span>THE KNOWLEDGE FORUM KERALA</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ideas. Opportunities. <span className="text-[#0066FF] block">A Brighter You.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            A vibrant community empowering curious minds through national competitions, learning programmes, and interactive challenges.
          </p>

          {/* Core Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href="#events"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm active:scale-[0.99] transition-all"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 px-5 rounded-xl font-semibold text-sm transition-colors"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Participant Portal / Login</span>
            </Link>
          </div>

        </div>

        {/* Bottom Scroll Indicator (Pushes everything else below first screen) */}
        <div className="pt-4 pb-1 flex flex-col items-center justify-center">
          <a 
            href="#events" 
            className="inline-flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span>Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-slate-400" />
          </a>
        </div>

      </section>

      {/* ── 2. EVENTS SECTION ── */}
      <section className="px-4 py-6" id="events">
        <div id="events-section" />
        
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider block">
              Programmes
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">
              Events & Contests
            </h2>
          </div>
          <Link 
            href="/register" 
            className="text-xs font-bold text-[#0066FF] flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          
          {/* Active Featured Event: Digital Poster Contest 2026 */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/20 shadow-xs overflow-hidden">
            <div className="relative h-40 w-full bg-slate-100">
              <Image
                src="/images/card_earth.jpg"
                alt="Digital Poster Creation Contest 2026"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-xs">
                  Registration Open
                </span>
              </div>
              <div className="absolute bottom-2.5 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-800 shadow-xs flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#0066FF]" />
                <span>15 NOV 2026</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Digital Poster Creation Contest
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Design impactful digital posters on inspiring themes. Open to all students & youth across India.
                </p>
              </div>

              {/* Prize & Fee Highlights */}
              <div className="bg-blue-50/70 rounded-xl p-2.5 flex items-center justify-between text-xs border border-blue-100/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Registration Fee</span>
                  <span className="font-extrabold text-slate-900">₹99 only</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-600 font-semibold block">1st Prize Reward</span>
                  <span className="font-black text-[#0066FF] text-sm">₹9,999</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white py-3 rounded-xl font-bold text-xs shadow-sm active:scale-[0.99] transition-all"
              >
                <span>Register Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Event: Republic Day Quiz 2027 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                Upcoming Contest
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Republic Day National Quiz 2027
              </h4>
              <p className="text-[11px] text-slate-500">
                Scheduled for 26 Jan 2027
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 ml-3">
              Coming Soon
            </span>
          </div>

        </div>
      </section>

      {/* ── 3. ABOUT US SECTION ── */}
      <section className="px-4 pb-8" id="about">
        <div id="about-section" />
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          
          <div>
            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider block">
              About TKFK
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
              A Community for Curious Minds
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            <strong>The Knowledge Forum Kerala (TKFK)</strong> is dedicated to creating accessible, high-standard knowledge experiences and competitions for learners across India. We believe curiosity is the catalyst for personal growth and positive community impact.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Accessible national-level competitions & prizes</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Official verified participant credentials</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Supportive community connecting learners nationwide</span>
            </div>
          </div>

          {/* Support / WhatsApp Help Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={EVENT_CONFIG.whatsAppGroupUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Join WhatsApp Community</span>
            </a>

            <Link
              href="/contact"
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors"
            >
              Need help? Contact Support Desk
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};
