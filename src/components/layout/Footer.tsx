import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 text-slate-600 pt-8 md:pt-14 pb-6 md:pb-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Desktop: full 4-column grid ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          
          {/* Col 1: Organizer Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-200 p-1 flex items-center justify-center">
                <Image 
                  src="/images/tkfk_logo.png" 
                  alt="TKFK Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-slate-900 tracking-wide">TKFK <span className="text-[#00966b]">2026</span></span>
                <p className="text-xs text-slate-500 font-medium">The Knowledge Forum Kerala</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organized by {EVENT_CONFIG.organizer} on the occasion of Gandhi Jayanti on 2 October 2026. Empowering citizens across India with Gandhian philosophy, history, and values.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">Event Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-700 transition-colors">Home Landing Page</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-700 transition-colors font-semibold text-emerald-700">Online Registration</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-emerald-700 transition-colors">Competition Rules & Guidelines</Link>
              </li>
              <li>
                <Link href="/registration-status" className="hover:text-emerald-700 transition-colors">Check Registration Status</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">Policies & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-emerald-700 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-700 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-emerald-700 transition-colors">Refund & Cancellation Policy</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-700 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-700 transition-colors">Contact Support Desk</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-slate-400 hover:text-slate-600 transition-colors">Admin Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 tracking-wider uppercase">Organizer Contact</h4>
            <div className="space-y-2.5 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{EVENT_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{EVENT_CONFIG.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{EVENT_CONFIG.supportPhone}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Mobile: compact footer ── */}
        <div className="md:hidden pb-6 border-b border-slate-200 space-y-4 text-center">
          {/* Brand row */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg shadow-xs border border-slate-200 p-0.5 flex items-center justify-center">
              <Image 
                src="/images/tkfk_logo.png" 
                alt="TKFK Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <span className="text-base font-bold text-slate-900">TKFK <span className="text-[#00966b]">2026</span></span>
              <p className="text-[10px] text-slate-500 font-medium">The Knowledge Forum Kerala</p>
            </div>
          </div>

          {/* Contact row — compact inline */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
            <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="flex items-center gap-1 hover:text-emerald-700">
              <Mail className="w-3 h-3 text-emerald-600" />
              <span>{EVENT_CONFIG.supportEmail}</span>
            </a>
            <a href={`tel:${EVENT_CONFIG.supportPhone.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:text-emerald-700">
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{EVENT_CONFIG.supportPhone}</span>
            </a>
          </div>

          {/* Key links — single row */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
            <Link href="/terms" className="text-slate-400 hover:text-emerald-700">Terms</Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="text-slate-400 hover:text-emerald-700">Privacy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/refund" className="text-slate-400 hover:text-emerald-700">Refund</Link>
            <span className="text-slate-300">·</span>
            <Link href="/contact" className="text-slate-400 hover:text-emerald-700">Contact</Link>
            <span className="text-slate-300">·</span>
            <Link href="/faq" className="text-slate-400 hover:text-emerald-700">FAQ</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 md:pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] md:text-xs text-slate-400 gap-2 md:gap-4">
          <p>© 2026 {EVENT_CONFIG.organizer}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Event Date: 2 October 2026</span>
            <span>•</span>
            <span className="font-semibold text-emerald-700">Registration Open</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
