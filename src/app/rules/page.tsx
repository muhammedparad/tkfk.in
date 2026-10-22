'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  Trophy, 
  ShieldCheck, 
  Palette, 
  Clock, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layers,
  MessageCircle,
  ExternalLink,
  Mail,
  AlertTriangle,
  Scale,
  Lock
} from 'lucide-react';

function RulesContent() {
  const searchParams = useSearchParams();
  const isFromRegister = searchParams?.get('from') === 'register';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-8 sm:pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8 outline-none">
        
        {/* Title & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#fdeee7] text-[#ff6b35] text-[11px] font-bold tracking-[0.2em] uppercase">
            TKFK POSTER DESIGNING CONTEST 2026
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Official Rules & Guidelines
          </h1>
          <p className="text-xs sm:text-sm text-[#706e6a] font-normal max-w-xl mx-auto leading-relaxed">
            Organised by The Knowledge Forum Kerala (TKFK). Create an original poster based on the official theme announced by TKFK. Read the following requirements before submitting your entry.
          </p>
        </div>

        {/* 🚨 MANDATORY WHATSAPP COMMUNITY DESK BANNER */}
        <div className="p-6 sm:p-7 rounded-[28px] sm:rounded-[32px] bg-[#eef8f2] border border-[#bbf7d0] space-y-4 shadow-soft">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-[#141412]">
                  Contest WhatsApp Group (Mandatory for All Participants)
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16a34a] text-white">
                  MANDATORY STEP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#2e5d3c] leading-relaxed font-normal">
                Joining the official contest WhatsApp group is <strong>mandatory</strong>. All official competition themes, design briefs, submission portal links, and announcements are released exclusively inside this group.
              </p>
            </div>
          </div>

          {isFromRegister ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-[#bbf7d0] space-y-2 text-xs text-[#2e5d3c]">
              <div className="flex items-center gap-2 font-bold text-[#141412] text-xs sm:text-sm">
                <Lock className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Invite Link Unlocked After Registration</span>
              </div>
              <p className="leading-relaxed">
                Joining the group is <strong>mandatory for all participants</strong> to access contest themes and submission links. Your official group invite link is unlocked immediately upon completed registration.
              </p>
              <div className="pt-1.5">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xs transition-colors"
                >
                  <span>Return to Registration Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <a
              href={EVENT_CONFIG.contestWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3.5 px-6 rounded-full text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enter Contest WhatsApp Group (Mandatory)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Main Comprehensive Rules Card */}
        <div className="bg-white p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-10 text-[#706e6a] text-xs sm:text-sm leading-relaxed">
          
          {/* Section 1: Contest Details */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Contest Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-10">
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">Registration Fee</span>
                <span className="text-sm font-bold text-[#141412]">₹99 per participant</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">Submission Deadline</span>
                <span className="text-sm font-bold text-[#ff6b35]">30 October 2026</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">First Prize</span>
                <span className="text-sm font-bold text-[#1e6f42]">₹7,001 Cash Award</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">Additional Rewards</span>
                <span className="text-sm font-bold text-[#141412]">Fontashan fonts (₹1,500) for Top 5</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">Eligibility & Location</span>
                <span className="text-sm font-bold text-[#141412]">All ages • Open across Kerala & India</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8]">
                <span className="block text-[11px] font-semibold text-[#9c9a97] uppercase tracking-wider">Languages & Limit</span>
                <span className="text-sm font-bold text-[#141412]">Malayalam & English • 1 entry each</span>
              </div>
            </div>
          </section>

          {/* Section 2: Design Requirements */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Design Requirements
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-3">
              <ul className="space-y-2 list-disc pl-5 marker:text-[#ff6b35]">
                <li><strong>Canvas Dimensions:</strong> 1080 × 1350 pixels (4:5 portrait aspect ratio).</li>
                <li><strong>Colour Mode:</strong> RGB mode (optimized for digital displays).</li>
                <li><strong>Final Poster Export:</strong> High-resolution JPG or PNG.</li>
                <li><strong>Editable Source File:</strong> Adobe Photoshop (.PSD) only (Mandatory).</li>
                <li><strong>Official Theme:</strong> To be announced exclusively by TKFK inside the official WhatsApp group.</li>
              </ul>
              <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-xs text-[#706e6a] italic">
                Your poster must be original, readable, relevant to the announced theme, and suitable for digital viewing.
              </div>
            </div>
          </section>

          {/* Section 3: Originality & AI Policy */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Originality & AI Policy
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-3">
              <p>
                AI tools may assist with ideas, imagery, and editing. However, the final poster must demonstrate <strong>meaningful human creative input</strong>. Unmodified AI-generated images submitted as complete designs are strictly not permitted.
              </p>
              <div className="p-4 rounded-2xl bg-[#fff5f5] border border-[#fed7d7] text-[#991b1b] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
                <span>
                  Plagiarism, copyright infringement, misleading information, and unauthorised branding are strictly prohibited and will lead to automatic disqualification.
                </span>
              </div>
            </div>
          </section>

          {/* Section 4: Submission Process */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">4</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Submission Process
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-3">
              <ol className="space-y-2.5 list-decimal pl-5 marker:font-bold marker:text-[#ff6b35]">
                <li>Register and pay the ₹99 fee on the official portal.</li>
                <li>Review the official theme and guidelines announced in the contest group.</li>
                <li>Create your original poster in Adobe Photoshop.</li>
                <li>Export the final artwork as a high-quality JPG or PNG.</li>
                <li>Save the editable Photoshop project as a <strong>.PSD</strong> file with organized layers.</li>
                <li>
                  Email the PSD source file along with your final export to{' '}
                  <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="text-[#ff6b35] font-semibold hover:underline">
                    {EVENT_CONFIG.supportEmail}
                  </a>{' '}
                  before the deadline.
                </li>
              </ol>
              <p className="text-xs text-[#9c9a97] pt-1">
                Ensure your files are complete and your PSD opens correctly. Retain a copy of your submission and registration confirmation.
              </p>
            </div>
          </section>

          {/* Section 5: Judging Criteria Table */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">5</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Judging Criteria (100 Points Total)
              </h2>
            </div>

            <div className="pl-2 sm:pl-10">
              <div className="rounded-2xl border border-[#f0ede8] overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#f8f5f0] border-b border-[#f0ede8] font-bold text-[#141412]">
                      <th className="py-3 px-5">Evaluation Criterion</th>
                      <th className="py-3 px-5 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede8]">
                    <tr>
                      <td className="py-2.5 px-5 font-medium text-[#141412]">Creativity and originality</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-[#ff6b35]">30</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-5 font-medium text-[#141412]">Composition and visual hierarchy</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-[#ff6b35]">25</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-5 font-medium text-[#141412]">Typography and readability</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-[#ff6b35]">20</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-5 font-medium text-[#141412]">Theme relevance</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-[#ff6b35]">15</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-5 font-medium text-[#141412]">Technical quality</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-[#ff6b35]">10</td>
                    </tr>
                    <tr className="bg-[#f8f5f0] font-bold">
                      <td className="py-3 px-5 text-[#141412]">Total Score</td>
                      <td className="py-3 px-5 text-right font-mono text-base text-[#141412]">100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 6: Prizes & Recognition */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">6</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Prizes & Recognition
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-2">
              <ul className="space-y-1.5 list-disc pl-5 marker:text-[#ff6b35]">
                <li><strong>First Prize:</strong> ₹7,001 direct cash award and official merit credential.</li>
                <li><strong>Five Best Performers:</strong> Fontashan premium font rewards worth ₹1,500, subject to the organisers&apos; final allocation details.</li>
                <li>Winners will be announced through TKFK&apos;s official communication channels.</li>
              </ul>
            </div>
          </section>

          {/* Section 7: Eligibility & Disqualification */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">7</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Eligibility & Disqualification
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-2">
              <p>
                Each participant may submit one individual entry. Group entries require prior authorisation. Entries may be disqualified for plagiarism, copyright violations, false information, inappropriate content, rule violations, or failure to provide the required PSD source file.
              </p>
              <p>
                Participants under 18 must follow any parental consent and prize-distribution requirements announced by TKFK.
              </p>
            </div>
          </section>

          {/* Section 8: Intellectual Property */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">8</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                Intellectual Property
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-2">
              <p>
                Participants retain ownership of their original artwork, subject to applicable law and third-party rights. TKFK may display submitted posters for judging and contest administration. Any additional promotional usage permissions will be specified in the final contest terms.
              </p>
            </div>
          </section>

          {/* Section 9: General Terms */}
          <section className="space-y-3.5">
            <div className="flex items-center gap-3 pb-3 border-b border-[#f0ede8]">
              <span className="w-7 h-7 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">9</span>
              <h2 className="text-base sm:text-lg font-bold text-[#141412] tracking-tight">
                General Terms
              </h2>
            </div>

            <div className="pl-2 sm:pl-10 space-y-2">
              <p>
                Participants are responsible for submitting complete files before the deadline. Any changes to the theme, deadline, or requirements will be communicated through official TKFK channels.
              </p>
              <p>
                The exact closing time, time zone, and final theme will be announced separately inside the official group.
              </p>
            </div>
          </section>

          {/* Before You Submit Checklist */}
          <div className="p-6 rounded-[24px] bg-[#fafafb] border border-[#f0ede8] space-y-4">
            <h3 className="font-bold text-[#141412] text-sm sm:text-base">Before You Submit Checklist</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#706e6a]">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Follow the official theme announced in the WhatsApp group.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Use a 1080 × 1350 px canvas (4:5 portrait ratio).</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Export the final poster as JPG or PNG.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Prepare the editable Adobe Photoshop (.PSD) file with organized layers.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Ensure your work is original and readable.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Email the PSD file to <strong>{EVENT_CONFIG.supportEmail}</strong>.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Submit before <strong>30 October 2026</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Design Boldly Tagline */}
          <div className="text-center pt-4 space-y-1">
            <p className="text-sm font-serif italic text-[#706e6a]">
              &ldquo;Design boldly. Think creatively. Let your work speak for itself.&rdquo;
            </p>
            <span className="text-xs font-bold text-[#141412] block">
              The Knowledge Forum Kerala (TKFK)
            </span>
          </div>

        </div>

        {/* CTA Bar */}
        <div className="p-6 rounded-[28px] bg-white border border-[#f0ede8] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <h4 className="font-bold text-[#141412] text-sm sm:text-base">Ready to showcase your design skills?</h4>
            <p className="text-xs text-[#706e6a]">Registration fee is ₹99. Win ₹7,001 and verifiable credentials.</p>
          </div>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white text-xs sm:text-sm font-medium px-6 py-3.5 rounded-full shadow-xs transition-colors"
          >
            <span>Register for Contest</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function RulesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RulesContent />
    </Suspense>
  );
}
