'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  FileText, 
  Palette, 
  AlertTriangle, 
  Trophy, 
  Mail, 
  Clock, 
  Layers, 
  ExternalLink, 
  ChevronRight, 
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

interface ContestRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'brief' | 'detailed';
  participantName?: string;
}

export const ContestRulesModal: React.FC<ContestRulesModalProps> = ({
  isOpen,
  onClose,
  defaultView = 'brief',
  participantName,
}) => {
  const [viewMode, setViewMode] = useState<'brief' | 'detailed'>(defaultView);

  // Sync default view when opened and lock background scroll
  useEffect(() => {
    if (isOpen) {
      setViewMode(defaultView);
      // Freeze Lenis smooth scroll on the underlying page
      if (typeof window !== 'undefined') {
        window.__lenis?.stop();
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }
    } else {
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.__lenis?.start();
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }
    };
  }, [isOpen, defaultView]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md sm:backdrop-blur-lg transition-all duration-300 animate-fadeIn"
      style={{
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      data-lenis-prevent="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        data-lenis-prevent="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            MODAL HEADER BAR
        ======================================================== */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#f0ede8] bg-[#fafafb] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-[0.2em] block">
                OFFICIAL GUIDELINES
              </span>
              <h2 id="rules-modal-title" className="text-base sm:text-lg font-bold text-[#141412] leading-tight">
                {viewMode === 'brief' ? 'Contest Rules Summary' : 'Full Official Rules & Guidelines'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#f0ede8] text-[#706e6a] hover:text-[#141412] border border-[#f0ede8] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close rules modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            MODAL BODY (SCROLLABLE)
        ======================================================== */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6 text-[#141412] text-xs sm:text-sm font-sans"
          data-lenis-prevent="true"
          style={{ overscrollBehavior: 'contain' }}
        >
          
          {/* ========================================================
              VIEW 1: BRIEF GUIDELINES (DEFAULT POPUP VIEW)
          ======================================================== */}
          {viewMode === 'brief' ? (
            <div className="space-y-6">

              {/* 🚨 MANDATORY WHATSAPP BANNER */}
              <div className="p-5 sm:p-6 rounded-[24px] bg-[#eef8f2] border border-[#bbf7d0] space-y-3.5 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#141412]">
                        Join Contest WhatsApp Group
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16a34a] text-white">
                        MANDATORY
                      </span>
                    </div>
                    <p className="text-xs text-[#2e5d3c] leading-relaxed">
                      Joining the official WhatsApp group is <strong>mandatory for all participants</strong>. The official competition theme, design guidelines, submission portal links, and announcements will be shared exclusively inside this group.
                    </p>
                  </div>
                </div>

                <a
                  href={EVENT_CONFIG.contestWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3 px-5 rounded-full text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enter Contest WhatsApp Group (Mandatory)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Key Highlights Grid */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-[#706e6a] uppercase tracking-wider">
                  Key Submission Requirements at a Glance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Item 1: Dimensions */}
                  <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#ff6b35] font-bold text-xs">
                      <Palette className="w-4 h-4 shrink-0" />
                      <span>Canvas & Format</span>
                    </div>
                    <p className="text-xs text-[#706e6a] leading-relaxed">
                      <strong>1080 × 1350 pixels</strong> (4:5 portrait ratio). RGB color mode. Output file as JPG or PNG.
                    </p>
                  </div>

                  {/* Item 2: PSD Source File */}
                  <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#ff6b35] font-bold text-xs">
                      <Layers className="w-4 h-4 shrink-0" />
                      <span>Editable Source File</span>
                    </div>
                    <p className="text-xs text-[#706e6a] leading-relaxed">
                      <strong>Adobe Photoshop (.PSD) only</strong>. The editable project file must be submitted to verify original layers.
                    </p>
                  </div>

                  {/* Item 3: AI & Originality Policy */}
                  <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#ff6b35] font-bold text-xs">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Originality & AI Policy</span>
                    </div>
                    <p className="text-xs text-[#706e6a] leading-relaxed">
                      Must demonstrate meaningful human creative input. Unmodified raw AI-generated designs are strictly prohibited.
                    </p>
                  </div>

                  {/* Item 4: Awards & Deadline */}
                  <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-1.5">
                    <div className="flex items-center gap-2 text-[#ff6b35] font-bold text-xs">
                      <Trophy className="w-4 h-4 shrink-0" />
                      <span>Prize & Deadline</span>
                    </div>
                    <p className="text-xs text-[#706e6a] leading-relaxed">
                      <strong>₹7,001 1st Prize</strong> + Fontashan fonts (₹1,500) for Top 5. Deadline: <strong>30 October 2026</strong>.
                    </p>
                  </div>

                </div>
              </div>

              {/* Submission Destination Callout */}
              <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#ff6b35] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs text-[#706e6a] leading-relaxed">
                  <span className="font-bold text-[#141412] block">Where to Submit:</span>
                  <span>
                    Email your completed JPG/PNG poster along with the editable <strong>.PSD file</strong> to{' '}
                    <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="text-[#ff6b35] font-medium hover:underline">
                      {EVENT_CONFIG.supportEmail}
                    </a>
                  </span>
                </div>
              </div>

              {/* Switch to Detailed View Trigger */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setViewMode('detailed')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6b35] hover:text-[#e85926] hover:underline cursor-pointer py-1"
                >
                  <span>Click here to read the full, detailed 9-section contest guidelines & judging rubric</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (

            /* ========================================================
                VIEW 2: FULL DETAILED GUIDELINES (COMPLETE 9 SECTIONS)
            ======================================================== */
            <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-[#706e6a]">
              
              {/* Back to Brief Button */}
              <div className="pb-2 border-b border-[#f0ede8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setViewMode('brief')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ff6b35] hover:text-[#e85926] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Brief Summary</span>
                </button>
                <span className="text-[11px] text-[#9c9a97]">Organised by The Knowledge Forum Kerala</span>
              </div>

              {/* 🚨 Mandatory WhatsApp Notice in Detailed View */}
              <div className="p-4 rounded-2xl bg-[#eef8f2] border border-[#bbf7d0] flex items-start gap-3 text-xs">
                <MessageCircle className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-[#141412] block">Official Contest WhatsApp Group (Mandatory):</strong>
                  <p className="text-[#2e5d3c]">
                    All competition themes, design briefs, and submission updates will be announced inside the group.{' '}
                    <a 
                      href={EVENT_CONFIG.contestWhatsAppUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-semibold text-[#16a34a] hover:underline inline-flex items-center gap-0.5"
                    >
                      Join group here <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </p>
                </div>
              </div>

              {/* Section 1: Contest Details */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  Contest Details
                </h3>
                <ul className="space-y-1.5 pl-8 list-disc marker:text-[#ff6b35]">
                  <li><strong>Registration fee:</strong> ₹99</li>
                  <li><strong>Deadline:</strong> 30 October 2026</li>
                  <li><strong>First prize:</strong> ₹7,001 cash award</li>
                  <li><strong>Additional rewards:</strong> Fontashan premium fonts worth ₹1,500 for five best performers</li>
                  <li><strong>Eligibility:</strong> Open to all ages</li>
                  <li><strong>Participation:</strong> Online, open across Kerala and India</li>
                  <li><strong>Languages:</strong> Malayalam and English</li>
                  <li><strong>Entries:</strong> Strictly one entry per registered participant</li>
                </ul>
              </section>

              {/* Section 2: Design Requirements */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  Design Requirements
                </h3>
                <ul className="space-y-1.5 pl-8 list-disc marker:text-[#ff6b35]">
                  <li><strong>Canvas Dimensions:</strong> 1080 × 1350 pixels (4:5 portrait aspect ratio)</li>
                  <li><strong>Colour Mode:</strong> RGB</li>
                  <li><strong>Final Export:</strong> JPG or PNG (high resolution)</li>
                  <li><strong>Editable Source File:</strong> Adobe Photoshop (.PSD) only (Mandatory)</li>
                  <li><strong>Official Theme:</strong> To be announced exclusively by TKFK inside the official contest group</li>
                </ul>
                <p className="pl-8 text-xs text-[#706e6a] italic">
                  Your poster must be original, readable, relevant to the theme, and suitable for digital viewing.
                </p>
              </section>

              {/* Section 3: Originality & AI Policy */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  Originality & AI Policy
                </h3>
                <div className="pl-8 space-y-2">
                  <p>
                    AI tools may assist with ideas, imagery, and editing. However, the final poster must demonstrate meaningful human creative input. <strong>Unmodified AI-generated images submitted as complete designs are not permitted.</strong>
                  </p>
                  <p>
                    Plagiarism, copyright infringement, misleading information, and unauthorised branding are strictly prohibited.
                  </p>
                </div>
              </section>

              {/* Section 4: Submission Process */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  Step-by-Step Submission Process
                </h3>
                <ol className="space-y-2 pl-8 list-decimal marker:font-bold marker:text-[#ff6b35]">
                  <li>Register and pay the ₹99 fee.</li>
                  <li>Review the official theme and instructions announced in the group.</li>
                  <li>Create your original poster in Adobe Photoshop.</li>
                  <li>Export the final artwork as JPG or PNG.</li>
                  <li>Save the editable Photoshop project as a <strong>.PSD</strong> file.</li>
                  <li>Email the PSD source file & final image to <strong>{EVENT_CONFIG.supportEmail}</strong> before the deadline.</li>
                </ol>
                <p className="pl-8 text-xs text-[#9c9a97]">
                  Ensure your files are complete and your PSD opens correctly without missing layers. Retain a copy of your submission and registration confirmation.
                </p>
              </section>

              {/* Section 5: Judging Criteria Table */}
              <section className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  Judging Criteria (100 Points Total)
                </h3>
                <div className="pl-8">
                  <div className="rounded-2xl border border-[#f0ede8] overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#f8f5f0] border-b border-[#f0ede8] font-bold text-[#141412]">
                          <th className="py-2.5 px-4">Evaluation Criterion</th>
                          <th className="py-2.5 px-4 text-right">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0ede8]">
                        <tr>
                          <td className="py-2 px-4 text-[#141412]">Creativity and originality</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-[#ff6b35]">30</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-[#141412]">Composition and visual hierarchy</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-[#ff6b35]">25</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-[#141412]">Typography and readability</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-[#ff6b35]">20</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-[#141412]">Theme relevance</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-[#ff6b35]">15</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 text-[#141412]">Technical quality</td>
                          <td className="py-2 px-4 text-right font-mono font-semibold text-[#ff6b35]">10</td>
                        </tr>
                        <tr className="bg-[#f8f5f0] font-bold">
                          <td className="py-2.5 px-4 text-[#141412]">Total Score</td>
                          <td className="py-2.5 px-4 text-right font-mono text-[#141412]">100</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Section 6: Prizes & Recognition */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">6</span>
                  Prizes & Recognition
                </h3>
                <ul className="space-y-1.5 pl-8 list-disc marker:text-[#ff6b35]">
                  <li><strong>First prize:</strong> ₹7,001 cash award</li>
                  <li><strong>Five best performers:</strong> Fontashan premium font rewards worth ₹1,500, subject to the organisers&apos; final allocation details.</li>
                  <li>Winners will be announced through TKFK&apos;s official communication channels.</li>
                </ul>
              </section>

              {/* Section 7: Eligibility & Disqualification */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">7</span>
                  Eligibility & Disqualification
                </h3>
                <div className="pl-8 space-y-2">
                  <p>
                    Each participant may submit one individual entry. Group entries require prior authorisation. Entries may be disqualified for plagiarism, copyright violations, false information, inappropriate content, rule violations, or failure to provide the required PSD source file.
                  </p>
                  <p>
                    Participants under 18 must follow any parental consent and prize-distribution requirements announced by TKFK.
                  </p>
                </div>
              </section>

              {/* Section 8: Intellectual Property */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">8</span>
                  Intellectual Property
                </h3>
                <p className="pl-8">
                  Participants retain ownership of their original artwork, subject to applicable law and third-party rights. TKFK may display submitted posters for judging and contest administration. Any additional promotional usage permissions will be specified in the final contest terms.
                </p>
              </section>

              {/* Section 9: General Terms */}
              <section className="space-y-2.5">
                <h3 className="text-sm sm:text-base font-bold text-[#141412] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#fdeee7] text-[#ff6b35] flex items-center justify-center text-xs font-bold shrink-0">9</span>
                  General Terms
                </h3>
                <p className="pl-8">
                  Participants are responsible for submitting complete files before the deadline. Any changes to the theme, deadline, or requirements will be communicated through official TKFK channels. The exact closing time, time zone, and final theme will be announced separately.
                </p>
              </section>

              {/* Before You Submit Checklist */}
              <div className="p-5 rounded-2xl bg-[#fafafb] border border-[#f0ede8] space-y-3">
                <h4 className="font-bold text-[#141412] text-xs sm:text-sm">Before You Submit Checklist:</h4>
                <ul className="space-y-1.5 text-xs text-[#706e6a]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Follow the official theme announced in the WhatsApp group.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Canvas size is exactly 1080 × 1350 px (4:5 portrait).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Export final poster as JPG or PNG.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Prepare the editable Adobe Photoshop (.PSD) file with organized layers.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Ensure original human input (no unmodified AI generations).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                    <span>Email files to <strong>{EVENT_CONFIG.supportEmail}</strong> before 30 October 2026.</span>
                  </li>
                </ul>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs font-serif italic text-[#706e6a]">
                  &ldquo;Design boldly. Think creatively. Let your work speak for itself.&rdquo;
                </p>
                <span className="text-[11px] font-bold text-[#141412] block mt-1">
                  The Knowledge Forum Kerala (TKFK)
                </span>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================
            MODAL FOOTER ACTIONS
        ======================================================== */}
        <div className="px-6 sm:px-8 py-4 bg-[#fafafb] border-t border-[#f0ede8] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#706e6a] text-center sm:text-left">
            {viewMode === 'brief' ? (
              <button
                type="button"
                onClick={() => setViewMode('detailed')}
                className="font-semibold text-[#ff6b35] hover:underline cursor-pointer"
              >
                Read Complete 9-Section Rules →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('brief')}
                className="font-semibold text-[#ff6b35] hover:underline cursor-pointer"
              >
                ← Return to Brief Summary
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-full border border-[#f0ede8] bg-white hover:bg-[#f8f5f0] text-xs font-medium text-[#141412] transition-colors cursor-pointer"
            >
              I Understand
            </button>
            
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white text-xs font-medium shadow-xs transition-colors"
            >
              <span>Go to Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
