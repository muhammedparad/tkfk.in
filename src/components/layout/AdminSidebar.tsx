'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  HelpCircle, 
  PlayCircle,
  Camera,
  Trophy, 
  Share2, 
  FileText, 
  Settings,
  LogOut, 
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard Stats', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Live Camera Proctoring', href: '/admin/proctoring', icon: Camera, badge: 'LIVE' },
  { label: 'Participants', href: '/admin/participants', icon: Users, badge: 'SUPER' },
  { label: 'Payment Status', href: '/admin/payments', icon: CreditCard },
  { label: 'Question Manager', href: '/admin/questions', icon: HelpCircle },
  { label: 'Live Quiz Simulator', href: '/admin/quiz-test', icon: PlayCircle },
  { label: 'Results & Winner Release', href: '/admin/results', icon: Trophy },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { label: 'Master System Settings', href: '/admin/settings', icon: SlidersHorizontal, badge: 'CONTROLS' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    router.push('/admin/login');
  };

  return (
    <aside className="w-64 bg-[#141412] text-[#9c9a97] min-h-screen flex flex-col border-r border-[#262522] flex-shrink-0">
      
      {/* Sidebar Header */}
      <div className="p-5 border-b border-[#262522] flex items-center gap-3">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-xs border border-[#33322e]">
          <img 
            src="/tkfk@4x.png" 
            alt="TKFK Logo" 
            width={28} 
            height={28} 
            className="w-full h-full object-contain" 
          />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm tracking-wide">TKFK Admin</h2>
          <p className="text-[11px] text-[#9c9a97]">Academic Control Center</p>
        </div>
      </div>

      {/* Super Admin Status Banner */}
      <div className="px-5 py-2.5 bg-[#1b1a17] border-b border-[#262522] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">SUPER ADMIN</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ONLINE
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#ff6b35] text-white shadow-xs'
                  : 'text-[#9c9a97] hover:bg-[#1f1e1b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  item.badge === 'LIVE'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : item.badge === 'CONTROLS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-[#262522] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-[#1f1e1b] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Invalidate & Logout Session</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-[#9c9a97] hover:text-white px-3 py-2 rounded-xl hover:bg-[#1f1e1b] transition-colors"
        >
          <span>Exit to Public Site</span>
        </Link>
      </div>

    </aside>
  );
};