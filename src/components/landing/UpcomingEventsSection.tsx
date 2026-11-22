'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Globe, Users, Award, Bell, Check, CheckCircle2 } from 'lucide-react';
import { useParticipantSession } from '@/hooks/useParticipantSession';
import { GsapReveal } from '@/components/ui/GsapReveal';

interface EventItem {
  id: string;
  image: string;
  badge: {
    text: string;
    type: 'open' | 'soon' | 'finished';
  };
  date: string;
  title: string;
  description: string;
  tags: {
    format: string;
    eligibility: string;
    reward: string;
  };
  cta: {
    label: string;
    href?: string;
    isPrimary?: boolean;
    isFinished?: boolean;
  };
}

const EVENTS: EventItem[] = [
  {
    id: 'poster-2026',
    image: '/images/contest_poster.jpeg',
    badge: { text: 'Registration Open', type: 'open' },
    date: '30 NOV 2026',
    title: 'Digital Poster Creation Contest 2026',
    description: 'Express your perspective on social and environmental themes. Submit original digital artwork to earn verified credentials and merit awards.',
    tags: {
      format: 'Online Submission',
      eligibility: 'All-India Open Participation',
      reward: 'Verifiable Certificate & ₹7,001 Awards',
    },
    cta: {
      label: 'Register Now',
      href: '/register',
      isPrimary: true,
    },
  },
  {
    id: 'gandhi-2026',
    image: '/images/gandhi_quiz.jpeg',
    badge: { text: 'Event History', type: 'finished' },
    date: '02 OCT 2026',
    title: 'Gandhi Jayanti National Quiz',
    description: 'A celebrated national knowledge milestone exploring the life, philosophy, and enduring ideals of Mahatma Gandhi.',
    tags: {
      format: 'Conducted Online',
      eligibility: 'All-India Participation',
      reward: 'Concluded Flagship',
    },
    cta: {
      label: 'Event History (Concluded)',
      isFinished: true,
    },
  },
  {
    id: 'creative-workshops',
    image: '/Posters/Creative_Learning.jpeg',
    badge: { text: 'Coming Soon', type: 'soon' },
    date: 'NOV 2026',
    title: 'Creative Learning & Design Circles',
    description: 'Interactive virtual sessions covering visual storytelling, design principles, and creative mentor walk-throughs for students.',
    tags: {
      format: 'Virtual Workshop Series',
      eligibility: 'Open to All Curious Minds',
      reward: 'Digital Toolkit & Learning Pass',
    },
    cta: {
      label: 'Notify Me',
      isPrimary: false,
    },
  },
];

export const UpcomingEventsSection: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useParticipantSession();
  const [notified, setNotified] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNotify = (id: string) => {
    setNotified(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 md:py-24 bg-[#0f0f17] border-b border-white/5" id="events-section">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <GsapReveal delay={0} duration={1.1} yOffset={30}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-[#a78bfa] text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 block w-fit">
                EXPLORE EVENTS &amp; OPPORTUNITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Central Discovery for Programmes &amp; Challenges
              </h2>
              <p className="text-sm sm:text-base text-[#94a3b8] mt-2 max-w-xl font-normal">
                Participate in active competitions, review past milestones, and discover upcoming creative workshops across the TKFK community.
              </p>
            </div>

            <Link
              href={mounted && isLoggedIn ? "/dashboard" : "/register"}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#a78bfa] hover:text-[#8b5cf6] transition-colors group"
            >
              <span>{mounted && isLoggedIn ? "Go to participant portal" : "Register for active contest"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </GsapReveal>

        {/* 3 Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {EVENTS.map((event, idx) => (
            <GsapReveal key={event.id} delay={idx * 0.12} duration={1.0} yOffset={45} scale={0.97}>
              <div
                className="bg-white/[0.03] backdrop-blur-xl rounded-[28px] overflow-hidden border border-white/[0.08] hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all duration-300 flex flex-col group hover:-translate-y-1 h-full"
              >
              {/* Event Image Banner with Overlay Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-[#13131f]">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Dark gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      event.badge.type === 'open'
                        ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                        : event.badge.type === 'finished'
                        ? 'bg-white/10 border border-white/15 text-[#64748b]'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {event.badge.text}
                  </span>
                </div>

                {/* Date Tag */}
                <div className="absolute bottom-3 right-4 z-10 bg-white/[0.08] backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-semibold text-white shadow-2xs flex items-center gap-1.5 border border-white/15">
                  <Calendar className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#a78bfa] transition-colors mb-2 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed font-normal mb-5">
                    {event.description}
                  </p>

                  {/* Metadata Pills */}
                  <div className="space-y-2 border-t border-white/[0.08] pt-4 mb-6 text-xs text-[#94a3b8] font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#64748b]" />
                      <span>{event.tags.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#64748b]" />
                      <span>{event.tags.eligibility}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#64748b]" />
                      <span>{event.tags.reward}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Button */}
                <div>
                  {event.cta.isPrimary ? (
                    <Link
                      href={mounted && isLoggedIn ? "/dashboard" : (event.cta.href || '/register')}
                      className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-full font-medium text-xs tracking-wide shadow-xs hover:shadow-md hover:shadow-violet-500/25 transition-all duration-300 active:scale-95"
                    >
                      <span>{mounted && isLoggedIn ? "Go to Portal" : event.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : event.cta.isFinished ? (
                    <div className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.05] text-[#64748b] py-3 rounded-full font-medium text-xs border border-white/[0.08] cursor-default select-none">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>Event History (Concluded)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNotify(event.id)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-medium text-xs transition-all duration-300 border ${
                        notified[event.id]
                          ? 'bg-violet-600/20 text-[#a78bfa] border-violet-500/30'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] text-[#94a3b8] border-white/[0.08] hover:border-violet-500/30'
                      }`}
                    >
                      {notified[event.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#a78bfa]" />
                          <span>Notification Set!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-[#64748b]" />
                          <span>{event.cta.label}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>
            </GsapReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
