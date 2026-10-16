import React from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, Users, Award, ArrowUpRight } from 'lucide-react';

interface Pillar {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  badge: string;
}

const PILLARS: Pillar[] = [
  {
    number: '01',
    icon: Trophy,
    title: 'Quizzes & Competitions',
    description: 'Impactful intellectual contests designed to challenge, inspire, and elevate curious minds across India.',
    href: '/register',
    badge: 'Contests',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Creative Programmes',
    description: 'Digital poster design challenges, talent arenas, and structured cohorts to expand your creative portfolio.',
    href: '/#events-section',
    badge: 'Creative',
  },
  {
    number: '03',
    icon: Award,
    title: 'Participant Portal & Pass',
    description: 'Instant official digital ID pass, verified certificates, scorecards, and live event desk credentials.',
    href: '/login',
    badge: 'Credentials',
  },
  {
    number: '04',
    icon: Users,
    title: 'Learning Community',
    description: 'Connect with thousands of proactive students, passionate educators, and dedicated mentors nationwide.',
    href: '/contact',
    badge: 'Community',
  },
];

export const CorePillarsBar: React.FC = () => {
  return (
    <section className="bg-[#f8f5f0] py-14 sm:py-20 border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12">
          <div>
            <span className="text-xs font-semibold text-[#ff6b35] tracking-widest uppercase block mb-2">
              FOUNDATION & ECOSYSTEM
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#141412] tracking-tight">
              Built for curious learners across India
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#706e6a] max-w-md mt-2 md:mt-0 font-normal">
            Everything you need to compete, create, and earn verified national credentials in one cohesive space.
          </p>
        </div>

        {/* 4 Cards Grid (Kairu Module Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.number}
                href={pillar.href}
                className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-[#f0ede8] shadow-2xs hover:shadow-kairu hover:border-[#e2ded8] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Number and Arrow */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-sm font-semibold text-[#9c9a97] group-hover:text-[#ff6b35] transition-colors">
                      {pillar.number}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-[#f0ede8] bg-[#fafafb] group-hover:bg-[#ff6b35] group-hover:border-[#ff6b35] group-hover:text-white text-[#706e6a] flex items-center justify-center transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-[#141412] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[#ff6b35]" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-[#141412] mb-2 group-hover:text-[#ff6b35] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-6">
                  <span className="inline-block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">
                    {pillar.badge}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
