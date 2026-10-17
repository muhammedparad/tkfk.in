'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Globe, Users, Award, Bell, Check, CheckCircle2 } from 'lucide-react';

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
    image: '/images/card_earth.jpg',
    badge: { text: 'Registration Open', type: 'open' },
    date: '15 NOV 2026',
    title: 'Digital Poster Creation Contest 2026',
    description: 'Express your perspective on social and environmental themes. Submit original digital artwork to earn verified credentials and merit awards.',
    tags: {
      format: 'Online Submission',
      eligibility: 'Classes 6–12 & College Youth',
      reward: 'Verifiable Certificate & ₹9,999 Awards',
    },
    cta: {
      label: 'Register Now (₹99)',
      href: '/register',
      isPrimary: true,
    },
  },
  {
    id: 'gandhi-2026',
    image: '/images/card_gandhi.jpg',
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
    image: '/images/card_sprout.jpg',
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
  const [notified, setNotified] = useState<{ [key: string]: boolean }>({});

  const handleNotify = (id: string) => {
    setNotified(prev => ({ ...prev, [id]: true }));
  };

  return (
    <section className="py-16 md:py-24 bg-[#f8f5f0] border-b border-[#f0ede8]" id="events-section">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold text-[#ff6b35] tracking-widest uppercase mb-2 block">
              EXPLORE EVENTS & OPPORTUNITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141412] tracking-tight">
              Central Discovery for Programmes & Challenges
            </h2>
            <p className="text-sm sm:text-base text-[#706e6a] mt-2 max-w-xl font-normal">
              Participate in active competitions, review past milestones, and discover upcoming creative workshops across the TKFK community.
            </p>
          </div>

          <Link
            href="/register"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#ff6b35] hover:text-[#e85926] transition-colors group"
          >
            <span>Register for active contest</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Event Cards Grid (Kairu Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-[28px] overflow-hidden border border-[#f0ede8] shadow-2xs hover:shadow-kairu hover:border-[#e2ded8] transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Event Image Banner with Overlay Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-[#fafafb]">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${
                      event.badge.type === 'open'
                        ? 'bg-[#ff6b35] text-white'
                        : event.badge.type === 'finished'
                        ? 'bg-[#141412]/80 text-[#fafafb] backdrop-blur-xs'
                        : 'bg-[#141412] text-white'
                    }`}
                  >
                    {event.badge.text}
                  </span>
                </div>

                {/* Date Tag */}
                <div className="absolute bottom-3 right-4 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-semibold text-[#141412] shadow-2xs flex items-center gap-1.5 border border-[#f0ede8]">
                  <Calendar className="w-3.5 h-3.5 text-[#ff6b35]" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#141412] group-hover:text-[#ff6b35] transition-colors mb-2 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed font-normal mb-5">
                    {event.description}
                  </p>

                  {/* Metadata Pills */}
                  <div className="space-y-2 border-t border-[#f0ede8] pt-4 mb-6 text-xs text-[#706e6a] font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#9c9a97]" />
                      <span>{event.tags.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#9c9a97]" />
                      <span>{event.tags.eligibility}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#9c9a97]" />
                      <span>{event.tags.reward}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Action Button */}
                <div>
                  {event.cta.isPrimary ? (
                    <Link
                      href={event.cta.href || '/register'}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white py-3 rounded-full font-medium text-xs tracking-wide shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 transition-all duration-300 active:scale-95"
                    >
                      <span>{event.cta.label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : event.cta.isFinished ? (
                    <div className="w-full inline-flex items-center justify-center gap-2 bg-[#f8f5f0] text-[#9c9a97] py-3 rounded-full font-medium text-xs border border-[#f0ede8] cursor-default select-none">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#9c9a97]" />
                      <span>Event History (Concluded)</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNotify(event.id)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-medium text-xs transition-all duration-300 border ${
                        notified[event.id]
                          ? 'bg-[#141412] text-white border-[#141412]'
                          : 'bg-white hover:bg-[#fafafb] text-[#141412] border-[#f0ede8] hover:border-[#141412]'
                      }`}
                    >
                      {notified[event.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#ff6b35]" />
                          <span>Notification Set!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-[#9c9a97]" />
                          <span>{event.cta.label}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
