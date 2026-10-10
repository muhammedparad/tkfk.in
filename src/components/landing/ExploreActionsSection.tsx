import React from 'react';
import Link from 'next/link';
import { Trophy, BookOpen, Award, Users, ArrowRight } from 'lucide-react';

interface ExploreCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
}

const CARDS: ExploreCard[] = [
  {
    title: 'Take a Quiz',
    description: 'Test your understanding across diverse topics and climb the national leaderboard.',
    icon: Trophy,
    href: '/register',
    bgColor: 'bg-[#F0F7FF]',
    borderColor: 'border-[#D9EAFF]',
    iconColor: 'text-[#0066FF]',
    iconBg: 'bg-blue-100/70',
  },
  {
    title: 'Join a Programme',
    description: 'Participate in collaborative cohorts, masterclasses, and curated learning tracks.',
    icon: BookOpen,
    href: '/study',
    bgColor: 'bg-[#FFFBEB]',
    borderColor: 'border-[#FEE685]',
    iconColor: 'text-[#D97706]',
    iconBg: 'bg-amber-100/70',
  },
  {
    title: 'Participant Portal',
    description: 'Access your registration record, official community desk, and participant ID card.',
    icon: Award,
    href: '/login',
    bgColor: 'bg-[#F0FDF4]',
    borderColor: 'border-[#BBF7D0]',
    iconColor: 'text-[#16A34A]',
    iconBg: 'bg-emerald-100/70',
  },
  {
    title: 'Be Part of TKFK',
    description: 'Volunteer, contribute questions, mentor newcomers, or help lead community chapters.',
    icon: Users,
    href: '/contact',
    bgColor: 'bg-[#FAF5FF]',
    borderColor: 'border-[#E9D5FF]',
    iconColor: 'text-[#9333EA]',
    iconBg: 'bg-purple-100/70',
  },
];

export const ExploreActionsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-bold text-[#0066FF] tracking-wider uppercase block mb-2">
            EXPLORE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Would You Like to Do?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-normal">
            Navigate directly to the most popular areas of the TKFK ecosystem.
          </p>
        </div>

        {/* 4 Pastel Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                className={`${card.bgColor} ${card.borderColor} border rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 min-h-[260px]`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                <div className="pt-6 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-[#0066FF] group-hover:text-white group-hover:border-[#0066FF] transition-all">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
