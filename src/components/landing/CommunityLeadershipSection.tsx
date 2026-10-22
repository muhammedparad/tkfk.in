'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, Instagram, Youtube, Linkedin, ArrowUpRight } from 'lucide-react';
import { GsapReveal } from '@/components/ui/GsapReveal';
import { EVENT_CONFIG } from '@/lib/config';

interface PlatformData {
  id: string;
  name: string;
  handle: string;
  followers: string;
  icon: React.ReactNode;
  url: string;
  actionLabel: string;
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
    name: 'WhatsApp Desk',
    handle: 'TKFK Official Community',
    followers: 'Official Community Hub',
    icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
    url: EVENT_CONFIG.whatsAppGroupUrl,
    actionLabel: 'Join WhatsApp Community Group',
    stats: {
      stat1Label: 'Community Desk',
      stat1Value: 'Official Network',
      stat2Label: 'Response Standard',
      stat2Value: '< 24 Hours',
      stat3Label: 'Coverage',
      stat3Value: 'All Members',
    },
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@tkfk.in',
    followers: 'Official Updates & Spotlights',
    icon: <Instagram className="w-5 h-5 text-[#E4405F]" />,
    url: EVENT_CONFIG.instagramUrl,
    actionLabel: 'Follow on Instagram (@tkfk.in)',
    stats: {
      stat1Label: 'Creative Spotlights',
      stat1Value: 'Featured Posters',
      stat2Label: 'Contest Updates',
      stat2Value: 'Official News',
      stat3Label: 'Community',
      stat3Value: 'Student Creators',
    },
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    handle: '@tkfkcommunity',
    followers: 'Video Briefs & Guides',
    icon: <Youtube className="w-5 h-5 text-[#FF0000]" />,
    url: EVENT_CONFIG.youtubeUrl,
    actionLabel: 'Subscribe on YouTube',
    stats: {
      stat1Label: 'Contest Guides',
      stat1Value: 'Theme Briefings',
      stat2Label: 'Design Tutorials',
      stat2Value: 'Technical Tips',
      stat3Label: 'Archive',
      stat3Value: 'Past Challenges',
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'TKFK Official',
    followers: 'Professional Network & News',
    icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
    url: EVENT_CONFIG.linkedinUrl,
    actionLabel: 'Connect on LinkedIn',
    stats: {
      stat1Label: 'Announcements',
      stat1Value: 'Official Releases',
      stat2Label: 'Mentorship',
      stat2Value: 'Academic Partners',
      stat3Label: 'Initiatives',
      stat3Value: 'Annual Events',
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
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-16 sm:mb-20">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[11px] font-semibold text-[#ff6b35] tracking-[0.2em] uppercase block">
                COMMUNITY & COLLABORATION
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.12]">
                Connect, collaborate, and grow with TKFK
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-sm sm:text-base text-[#706e6a] leading-relaxed font-normal">
                Bringing together curious students, young creators, and dedicated mentors through open initiatives, transparent evaluations, and responsive support.
              </p>
            </div>
          </div>
        </GsapReveal>

        {/* Profile Row: Image on Left, Bio + 4 Platform Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Portrait */}
          <div className="lg:col-span-5">
            <GsapReveal delay={0.1} duration={1.2} yOffset={40} scale={0.97}>
              <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden border border-[#f0ede8] bg-[#f0ede8] shadow-2xs group">
                <Image
                  src="/images/community_orbit.png"
                  alt="TKFK Community Initiative"
                  fill
                  sizes="(max-width: 1024px) 100vw, 450px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141412]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="text-[11px] font-semibold text-[#ff6b35] uppercase tracking-[0.2em] block">
                    COMMUNITY INITIATIVE
                  </span>
                  <h4 className="text-xl font-medium tracking-[-0.03em]">
                    The Knowledge Forum Team
                  </h4>
                  <p className="text-xs text-white/80">
                    Coordinating nationwide student cohorts, learning circles & jury panels
                  </p>
                </div>
              </div>
            </GsapReveal>
          </div>

          {/* Right Column: Bio & 4 Interactive Platform Cards */}
          <div className="lg:col-span-7 space-y-6">
            <GsapReveal delay={0.15} duration={1.2} yOffset={40} scale={0.97}>
              <p className="text-base sm:text-lg text-[#141412] font-medium leading-relaxed">
                Founded on the belief that purposeful learning and creativity inspire lifelong growth, The Knowledge Forum Kerala (TKFK) is an open community bringing together learners, creators, and educators across India. We coordinate creative challenges, share learning frameworks, host mentor walk-throughs, and provide dedicated helpdesks so that every participant has an active pathway to develop and showcase their abilities.
              </p>

              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed mt-2">
                Select any official channel below to connect directly with our support desk or view announcements.
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
                      className={`rounded-2xl p-4 flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isSelected
                          ? 'border border-[#ff6b35] ring-2 ring-[#ff6b35]/20 bg-[#f0ede8] scale-[1.02] shadow-sm'
                          : 'border border-[#f0ede8] bg-[#f0ede8]/60 hover:bg-[#f0ede8]/90 hover:border-[#e2ded8]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#f0ede8] flex items-center justify-center shrink-0 shadow-2xs">
                          {platform.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-[#141412] block truncate">
                            {platform.name}
                          </span>
                          <span className="text-[11px] text-[#706e6a] block truncate">
                            {platform.handle}
                          </span>
                        </div>
                      </div>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#ff6b35] hover:border-[#ff6b35]/40 transition-colors shrink-0 shadow-2xs group/btn"
                        title={`Open ${platform.name}`}
                        aria-label={`Open ${platform.name}`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Active Channel Action Button */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href={activePlatform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141412] hover:bg-[#ff6b35] text-white text-xs font-medium tracking-tight shadow-xs hover:shadow-md transition-all active:scale-95"
                >
                  <span>{activePlatform.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
                <span className="text-xs text-[#9c9a97]">
                  Official verified channel
                </span>
              </div>
            </GsapReveal>
          </div>

        </div>

        {/* Dynamic Statistics Beneath Profile (Animated on Selection) */}
        <GsapReveal delay={0.2} duration={1.1} yOffset={35}>
          <div className="mt-16 pt-12 border-t border-[#f0ede8] grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div className={`transition-all duration-300 ease-out ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-medium text-[#141412] tracking-[-0.04em]">
                {activePlatform.stats.stat1Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-normal">
                {activePlatform.stats.stat1Label}
              </p>
            </div>

            <div className={`transition-all duration-300 ease-out delay-75 ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-medium text-[#ff6b35] tracking-[-0.04em]">
                {activePlatform.stats.stat2Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-normal">
                {activePlatform.stats.stat2Label}
              </p>
            </div>

            <div className={`transition-all duration-300 ease-out delay-150 ${animating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <div className="text-3xl sm:text-4xl font-medium text-[#141412] tracking-[-0.04em]">
                {activePlatform.stats.stat3Value}
              </div>
              <p className="text-xs sm:text-sm text-[#706e6a] mt-1 font-normal">
                {activePlatform.stats.stat3Label}
              </p>
            </div>
          </div>
        </GsapReveal>

      </div>
    </section>
  );
};
