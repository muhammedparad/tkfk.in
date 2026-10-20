'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, X } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';

export const MediaPreviewSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-14 sm:py-20 bg-[#f8f5f0] border-b border-[#f0ede8] relative" id="preview">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Top visual connector line seamlessly continuing from Hero */}
        <div className="mx-auto w-[1.5px] h-8 bg-gradient-to-b from-[#ff6b35]/80 to-[#f0ede8] mb-6 hidden md:block" />

        {/* Mock Browser Window Container with GsapReveal */}
        <GsapReveal delay={0.1} duration={1.2} yOffset={45} scale={0.97}>
          <div className="relative rounded-[32px] border border-[#f0ede8] bg-[#fafafb] p-3 sm:p-4 shadow-kairu transition-all duration-500 hover:shadow-kairu-hover">
            
            {/* Window Chrome Header Bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 mb-3 border-b border-[#f0ede8]">
              {/* 3 Window Dots */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>

              {/* Centered / Right Window Label */}
              <div className="text-[11px] font-mono text-[#706e6a] tracking-wider uppercase font-medium">
                TKFK / Digital Poster Creation Contest 2026
              </div>

              {/* Live Status Pill with Pulsing Dot */}
              <div className="flex items-center gap-1.5 bg-[#ff6b35]/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-ping" />
                <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-wide">
                  Live
                </span>
              </div>
            </div>

            {/* Large Rounded Media Preview Thumbnail with Enhanced Image Treatment */}
            <div 
              onClick={() => setModalOpen(true)}
              className="group relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-[#141412] cursor-pointer shadow-inner"
            >
              <Image
                src="/images/card_earth.jpg"
                alt="Digital Poster Creation Contest Video Preview"
                fill
                sizes="(max-width: 1200px) 100vw, 1100px"
                className="object-cover opacity-85 group-hover:opacity-95 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              />

              {/* Cinematic Multi-stop Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141412]/85 via-[#141412]/30 to-transparent pointer-events-none" />

              {/* Central Glass Play Button with Ripple Animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:bg-[#ff6b35] transition-all duration-300">
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white translate-x-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Details Overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end justify-between pointer-events-none text-white">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#ff6b35] font-semibold block mb-1">
                    OFFICIAL OVERVIEW
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                    Design Impactful Posters. Win Verified Recognition.
                  </h3>
                </div>
                <span className="text-xs text-white/90 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full font-sans font-medium hidden sm:inline-block">
                  Official Guide
                </span>
              </div>
            </div>

          </div>
        </GsapReveal>

      </div>

      {/* Video / Info Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141412]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#fafafb] border border-[#f0ede8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#f0ede8] bg-white flex items-center justify-center text-[#141412] hover:bg-[#f0ede8]"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-[#ff6b35] tracking-widest uppercase block">
              CONTEST BRIEFING
            </span>
            <h3 className="text-2xl font-bold text-[#141412]">
              Digital Poster Creation Contest 2026
            </h3>
            <p className="text-sm text-[#706e6a] leading-relaxed">
              Open to all school students, college learners, and creative youth across India. Participants create an original digital poster on inspiring social, cultural, or scientific themes. Submissions are judged on originality, visual hierarchy, clarity of message, and creative execution.
            </p>
            <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] flex items-center justify-between text-xs">
              <span className="font-semibold text-[#141412]">Submission Deadline: 15 November 2026, 11:59 PM IST</span>
              <span className="font-bold text-[#ff6b35]">Registration Fee: ₹99</span>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-[#141412] text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-[#2a2a26]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
