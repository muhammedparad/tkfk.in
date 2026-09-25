'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Participant, Certificate } from '@/types';
import { ShieldCheck, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const idQuery = (params.id as string) || '';

  const [searchCode, setSearchCode] = useState(idQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    certificate?: Certificate;
    participant?: Participant;
  } | null>(null);

  const handleVerify = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verify?code=${encodeURIComponent(queryToSearch.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idQuery) {
      handleVerify(idQuery);
    }
  }, [idQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Certificate & Participant Verification
          </h1>
          <p className="text-xs text-slate-600">
            Verify official registration or certificate authenticity issued by TKFK
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter Participant ID (TKFK26-XXXXXX) or Certificate Code"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="flex-1 px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
          />
          <button
            onClick={() => handleVerify(searchCode)}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-sm transition-all"
          >
            {loading ? 'Searching...' : 'Verify'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            {result.valid && result.participant ? (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        OFFICIALLY VERIFIED
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">Authentic Participant Record</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Participant Name</span>
                    <p className="text-base font-bold text-slate-900 mt-0.5">{result.participant.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Participant ID</span>
                    <p className="text-base font-bold text-emerald-700 font-mono mt-0.5">{result.participant.participant_id}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">State / City</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{result.participant.state} {result.participant.city ? `(${result.participant.city})` : ''}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase">Occupation / Institution</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{result.participant.college || 'General Participant'}</p>
                  </div>
                </div>

                {result.certificate && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Certificate Code:</span>
                      <span className="font-mono font-bold text-slate-900">{result.certificate.certificate_code}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">Verification Hash:</span>
                      <span className="font-mono text-slate-600 text-[11px]">{result.certificate.verification_hash}</span>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center space-y-3 py-4">
                <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Record Not Found</h3>
                <p className="text-xs text-slate-500">
                  The provided query code does not match any confirmed participant or certificate in the TKFK database.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
