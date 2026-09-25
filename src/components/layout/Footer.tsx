import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';
import { EVENT_CONFIG } from '@/lib/config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Organizer Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                <Image 
                  src="/images/tkfk_logo.png" 
                  alt="TKFK Logo" 
                  width={36} 
                  height={36} 
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-wide">TKFK <span className="text-emerald-500">2026</span></span>
                <p className="text-xs text-gray-400 font-medium">The Knowledge Forum Kerala</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Organized by {EVENT_CONFIG.organizer} on the occasion of Gandhi Jayanti on 2 October 2026. Empowering citizens across India with Gandhian philosophy, history, and values.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Event Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">Home Landing Page</Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">Online Registration (₹99)</Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-emerald-400 transition-colors">Competition Rules & Guidelines</Link>
              </li>
              <li>
                <Link href="/registration-status" className="hover:text-emerald-400 transition-colors">Check Registration Status</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policy & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Policies & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-emerald-400 transition-colors">Refund & Cancellation Policy</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support Desk</Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gray-500 hover:text-gray-300 transition-colors">Admin Portal Login</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Organizer Contact</h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{EVENT_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{EVENT_CONFIG.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{EVENT_CONFIG.supportPhone}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 {EVENT_CONFIG.organizer}. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Event Date: 2 October 2026</span>
            <span>•</span>
            <span>Registration Fee: ₹99</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
