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
    <div className="flex flex-col bg-[#f8f5f0] min-h-screen text-[#141412]">
      
      {/* ── 1. HERO SECTION (FIRST SCREEN ONLY) ── */}
      <section className="relative overflow-hidden bg-[#f8f5f0] border-b border-[#f0ede8] min-h-[calc(100vh-64px)] flex flex-col justify-between">
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `radial-gradient(#141412 0.75px, transparent 0.75px)`,
            backgroundSize: '20px 20px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 70%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, #000 70%, transparent 100%)',
          }}
        />

        {/* Top Graphic */}
        <div className="relative w-full overflow-hidden pt-4">
          <div className="relative w-full aspect-[474/360] max-h-[300px]">
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
        <div className="px-5 pt-2 pb-6 space-y-4 max-w-md mx-auto relative z-10">
          
          {/* Eyebrow Pill */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#f0ede8] text-[#141412] text-xs font-medium tracking-wide shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></span>
              <span className="font-semibold text-[#ff6b35]">Registration Live</span>
              <span className="text-[#9c9a97]">•</span>
              <span className="text-[#706e6a]">TKFK Kerala</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-[32px] font-bold text-[#141412] tracking-tight leading-[1.12]">
            <span className="block">Ideas. Opportunities.</span>
            <span className="text-[#ff6b35] italic font-serif block mt-0.5">
              A Brighter You.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] text-[#706e6a] font-normal leading-relaxed">
            A vibrant community empowering curious minds through national competitions, learning programmes, and interactive challenges.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/register"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white py-3.5 px-6 rounded-full font-medium text-[14.5px] shadow-sm hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-[0.98] transition-all"
            >
              <span>Register for Poster Contest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] py-3.5 px-6 rounded-full font-medium text-[14px] shadow-2xs transition-colors"
            >
              <User className="w-4 h-4 text-[#9c9a97]" />
              <span>Participant Portal / Login</span>
            </Link>
          </div>

        </div>

        {/* Bottom Scroll Prompt */}
        <div className="pt-1 pb-4 flex flex-col items-center justify-center">
          <a 
            href="#events" 
            className="inline-flex flex-col items-center gap-1 text-[11px] font-medium text-[#9c9a97] hover:text-[#141412] transition-colors"
          >
            <span>Scroll to explore</span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce text-[#ff6b35]" />
          </a>
        </div>

      </section>

      {/* ── 2. EVENTS SECTION (BELOW THE FOLD) ── */}
      <section className="px-4 py-10" id="events">
        <div id="events-section" />
        
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <span className="text-[10px] font-semibold text-[#ff6b35] uppercase tracking-widest block">
              PROGRAMMES
            </span>
            <h2 className="text-xl font-bold text-[#141412]">
              Events & Contests
            </h2>
          </div>
          <Link 
            href="/register" 
            className="text-xs font-semibold text-[#ff6b35] flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          
          {/* Active Featured Event: Digital Poster Contest 2026 */}
          <div className="bg-white rounded-[26px] border border-[#f0ede8] shadow-2xs overflow-hidden">
            <div className="relative h-44 w-full bg-[#fafafb]">
              <Image
                src="/images/contest_poster.jpeg"
                alt="Digital Poster Creation Contest 2026"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ff6b35] text-white shadow-xs">
                  Registration Open
                </span>
              </div>
              <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#141412] shadow-2xs flex items-center gap-1 border border-[#f0ede8]">
                <Calendar className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>15 NOV 2026</span>
              </div>
            </div>

            <div className="p-5 space-y-3.5">
              <div>
                <h3 className="text-lg font-bold text-[#141412] leading-snug">
                  Digital Poster Creation Contest
                </h3>
                <p className="text-xs sm:text-sm text-[#706e6a] mt-1 leading-relaxed">
                  Design impactful digital posters on inspiring themes. Open to all students & youth across India.
                </p>
              </div>

              {/* Prize & Fee Highlights */}
              <div className="bg-[#f8f5f0] rounded-2xl p-3 flex items-center justify-between text-xs border border-[#f0ede8]">
                <div>
                  <span className="text-[10px] text-[#9c9a97] block font-medium">Registration Fee</span>
                  <span className="font-bold text-[#141412] text-sm">₹99 only</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#ff6b35] font-semibold block">1st Prize Reward</span>
                  <span className="font-bold text-[#ff6b35] text-base">₹7,001</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/register"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white py-3.5 rounded-full font-medium text-xs tracking-wide shadow-xs active:scale-[0.98] transition-all"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Upcoming Event: Republic Day Quiz 2027 */}
          <div className="bg-white rounded-2xl p-4 border border-[#f0ede8] shadow-2xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#ff6b35] uppercase tracking-wider block">
                Upcoming Contest
              </span>
              <h4 className="text-sm font-bold text-[#141412]">
                Republic Day National Quiz 2027
              </h4>
              <p className="text-[11px] text-[#9c9a97]">
                Scheduled for 26 Jan 2027
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#706e6a] bg-[#f8f5f0] border border-[#f0ede8] px-3 py-1.5 rounded-full shrink-0 ml-3">
              Coming Soon
            </span>
          </div>

        </div>
      </section>

      {/* ── 3. ABOUT US SECTION ── */}
      <section className="px-4 pb-10" id="about">
        <div id="about-section" />
        
        <div className="bg-white rounded-[26px] p-5 border border-[#f0ede8] shadow-2xs space-y-4">
          
          <div>
            <span className="text-[10px] font-semibold text-[#ff6b35] uppercase tracking-widest block">
              ABOUT TKFK
            </span>
            <h2 className="text-lg font-bold text-[#141412] mt-0.5">
              A community for curious minds.
            </h2>
          </div>

          <p className="text-xs text-[#706e6a] leading-relaxed font-normal">
            <strong>The Knowledge Forum Kerala (TKFK)</strong> is dedicated to creating accessible, high-standard knowledge experiences and competitions for learners across India. We believe curiosity is the catalyst for personal growth and positive community impact.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-2.5 text-xs text-[#706e6a]">
              <CheckCircle2 className="w-4 h-4 text-[#ff6b35] shrink-0 mt-0.5" />
              <span>Accessible national-level competitions & prizes</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#706e6a]">
              <CheckCircle2 className="w-4 h-4 text-[#ff6b35] shrink-0 mt-0.5" />
              <span>Official verified participant credentials</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#706e6a]">
              <CheckCircle2 className="w-4 h-4 text-[#ff6b35] shrink-0 mt-0.5" />
              <span>Supportive community connecting learners nationwide</span>
            </div>
          </div>

          {/* Support / WhatsApp Help Button */}
          <div className="pt-2 border-t border-[#f0ede8] flex flex-col gap-2">
            <a
              href={EVENT_CONFIG.whatsAppGroupUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#141412] hover:bg-[#2a2a26] text-white py-3 px-4 rounded-full font-medium text-xs shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#ff6b35]" />
              <span>Join WhatsApp Community</span>
            </a>

            <Link
              href="/contact"
              className="w-full text-center text-xs font-medium text-[#9c9a97] hover:text-[#141412] py-1.5 transition-colors"
            >
              Need help? Contact Support Desk
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};
