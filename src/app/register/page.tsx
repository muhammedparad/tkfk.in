'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserCheck, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState('');
  const [consent, setConsent] = useState(false);

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
        localStorage.setItem('tkfk26_participant', JSON.stringify(data.participant));
        router.push('/payment');
      } else {
        router.push('/payment');
      }

    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-6 sm:py-12 px-3 sm:px-6 lg:px-8 outline-none">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-6 space-y-2">
            <span className="text-xs font-extrabold tracking-widest text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full uppercase">
              Online Registration — Open to All
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              TKFK Gandhi Knowledge Challenge 2026
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Fee: <span className="font-bold text-slate-900">₹99</span> • Quiz Date: <span className="font-bold text-slate-900">2 October 2026</span>
            </p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-md space-y-5">
            
            {errorMsg && (
              <div 
                id="register-error" 
                role="alert" 
                aria-live="assertive" 
                className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm sm:text-base font-medium flex items-center gap-2.5"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label htmlFor="reg-name" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base transition-all bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base transition-all bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base transition-all bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-state" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="reg-state"
                    required
                    autoComplete="address-level1"
                    aria-invalid={Boolean(errorMsg)}
                    aria-describedby={errorMsg ? "register-error" : undefined}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base bg-white transition-all"
                  >
                    {INDIAN_STATES.map((s, idx) => (
                      <option key={s} value={idx === 0 ? '' : s} disabled={idx === 0}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-city" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-college" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institution / College <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  id="reg-college"
                  type="text"
                  autoComplete="organization"
                  maxLength={150}
                  placeholder="e.g. ABC College / School / Organization"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 text-sm sm:text-base transition-all bg-white"
                />
              </div>


              {/* Consent & Age Checkbox */}
              <div className="pt-2">
                <label htmlFor="reg-consent" className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed cursor-pointer select-none">
                  <input
                    id="reg-consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                  />
                  <span>
                    I confirm that I agree to the <Link href="/rules" className="text-emerald-700 underline font-semibold">Competition Rules</Link>, <Link href="/terms" className="text-emerald-700 underline font-semibold">Terms of Use</Link>, and <Link href="/privacy" className="text-emerald-700 underline font-semibold">Privacy Policy</Link>, and confirm that I am of eligible age or have parental/guardian consent to participate.
                  </span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all text-sm sm:text-base disabled:opacity-50 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <span>Processing Registration...</span>
                  ) : (
                    <>
                      <span>Proceed to Payment (₹99)</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span className="text-slate-500">Official Registration Portal</span>
              <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
                Already registered? Login
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
