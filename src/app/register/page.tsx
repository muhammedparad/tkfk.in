'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowRight, AlertCircle, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { ContestRulesModal } from '@/components/contest/ContestRulesModal';
import { 
  getCachedParticipantSession, 
  clearParticipantSessionCache, 
  saveParticipantSessionCache 
} from '@/hooks/useParticipantSession';
import { safeStorage } from '@/lib/storage';

const INDIAN_STATES = [
  "Select State / UT",
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Other"
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [consent, setConsent] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Auto-redirect if already registered and logged in via cookie/cache
  React.useEffect(() => {
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

      const ref = params.get('ref') || params.get('referral') || params.get('code');
      if (ref) {
        setFormData((prev) => ({ ...prev, referral_code: ref.toUpperCase().trim() }));
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
              registration: data.registration || null,
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    college: '',
    referral_code: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().replace(/[^0-9]/g, '').length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.state || formData.state === 'Select State / UT') {
      setErrorMsg('Please select your State / UT.');
      return;
    }
    if (!consent) {
      setErrorMsg('Please accept the Terms, Rules, and Privacy Policy consent checkbox.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, consent })
      });

      const data = await res.json();

      if (!res.ok && data.status === 'ALREADY_REGISTERED') {
        setErrorMsg(data.message || 'This account is already registered. Please log in.');
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please check your inputs and try again.');
      }

      if (data.participant) {
        safeStorage.setItem('tkfk26_participant', JSON.stringify(data.participant));
      }
      router.push('/payment');

    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 outline-none">
        <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8 my-auto">
          
          {/* Section Header */}
          <div className="text-center space-y-2.5 sm:space-y-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-1.5 border border-[#f0ede8] shadow-soft p-2">
              <img 
                src="/tkfk@4x.png" 
                alt="TKFK Logo" 
                width={43} 
                height={43} 
                className="w-[43px] h-[43px] object-contain" 
              />
            </div>
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              CONTEST ENTRY PASS
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
              Digital Poster Creation Contest 2026
            </h1>
            <p className="text-sm sm:text-base text-[#706e6a] font-normal leading-relaxed max-w-md mx-auto">
              Registration Form • Fixed Entry Pass: <span className="font-semibold text-[#141412]">₹99</span>
            </p>
          </div>

          {/* Quick Contest Highlights Card */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-[#f0ede8]/60 border border-[#f0ede8] space-y-3.5 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-white border border-[#f0ede8] shadow-2xs">
                <span className="text-[10px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider block">First Prize</span>
                <span className="text-base sm:text-lg font-medium text-[#ff6b35]">₹7,001</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#f0ede8] shadow-2xs">
                <span className="text-[10px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider block">Submission Format</span>
                <span className="text-xs sm:text-sm font-medium text-[#141412]">PNG / JPG / PDF</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white border border-[#f0ede8] shadow-2xs">
                <span className="text-[10px] font-mono font-semibold text-[#9c9a97] uppercase tracking-wider block">Recognition</span>
                <span className="text-xs sm:text-sm font-medium text-[#1e6f42]">Verifiable Certificate</span>
              </div>
            </div>
            <p className="text-xs text-[#706e6a] text-center leading-relaxed font-normal">
              Register now to generate your official digital Participant Pass. Detailed themes and portal submission links will be accessible immediately upon confirmed registration.{' '}
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="font-semibold text-[#ff6b35] hover:text-[#e85926] underline underline-offset-2 transition-colors cursor-pointer"
              >
                View Contest Guidelines
              </button>
            </p>

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#fafafb] border border-[#dedad3] text-xs font-semibold text-[#141412] hover:text-[#ff6b35] shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#ff6b35]" />
                <span>View Guidelines & Rules</span>
                <ChevronRight className="w-3 h-3 text-[#9c9a97]" />
              </button>
              <span className="text-[11px] text-[#706e6a] font-normal">
                (Joining contest WhatsApp group is <strong className="text-[#141412] font-semibold">mandatory</strong> upon registration)
              </span>
            </div>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6">
            
            {errorMsg && (
              <div 
                id="register-error" 
                role="alert" 
                aria-live="assertive" 
                className="p-4 rounded-2xl bg-[#fef2f2] border border-[#fed7d7] text-[#991b1b] text-sm font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#dc2626]" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                  Full Name <span className="text-[#ff6b35]">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  aria-invalid={Boolean(errorMsg)}
                  aria-describedby={errorMsg ? "register-error" : undefined}
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base text-[#141412] placeholder:text-[#9c9a97] transition-all bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    Email Address <span className="text-[#ff6b35]">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    maxLength={100}
                    required
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? "register-error" : undefined}
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base text-[#141412] placeholder:text-[#9c9a97] transition-all bg-white outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    Mobile Number <span className="text-[#ff6b35]">*</span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    required
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? "register-error" : undefined}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base text-[#141412] placeholder:text-[#9c9a97] transition-all bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-state" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    State <span className="text-[#ff6b35]">*</span>
                  </label>
                  <select
                    id="reg-state"
                    required
                    autoComplete="address-level1"
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? "register-error" : undefined}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base text-[#141412] bg-white transition-all outline-none"
                  >
                    {INDIAN_STATES.map((s, idx) => (
                      <option key={s} value={idx === 0 ? '' : s} disabled={idx === 0}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-city" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    City / Town
                  </label>
                  <input
                    id="reg-city"
                    type="text"
                    autoComplete="address-level2"
                    maxLength={100}
                    placeholder="e.g. Thiruvananthapuram"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base text-[#141412] placeholder:text-[#9c9a97] transition-all bg-white outline-none"
                  />
                </div>
              </div>


              <div>
                <label htmlFor="reg-referral" className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                  Referral Code <span className="text-[#9c9a97] font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="reg-referral"
                  type="text"
                  maxLength={30}
                  placeholder="e.g. TKFK100 (if you have one)"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm sm:text-base uppercase font-mono tracking-wider text-[#141412] placeholder:text-[#9c9a97] transition-all bg-white outline-none"
                />
              </div>

              {/* Consent & Rules Checkbox */}
              <div className="pt-2">
                <label htmlFor="reg-consent" className="flex items-start gap-3 text-xs sm:text-sm text-[#706e6a] leading-relaxed cursor-pointer select-none">
                  <input
                    id="reg-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[#e2ded8] text-[#ff6b35] focus:ring-[#ff6b35] focus:ring-offset-0 cursor-pointer"
                  />
                  <span>
                    I agree to the <Link href="/rules" className="text-[#ff6b35] underline font-medium">Competition Rules</Link>, <Link href="/terms" className="text-[#ff6b35] underline font-medium">Terms of Use</Link>, and <Link href="/privacy" className="text-[#ff6b35] underline font-medium">Privacy Policy</Link>, and confirm that I am of eligible age or have guardian consent to participate.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full shadow-xs hover:shadow-md transition-all active:scale-[0.99] text-sm sm:text-base disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Processing Registration...</span>
                  ) : (
                    <>
                      <span>Proceed to Payment (₹99)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="pt-4 border-t border-[#f0ede8] flex items-center justify-between text-xs sm:text-sm text-[#706e6a]">
              <span>Official Registration Portal</span>
              <Link href="/login" className="font-medium text-[#ff6b35] hover:underline">
                Already registered? Login
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* Official Contest Rules Modal (Pre-registration view: WhatsApp group joining locked until registered) */}
      <ContestRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        allowGroupJoin={false}
        defaultView="brief"
      />

      <Footer />
    </div>
  );
}
