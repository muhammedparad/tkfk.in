import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#f8f5f0] text-[#706e6a] border-t border-[#f0ede8] kairu-grid-bg">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-16 pb-12">
        
        {/* Main Footer Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#f0ede8] items-start">
          
          {/* Col 1: Brand & Promise */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#141412] text-white flex items-center justify-center p-1.5 shadow-2xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="m9 9 6 6" />
                  <path d="m15 9-6 6" />
                </svg>
              </div>
              <span className="font-bold text-xl text-[#141412] tracking-tight">
                TKFK
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-md font-normal">
              The complete ecosystem for building digital student portfolios, participating in national challenges, and earning verified credentials.
            </p>

            <div className="pt-2">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium text-xs tracking-wide shadow-xs hover:shadow-md hover:shadow-[#ff6b35]/25 active:scale-95 transition-all duration-200"
              >
                <span>Get access for ₹99</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white/30 transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-[#141412] uppercase tracking-wider">
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
            <h4 className="text-xs font-bold text-[#141412] uppercase tracking-wider">
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
