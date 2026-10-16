import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f8f5f0] text-[#706e6a] border-t border-[#f0ede8]">
      
      {/* ── DESKTOP RICH FOOTER (hidden on mobile screens) ── */}
      <div className="hidden md:block max-w-[1100px] mx-auto px-4 sm:px-6 pt-14 pb-10">

        {/* 5-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#f0ede8]">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center border border-[#f0ede8] shadow-2xs">
                <Image 
                  src="/images/tkfk_logo.png" 
                  alt="TKFK Logo" 
                  width={34} 
                  height={34} 
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-bold text-[#141412] tracking-tight">
                  TKFK
                </span>
                <p className="text-[10px] text-[#ff6b35] font-semibold tracking-wider uppercase">
                  A KNOWLEDGE COMMUNITY
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-sm font-normal">
              A forward-thinking educational ecosystem empowering students, youth, and educators through nationwide quizzes, creative cohorts, and verified certificates.
            </p>

            <div className="pt-2 flex items-center gap-3 text-[#9c9a97]">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] hover:border-[#ff6b35] hover:text-[#ff6b35] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] hover:border-[#ff6b35] hover:text-[#ff6b35] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] hover:border-[#ff6b35] hover:text-[#ff6b35] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href={EVENT_CONFIG.whatsAppGroupUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-white border border-[#f0ede8] hover:border-[#ff6b35] hover:text-[#ff6b35] flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 2c-5.508 0-9.984 4.477-9.984 9.984 0 1.761.458 3.477 1.328 4.989L2 22l5.176-1.355a9.923 9.923 0 0 0 4.855 1.255h.004c5.508 0 9.985-4.477 9.985-9.984 0-2.667-1.039-5.175-2.926-7.062A9.925 9.925 0 0 0 12.031 2zm0 18.281h-.004a8.277 8.277 0 0 1-4.218-1.151l-.303-.18-3.136.822.837-3.056-.197-.314a8.267 8.267 0 0 1-1.266-4.418c0-4.57 3.719-8.289 8.289-8.289 2.215 0 4.297.863 5.863 2.43 1.566 1.566 2.428 3.648 2.428 5.863 0 4.57-3.719 8.293-8.291 8.293z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#141412] tracking-wider uppercase">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-[#706e6a]">
              <li>
                <Link href="/" className="hover:text-[#141412] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#ff6b35] transition-colors font-semibold text-[#ff6b35]">Upcoming Events</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-[#141412] transition-colors">Competition Guidelines</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#141412] transition-colors font-medium">Participant Portal</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#141412] transition-colors">Community Support</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#141412] tracking-wider uppercase">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#706e6a]">
              <li>
                <Link href="/faq" className="hover:text-[#141412] transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#141412] transition-colors">Refund & Cancellation</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-[#9c9a97] hover:text-[#141412] transition-colors">Admin Desk</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#141412] tracking-wider uppercase">
              Contact Desk
            </h4>
            <div className="space-y-2.5 text-xs text-[#706e6a]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ff6b35] flex-shrink-0 mt-0.5" />
                <span>{EVENT_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
                <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="hover:text-[#141412] transition-colors">
                  {EVENT_CONFIG.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
                <a href={`tel:${EVENT_CONFIG.supportPhone.replace(/\s/g, '')}`} className="hover:text-[#141412] transition-colors">
                  {EVENT_CONFIG.supportPhone}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9c9a97] gap-4">
          <p>© 2026 TKFK — The Knowledge Forum Kerala. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Knowledge</span>
            <span>•</span>
            <span>Community</span>
            <span>•</span>
            <span>Opportunities</span>
          </div>
        </div>

      </div>

      {/* ── MOBILE SHORTENED FOOTER (visible only on mobile screens) ── */}
      <div className="block md:hidden px-5 py-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 border border-[#f0ede8]">
            <Image 
              src="/images/tkfk_logo.png" 
              alt="TKFK Logo" 
              width={30} 
              height={30} 
              className="object-contain"
            />
          </div>
          <div>
            <span className="text-lg font-bold text-[#141412] tracking-tight">
              TKFK
            </span>
            <p className="text-[10px] text-[#ff6b35] font-semibold tracking-wider uppercase">
              The Knowledge Forum Kerala
            </p>
          </div>
        </div>

        {/* Quick Horizontal Links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#706e6a] font-medium">
          <Link href="/" className="hover:text-[#141412] transition-colors">Home</Link>
          <Link href="/register" className="text-[#ff6b35] font-semibold hover:underline">Events</Link>
          <Link href="/login" className="hover:text-[#141412] transition-colors">Portal</Link>
          <Link href="/contact" className="hover:text-[#141412] transition-colors">Contact</Link>
          <Link href="/terms" className="hover:text-[#141412] transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#141412] transition-colors">Privacy</Link>
        </div>

        {/* Support & WhatsApp */}
        <div className="pt-3 border-t border-[#f0ede8] flex items-center justify-between text-xs text-[#706e6a]">
          <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="hover:text-[#141412] truncate max-w-[200px]">
            {EVENT_CONFIG.supportEmail}
          </a>
          <a 
            href={EVENT_CONFIG.whatsAppGroupUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#ff6b35] hover:text-[#e85926] font-semibold flex items-center gap-1"
          >
            <span>WhatsApp Community</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-[#9c9a97] text-center pt-1">
          © 2026 TKFK. All rights reserved.
        </div>
      </div>

    </footer>
  );
};
