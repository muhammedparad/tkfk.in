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
  Info,
  XCircle,
  FileText,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { saveParticipantSessionCache } from '@/hooks/useParticipantSession';
import { safeStorage } from '@/lib/storage';
import { ContestRulesModal } from '@/components/contest/ContestRulesModal';

export type UiPaymentMode = 'PROVIDER' | 'MOCK' | 'DISABLED' | 'LOADING';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentStatus>('PENDING');
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Payment System Mode & Config
  const [paymentMode, setPaymentMode] = useState<UiPaymentMode>('LOADING');
  const [modeReason, setModeReason] = useState<string>('');

  // Razorpay Gateway Order State (Only used when mode === 'PROVIDER')
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const initializeOrderForMode = React.useCallback(async (registrationId: string) => {
    try {
      setPaymentMode('LOADING');
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId })
      });
      const orderJson = await orderRes.json();

      if (orderRes.status === 503 || orderJson.mode === 'DISABLED') {
        setPaymentMode('DISABLED');
        setModeReason(orderJson.error || 'Online payment is temporarily unavailable. Please try again later.');
        return;
      }

      if (orderJson.mode === 'MOCK') {
        setPaymentMode('MOCK');
        setOrderData({
          orderId: orderJson.order_id || orderJson.order?.orderId || 'order_mock',
          amount: 99,
          currency: 'INR',
          keyId: 'mock_key_id'
        });
        return;
      }

      if (orderRes.ok && orderJson.success) {
        const keyId = orderJson.key_id || orderJson.order?.keyId;
        const orderId = orderJson.order_id || orderJson.id || orderJson.order?.orderId;

        if (!keyId || keyId === 'mock_key_id' || !orderId) {
          setPaymentMode('DISABLED');
          setModeReason('Online payment configuration unavailable.');
          return;
        }

        setPaymentMode('PROVIDER');
        setOrderData({
          orderId,
          amount: orderJson.amount || 99,
          currency: orderJson.currency || 'INR',
          keyId
        });
        loadRazorpayScript();
      } else {
        setPaymentMode('DISABLED');
        setModeReason(orderJson.error || 'Online payment is temporarily unavailable.');
      }
    } catch (err) {
      setPaymentMode('DISABLED');
      setModeReason('Payment service network error.');
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function initPaymentDesk() {
      try {
        // 1. Fetch Participant Information
        const res = await fetch('/api/participant/me');
        const data = await res.json();

        let currentReg: Registration | null = null;
        let currentPart: Participant | null = null;

        if (res.ok && data.participant) {
          currentPart = data.participant;
          currentReg = data.registration || {
            id: data.participant.id,
            participant_id: data.participant.id,
            registration_status: (data.participant.status === 'ACTIVE' ? 'CONFIRMED' : (data.participant.status || 'PENDING')) as RegistrationStatus,
            payment_status: 'PENDING' as PaymentStatus,
            amount: EVENT_CONFIG.registrationFee || 99,
            currency: 'INR',
            created_at: data.participant.created_at || new Date().toISOString()
          };
          setParticipant(currentPart);
          setRegistration(currentReg);
          if (currentReg) {
            setPaymentState(currentReg.payment_status);
          }
          safeStorage.setItem('tkfk26_participant', JSON.stringify(data.participant));
        } else {
          // Fallback to saved participant in safeStorage
          const saved = safeStorage.getItem('tkfk26_participant') || safeStorage.getItem('gkc26_participant');
          if (saved) {
            try {
              const p = JSON.parse(saved);
              currentPart = p;
              currentReg = {
                id: p.id,
                participant_id: p.id,
                registration_status: (p.status === 'ACTIVE' ? 'CONFIRMED' : (p.status || 'PENDING')) as RegistrationStatus,
                payment_status: 'PENDING' as PaymentStatus,
                amount: EVENT_CONFIG.registrationFee || 99,
                currency: 'INR',
                created_at: p.created_at || new Date().toISOString()
              };
              setParticipant(currentPart);
              setRegistration(currentReg);
            } catch {
              router.push('/register');
              return;
            }
          } else {
            router.push('/register');
            return;
          }
        }

        // 2. Fetch Server Payment Mode & Order Creation
        if (currentReg && currentReg.payment_status !== 'SUCCESS') {
          await initializeOrderForMode(currentReg.id);
        }

      } catch (err) {
        console.error('Error initializing payment desk:', err);
        setPaymentMode('DISABLED');
        setModeReason('Unable to connect to payment server.');
      } finally {
        setLoading(false);
      }
    }

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
    }, 4000);

    return () => clearInterval(intervalId);
  }, [router, initializeOrderForMode]);

  // Auto redirect to dashboard when payment is SUCCESS
  useEffect(() => {
    if (paymentState === 'SUCCESS') {
      const timer = setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentState]);

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

    if (paymentMode !== 'PROVIDER') {
      alert('Online payment configuration is not active.');
      return;
    }

    if (!(window as any).Razorpay) {
      loadRazorpayScript();
      alert('Payment SDK is loading... Please try again in 3 seconds.');
      return;
    }

    setProcessingPayment(true);

    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/images/tkfk_logo.png` : undefined;
    const cleanPhone = (participant.phone || '').replace(/\D/g, '').slice(-10);

    const options: any = {
      key: orderData.keyId,
      amount: Math.round(orderData.amount * 100),
      currency: orderData.currency || 'INR',
      name: `${EVENT_CONFIG.organizerAbbr} — ${EVENT_CONFIG.eventName}`,
      description: 'Registration Fee Payment',
      order_id: orderData.orderId,
      prefill: {
        name: participant.name || '',
        email: participant.email || '',
        contact: cleanPhone
      },
      theme: {
        color: '#ff6b35'
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
            setShowRulesModal(true);
            if (participant) {
              saveParticipantSessionCache({
                participant: verifyData.participant || participant,
                registration: verifyData.registration || registration
              });
            }
          } else {
            alert(verifyData.error || 'Payment verification pending.');
          }
        } catch (err) {
          alert('Error verifying payment.');
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

    if (logoUrl) {
      options.image = logoUrl;
    }

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      setProcessingPayment(false);
      console.error('[RAZORPAY PAYMENT FAILED]', response.error);
      const desc = response.error?.description;
      if (desc && desc !== 'Payment failed' && desc !== 'Oops! Something went wrong.') {
        alert(`Payment declined: ${desc}`);
      }
    });
    rzp.open();
  };

  const handleSimulateMockPayment = async () => {
    if (!registration) return;
    setProcessingPayment(true);

    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          razorpay_order_id: 'order_mock_simulated',
          razorpay_payment_id: 'pay_mock_simulated',
          razorpay_signature: 'mock_signature'
        })
      });

      if (res.ok) {
        setPaymentState('SUCCESS');
        setShowRulesModal(true);
      } else {
        alert('Mock payment simulation failed.');
      }
    } catch {
      alert('Error during mock payment simulation.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="flex items-center gap-3 text-[#706e6a] font-medium text-xs sm:text-sm">
          <div className="w-5 h-5 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
          <span>Loading Payment Details...</span>
        </div>
      </div>
    );
  }

  if (!participant || !registration) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
          <div className="bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center max-w-md w-full space-y-4 my-auto">
            <AlertTriangle className="w-12 h-12 text-[#ff6b35] mx-auto" />
            <h2 className="text-lg sm:text-xl font-medium text-[#141412]">Registration Required</h2>
            <p className="text-xs sm:text-sm text-[#706e6a]">Please complete registration before proceeding to payment.</p>
            <Link href="/register" className="inline-block bg-[#ff6b35] hover:bg-[#e85926] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-medium shadow-xs">
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
      <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto w-full">
          <div className="bg-white p-8 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft text-center space-y-6 w-full my-auto">
            <div className="w-16 h-16 bg-[#eef8f2] rounded-full flex items-center justify-center text-[#16a34a] mx-auto border border-[#cbe8d5]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#1e6f42] bg-[#eef8f2] px-3 py-1 rounded-full border border-[#cbe8d5]">
                Payment Completed
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium text-[#141412] tracking-tight">Registration Confirmed!</h2>
              <p className="text-xs sm:text-sm text-[#706e6a] max-w-md mx-auto leading-relaxed">
                Your payment has been successfully completed. Your official participant registration is active.
              </p>
            </div>

            {/* MANDATORY CONTEST WHATSAPP GROUP NOTICE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#eef8f2] border border-[#bbf7d0] text-left space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
                <h3 className="text-xs sm:text-sm font-bold text-[#141412]">
                  MANDATORY STEP: Official Contest WhatsApp Group
                </h3>
              </div>
              <p className="text-xs text-[#2e5d3c] leading-relaxed">
                Joining the official contest WhatsApp group is <strong>mandatory for all participants</strong>. The official competition theme, design guidelines, submission portal links, and updates will be shared exclusively inside this group.
              </p>
              <a
                href={EVENT_CONFIG.contestWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium py-3 px-5 rounded-full text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enter Contest WhatsApp Group (Mandatory)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] text-xs text-left space-y-2 font-sans">
              <div className="flex justify-between">
                <span className="text-[#706e6a]">Participant Name:</span>
                <span className="font-semibold text-[#141412]">{participant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706e6a]">Status:</span>
                <span className="font-semibold text-[#1e6f42]">ACTIVE & CONFIRMED</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              {/* Contest Rules & Guidelines Trigger */}
              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#fafafb] text-[#141412] border border-[#f0ede8] font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm shadow-2xs hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#ff6b35]" />
                <span>View Contest Rules & Guidelines</span>
              </button>

              <button
                onClick={() => { window.location.href = '/dashboard'; }}
                className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full text-sm shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Enter Participant Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Official Contest Rules Modal */}
        <ContestRulesModal
          isOpen={showRulesModal}
          onClose={() => setShowRulesModal(false)}
          defaultView="brief"
          participantName={participant.name}
        />

        <Footer />
      </div>
    );
  }

  // Main View for Pending Payment
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f5f0] text-[#141412] font-sans antialiased selection:bg-[#ff6b35]/20">
      <Navbar />

      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 outline-none">
        <div className="w-full max-w-xl mx-auto space-y-6 my-auto">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#f0ede8] text-[#ff6b35] text-[11px] font-semibold tracking-[0.2em] uppercase">
              SECURE CHECKOUT
            </div>
            <h1 className="text-2xl sm:text-4xl font-medium text-[#141412] tracking-[-0.04em]">Complete Your Payment</h1>
            <p className="text-xs sm:text-sm text-[#706e6a]">Instant Confirmation • Official Entry Pass: ₹99</p>
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-[28px] sm:rounded-[36px] border border-[#f0ede8] shadow-soft space-y-6">
            
            {/* Participant Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#f8f5f0] border border-[#f0ede8] space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#706e6a] font-medium">Participant Name:</span>
                <span className="font-semibold text-[#141412]">{participant.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-2 border-t border-[#f0ede8]">
                <span className="text-[#706e6a] font-medium">Event:</span>
                <span className="font-semibold text-[#141412]">{EVENT_CONFIG.eventName}</span>
              </div>
            </div>

            {/* CASE 0: Loading State */}
            {paymentMode === 'LOADING' && (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-[#706e6a] border-t border-[#f0ede8]">
                <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold">Initializing Secure Payment Gateway...</span>
              </div>
            )}

            {/* CASE 1: PROVIDER Mode Active */}
            {paymentMode === 'PROVIDER' && orderData && (
              <div className="space-y-5 pt-2 border-t border-[#f0ede8]">
                
                {paymentState === 'FAILED' && (
                  <div className="p-4 rounded-2xl bg-[#fef2f2] border border-[#fed7d7] text-[#991b1b] text-xs flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Payment Not Completed / Failed</p>
                      <p className="text-[11px] text-[#991b1b]/80 leading-relaxed">
                        Your previous payment was not completed or declined. You can retry payment below or restart registration.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-[#f0ede8]/60 border border-[#f0ede8] text-[#141412] space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#ff6b35] uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#ff6b35]" />
                      <span>Online Payment Options</span>
                    </span>
                    <span className="text-sm font-bold text-[#ff6b35]">₹99.00</span>
                  </div>
                  <p className="text-xs text-[#706e6a] leading-relaxed font-normal">
                    Pay securely via UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, or NetBanking.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLaunchRazorpay}
                    disabled={processingPayment || verifyingPayment}
                    className="w-full flex items-center justify-center gap-2.5 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full shadow-xs hover:shadow-md transition-all text-sm sm:text-base disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Opening Checkout...</span>
                      </>
                    ) : verifyingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{paymentState === 'FAILED' ? 'Retry Payment Now (₹99)' : 'Proceed to Payment (₹99)'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-[#706e6a] pt-1">
                  <ShieldCheck className="w-4 h-4 text-[#ff6b35]" />
                  <span>256-bit Secure Encrypted Payment Gateway</span>
                </div>
              </div>
            )}

            {/* CASE 2: MOCK Mode (Development Only) */}
            {paymentMode === 'MOCK' && (
              <div className="space-y-5 pt-2 border-t border-[#f0ede8]">
                <div className="p-4 rounded-2xl bg-[#f0ede8] border border-[#e2ded8] text-[#141412] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-[#ff6b35]">
                    <Info className="w-4 h-4 text-[#ff6b35]" />
                    <span>Development Mock Payment Mode</span>
                  </div>
                  <p className="text-xs text-[#706e6a] leading-relaxed font-normal">
                    Simulated test payment mode enabled for local testing. No real money will be charged.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulateMockPayment}
                    disabled={processingPayment}
                    className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 sm:py-4 px-6 rounded-full shadow-xs text-sm sm:text-base transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {processingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Simulating Mock Payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Simulate Test Payment (Mock)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CASE 3: DISABLED Mode (Fail-Closed Configuration Unavailable) */}
            {paymentMode === 'DISABLED' && (
              <div className="space-y-5 pt-2 border-t border-[#f0ede8]">
                <div className="p-5 rounded-2xl bg-[#fef2f2] border border-[#fed7d7] text-[#991b1b] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <XCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0" />
                    <span>Online Payment Unavailable</span>
                  </div>
                  <p className="text-xs text-[#991b1b]/80 leading-relaxed">
                    Online payment is temporarily unavailable. Please try again later.
                  </p>
                  {modeReason && (
                    <p className="text-[11px] font-mono bg-white/60 p-2 rounded-lg border border-[#fed7d7]">
                      System note: {modeReason}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (registration) initializeOrderForMode(registration.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] hover:bg-[#e85926] text-white font-medium py-3.5 px-6 rounded-full text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Gateway Connection</span>
                  </button>
                </div>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="w-full block text-center bg-white hover:bg-[#fafafb] text-[#141412] font-medium py-3.5 px-6 rounded-full text-xs border border-[#f0ede8] transition-all"
                  >
                    Contact Support Desk
                  </Link>
                </div>
              </div>
            )}

            {/* Restart Fresh Registration Option */}
            <div className="pt-3 text-center border-t border-[#f0ede8]">
              <button
                type="button"
                onClick={() => {
                  safeStorage.removeItem('tkfk_participant_session');
                  safeStorage.removeItem('tkfk26_participant');
                  safeStorage.removeItem('gkc26_participant');
                  window.location.href = '/register';
                }}
                className="text-xs font-medium text-[#706e6a] hover:text-[#141412] transition-colors cursor-pointer"
              >
                ← Want to change details? Restart fresh registration
              </button>
            </div>

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
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
        <div className="w-6 h-6 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
