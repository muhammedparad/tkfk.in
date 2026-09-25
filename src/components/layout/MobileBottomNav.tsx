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
  Menu as MenuIcon, 
  ArrowRight,
  UserCheck
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

  // Dispatch custom event to trigger accessible mobile header drawer
  const handleToggleMenu = () => {
    window.dispatchEvent(new Event('toggle-mobile-menu'));
  };

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
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-full px-3 py-1.5 max-w-md mx-auto flex items-center justify-around text-white">
          {PARTICIPANT_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                  isActive
                    ? 'text-emerald-400 font-bold bg-slate-800/80'
                    : 'text-slate-400 font-medium hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs tracking-tight mt-0.5 font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  // PUBLIC CONTEXTUAL NAVIGATION BAR: Menu Toggle + Primary Register CTA
  return (
    <nav 
      aria-label="Mobile Public Navigation"
      className="md:hidden fixed bottom-3 left-3 right-3 z-50 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-full px-3.5 py-2 max-w-sm mx-auto flex items-center justify-between gap-2">
        <button
          onClick={handleToggleMenu}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-200 hover:text-white font-bold text-sm bg-slate-800/80 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400"
          aria-label="Toggle navigation menu drawer"
        >
          <MenuIcon className="w-4 h-4 text-emerald-400" />
          <span>Menu</span>
        </button>

        {pathname === '/register' ? (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-full text-sm shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <UserCheck className="w-4 h-4" />
            <span>Login</span>
          </Link>
        ) : (
          <Link
            href="/register"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4.5 py-2 rounded-full text-sm shadow-md transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <span>Register (₹99)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </nav>
  );
};
