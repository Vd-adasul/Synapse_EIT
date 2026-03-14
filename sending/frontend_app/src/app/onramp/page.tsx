'use client';

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import OnrampWidget from '../../components/OnrampWidget';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const DESTINATION_WALLET =
  process.env.NEXT_PUBLIC_DESTINATION_WALLET ||
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

type Step = 'amount' | 'pay' | 'done';

function OnrampContent() {
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('1000');
  const [customAmount, setCustomAmount] = useState('');

  const activeAmount = customAmount || amount;

  const handlePreset = useCallback((val: number) => {
    setAmount(String(val));
    setCustomAmount('');
  }, []);

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/[^0-9]/g, '');
      setCustomAmount(v);
    },
    [],
  );

  const handleProceed = useCallback(() => {
    if (Number(activeAmount) >= 100) setStep('pay');
  }, [activeAmount]);

  const estimatedUSDC = (Number(activeAmount) / 84.5).toFixed(2);

  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('stripe_success') === 'true') {
      const amt = searchParams.get('amount');
      if (amt) {
        setAmount(amt);
        setCustomAmount('');
      }
      setStep('done');
    }
  }, [searchParams]);

  const handleStripeCheckout = async () => {
    setIsStripeLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: activeAmount, destinationWallet: DESTINATION_WALLET })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start Stripe checkout');
      }
    } catch (e) {
      console.error(e);
      alert('Network error with Stripe');
    } finally {
      setIsStripeLoading(false);
    }
  };


  return (
    <main className="relative min-h-screen bg-[#030303]">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] animate-float"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <div className="relative z-10 pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="max-w-2xl mx-auto mb-12 flex items-center gap-3">
          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 hover:text-white transition-colors"
          >
            Home
          </Link>
          <span className="text-neutral-700">/</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">
            Onramp
          </span>
        </div>

        {/* Page Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-4 block">
            Fiat to Crypto
          </span>
          <h1 className="text-5xl sm:text-6xl font-serif text-white tracking-tight mb-4">
            Instant <span className="animate-shimmer">Deposit</span>
          </h1>
          <p className="text-neutral-500 text-[11px] font-sans font-bold uppercase tracking-widest leading-relaxed">
            Convert INR to USDC on Polygon in seconds.
            <br />
            Powered by Onramp.money
          </p>
        </div>

        {/* Step Indicator */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { id: 'amount' as const, label: 'Amount', num: 1 },
              { id: 'pay' as const, label: 'Payment', num: 2 },
              { id: 'done' as const, label: 'Complete', num: 3 },
            ].map((s, idx) => {
              const isActive = s.id === step;
              const isPast =
                (step === 'pay' && s.id === 'amount') ||
                (step === 'done' && (s.id === 'amount' || s.id === 'pay'));
              return (
                <React.Fragment key={s.id}>
                  {idx > 0 && (
                    <div
                      className={`flex-1 h-[1px] mx-2 transition-all duration-500 ${
                        isPast
                          ? 'bg-gradient-to-r from-violet-500 to-cyan-400'
                          : 'bg-white/10'
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-serif text-lg transition-all duration-500 ${
                        isActive
                          ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]'
                          : isPast
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/10 bg-black text-neutral-700'
                      }`}
                    >
                      {isPast ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        isActive
                          ? 'text-violet-400'
                          : isPast
                            ? 'text-emerald-500'
                            : 'text-neutral-600'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ------- STEP 1: AMOUNT ------- */}
        {step === 'amount' && (
          <div className="max-w-lg mx-auto animate-[fadeIn_0.4s_ease-out]">
            <div className="p-1 glass rounded-[40px] overflow-hidden shadow-2xl">
              <div className="bg-[#030303] rounded-[39px] p-10 space-y-8">
                {/* Heading */}
                <div className="text-center">
                  <h2 className="text-3xl font-serif text-white mb-2">
                    How much?
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Enter amount in Indian Rupees (INR)
                  </p>
                </div>

                {/* Big Amount Display */}
                <div className="text-center py-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-xl font-serif text-neutral-600">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={customAmount || amount}
                      onChange={handleCustomChange}
                      placeholder="0"
                      className="text-7xl font-serif text-white bg-transparent border-none outline-none text-center max-w-[300px] placeholder:text-neutral-800"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <svg
                      className="w-4 h-4 text-cyan-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                    <span className="text-sm font-mono text-cyan-400">
                      ≈ {estimatedUSDC} USDC
                    </span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap justify-center gap-3">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => handlePreset(val)}
                      className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                        amount === String(val) && !customAmount
                          ? 'bg-violet-600 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.5)]'
                          : 'bg-white/[0.03] border border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Info Row */}
                <div className="flex items-center justify-between p-5 rounded-[20px] bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-400">
                        $
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                        Output Token
                      </span>
                      <span className="text-sm text-white font-semibold">
                        USDC on Polygon
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                      Rate
                    </span>
                    <span className="text-sm text-white font-mono">
                      ₹84.50
                    </span>
                  </div>
                </div>

                {/* Destination */}
                <div className="p-4 rounded-[16px] border border-white/5 bg-white/[0.01]">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 block mb-1">
                    Destination
                  </span>
                  <span className="text-xs font-mono text-neutral-400">
                    {DESTINATION_WALLET.slice(0, 10)}...
                    {DESTINATION_WALLET.slice(-8)}
                  </span>
                  <span className="text-[9px] ml-2 text-emerald-500 font-bold uppercase tracking-widest">
                    Polygon
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleProceed}
                  disabled={Number(activeAmount) < 100}
                  className="w-full group relative p-[1px] rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <div className="shiny-border-gradient absolute inset-[-100%] z-0" />
                  <div className="shiny-border-content relative z-10 px-10 py-5 rounded-full flex items-center justify-center gap-3">
                    <span className="text-[13px] font-black uppercase tracking-[0.2em] text-white">
                      Continue to Payment
                    </span>
                    <svg
                      className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </button>

                {Number(activeAmount) > 0 && Number(activeAmount) < 100 && (
                  <p className="text-center text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                    Minimum amount is ₹100
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------- STEP 2: PAYMENT ------- */}
        {step === 'pay' && (
          <div className="max-w-lg mx-auto animate-[fadeIn_0.4s_ease-out]">
            {/* Summary bar */}
            <div className="mb-6 flex items-center justify-between p-5 rounded-full glass">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-violet-400">₹</span>
                </div>
                <div>
                  <span className="text-white font-serif text-lg">
                    ₹{Number(activeAmount).toLocaleString()}
                  </span>
                  <span className="text-neutral-500 text-xs ml-2 font-mono">
                    → {estimatedUSDC} USDC
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep('amount')}
                className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/5 hover:border-white/20"
              >
                Edit
              </button>
            </div>

            {/* Onramp Widget */}
            <OnrampWidget
              destinationWallet={DESTINATION_WALLET}
              amount={activeAmount}
            />

            {/* STRIPE BUTTON IMPLEMENTATION */}
            <div className="mt-6 flex flex-col items-center gap-4 p-6 rounded-[24px] border border-violet-500/20 bg-violet-500/5">
              <span className="text-[11px] font-black uppercase tracking-widest text-violet-400">Alternative: Global Card Payment</span>
              <button 
                onClick={handleStripeCheckout}
                disabled={isStripeLoading}
                className="w-full relative group overflow-hidden rounded-full p-[1px] transition-all hover:scale-[1.02] active:scale-95"
              >
                 <div className="absolute inset-[-100%] z-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 animate-[spin_4s_linear_infinite]" />
                 <div className="relative z-10 px-8 py-4 bg-black rounded-full flex items-center justify-center gap-3 w-full h-full">
                    {isStripeLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Pay instantly with Stripe</span>
                      </>
                    )}
                 </div>
              </button>
            </div>

            {/* After payment instructions */}
            <div className="mt-8 p-6 rounded-[24px] border border-white/5 bg-white/[0.01]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white mb-2">
                    How this works
                  </p>
                  <ol className="space-y-2 text-xs text-neutral-400 leading-relaxed list-decimal list-inside">
                    <li>Complete the payment via UPI, bank transfer, or card above</li>
                    <li>Onramp.money converts your INR to USDC automatically</li>
                    <li>USDC lands in the destination wallet on Polygon network</li>
                    <li>Transaction typically completes in 2–5 minutes</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------- STEP 3: DONE ------- */}
        {step === 'done' && (
          <div className="max-w-lg mx-auto text-center animate-[fadeIn_0.4s_ease-out]">
            <div className="p-1 glass rounded-[40px] overflow-hidden shadow-2xl">
              <div className="bg-[#030303] rounded-[39px] p-14">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-8">
                  <svg
                    className="w-10 h-10 text-emerald-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-serif text-white mb-3">
                  Payment Initiated
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-8">
                  Your USDC will arrive in 2–5 minutes
                </p>

                <div className="space-y-3 mb-10">
                  <div className="flex justify-between p-4 rounded-[16px] bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                      Amount
                    </span>
                    <span className="text-sm text-white font-mono">
                      ₹{Number(activeAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 rounded-[16px] bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                      USDC
                    </span>
                    <span className="text-sm text-cyan-400 font-mono">
                      ≈ {estimatedUSDC}
                    </span>
                  </div>
                  <div className="flex justify-between p-4 rounded-[16px] bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                      Network
                    </span>
                    <span className="text-sm text-emerald-400 font-mono">
                      Polygon
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href="/#campaign"
                    className="w-full py-4 rounded-full bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    View Campaign
                  </Link>
                  <button
                    onClick={() => {
                      setStep('amount');
                      setCustomAmount('');
                      setAmount('1000');
                    }}
                    className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all active:scale-95"
                  >
                    Make Another Deposit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trust badges */}
        <div className="max-w-lg mx-auto mt-16 flex flex-wrap justify-center gap-6">
          {[
            { label: 'KYC Verified', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
            { label: 'Bank-Grade Encryption', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { label: 'RBI Compliant', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.01]"
            >
              <svg
                className="w-3.5 h-3.5 text-neutral-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={badge.icon}
                />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


export default function OnrampPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030303] flex justify-center items-center"><div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <OnrampContent />
    </Suspense>
  );
}
