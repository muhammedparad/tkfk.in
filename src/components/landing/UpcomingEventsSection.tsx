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
    title: 'Digital Poster Creation Contest',
    description: 'Unleash your visual creativity! Design impactful digital posters on inspiring themes and win state-level recognition.',
    tags: {
      format: 'Online Submission',
      eligibility: 'Open to All Students & Youth',
      reward: 'E-Certificate & Cash Prizes',
    },
    cta: {
      label: 'Register Now',
      href: '/register',
      isPrimary: true,
    },
  },
  {
    id: 'gandhi-2026',
    image: '/images/card_gandhi.jpg',
    badge: { text: 'Event Finished', type: 'finished' },
    date: '02 OCT 2026',
    title: 'Gandhi Jayanti Quiz 2026',
    description: 'Annual flagship national quiz competition celebrating the life, values, and timeless vision of Mahatma Gandhi.',
    tags: {
      format: 'Conducted Online',
      eligibility: 'Open to All',
      reward: 'Certificates Distributed',
    },
    cta: {
      label: 'View Certificates',
      href: '/certificates',
      isFinished: true,
    },
  },
  {
    id: 'republic-day-2027',
    image: '/images/card_sprout.jpg',
    badge: { text: 'Coming Soon', type: 'soon' },
    date: '26 JAN 2027',
    title: 'Republic Day National Quiz',
    description: 'Celebrate Indian constitution, democracy, and freedom struggle through an intensive knowledge contest.',
    tags: {
      format: 'Online',
      eligibility: 'Open to All',
      reward: 'E-Certificate',
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
    <section className="py-16 md:py-24 bg-white border-b border-slate-100" id="events-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#0066FF] tracking-wider uppercase mb-2 block">
              FEATURED & UPCOMING PROGRAMMES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Our Next Opportunities
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-2xl font-normal">
              Step into creative and intellectual arenas, showcase your talent, and earn prestigious recognitions.
            </p>
          </div>

          <Link
            href="/register"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#0066FF] hover:text-[#0052cc] transition-colors group"
          >
            <span>View All Programmes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Event Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EVENTS.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Event Image Banner with Overlay Badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Status Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-xs ${
                      event.badge.type === 'open'
                        ? 'bg-rose-600 text-white'
                        : event.badge.type === 'finished'
                        ? 'bg-slate-700/95 text-slate-100 backdrop-blur-xs'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {event.badge.text}
                  </span>
                </div>

                {/* Date Tag */}
                <div className="absolute bottom-3 right-4 z-10 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-xs flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0066FF] transition-colors mb-2.5">
                    {event.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mb-5">
                    {event.description}
                  </p>

                  {/* Metadata Pills */}
                  <div className="space-y-2 border-t border-slate-100 pt-4 mb-6 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span>{event.tags.format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{event.tags.eligibility}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>{event.tags.reward}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Action */}
                <div>
                  {event.cta.isPrimary ? (
                    <Link
                      href={event.cta.href || '/register'}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white py-3 rounded-xl font-bold text-sm shadow-xs transition-colors"
                    >
                      <span>{event.cta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : event.cta.isFinished ? (
                    <Link
                      href={event.cta.href || '/certificates'}
                      className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-colors border border-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{event.cta.label}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleNotify(event.id)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors border ${
                        notified[event.id]
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {notified[event.id] ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Notification Set!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-slate-500" />
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
