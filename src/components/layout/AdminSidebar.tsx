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
  ShieldCheck 
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard Stats', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Live Camera Proctoring', href: '/admin/proctoring', icon: Camera, badge: 'LIVE' },
  { label: 'Participants', href: '/admin/participants', icon: Users },
  { label: 'Payment Status', href: '/admin/payments', icon: CreditCard },
  { label: 'Question Manager', href: '/admin/questions', icon: HelpCircle },
  { label: 'Live Quiz Simulator', href: '/admin/quiz-test', icon: PlayCircle },
  { label: 'Results & Winner Release', href: '/admin/results', icon: Trophy },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
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
      <div className="p-6 border-b border-[#262522] flex items-center gap-3">
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
          <h2 className="font-semibold text-white text-sm tracking-wide">TKFK Admin</h2>
          <p className="text-[11px] text-[#9c9a97]">Academic Control Center</p>
        </div>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#ff6b35] text-white shadow-xs'
                  : 'text-[#9c9a97] hover:bg-[#1f1e1b] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
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
