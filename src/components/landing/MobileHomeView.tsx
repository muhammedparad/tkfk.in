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
      
      {/* ── 1. HERO SECTION (EXACT MATCH TO MOBILE MOCKUP) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EBF5FF] via-white to-[#F0F7FF] border-b border-slate-100">
        
        {/* Top Student Illustration with 4 Floating Feature Badges */}
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#DCEEFF]/50 to-transparent pt-1">
          <div className="relative w-full aspect-[474/420] max-h-[380px]">
            <Image
              src="/images/mobile_hero_students.png"
              alt="TKFK Knowledge Community - Students Collaborating"
              fill
              priority
              sizes="100vw"
              className="object-contain object-top select-none pointer-events-none drop-shadow-xs"
            />
          </div>
        </div>

        {/* Hero Text & CTA Content */}
        <div className="px-5 pt-3 pb-8 space-y-4 max-w-md mx-auto relative z-10">
          
          {/* Eyebrow Pill */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF3FF] border border-[#CCE0FF] text-[#0066FF] text-xs font-bold tracking-wide shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>THE KNOWLEDGE FORUM KERALA</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-[34px] font-extrabold text-slate-900 tracking-tight leading-[1.14]">
            <span className="block">Ideas. Opportunities.</span>
            <span className="relative inline-block text-[#0066FF] mt-1">
              A Brighter You.
              {/* Curved Underline Swoosh */}
              <svg 
                className="absolute -bottom-2 left-0 w-full h-3 text-[#0066FF] overflow-visible" 
                viewBox="0 0 200 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M3 8.5C55 2.5 145 2.5 197 7.5" 
                  stroke="currentColor" 
                  strokeWidth="3.2" 
                  strokeLinecap="round" 
                />
              </svg>
              {/* Blue accent sparkle lines */}
              <span className="absolute -right-6 top-1 flex flex-col gap-1 pointer-events-none">
                <span className="w-3.5 h-[2.5px] bg-[#0066FF] rounded-full rotate-[20deg]" />
                <span className="w-4 h-[2.5px] bg-[#0066FF] rounded-full rotate-[10deg] ml-1" />
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14.5px] text-slate-600 font-normal leading-relaxed pt-1">
            A vibrant community empowering curious minds through national competitions, learning programmes, and interactive challenges.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href="#events"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white py-4 px-6 rounded-2xl font-bold text-[15px] shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#F1F5F9] hover:bg-slate-200 text-slate-800 py-3.5 px-6 rounded-2xl font-semibold text-[14.5px] transition-colors"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>Participant Portal / Login</span>
            </Link>
          </div>

        </div>

        {/* Bottom Decorative Accents & Scroll Indicator */}
        <div className="relative pt-2 pb-5 flex flex-col items-center justify-center">
          
          {/* Bottom Left Burst Strokes */}
          <div className="absolute bottom-4 left-4 pointer-events-none opacity-85">
            <div className="relative w-8 h-8">
              <span className="absolute top-1 left-2 w-3.5 h-[3px] bg-[#0066FF] rounded-full -rotate-[45deg]" />
              <span className="absolute top-3 left-4 w-3.5 h-[3px] bg-[#0066FF] rounded-full -rotate-[15deg]" />
              <span className="absolute top-5 left-5 w-3.5 h-[3px] bg-[#0066FF] rounded-full rotate-[15deg]" />
            </div>
          </div>

          {/* Bottom Right Dashed Curved Vector */}
          <div className="absolute bottom-3 right-0 w-28 h-12 pointer-events-none opacity-80 overflow-hidden">
            <svg viewBox="0 0 120 50" fill="none" className="w-full h-full text-[#0066FF]">
              <path d="M0 45 C40 40, 80 15, 120 5" stroke="currentColor" strokeWidth="2.2" strokeDasharray="4 4" />
            </svg>
          </div>

          {/* Bottom Wave Glow */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />

          {/* Scroll Prompt */}
          <a 
            href="#events" 
            className="inline-flex flex-col items-center gap-1 text-xs font-semibold text-slate-400 hover:text-blue-600 transition-colors relative z-10"
          >
            <span>Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-slate-400" />
          </a>
        </div>

      </section>

      {/* ── 2. EVENTS SECTION (BELOW THE FOLD) ── */}
      <section className="px-4 py-8" id="events">
        <div id="events-section" />
        
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <span className="text-[10px] font-bold text-[#0066FF] uppercase tracking-wider block">
              Programmes
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
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

        <div className="space-y-4">
          
          {/* Active Featured Event: Digital Poster Contest 2026 */}
          <div className="bg-white rounded-3xl border-2 border-blue-500/20 shadow-xs overflow-hidden">
            <div className="relative h-44 w-full bg-slate-100">
              <Image
                src="/images/card_earth.jpg"
                alt="Digital Poster Creation Contest 2026"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                  Registration Open
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
                <span>15 NOV 2026</span>
              </div>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                  Digital Poster Creation Contest
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Design impactful digital posters on inspiring themes. Open to all students & youth across India.
                </p>
              </div>

              {/* Prize & Fee Highlights */}
              <div className="bg-blue-50/70 rounded-2xl p-3 flex items-center justify-between text-xs border border-blue-100/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Registration Fee</span>
                  <span className="font-extrabold text-slate-900 text-sm">₹99 only</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-blue-600 font-semibold block">1st Prize Reward</span>
                  <span className="font-black text-[#0066FF] text-base">₹9,999</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white py-3.5 rounded-xl font-bold text-sm shadow-sm active:scale-[0.99] transition-all"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
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
