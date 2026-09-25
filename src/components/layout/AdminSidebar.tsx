'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  HelpCircle, 
  Trophy, 
  Share2, 
  FileText, 
  Settings,
  LogOut,
  ShieldCheck 
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard Stats', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Participants', href: '/admin/participants', icon: Users },
  { label: 'Payment Status', href: '/admin/payments', icon: CreditCard },
  { label: 'Question Manager', href: '/admin/questions', icon: HelpCircle },
  { label: 'Results & Winner Release', href: '/admin/results', icon: Trophy },
  { label: 'Referral Analytics', href: '/admin/referrals', icon: Share2 },
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
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 flex-shrink-0">
      
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-white text-sm tracking-wide">TKFK26 Admin</h2>
          <p className="text-[11px] text-slate-400">TKFK Control Center</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Invalidate & Logout Session</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <span>Exit to Public Site</span>
        </Link>
      </div>

    </aside>
  );
};
