'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  User, 
  HelpCircle,
  FileText,
  UserCheck,
  UserPlus
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  // Hide mobile bottom navigation bar during active quiz taking or admin view
  if (pathname === '/quiz' || pathname.startsWith('/admin')) {
    return null;
  }

  // Check if current route is a logged-in participant route
  const isParticipantRoute = 
    pathname.startsWith('/dashboard') ||
    pathname === '/quiz-rules' ||
    pathname === '/quiz-completed' ||
    pathname === '/registration-success' ||
    pathname === '/registration-status' ||
    pathname === '/results';

  if (isParticipantRoute) {
    const PARTICIPANT_ITEMS = [
      { label: 'Home', href: '/dashboard', icon: Home },
      { label: 'Study', href: '/study', icon: BookOpen },
      { label: 'Quiz', href: '/quiz-rules', icon: Award },
      { label: 'Results', href: '/results', icon: CheckCircle2 },
      { label: 'Account', href: '/registration-status', icon: User },
    ];

    return (
      <nav 
        aria-label="Mobile Participant Navigation"
        className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-2 py-1.5 max-w-md mx-auto flex items-center justify-around text-slate-800">
          {PARTICIPANT_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-full transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                  isActive
                    ? 'text-emerald-700 font-bold bg-emerald-50'
                    : 'text-slate-600 font-medium hover:text-emerald-600'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-emerald-600' : 'text-slate-500'}`} />
                <span className="text-[11px] tracking-tight mt-0.5 font-semibold whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // PUBLIC MENU TAB BAR: 4 direct navigation buttons (Home, Rules, FAQ, Login)
  const PUBLIC_ITEMS = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Rules', href: '/rules', icon: FileText },
    { label: 'FAQ', href: '/faq', icon: HelpCircle },
    { label: 'Login', href: '/login', icon: UserCheck },
  ];

  return (
    <nav 
      aria-label="Mobile Public Navigation"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-3 py-1.5 max-w-sm mx-auto flex items-center justify-around text-slate-800">
        {PUBLIC_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-0.5 px-3 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-600 group"
            >
              <div className={`p-1.5 rounded-full transition-all ${
                isActive ? 'bg-emerald-100/80 text-emerald-700' : 'text-slate-500 group-hover:text-emerald-600'
              }`}>
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-emerald-700' : 'text-slate-500'}`} />
              </div>
              <span className={`text-[11px] tracking-tight mt-0.5 whitespace-nowrap ${
                isActive ? 'font-bold text-emerald-700' : 'font-medium text-slate-600'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

