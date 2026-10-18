'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  Trophy, 
  ShieldCheck, 
  Scale, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Layers,
  Info
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-8 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 outline-none">
        
        {/* Title & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            COMMUNITY GUIDELINES
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Competition Rules & Principles
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a] font-normal max-w-xl mx-auto leading-relaxed">
            Standard principles and code of conduct applicable to all TKFK challenges, competitions, and learning programmes.
          </p>
        </div>

        {/* Two-Tier Rule System Announcement */}
        <div className="p-5 sm:p-6 rounded-[24px] bg-[#f0ede8]/70 border border-[#f0ede8] text-[#141412] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3.5 text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#ff6b35] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-[#141412] text-sm sm:text-base">
                How Our Competition Guidelines Work
              </h3>
              <p className="text-xs text-[#706e6a] leading-relaxed">
                The general guidelines below apply universally across all our initiatives. <strong>Event-specific rules</strong> (such as submission formats, evaluation rubrics, or live proctoring criteria) are provided whenever you enter a specific competition portal.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full shadow-xs transition-colors"
          >
            <span>Active Contest</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Universal Core Pillars Grid */}
        <div className="bg-white p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-8 text-[#706e6a] text-xs sm:text-sm leading-relaxed">
          
          {/* General Rules Section */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#f0ede8]">
              <ShieldCheck className="w-5 h-5 text-[#ff6b35] shrink-0" />
              <h2 className="text-base sm:text-lg font-medium text-[#141412] tracking-tight">
                General Code of Conduct
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Rule 1: Fair Play & Integrity */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <HeartHandshake className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Fair Play & Integrity</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  All participants must compete with honesty and genuine spirit. Any form of impersonation, unfair assistance, automated bots, or deceptive practices will result in immediate disqualification.
                </p>
              </div>

              {/* Rule 2: Original Work */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Originality & Creative Ownership</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  Every submission, answer, design, or written work must be the original effort of the registered individual. Plagiarism or submitting uncredited work from other creators is strictly prohibited.
                </p>
              </div>

              {/* Rule 3: Individual Attempt & Registration */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <UserCheck className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Single Registration & Participation</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  Unless an event is specifically announced as a team or collaborative cohort, each participant is permitted exactly one official registration and one submission per event.
                </p>
              </div>

              {/* Rule 4: Timelines & Deadlines */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Adherence to Deadlines</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  All registrations, file uploads, and exam attempts must be submitted within the published schedule. Late submissions cannot be processed or counted toward rankings.
                </p>
              </div>

              {/* Rule 5: Community Decorum */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                  <span>Respectful Community Decorum</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  Participants are expected to maintain courteous and respectful conduct across all event portals, WhatsApp community groups, and communication desks.
                </p>
              </div>

              {/* Rule 6: Organiser & Evaluation Decisions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2">
                <div className="flex items-center gap-2 text-[#141412] font-semibold text-xs sm:text-sm">
                  <Scale className="w-4 h-4 text-[#ff6b35] shrink-0" />
                  <span>Jury & Evaluation Discretion</span>
                </div>
                <p className="text-xs text-[#706e6a] leading-relaxed">
                  Independent panels evaluate submissions according to pre-determined rubrics. The evaluations and decisions of the organizing committee and judges are final and binding.
                </p>
              </div>

            </div>
          </section>

          {/* Event-Specific Rules Notice Card */}
          <section className="p-5 rounded-2xl bg-[#f0ede8]/70 border border-[#f0ede8] space-y-3">
            <div className="flex items-center gap-2 text-[#141412] font-semibold text-sm">
              <Info className="w-4 h-4 text-[#ff6b35] shrink-0" />
              <span>Specific Competition Rules</span>
            </div>
            <p className="text-xs text-[#706e6a] leading-relaxed">
              Each individual competition may include its own technical instructions and requirements. These will always be presented clearly before you begin:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#706e6a]">
              <li><strong>Poster & Art Contests:</strong> Accepted file formats (PNG, JPG, PDF), theme criteria, dimensions, and resolution requirements.</li>
              <li><strong>Live Quizzes:</strong> Specific time limits per question, webcam verification, and anti-cheating window guidelines.</li>
              <li><strong>Writing & Idea Challenges:</strong> Word count limits, language options, formatting standards, and citation guidelines.</li>
            </ul>
          </section>

          {/* Awards & Recognition */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1">
              <Trophy className="w-5 h-5 text-[#ff6b35] shrink-0" />
              <h3 className="text-base font-medium text-[#141412]">
                Prizes & Verified Recognition
              </h3>
            </div>
            <p className="text-[#706e6a] leading-relaxed text-xs sm:text-sm">
              Winners of TKFK competitions are awarded cash rewards, accolades, and official Certificates of Merit as specified for each event. All registered, active participants who fulfill competition criteria receive an authentic Digital Certificate of Participation.
            </p>
          </section>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#f0ede8]">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium text-xs transition-colors"
            >
              Explore Active Competitions
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Access Participant Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
