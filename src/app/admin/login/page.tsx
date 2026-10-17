'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, KeyRound, Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid admin credentials. Access denied.');
      }

      router.push('/admin/dashboard');

    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141412] px-4 font-sans antialiased text-white selection:bg-[#ff6b35]/30">
      <div className="max-w-md w-full bg-[#1a1916] p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#262522] shadow-2xl space-y-6">
        
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#262522] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#33322e] p-2.5 shadow-soft">
            <img 
              src="/tkfk@4x.png" 
              alt="TKFK Logo" 
              width={48} 
              height={48} 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#262522] text-[#ff6b35] text-[10px] font-semibold tracking-[0.2em] uppercase">
            ADMINISTRATOR ACCESS
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white">TKFK Admin Portal</h1>
          <p className="text-xs text-[#9c9a97]">Role-Based Administrator Authentication</p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-[#fef2f2]/10 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#9c9a97] uppercase tracking-wider mb-2">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#141412] border border-[#262522] text-white text-sm focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none placeholder:text-[#646360] transition-all"
              />
              <Mail className="w-4 h-4 text-[#646360] absolute right-4 top-4" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9c9a97] uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#141412] border border-[#262522] text-white text-sm focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 outline-none placeholder:text-[#646360] transition-all"
              />
              <KeyRound className="w-4 h-4 text-[#646360] absolute right-4 top-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full shadow-xs text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#262522] text-center">
          <Link href="/" className="text-xs text-[#9c9a97] hover:text-white transition-colors">
            ← Return to Public Homepage
          </Link>
        </div>

      </div>
    </div>
  );
}
