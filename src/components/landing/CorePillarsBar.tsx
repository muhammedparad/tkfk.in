import React from 'react';
import Link from 'next/link';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

interface Pillar {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

const PILLARS: Pillar[] = [
  {
    icon: GraduationCap,
    title: 'Quizzes & Competitions',
    description: 'Engaging contests designed to test, inspire, and elevate your intellect.',
    href: '/register',
  },
  {
    icon: BookOpen,
    title: 'Learning Programmes',
    description: 'Curated resources and workshops to expand your skills and horizons.',
    href: '/study',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with like-minded students, educators, and mentors nationwide.',
    href: '/contact',
  },
  {
    icon: Award,
    title: 'Participant Pass',
    description: 'Instant official digital ID pass, event desk access, and verification.',
    href: '/login',
  },
];

export const CorePillarsBar: React.FC = () => {
  return (
    <section className="bg-slate-50/60 py-10 sm:py-14 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={idx}
                href={pillar.href}
                className="group bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center mb-4 group-hover:scale-105 group-hover:bg-[#0066FF] group-hover:text-white transition-all duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 group-hover:text-[#0066FF] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
