'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EVENT_CONFIG } from '@/lib/config';
import { Participant, Registration, PaymentStatus, RegistrationStatus } from '@/types';
import { 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  Clock
} from 'lucide-react';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentStatus>('PENDING');

  // Razorpay Gateway Order State
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const amount = EVENT_CONFIG.registrationFee || 99;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function initPaymentDesk() {
      try {
        const res = await fetch('/api/participant/me');
        const data = await res.json();

        if (res.ok && data.participant) {
          setParticipant(data.participant);
          const reg: Registration = data.registration || {
            id: data.participant.id,
            participant_id: data.participant.id,
            registration_status: (data.participant.status === 'ACTIVE' ? 'CONFIRMED' : (data.participant.status || 'PENDING')) as RegistrationStatus,
            payment_status: 'PENDING' as PaymentStatus,
            amount: amount,
            currency: 'INR',
            created_at: data.participant.created_at || new Date().toISOString()
          };
          setRegistration(reg);
          setPaymentState(reg.payment_status);
          localStorage.setItem('tkfk26_participant', JSON.stringify(data.participant));

          if (reg.payment_status === 'PENDING') {
            await createRazorpayOrder(reg.id);
          }
        } else {
          // Fallback to saved participant in localStorage
          const saved = localStorage.getItem('tkfk26_participant') || localStorage.getItem('gkc26_participant');
          if (saved) {
            try {
              const p = JSON.parse(saved);
              setParticipant(p);
              const reg: Registration = {
                id: p.id,
                participant_id: p.id,
                registration_status: (p.status === 'ACTIVE' ? 'CONFIRMED' : (p.status || 'PENDING')) as RegistrationStatus,
                payment_status: 'PENDING' as PaymentStatus,
                amount: amount,
                currency: 'INR',
                created_at: p.created_at || new Date().toISOString()
              };
              setRegistration(reg);
              await createRazorpayOrder(reg.id);
            } catch {
              router.push('/register');
            }
          } else {
            router.push('/register');
          }
        }
      } catch (err) {
        console.error('Error initializing payment desk:', err);
        setOrderError('Unable to connect to payment system.');
      } finally {
        setLoading(false);
      }
    }

    async function createRazorpayOrder(registrationId: string) {
      try {
        const res = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registrationId })
        });
        const data = await res.json();

        if (res.ok && data.success && data.order) {
          setOrderData({
            orderId: data.order.orderId,
            amount: data.order.amount || amount,
            currency: data.order.currency || 'INR',
            keyId: data.order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
          });
          loadRazorpayScript();
        } else {
          setOrderError(data.error || 'Payment gateway initialization pending.');
        }
      } catch (err: any) {
        setOrderError('Payment service unavailable.');
      }
    }

    loadRazorpayScript();
    initPaymentDesk();

    // Poll status periodically if status is PENDING
    intervalId = setInterval(async () => {
      try {
        const res = await fetch('/api/payment/status');
        if (res.ok) {
          const data = await res.json();
          if (data.payment_status) {
            setPaymentState(data.payment_status);
          }
        }
      } catch {}
    }, 10000);

    return () => clearInterval(intervalId);
  }, [router, amount]);

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-sdk')) return;
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleLaunchRazorpay = () => {
    if (!orderData || !participant || !registration) return;

    if (!(window as any).Razorpay) {
      loadRazorpayScript();
      alert('Payment SDK is loading... Please try again in 3 seconds.');
      return;
    }

    setProcessingPayment(true);

    const options = {
      key: orderData.keyId,
      amount: Math.round(orderData.amount * 100),
      currency: orderData.currency,
      name: 'TKFK Gandhi Knowledge Challenge',
      description: `Registration Fee Payment`,
      image: '/images/tkfk_logo.png',
      order_id: orderData.orderId,
      prefill: {
        name: participant.name,
        email: participant.email,
        contact: participant.phone
      },
      theme: {
        color: '#059669' // Emerald theme
      },
      handler: async function (response: any) {
        setProcessingPayment(false);
        setVerifyingPayment(true);

        try {
          let verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              registrationId: registration.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          let verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registrationId: registration.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            verifyData = await verifyRes.json();
          }

          if (verifyRes.ok && verifyData.success) {
            setPaymentState('SUCCESS');
          } else {
            alert(verifyData.error || 'Payment verification failed.');
          }
        } catch (err) {
          alert('Error communicating with payment server.');
        } finally {
          setVerifyingPayment(false);
        }
      },
      modal: {
        ondismiss: function () {
          setProcessingPayment(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      setProcessingPayment(false);
      alert(response.error?.description || 'Payment failed. Please try again.');
    });
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-xs sm:text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading Payment Details...</span>
        </div>
      </div>
    );
  }

  if (!participant || !registration) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md text-center max-w-md w-full space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Registration Required</h2>
            <p className="text-xs text-slate-600">Please complete registration before proceeding to payment.</p>
            <Link href="/register" className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-full text-xs font-bold shadow-md">
              Go to Registration Form →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // State 1: Payment Already Confirmed / SUCCESS
  if (paymentState === 'SUCCESS') {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6 w-full">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Payment Completed
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Registration Confirmed!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your payment has been successfully completed. Your registration is active and confirmed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Participant Name:</span>
                <span className="font-bold text-slate-900">{participant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">ACTIVE & CONFIRMED</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-md transition-all active:scale-95"
              >
                <span>Enter Participant Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Main View for Pending Payment
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-grow py-6 sm:py-12 px-3 sm:px-6 lg:px-8 outline-none">
        <div className="max-w-xl mx-auto space-y-5">
          
          <div className="text-center space-y-1.5">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Payment
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Complete Your Payment</h1>
            <p className="text-xs text-slate-600">Safe & Secure Online Payment</p>
          </div>

          <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl space-y-6">
            
            {/* Participant Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Participant Name:</span>
                <span className="font-bold text-slate-900">{participant.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Event:</span>
                <span className="font-semibold text-slate-700">TKFK Gandhi Knowledge Challenge 2026</span>
              </div>
            </div>

            {/* CASE 1: Payment Order Ready */}
            {orderData ? (
              <div className="space-y-5 pt-2 border-t border-slate-100">
                <div className="p-4 rounded-2xl bg-[#edf8f3] border border-[#d1f2e4] text-[#0f172a] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00835d] uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#00835d]" />
                      <span>Online Payment Options</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    Pay securely via Google Pay, PhonePe, Paytm, BHIM, UPI, Credit/Debit Cards, or NetBanking.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLaunchRazorpay}
                    disabled={processingPayment || verifyingPayment}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all text-sm sm:text-base disabled:opacity-50 active:scale-[0.99]"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Opening Checkout...</span>
                      </>
                    ) : verifyingPayment ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Verifying Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Proceed to Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-bit Secure Encrypted Payment</span>
                </div>
              </div>
            ) : (
              /* CASE 2: Gateway Pending */
              <div className="space-y-5 pt-2 border-t border-slate-100">
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-sm sm:text-base">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Payment Options Loading</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Online payment service is initializing. Your registration details are saved safely.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/dashboard"
                    className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl text-xs shadow-sm transition-all"
                  >
                    Go to Participant Dashboard
                  </Link>
                  <Link
                    href="/contact"
                    className="w-full text-center bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl text-xs border border-slate-300 transition-all"
                  >
                    Contact Support Desk
                  </Link>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
