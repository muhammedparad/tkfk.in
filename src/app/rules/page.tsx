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
  Award, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  HeartHandshake,
  FileText,
  Layers,
  Info
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* Title & Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            General Competition Rules & Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {EVENT_CONFIG.organizer}
          </p>
          <p className="text-xs text-slate-500 max-w-xl mx-auto pt-1 leading-relaxed">
            Standard principles and code of conduct applicable to all TKFK competitions, creative challenges, and learning programmes.
          </p>
        </div>

        {/* Two-Tier Rule System Announcement */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                How Our Competition Rules Work
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The general guidelines below apply universally across all our initiatives. <strong>Event-specific rules</strong> (such as submission formats, evaluation rubrics, or live proctoring criteria) are provided whenever you enter a specific competition portal.
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 inline-flex items-center gap-2 bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <span>View Active Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Universal Core Pillars Grid */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-md space-y-8 text-slate-700 text-xs sm:text-sm leading-relaxed">
          
          {/* General Rules Section */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-wide">
                General Code of Conduct
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Rule 1: Fair Play & Integrity */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Fair Play & Integrity</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All participants must compete with honesty and genuine spirit. Any form of impersonation, unfair assistance, automated bots, or deceptive practices will result in immediate disqualification.
                </p>
              </div>

              {/* Rule 2: Original Work */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Originality & Creative Ownership</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every submission, answer, design, or written work must be the original effort of the registered individual. Plagiarism or submitting uncredited work from other creators is strictly prohibited.
                </p>
              </div>

              {/* Rule 3: Individual Attempt & Registration */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <UserCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Single Registration & Participation</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unless an event is specifically announced as a team or collaborative cohort, each participant is permitted exactly one official registration and one submission per event.
                </p>
              </div>

              {/* Rule 4: Timelines & Deadlines */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Adherence to Deadlines</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All registrations, file uploads, and exam attempts must be submitted within the published schedule. Late submissions cannot be processed or counted toward rankings.
                </p>
              </div>

              {/* Rule 5: Community Decorum */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Respectful Community Decorum</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Participants are expected to maintain courteous and respectful conduct across all event portals, WhatsApp community groups, and communication desks.
                </p>
              </div>

              {/* Rule 6: Organiser & Evaluation Decisions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Jury & Evaluation Discretion</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Independent panels evaluate submissions according to pre-determined rubrics. The evaluations and decisions of the organizing committee and judges are final and binding.
                </p>
              </div>

            </div>
          </section>

          {/* Event-Specific Rules Notice Card */}
          <section className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Specific Competition Rules</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Each individual competition may include its own technical instructions and requirements. These will always be presented clearly before you begin:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900/90 font-medium">
              <li><strong>Live Quizzes:</strong> Specific time limits per question, camera/webcam verification, and anti-cheating window guidelines.</li>
              <li><strong>Poster & Art Contests:</strong> Accepted file formats (PNG, JPG, PDF), theme criteria, dimensions, and resolution requirements.</li>
              <li><strong>Writing & Idea Challenges:</strong> Word count limits, language options, formatting standards, and citation guidelines.</li>
            </ul>
          </section>

          {/* Awards & Recognition */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Prizes & Verified Recognition
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
              Winners of TKFK competitions are awarded cash rewards, accolades, and official Certificates of Merit as specified for each event. All registered, active participants who fulfill competition criteria receive an authentic Digital Certificate of Participation.
            </p>
          </section>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
            >
              Explore Active Competitions
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center px-6 py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
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
