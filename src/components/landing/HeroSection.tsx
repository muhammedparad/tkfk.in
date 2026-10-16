import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Trophy, Sparkles, BookOpen, Users, Award, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#f8f5f0] pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#f0ede8]">
      
      {/* Subtle Kairu Grid Background Mask */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(#141412 0.75px, transparent 0.75px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)',
        }}
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Centered Editorial Hero Block */}
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#f0ede8] text-[#141412] text-xs font-medium tracking-wide shadow-2xs backdrop-blur-xs transition-transform hover:scale-[1.02]">
            <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></span>
            <span className="font-semibold text-[#ff6b35]">Registration Live</span>
            <span className="text-[#9c9a97]">•</span>
            <span className="text-[#706e6a]">Digital Poster Creation Contest 2026</span>
          </div>

          {/* Main Headline (Kairu Typography) */}
          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold text-[#141412] tracking-tight leading-[1.08]">
            Turn curiosity into <span className="text-[#ff6b35] italic font-serif">achievements</span> that inspire.
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg lg:text-xl text-[#706e6a] font-normal leading-relaxed max-w-2xl mx-auto">
            The Knowledge Forum Kerala is a vibrant community empowering learners through national competitions, learning programmes, and interactive challenges.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 bg-[#ff6b35] hover:bg-[#e85926] text-white px-7 py-3.5 rounded-full font-medium text-sm sm:text-base shadow-sm hover:shadow-lg hover:shadow-[#ff6b35]/25 transition-all duration-300 active:scale-95"
            >
              <span>Register for Poster Contest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#events-section"
              className="inline-flex items-center justify-center gap-2 bg-white/80 hover:bg-white text-[#141412] border border-[#f0ede8] px-6 py-3.5 rounded-full font-medium text-sm sm:text-base shadow-2xs hover:shadow-xs transition-all duration-200"
            >
              <span>Explore Programmes</span>
            </a>
          </div>

          {/* 3 Pillar Features with Minimalist Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-[#706e6a]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
              <span>National Level Contests</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
              <span>Verified Participant Pass</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
              <span>Supportive Learning Cohort</span>
            </div>
          </div>

        </div>

        {/* ── KAIRU FLOATING SHOWCASE BANNER / CARDS ── */}
        <div className="mt-12 sm:mt-16 pt-2">
          <div className="relative rounded-[28px] border border-[#f0ede8] bg-white/70 p-3 sm:p-4 shadow-kairu backdrop-blur-xs transition-all duration-500 hover:shadow-kairu-hover">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[#fafafb] rounded-[22px] border border-[#f0ede8] p-6 sm:p-8">
              
              {/* Left Column: Live Contest Spotlight */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f8f5f0] border border-[#f0ede8] text-xs text-[#141412] font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>Featured Flagship Opportunity</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#141412] tracking-tight leading-snug">
                  Digital Poster Creation Contest 2026
                </h2>

                <p className="text-sm text-[#706e6a] leading-relaxed max-w-lg">
                  Submit your original digital artwork on inspiring themes. Open to all school students, college learners, and creative youth across India.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-1 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#f0ede8] font-medium text-[#141412]">
                    🏆 ₹9,999 1st Prize Reward
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#f0ede8] font-medium text-[#141412]">
                    📜 Verified E-Certificate
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#f0ede8] font-medium text-[#141412]">
                    🎟️ ₹99 Registration
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff6b35] hover:text-[#e85926] group transition-colors"
                  >
                    <span>Proceed to registration form</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Artwork / Card Graphic */}
              <div className="md:col-span-5 flex justify-center items-center">
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#f0ede8] shadow-sm">
                  <Image
                    src="/images/card_earth.jpg"
                    alt="Digital Poster Creation Contest 2026"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141412]/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                    <span className="bg-[#141412]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      15 NOV 2026
                    </span>
                    <span className="bg-[#ff6b35] px-2.5 py-1 rounded-lg font-bold">
                      Open Now
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
