'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageCircle, Instagram, Youtube, Linkedin } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';
import { useParticipantSession } from '@/hooks/useParticipantSession';

export const Footer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useParticipantSession();

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <footer className="bg-[#f8f5f0] text-[#706e6a] border-t border-[#f0ede8] kairu-grid-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-16 pb-12">
        
        {/* Main Footer Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#f0ede8] items-start">
          
          {/* Col 1: Brand & Promise */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-block group focus-visible:ring-2 focus-visible:ring-[#ff6b35] rounded-md outline-none" aria-label="TKFK Home">
                <img 
                  src="/tkfk2@4x.png" 
                  alt="TKFK" 
                  className="h-[34px] w-auto object-contain group-hover:opacity-90 transition-opacity" 
                />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-md font-normal">
              The complete ecosystem for building digital student portfolios, participating in national challenges, and earning verified credentials.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={mounted && isLoggedIn ? "/dashboard" : "/register"}
                className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs tracking-[-0.01em] shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
              >
                <span>{mounted && isLoggedIn ? "Participant Portal" : "Register for Contest"}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>

              {/* Social Channels */}
              <div className="flex items-center gap-1.5">
                <a
                  href={EVENT_CONFIG.whatsAppGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join WhatsApp Community"
                  title="WhatsApp Community Desk"
                  className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#25D366] hover:border-[#25D366]/40 transition-colors shadow-2xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
                <a
                  href={EVENT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow TKFK on Instagram"
                  title="Instagram (@tkfk.in)"
                  className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#E4405F] hover:border-[#E4405F]/40 transition-colors shadow-2xs"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href={EVENT_CONFIG.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Subscribe to TKFK on YouTube"
                  title="YouTube (@tkfkcommunity)"
                  className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#FF0000] hover:border-[#FF0000]/40 transition-colors shadow-2xs"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a
                  href={EVENT_CONFIG.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Connect with TKFK on LinkedIn"
                  title="LinkedIn"
                  className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] flex items-center justify-center text-[#706e6a] hover:text-[#0A66C2] hover:border-[#0A66C2]/40 transition-colors shadow-2xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold text-[#141412] uppercase tracking-[0.2em]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#706e6a]">
              <li>
                <Link href="/#why" className="hover:text-[#141412] transition-colors">Why TKFK</Link>
              </li>
              <li>
                <Link href="/#curriculum" className="hover:text-[#141412] transition-colors">Contest Blueprint</Link>
              </li>
              <li>
                <Link href="/#timeline" className="hover:text-[#141412] transition-colors">4-Phase Timeline</Link>
              </li>
              <li>
                <Link href="/#community" className="hover:text-[#141412] transition-colors">Community Desk</Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#141412] transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[#141412] transition-colors">Guidelines</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Support */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold text-[#141412] uppercase tracking-[0.2em]">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#706e6a]">
              <li>
                <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#141412] transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#141412] transition-colors">Contact Support</Link>
              </li>
              <li>
                <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="text-[#ff6b35] hover:underline">
                  {EVENT_CONFIG.supportEmail}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9c9a97] gap-4">
          <p>© 2026 TKFK — The Knowledge Forum Kerala. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
