'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Instagram, Youtube, Twitter } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

interface PlatformData {
  id: string;
  name: string;
  handle: string;
  followers: string;
  icon: React.ReactNode;
  stats: {
    stat1Label: string;
    stat1Value: string;
    stat2Label: string;
    stat2Value: string;
    stat3Label: string;
    stat3Value: string;
  };
}

const PLATFORMS: PlatformData[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Community',
    handle: 'TKFK Official Desk',
    followers: '12.8k Active Members',
    icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
    stats: {
      stat1Label: 'District Chapters',
      stat1Value: '14 Active',
      stat2Label: 'Verified Participants',
      stat2Value: '12,800+',
      stat3Label: 'Daily Queries Resolved',
      stat3Value: '< 2 Hours',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@tkfk.kerala',
    followers: '18.5k Followers',
    icon: <Instagram className="w-5 h-5 text-[#E4405F]" />,
    stats: {
      stat1Label: 'Creative Spotlights',
      stat1Value: '140+ Works',
      stat2Label: 'Monthly Impressions',
      stat2Value: '280k+',
      stat3Label: 'Student Reach',
      stat3Value: '18.5k+',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    handle: 'TKFK Knowledge Desk',
    followers: '14.2k Subscribers',
    icon: <Youtube className="w-5 h-5 text-[#FF0000]" />,
    stats: {
      stat1Label: 'Video Briefs & Tutorials',
      stat1Value: '48 Sessions',
      stat2Label: 'Total Watch Time',
      stat2Value: '32,000 hrs',
      stat3Label: 'Contest Winners Featured',
      stat3Value: '85 Winners',
    },
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    handle: '@tkfk_kerala',
    followers: '6.4k Followers',
    icon: <Twitter className="w-5 h-5 text-[#141412]" />,
    stats: {
      stat1Label: 'Thought Leadership',
      stat1Value: '120+ Threads',
      stat2Label: 'Academic Reach',
      stat2Value: '65k+ Views',
      stat3Label: 'Partner Educators',
      stat3Value: '45 Mentors',
    },
  },
];

export const CommunityLeadershipSection: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<PlatformData>(PLATFORMS[0]);
  const [animating, setAnimating] = useState(false);

  const handleSelect = (platform: PlatformData) => {
    if (platform.id === activePlatform.id) return;
    setAnimating(true);
    setTimeout(() => {
      setActivePlatform(platform);
      setAnimating(false);
    }, 150);
  };

  return (
    <section className="py-20 md:py-28 bg-[#f8f5f0] border-b border-[#f0ede8]" id="community">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <ScrollReveal delayMs={0} direction="up">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-widest uppercase block">
                COMMUNITY DESK & MENTORS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141412] tracking-tight leading-[1.12]">
                The Knowledge Forum Kerala
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed font-normal">
                Empowering grassroots curiosity through transparent evaluations, verified passes, and dedicated student support desks.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Profile Row: Image on Left, Bio + 4 Platform Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5">
            <ScrollReveal delayMs={100} direction="right">
              <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-[#f0ede8] bg-[#f0ede8] shadow-2xs group">
                <Image
                  src="/images/card_earth.jpg"
                  alt="TKFK Community Leadership"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141412]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[11px] font-mono text-[#ff6b35] uppercase tracking-wider block">
                    COMMUNITY LEADERSHIP
                  </span>
                  <h4 className="text-xl font-bold">
                    The Knowledge Forum Team
                  </h4>
                  <p className="text-xs text-white/80">
                    Coordinating statewide student cohorts & jury panels
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Bio & 4 Interactive Platform Cards */}
          <div className="lg:col-span-7 space-y-6">
            <ScrollReveal delayMs={150} direction="left">
              <p className="text-base sm:text-lg text-[#141412] font-medium leading-relaxed">
                Founded on the belief that curiosity is the catalyst for personal growth, TKFK has grown into an inspiring community for thousands of learners. Every competition is built on fairness, clear rubrics, and instant credentials.
              </p>

              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed mt-2">
                Select any community channel below to view live cohort metrics and connect directly with our support desk.
              </p>

              {/* 4 Interactive Social Cards with Orange Outline on Selected State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                {PLATFORMS.map((platform) => {
                  const isSelected = activePlatform.id === platform.id;
                  return (
                    <div
                      key={platform.id}
                      onClick={() => handleSelect(platform)}
                      onMouseEnter={() => handleSelect(platform)}
                      className={`rounded-2xl p-4 flex items-center gap-3.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isSelected
                          ? 'border border-[#ff6b35] ring-2 ring-[#ff6b35]/20 bg-[#f0ede8] scale-[1.02] shadow-sm'
                          : 'border border-[#f0ede8] bg-[#f0ede8]/60 hover:bg-[#f0ede8]/90 hover:border-[#e2ded8]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#f0ede8] flex items-center justify-center shrink-0 shadow-2xs">
                        {platform.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#141412] block truncate">
                          {platform.name}
                        </span>
                        <span className="text-[11px] text-[#706e6a] block truncate">
                          {platform.followers}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>

        </div>

        {/* Dynamic Statistics Beneath Profile (Animated on Selection) */}
        <ScrollReveal delayMs={200} direction="up">
          <div className="mt-16 pt-12 border-t border-[#f0ede8] grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className={`transition-all duration-300 ease-out ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#141412] tracking-tight">
                {activePlatform.stats.stat1Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-medium">
                {activePlatform.stats.stat1Label}
              </p>
            </div>

            <div className={`transition-all duration-300 ease-out delay-75 ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#ff6b35] tracking-tight">
                {activePlatform.stats.stat2Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-medium">
                {activePlatform.stats.stat2Label}
              </p>
            </div>

            <div className={`transition-all duration-300 ease-out delay-150 ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#141412] tracking-tight">
                {activePlatform.stats.stat3Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-medium">
                {activePlatform.stats.stat3Label}
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
