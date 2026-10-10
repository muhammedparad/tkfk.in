import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Play, Trophy, BookOpen, Users } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white py-12 md:py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Call to Action */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-[#0066FF] text-xs sm:text-sm font-bold tracking-wide">
              <span>A KNOWLEDGE AND LEARNING PLATFORM</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              <span className="block">Ideas.</span>
              <span className="block">Opportunities.</span>
              <span className="block text-[#0066FF]">A Brighter You.</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
              TKFK is a vibrant community empowering curious minds through competitions, curated learning programmes, and interactive challenges. Discover your potential and shape tomorrow.
            </p>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 pt-1">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white px-6 sm:px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#about-section"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 sm:px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-colors"
              >
                <span>Learn More</span>
                <Play className="w-3.5 h-3.5 fill-slate-600 text-slate-600" />
              </a>
            </div>

            {/* 3 Pillar Features with Icons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Participate in Events</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Build Your Knowledge</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066FF] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span>Be Part of a Community</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Illustration Matching Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center relative">
            <div className="relative w-full max-w-[480px] lg:max-w-[520px]">
              <Image
                src="/images/hero_illustration.png"
                alt="TKFK Knowledge Community Illustration"
                width={620}
                height={520}
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                className="w-full h-auto object-contain drop-shadow-sm select-none"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
