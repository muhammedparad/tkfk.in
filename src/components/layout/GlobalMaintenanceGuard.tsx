'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Wrench, ShieldAlert, MessageCircle, Phone, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

interface SiteSettings {
  maintenance_mode?: boolean;
  portal_maintenance_message?: string;
  support_phone?: string;
  support_email?: string;
  contest_whatsapp_url?: string;
  community_whatsapp_url?: string;
}

export const GlobalMaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Admin routes ALWAYS bypass global maintenance mode so administrators can manage the platform
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/api/admin');

  useEffect(() => {
    if (isAdminRoute) {
      setIsChecking(false);
      return;
    }

    let isMounted = true;

    async function checkMaintenance() {
      try {
        const res = await fetch(`/api/site-settings?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        // Fallback gracefully on network error
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    checkMaintenance();

    // Re-check periodically every 20 seconds so maintenance mode toggle is picked up dynamically
    const interval = setInterval(checkMaintenance, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname, isAdminRoute]);

  // If this is an admin route, always render normal children
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // While checking settings on initial load, show a neutral loading state — not the real content
  // This prevents any flash of the actual page before the maintenance check completes
  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#ece8e1] border-t-[#ff6b35] animate-spin" />
          <span className="text-xs text-[#9c9a97] font-mono">Loading…</span>
        </div>
      </div>
    );
  }

  // If maintenance mode is active, block everything and show the Emergency Maintenance Screen
  if (settings?.maintenance_mode) {
    const whatsappUrl = settings.contest_whatsapp_url || settings.community_whatsapp_url || 'https://chat.whatsapp.com/KMtL6c6cIwH6tG0L0lGypW';
    const supportPhone = settings.support_phone || '+91 97782 19793';
    const supportEmail = settings.support_email || 'theknowledgeforumkerala@gmail.com';
    const maintenanceMsg = settings.portal_maintenance_message || 
      'The Knowledge Forum Kerala (TKFK) platform is currently undergoing scheduled platform upgrades and maintenance. All active records and participant passes are safe.';

    return (
      <div className="min-h-screen bg-[#f8f5f0] text-[#141412] flex flex-col justify-between selection:bg-[#ff6b35]/20 font-sans">
        
        {/* Top Header Bar */}
        <header className="w-full border-b border-[#ece8e1] bg-white/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#e5e0d8] flex items-center justify-center p-1 shadow-2xs">
                <img src="/tkfk@4x.png" alt="TKFK Logo" width={24} height={24} className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-[#141412] tracking-tight text-sm">TKFK Platform</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Emergency Maintenance Active</span>
            </div>
          </div>
        </header>

        {/* Central Maintenance Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-xl w-full bg-white rounded-[32px] border border-[#ece8e1] shadow-2xl p-8 sm:p-12 text-center space-y-7 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-[#ea580c] flex items-center justify-center mx-auto shadow-inner">
              <Wrench className="w-10 h-10 animate-bounce duration-1000" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#141412] text-white text-[10px] font-mono font-black tracking-widest uppercase">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>SYSTEM NOTICE</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#141412] tracking-tight">
                Platform Under Scheduled Maintenance
              </h1>
              <p className="text-xs sm:text-sm text-[#706e6a] leading-relaxed max-w-md mx-auto">
                {maintenanceMsg}
              </p>
            </div>

            {/* Quick Actions & Support Desks */}
            <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ece8e1] space-y-3 text-left">
              <p className="text-[11px] font-black uppercase text-[#141412] tracking-wider">
                Need Immediate Help or Contest Inquiries?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#075E54] text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                  <span className="truncate">Official WhatsApp Desk</span>
                </a>

                <a
                  href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white hover:bg-slate-50 border border-[#ece8e1] text-[#141412] text-xs font-bold transition-all shadow-2xs"
                >
                  <Phone className="w-4 h-4 text-[#ff6b35] flex-shrink-0" />
                  <span className="truncate">{supportPhone}</span>
                </a>
              </div>

              <div className="pt-2 border-t border-[#ece8e1] flex items-center justify-between text-[11px] text-[#706e6a]">
                <span>Email Support:</span>
                <a href={`mailto:${supportEmail}`} className="font-mono font-bold text-[#141412] hover:underline">
                  {supportEmail}
                </a>
              </div>
            </div>

            {/* Administrator Bypass Link */}
            <div className="pt-2 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#706e6a] hover:text-[#ff6b35] transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Administrator Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-[#ece8e1] bg-white/60 py-4 px-6 text-center text-xs text-[#9c9a97]">
          <span>&copy; {new Date().getFullYear()} The Knowledge Forum Kerala (TKFK). All rights reserved.</span>
        </footer>

      </div>
    );
  }

  // Normal flow
  return <>{children}</>;
};