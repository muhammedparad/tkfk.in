import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Linkedin, Mail, MessageCircle, Quote, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { TEAM_MEMBERS, getTeamMemberBySlug } from '@/lib/teamData';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return Object.keys(TEAM_MEMBERS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const member = getTeamMemberBySlug(params.slug);
  if (!member) {
    return {
      title: 'Team Member Not Found | TKFK',
    };
  }

  return {
    title: `${member.name} — ${member.role} | TKFK (The Knowledge Forum Kerala)`,
    description: `${member.name} is the ${member.role} of TKFK (The Knowledge Forum Kerala). Read their journey, philosophy on learning, and vision for student-led innovation.`,
    openGraph: {
      title: `${member.name} — ${member.role} | TKFK`,
      description: member.tagline,
      images: [
        {
          url: member.image,
          width: 800,
          height: 800,
          alt: `${member.name} - ${member.role}`,
        },
      ],
    },
  };
}

export default function TeamMemberPage({ params }: PageProps) {
  const member = getTeamMemberBySlug(params.slug);

  if (!member) {
    notFound();
  }

  const otherMember = getTeamMemberBySlug(member.otherMemberSlug);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-6 sm:pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full outline-none">
        
        {/* Back navigation pill */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/#who-builds"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#706e6a] hover:text-[#ff6b35] transition-colors py-1.5 px-3 rounded-full hover:bg-white/70 border border-transparent hover:border-[#f0ede8] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Team</span>
          </Link>
        </div>

        {/* ========================================================
            PROFILE HERO HEADER (Matches reference screenshot style)
        ======================================================== */}
        <section className="bg-white rounded-[32px] sm:rounded-[36px] p-6 sm:p-10 border border-[#f0ede8] shadow-[0_8px_30px_rgba(20,20,18,0.03)] flex flex-col md:flex-row items-center md:items-start gap-8 sm:gap-10">
          
          {/* Avatar Container with Warm Circular Backdrop */}
          <div className="relative shrink-0">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden bg-[#feddcc] border-4 border-white shadow-soft flex items-end justify-center">
              <Image
                src={member.image}
                alt={`${member.name} - ${member.role}`}
                fill
                sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 220px"
                className="object-cover object-bottom"
                priority
              />
            </div>
          </div>

          {/* Profile Headline & Role */}
          <div className="flex-1 text-center md:text-left space-y-3.5">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#fdeee7] text-[#ff6b35] text-[11px] font-bold tracking-[0.2em] uppercase">
              {member.badgeLabel}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#141412] tracking-[-0.035em] leading-[1.12]">
              Hi, I&apos;m {member.name}
            </h1>

            <p className="text-sm sm:text-base font-medium text-[#706e6a] leading-relaxed">
              {member.fullRole}
            </p>

            {/* Social / Connect Actions Row */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2.5">
              <a
                href={EVENT_CONFIG.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                title="Connect on LinkedIn"
                className="w-10 h-10 rounded-full bg-[#f8f5f0] border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#0A66C2] hover:bg-white hover:border-[#0A66C2]/40 transition-all shadow-2xs group"
              >
                <Linkedin className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={`mailto:${EVENT_CONFIG.supportEmail}?subject=Message%20for%20${encodeURIComponent(member.name)}`}
                aria-label={`Send an email to ${member.name}`}
                title="Send an email"
                className="w-10 h-10 rounded-full bg-[#f8f5f0] border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#ff6b35] hover:bg-white hover:border-[#ff6b35]/40 transition-all shadow-2xs group"
              >
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href={EVENT_CONFIG.whatsAppGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TKFK WhatsApp Community"
                title="TKFK WhatsApp Community Desk"
                className="w-10 h-10 rounded-full bg-[#f8f5f0] border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#25D366] hover:bg-white hover:border-[#25D366]/40 transition-all shadow-2xs group"
              >
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </a>

              <span className="text-[11px] text-[#9c9a97] font-medium ml-1">
                Official TKFK Leadership
              </span>
            </div>

          </div>

        </section>

        {/* ========================================================
            NARRATIVE CONTENT STORY (Exact text provided by user)
        ======================================================== */}
        <article className="mt-10 sm:mt-12 bg-white/70 border border-[#f0ede8] rounded-[32px] sm:rounded-[36px] p-7 sm:p-12 shadow-2xs space-y-10">
          
          {/* Introduction block */}
          <div className="space-y-4 pb-8 border-b border-[#f0ede8]">
            <h2 className="text-xl sm:text-2xl font-bold text-[#141412] tracking-tight flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
              <span>Introduction</span>
            </h2>

            {member.bioIntro.map((paragraph, idx) => (
              <p key={idx} className="text-[15px] sm:text-[17px] text-[#4a4844] leading-[1.8] font-normal">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Highlight Pull-Quote */}
          <div className="relative p-6 sm:p-8 rounded-[24px] bg-[#fdeee7]/70 border-l-4 border-[#ff6b35] text-[#141412] shadow-2xs my-8">
            <Quote className="w-6 h-6 text-[#ff6b35] mb-2 opacity-80" />
            <p className="text-base sm:text-xl font-medium leading-relaxed italic text-[#141412]">
              &ldquo;{member.quote}&rdquo;
            </p>
            <span className="block text-xs font-semibold text-[#ff6b35] uppercase tracking-wider mt-3">
              — {member.name}, {member.role}
            </span>
          </div>

          {/* Core Body Sections */}
          <div className="space-y-10">
            {member.sections.map((section, idx) => (
              <section key={idx} className="space-y-3.5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#141412] tracking-tight flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff6b35]" />
                  <span>{section.title}</span>
                </h2>

                <div className="space-y-3.5">
                  {section.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-[15px] sm:text-[17px] text-[#4a4844] leading-[1.8] font-normal">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* A Note to You: Warm Callout Card */}
          <div className="p-7 sm:p-9 rounded-[28px] bg-[#f0ede8]/80 border border-[#e5e1da] space-y-4 mt-10 shadow-2xs">
            <div className="flex items-center gap-2 text-[#ff6b35]">
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                A NOTE TO YOU
              </span>
            </div>

            <div className="space-y-3.5">
              {member.noteToYou.map((note, nIdx) => (
                <p 
                  key={nIdx} 
                  className={`text-[15px] sm:text-[17px] leading-[1.8] ${
                    nIdx === member.noteToYou.length - 1 
                      ? 'font-semibold text-[#141412] text-lg sm:text-xl pt-2' 
                      : 'text-[#4a4844] font-normal'
                  }`}
                >
                  {note}
                </p>
              ))}
            </div>

            {/* Formal Sign-off Signature Block */}
            <div className="pt-6 mt-6 border-t border-[#e2ded8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#141412] tracking-tight">
                  {member.signOff.name}
                </div>
                <div className="text-xs sm:text-sm text-[#706e6a] font-medium">
                  {member.signOff.role}
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e2ded8] text-xs font-semibold text-[#141412] shadow-2xs">
                <span>The Knowledge Forum Kerala</span>
              </div>
            </div>

          </div>

          {/* ========================================================
              SWITCHER / OTHER TEAM MEMBER LINK
          ======================================================== */}
          {otherMember && (
            <div className="pt-8 border-t border-[#f0ede8]">
              <div className="bg-[#f8f5f0] border border-[#f0ede8] rounded-[24px] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#e2ded8] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#feddcc] border-2 border-white shadow-2xs shrink-0">
                    <Image
                      src={otherMember.image}
                      alt={otherMember.name}
                      fill
                      className="object-cover object-bottom"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#ff6b35] tracking-wider uppercase block">
                      OUR LEADERSHIP TEAM
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#141412] tracking-tight">
                      {otherMember.name} — {otherMember.role}
                    </h4>
                  </div>
                </div>

                <Link
                  href={`/team/${otherMember.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#ff6b35] text-[#141412] hover:text-white border border-[#f0ede8] hover:border-[#ff6b35] text-xs font-semibold tracking-tight transition-all active:scale-95 shadow-2xs shrink-0"
                >
                  <span>{member.otherMemberLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Community Desk & Action Strip */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-[#141412]">
                Explore TKFK Programmes & Competitions
              </h4>
              <p className="text-xs text-[#706e6a] mt-0.5">
                Take the first step. Join our active Digital Poster Contest or connect with the community.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
              >
                <span>Join Active Challenge</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/#who-builds"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#f0ede8] hover:bg-[#e5e1da] text-[#141412] text-xs font-medium transition-colors"
              >
                <span>Back to Team</span>
              </Link>
            </div>
          </div>

        </article>

      </main>

      <Footer />
    </div>
  );
}
