'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Trophy, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  User, 
  FileCheck2, 
  MessageCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const MobileHomeView: React.FC = () => {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-12">
      
      {/* ── 1. MINIMAL HERO (NO HERO IMAGE) ── */}
      <section className="bg-white px-5 pt-8 pb-7 border-b border-slate-100 shadow-xs">
        <div className="space-y-4">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-[#0066FF] text-[11px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-[#0066FF]" />
            <span>KNOWLEDGE & LEARNING PLATFORM</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ideas. Opportunities. <span className="text-[#0066FF] block">A Brighter You.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            TKFK is a vibrant community empowering curious minds through national competitions, learning programmes, and verified credentials.
          </p>

          {/* Primary CTA Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white py-3.5 px-5 rounded-xl font-bold text-sm shadow-sm active:scale-[0.99] transition-all"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-5 rounded-xl font-semibold text-sm transition-colors"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Participant Portal / Login</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ── 2. QUICK CORE FUNCTIONS GRID ── */}
      <section className="px-4 py-5">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">
          Quick Functions
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          
          {/* Register Event */}
          <Link
            href="/register"
            className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs hover:border-blue-300 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block text-[10px]">Open Now</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Register Event</h3>
              <p className="text-[11px] text-slate-500 mt-1">Poster Contest 2026</p>
            </div>
          </Link>

          {/* Participant Portal */}
          <Link
            href="/login"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block text-[10px]">ID Pass</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">My Portal</h3>
              <p className="text-[11px] text-slate-500 mt-1">View ID & Status</p>
            </div>
          </Link>

          {/* Certificates */}
          <Link
            href="/certificates"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block text-[10px]">Verify</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Certificates</h3>
              <p className="text-[11px] text-slate-500 mt-1">Download & Check</p>
            </div>
          </Link>

          {/* Results */}
          <Link
            href="/results"
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 active:scale-[0.98] transition-all flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block text-[10px]">Official</span>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">Quiz Results</h3>
              <p className="text-[11px] text-slate-500 mt-1">Scores & Rankings</p>
            </div>
          </Link>

        </div>
      </section>

      {/* ── 3. EVENTS SECTION ── */}
      <section className="px-4 py-4" id="events">
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
            <div className="relative h-36 w-full bg-slate-100">
              <Image
                src="/images/card_earth.jpg"
                alt="Digital Poster Contest 2026"
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

          {/* Past Event: Gandhi Jayanti Quiz 2026 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Concluded Event
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Gandhi Jayanti Quiz 2026
              </h4>
              <p className="text-[11px] text-slate-500">
                Conducted on 02 Oct 2026 • National Level
              </p>
            </div>
            <Link
              href="/results"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0066FF] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors shrink-0 ml-3"
            >
              <span>Results</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Upcoming Event: Republic Day Quiz 2027 */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">
                Coming Soon
              </span>
              <h4 className="text-sm font-bold text-slate-800">
                Republic Day National Quiz 2027
              </h4>
              <p className="text-[11px] text-slate-500">
                Scheduled for 26 Jan 2027
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0 ml-3">
              Announcing Soon
            </span>
          </div>

        </div>
      </section>

      {/* ── 4. ABOUT US SECTION ── */}
      <section className="px-4 py-5" id="about">
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
            <strong>The Knowledge Forum Kerala (TKFK)</strong> is dedicated to creating accessible, high-standard knowledge experiences and competitions for learners across India. We believe curiosity is the catalyst for intellectual growth and positive change.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Affordable national-level competitions & prizes</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Verified digital participant passes & certificates</span>
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
