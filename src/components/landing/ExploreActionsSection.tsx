import React from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, Award, Users, ArrowUpRight } from 'lucide-react';

interface ExploreCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  tag: string;
}

const CARDS: ExploreCard[] = [
  {
    title: 'Compete in Events',
    description: 'Test your understanding, create bold visual works, and climb national leaderboards.',
    icon: Trophy,
    href: '/register',
    tag: 'Contests',
  },
  {
    title: 'Creative Programmes',
    description: 'Participate in talent competitions, design challenges, and creative showcase awards.',
    icon: BookOpen,
    href: '/#events-section',
    tag: 'Challenges',
  },
  {
    title: 'Participant Portal',
    description: 'Access your registration record, download your official digital ID pass, and verify scores.',
    icon: Award,
    href: '/login',
    tag: 'Pass Desk',
  },
  {
    title: 'Join Community',
    description: 'Volunteer with chapters, contribute questions, mentor newcomers, or join the discussion.',
    icon: Users,
    href: '/contact',
    tag: 'Network',
  },
];

export const ExploreActionsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#f8f5f0] border-b border-[#f0ede8]">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <span className="text-xs font-semibold text-[#ff6b35] tracking-widest uppercase block mb-2">
            EXPLORE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#141412] tracking-tight">
            What would you like to do?
          </h2>
          <p className="text-sm sm:text-base text-[#706e6a] mt-2 font-normal">
            Navigate directly to the most popular destinations across the TKFK ecosystem.
          </p>
        </div>

        {/* 4 Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className="bg-white border border-[#f0ede8] rounded-[28px] p-6 sm:p-7 flex flex-col justify-between hover:shadow-kairu hover:border-[#e2ded8] transition-all duration-300 group hover:-translate-y-1 min-h-[250px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-[#141412] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#ff6b35]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-[#141412] mb-2 group-hover:text-[#ff6b35] transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 flex justify-end">
                  <div className="w-9 h-9 rounded-full bg-[#f8f5f0] border border-[#f0ede8] flex items-center justify-center text-[#706e6a] group-hover:bg-[#ff6b35] group-hover:text-white group-hover:border-[#ff6b35] transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
