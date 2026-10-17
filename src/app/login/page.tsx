'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { getCachedParticipantSession, saveParticipantSessionCache, clearParticipantSessionCache } from '@/hooks/useParticipantSession';

export default function LoginPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Automatically redirect if already logged in via persistent cookie/cache
  React.useEffect(() => {
    // If arriving from an explicit logout action, clear state and DO NOT auto-redirect!
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isLoggedOutParam = params.get('logged_out') === '1' || params.get('logout') === 'true';
      const justLoggedOut = sessionStorage.getItem('tkfk_logged_out') === '1';

      if (isLoggedOutParam || justLoggedOut) {
        clearParticipantSessionCache();
        try {
          sessionStorage.removeItem('tkfk_logged_out');
        } catch {}
        setCheckingSession(false);
        return;
      }
    }

    const cached = getCachedParticipantSession();
    if (cached?.isLoggedIn) {
      router.replace('/dashboard');
      return;
    }

    async function checkExistingSession() {
      try {
        const res = await fetch('/api/participant/me', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.participant && data.isConfirmed && !data.isAdmin) {
            saveParticipantSessionCache({
              participant: data.participant,
              registration: data.registration || null
            });
            router.replace('/dashboard');
            return;
          }
        }
      } catch {} finally {
        setCheckingSession(false);
      }
    }
    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!participantId.trim()) {
      setErrorMsg('Please enter your Participant ID (e.g. TKFK26-004821).');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Please enter your registered 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/quiz/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participantId.trim(),
          phone: phone.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials. Participant ID and registered phone number do not match.');
      }

      if (data.participant) {
        saveParticipantSessionCache({
          participant: data.participant,
          registration: data.registration || null
        });
      }

      window.location.href = '/dashboard';

    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 outline-none">
        <div className="max-w-md mx-auto space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-[#f0ede8] text-[#ff6b35] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#f0ede8] shadow-2xs">
              <UserCheck className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[10px] font-semibold tracking-[0.2em] uppercase">
              PORTAL LOGIN
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-[-0.04em]">
              Participant Login
            </h1>
            <p className="text-xs sm:text-sm text-[#706e6a] font-normal leading-relaxed">
              Enter your official Participant ID and registered 10-digit phone number
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6">
            
            {errorMsg && (
              <div 
                id="login-error" 
                role="alert" 
                aria-live="assertive" 
                className="p-4 rounded-2xl bg-[#fef2f2] border border-[#fed7d7] text-[#991b1b] text-xs sm:text-sm font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              <div>
                <label htmlFor="login-pid" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                  Participant ID <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="login-pid"
                  type="text"
                  required
                  autoComplete="username"
                  maxLength={20}
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? "login-error" : undefined}
                  placeholder="e.g. TKFK26-004821"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base outline-none uppercase font-mono tracking-wider text-[#141412] placeholder:text-[#9c9a97] bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="login-phone" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                  Registered Mobile Number <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="login-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  required
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? "login-error" : undefined}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base outline-none text-[#141412] placeholder:text-[#9c9a97] bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full shadow-xs hover:shadow-md transition-all active:scale-[0.99] text-sm sm:text-base disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Log In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="pt-4 border-t border-[#f0ede8] flex items-center justify-between text-xs sm:text-sm text-[#706e6a]">
              <Link href="/register" className="font-medium text-[#ff6b35] hover:underline">
                New Participant? Register
              </Link>
              <Link href="/registration-status" className="font-medium hover:text-[#141412] transition-colors">
                Check Status
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
