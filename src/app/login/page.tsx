'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      router.push('/dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-16 px-4 sm:px-6 lg:px-8 outline-none">
        <div className="max-w-md mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
              <UserCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Participant Login
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Enter your official Participant ID and registered 10-digit phone number
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            
            {errorMsg && (
              <div 
                id="login-error" 
                role="alert" 
                aria-live="assertive" 
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              <div>
                <label htmlFor="login-pid" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Participant ID <span className="text-rose-500">*</span>
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base outline-none uppercase font-mono tracking-wider bg-white transition-all"
                />
              </div>

              <div>
                <label htmlFor="login-phone" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Registered Phone Number <span className="text-rose-500">*</span>
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base outline-none bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg transition-all text-sm sm:text-base disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Log In to Dashboard</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
              <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
                New Participant? Register
              </Link>
              <Link href="/registration-status" className="font-medium hover:underline text-slate-600">
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
