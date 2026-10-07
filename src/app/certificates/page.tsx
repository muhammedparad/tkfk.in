'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CertificateCanvas } from '@/components/ui/CertificateCanvas';
import { Participant } from '@/types';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Share2, 
  ShieldCheck, 
  ArrowRight,
  Phone,
  RotateCcw
} from 'lucide-react';

function CertificatesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('id') || searchParams.get('phone') || searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [result, setResult] = useState<{
    success: boolean;
    eligible?: boolean;
    participant?: Partial<Participant> & { participant_id: string; name: string };
    registration?: any;
    message?: string;
  } | null>(null);

  const fetchCertificate = async (queryStr: string) => {
    const clean = queryStr.trim();
    if (!clean) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/certificates?id=${encodeURIComponent(clean)}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Lookup error:', err);
      setResult({
        success: false,
        message: 'Could not connect to the verification server. Please check your internet connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      fetchCertificate(initialQuery.trim());
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/certificates?id=${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
      fetchCertificate(searchQuery.trim());
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setResult(null);
    setSearched(false);
    router.push('/certificates');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-10">
        
        {/* Header Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Official Certificate Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Download Your <span className="text-[#00966b]">Certificate</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            All registered participants with confirmed payment can download their official <strong>Certificate of Participation</strong> for the <strong>TKFK Gandhi Knowledge Challenge 2026</strong>.
          </p>
        </div>

        {/* Search / Lookup Box */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white p-3 sm:p-5 rounded-3xl border border-slate-200 shadow-xl space-y-3">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative w-full flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Participant ID (e.g. TKFK26-680020) or Phone"
                  className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base font-semibold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#00966b] hover:bg-[#00835d] text-white px-7 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Get Certificate</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {searched && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 px-1">
              <span>💡 Enter your 10-digit mobile number if you don&apos;t remember your ID.</span>
              <span className="font-semibold text-emerald-700">Payment verified download</span>
            </div>
          </div>
        </div>

        {/* Results / Certificate Display Section */}
        {result && (
          <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
            {result.success && result.eligible && result.participant ? (
              <div className="space-y-6">
                
                {/* Certificate Canvas Preview & Download */}
                <CertificateCanvas 
                  participant={result.participant} 
                />

                {/* Participant Details Summary Card */}
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Participant & Issue Credentials</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Participant ID</span>
                      <span className="text-sm font-extrabold text-emerald-700 font-mono mt-0.5 block">{result.participant.participant_id}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Participant Name</span>
                      <span className="text-sm font-bold text-slate-900 mt-0.5 block truncate">{result.participant.name}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Payment Status</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SUCCESS (₹99)</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 font-bold block uppercase text-[10px]">Event Conducted</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block">2 October 2026</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : result.success && result.participant && !result.eligible ? (
              /* Participant found but payment not SUCCESS */
              <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">Payment Confirmation Required</h3>
                  <p className="text-sm text-slate-600">
                    Registration record found for <strong>{result.participant.name}</strong> ({result.participant.participant_id}), but the payment status is currently not marked as confirmed.
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl text-xs text-amber-900 text-left space-y-2">
                  <p>
                    • If you already made the ₹99 payment, your transaction might still be verifying.
                  </p>
                  <p>
                    • Please contact the TKFK helpdesk with your payment screenshot or Razorpay Payment ID to activate your certificate.
                  </p>
                </div>
                <div className="pt-2 flex justify-center">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-[#00966b] text-white px-6 py-3 rounded-full font-bold text-xs hover:bg-[#00835d] transition-all shadow-sm"
                  >
                    <span>Contact Support Helpdesk</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Record Not Found */
              <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">Record Not Found</h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {result.message || 'No registered participant was found matching your search query. Please double-check the Participant ID or phone number.'}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Try Another Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Helpful Info & Verification Guidelines */}
        <div className="max-w-3xl mx-auto pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900">High-Resolution Quality</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Certificates are generated at ultra-sharp 2560×1809 master resolution suitable for framing or high-quality printing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-xs font-bold text-slate-900">1-Tap Mobile Save</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Use &ldquo;Save to Photos / Share&rdquo; or press and hold the certificate on your phone to save straight to your gallery.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900">Official Authenticity</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Issued and certified by The Knowledge Forum Kerala (TKFK) for the 2026 Gandhi Knowledge Challenge.
            </p>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        Loading Certificates Portal...
      </div>
    }>
      <CertificatesContent />
    </Suspense>
  );
}
