import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowRight, Globe } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 md:pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 4-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl p-1 flex items-center justify-center">
                <Image 
                  src="/images/tkfk_logo.png" 
                  alt="TKFK Logo" 
                  width={34} 
                  height={34} 
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-wide">
                  TKFK
                </span>
                <p className="text-xs text-blue-400 font-semibold tracking-wide">
                  A KNOWLEDGE COMMUNITY
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-normal">
              A forward-thinking educational ecosystem empowering students, youth, and educators through nationwide quizzes, collaborative cohorts, and verified certificates.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* WhatsApp */}
              <a href="https://whatsapp.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 2c-5.508 0-9.984 4.477-9.984 9.984 0 1.761.458 3.477 1.328 4.989L2 22l5.176-1.355a9.923 9.923 0 0 0 4.855 1.255h.004c5.508 0 9.985-4.477 9.985-9.984 0-2.667-1.039-5.175-2.926-7.062A9.925 9.925 0 0 0 12.031 2zm0 18.281h-.004a8.277 8.277 0 0 1-4.218-1.151l-.303-.18-3.136.822.837-3.056-.197-.314a8.267 8.267 0 0 1-1.266-4.418c0-4.57 3.719-8.289 8.289-8.289 2.215 0 4.297.863 5.863 2.43 1.566 1.566 2.428 3.648 2.428 5.863 0 4.57-3.719 8.293-8.291 8.293z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-400 transition-colors font-semibold text-blue-400">Upcoming Events</Link>
              </li>
              <li>
                <Link href="/study" className="hover:text-blue-400 transition-colors">Learning Resources</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition-colors font-medium">Participant Portal</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-blue-400 transition-colors">Competition Guidelines</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-blue-400 transition-colors">Refund & Cancellation</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-500 hover:text-slate-400 transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Desk */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase">
              Contact Desk
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{EVENT_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="hover:text-white transition-colors">
                  {EVENT_CONFIG.supportEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href={`tel:${EVENT_CONFIG.supportPhone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                  {EVENT_CONFIG.supportPhone}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 TKFK — The Knowledge Community. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Knowledge</span>
            <span>•</span>
            <span>Community</span>
            <span>•</span>
            <span>Opportunities</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
