'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit contact message');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10 outline-none">
        
        {/* Page Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
            PARTICIPANT SUPPORT
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#141412] tracking-[-0.04em] leading-[1.15]">
            Contact TKFK Secretariat
          </h1>
          <p className="text-sm sm:text-base text-[#706e6a] font-normal leading-relaxed max-w-md mx-auto">
            Have questions regarding registration, contest guidelines, or community activities?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Contact Details Card */}
          <div className="md:col-span-5 bg-[#f0ede8]/60 border border-[#f0ede8] text-[#141412] p-8 rounded-[28px] sm:rounded-[36px] space-y-8 flex flex-col justify-between shadow-2xs">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono font-semibold text-[#9c9a97] uppercase tracking-wider block mb-1">
                  OFFICIAL DIRECTORY
                </span>
                <h3 className="text-xl font-medium text-[#141412] tracking-tight">Contact Information</h3>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-[#706e6a]">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#f0ede8] flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4 text-[#ff6b35]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-semibold text-[#141412] uppercase tracking-wider">Address</span>
                    <span className="leading-relaxed">{EVENT_CONFIG.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#f0ede8] flex items-center justify-center shrink-0 shadow-2xs">
                    <Mail className="w-4 h-4 text-[#ff6b35]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-semibold text-[#141412] uppercase tracking-wider">Email</span>
                    <a href={`mailto:${EVENT_CONFIG.supportEmail}`} className="hover:text-[#ff6b35] transition-colors">
                      {EVENT_CONFIG.supportEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#f0ede8] flex items-center justify-center shrink-0 shadow-2xs">
                    <Phone className="w-4 h-4 text-[#ff6b35]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-[11px] font-semibold text-[#141412] uppercase tracking-wider">Phone</span>
                    <span>{EVENT_CONFIG.supportPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e2ded8] text-xs text-[#9c9a97]">
              Helpdesk Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="md:col-span-7 bg-white p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6">
            
            {errorMsg && (
              <div role="alert" aria-live="assertive" className="p-4 rounded-2xl bg-[#fef2f2] border border-[#fed7d7] text-[#991b1b] text-xs sm:text-sm font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#dc2626] flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-[#eef8f2] text-[#16a34a] rounded-full flex items-center justify-center mx-auto border border-[#cbe8d5]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-[#141412] tracking-tight">Your inquiry was received.</h3>
                <p className="text-xs sm:text-sm text-[#706e6a] max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. A coordinator from our secretariat will review your message and reply via email.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="text-xs font-semibold text-[#ff6b35] hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    Your Name <span className="text-[#ff6b35]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm text-[#141412] placeholder:text-[#9c9a97] outline-none transition-all bg-white"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    Email Address <span className="text-[#ff6b35]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm text-[#141412] placeholder:text-[#9c9a97] outline-none transition-all bg-white"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141412] tracking-wider uppercase mb-1.5">
                    Message <span className="text-[#ff6b35]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2ded8] hover:border-[#c8c4bc] focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 text-sm text-[#141412] placeholder:text-[#9c9a97] outline-none transition-all bg-white resize-y"
                    placeholder="How can our community team help you?"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm sm:text-base shadow-xs hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
