'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import confetti from 'canvas-confetti';

interface Quote {
  amountMinor: number;
  originalAmountMinor: number;
  currency: 'INR' | 'USD';
  badge?: string;
  description: string;
  eventTitle: string;
  summary: { label: string; value: string }[];
  discountPercent?: number;
  applied?: { title: string; message: string };
}

const money = (minor: number) => (minor / 100).toLocaleString();

// Section heading with accent dot
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="relative flex-shrink-0 w-3 h-3">
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
        <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-60" />
      </div>
      <h2 className="text-sm font-bold uppercase tracking-widest text-[#2C5F5F]">{children}</h2>
    </div>
  );
}

// Summary row
function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#E5E3D7] last:border-0">
      <span className="text-sm text-[#6B6B6B] font-medium">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-[#2C5F5F] text-base' : 'text-[#1A1A1A]'}`}>
        {value}
      </span>
    </div>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get('registration_id');

  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Coupon state — `quote` is always what the server says will be charged
  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponPopupMessage, setCouponPopupMessage] = useState('');
  const [couponPopupTitle, setCouponPopupTitle] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const supabase = createClient();

  const fetchQuote = async (code?: string): Promise<{ quote: Quote } | { error: string }> => {
    const res = await fetch('/api/v3/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registration_id: registrationId, ...(code && { code }) }),
    });
    const data = await res.json();
    return res.ok ? { quote: data.quote as Quote } : { error: (data.error as string) || 'Failed to calculate fee' };
  };

  const fireConfetti = () => {
    const burst = (originX: number) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: originX, y: 1 },
        angle: originX < 0.5 ? 60 : 120,
        colors: ['#2C5F5F', '#2D5F4F', '#4CAF88', '#F8F7F2', '#D4AF37'],
        startVelocity: 45,
        gravity: 0.8,
        ticks: 200,
      });
    burst(0.1);
    setTimeout(() => burst(0.9), 100);
  };

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setIsVerifying(true);

    const result = await fetchQuote(code);
    if ('error' in result) {
      setCouponError(result.error);
    } else {
      setQuote(result.quote);
      setAppliedCode(code);
      setCouponPopupTitle(result.quote.applied?.title ?? 'Code Applied!');
      setCouponPopupMessage(result.quote.applied?.message ?? '');
      setShowCouponPopup(true);
      fireConfetti();
      setTimeout(() => setShowCouponPopup(false), 2500);
    }
    setIsVerifying(false);
  };

  const removeCoupon = async () => {
    setAppliedCode(null);
    setCouponCode('');
    setCouponError(null);
    const result = await fetchQuote();
    if ('quote' in result) setQuote(result.quote);
  };

  useEffect(() => {
    const load = async () => {
      if (!registrationId) { setError('No registration ID provided'); setIsLoading(false); return; }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('User not authenticated'); setIsLoading(false); return; }

        const { data: reg } = await supabase
          .from('registrations_v3').select('paid, registration_by').eq('id', registrationId).maybeSingle();
        if (!reg) { setError('Registration not found'); setIsLoading(false); return; }
        if (reg.registration_by !== user.id) { setError('Unauthorized access'); setIsLoading(false); return; }
        if (reg.paid) { setAlreadyPaid(true); setIsLoading(false); return; }

        const result = await fetchQuote();
        if ('error' in result) setError(result.error);
        else setQuote(result.quote);
      } catch (err) {
        console.error('Error loading registration:', err);
        setError('Failed to load registration details');
      }
      setIsLoading(false);
    };
    load();
  }, [registrationId]);

  const createOrder = async () => {
    if (!quote) return;
    setIsProcessing(true);
    setError(null);
    try {
      // The server recomputes the amount; we only tell it which code to apply.
      const res = await fetch('/api/v3/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: registrationId, ...(appliedCode && { code: appliedCode }) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const paymentData = {
        key: data.key,
        order_id: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        name: 'MindDrain Event Registration',
        description: `${data.event_title} - ${data.description}`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/v3/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registration_id: registrationId,
                payment_id: data.payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.isOk) {
              setShowSuccessDialog(true);
              setTimeout(() => router.push('/profile'), 3000);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Failed to verify payment. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            setIsProcessing(false);
            setError('Payment cancelled');
            try {
              await fetch('/api/v3/cancel-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_id: data.payment_id }),
              });
            } catch (err) {
              console.error('Failed to register cancellation', err);
            }
          },
        },
        theme: { color: '#2C5F5F' },
      };

      new (window as any).Razorpay(paymentData).open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading payment details...</span>
        </div>
      </div>
    );
  }

  // Already paid screen
  if (alreadyPaid) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-[#2D5F4F] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Payment Complete</h2>
          <p className="text-sm text-[#6B6B6B] mb-7 leading-relaxed">
            Your registration has already been paid and confirmed. No further action is needed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Fatal error
  if (error && !quote) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-[#C85D3E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-[#C85D3E] text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Something went wrong</h2>
          <p className="text-sm text-[#6B6B6B] mb-7">{error}</p>
          <button
            onClick={() => router.push('/registration-3')}
            className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors"
          >
            ← Back to Registration
          </button>
        </div>
      </div>
    );
  }

  const currencySymbol = quote?.currency === 'INR' ? '₹' : '$';
  const discounted = !!quote && quote.amountMinor !== quote.originalAmountMinor;

  return (
    <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
      <Script type="text/javascript" src="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              Final Step
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Complete Payment</h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">Review your details and confirm your spot</p>
        </div>

        {/* Inline error toast */}
        {error && (
          <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
            <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">

          {quote && (
            <>
              {/* Registration period badge */}
              <div className="flex items-center justify-between">
                <SectionHeading>Registration Summary</SectionHeading>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2C5F5F]/10 text-[#2C5F5F] border border-[#2C5F5F]/20">
                  {quote.badge ?? quote.eventTitle}
                </span>
              </div>

              {/* Summary card */}
              <div className="bg-white rounded-xl border border-[#E5E3D7] px-5 py-1">
                {quote.summary.map((row) => (
                  <SummaryRow key={row.label} label={row.label} value={row.value} highlight />
                ))}
                {discounted && quote.discountPercent && (
                  <SummaryRow
                    label="Discount"
                    value={`${quote.discountPercent}% off (-${currencySymbol}${money(quote.originalAmountMinor - quote.amountMinor)})`}
                  />
                )}
                {discounted && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E5E3D7] last:border-0">
                    <span className="text-sm text-[#6B6B6B] font-medium">Original Amount</span>
                    <span className="text-sm text-[#8B8B8B] line-through">
                      {currencySymbol}{money(quote.originalAmountMinor)}
                    </span>
                  </div>
                )}
                <SummaryRow
                  label="Total Amount"
                  value={`${currencySymbol}${money(quote.amountMinor)}`}
                />
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-4 bg-[#2C5F5F]/5 border border-[#2C5F5F]/20 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#2C5F5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <p className="text-sm text-[#4B4B4B] leading-relaxed">
                  {quote.badge && <>You&apos;re registering under the <strong className="text-[#2C5F5F]">{quote.badge}</strong> period. </>}
                  The registration fee is <strong>non-refundable</strong> once payment is complete.
                </p>
              </div>

              {/* Coupon section */}
              <div>
                <SectionHeading>Coupon/Referral Code (Optional)</SectionHeading>

                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); if (appliedCode) removeCoupon(); }}
                      placeholder="Enter coupon or referral code"
                      disabled={!!appliedCode || isVerifying}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#D0CEC2] bg-white text-sm font-mono font-semibold text-[#1A1A1A] outline-none focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed tracking-widest placeholder:tracking-normal placeholder:font-normal"
                    />
                    {appliedCode ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 border border-[#C85D3E]/30 text-[#C85D3E] text-sm font-bold hover:bg-[#C85D3E]/20 transition-colors"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || isVerifying}
                        className="px-4 py-2.5 w-24 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isVerifying ? (
                          <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : 'Apply'}
                      </button>
                    )}
                  </div>

                  {couponError && (
                    <p className="text-xs text-[#C85D3E] font-semibold flex items-center gap-1.5">
                      <span>⚠</span> {couponError}
                    </p>
                  )}

                  {appliedCode && quote.applied && (
                    <div className="flex items-center gap-2 p-3 bg-[#2D5F4F]/10 border border-[#2D5F4F]/25 rounded-xl">
                      <svg className="w-4 h-4 text-[#2D5F4F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs font-semibold text-[#2D5F4F]">{quote.applied.message}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E5E3D7]" />

              {/* Pay button */}
              <button
                onClick={createOrder}
                disabled={isProcessing}
                className={`
                  w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${isProcessing
                    ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                    : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                  }
                `}
              >
                {isProcessing
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  : `Pay ${currencySymbol}${money(quote.amountMinor)} →`
                }
              </button>

              <p className="text-xs text-center text-[#8B8B8B]">
                By proceeding, you agree to our terms and conditions. Payment is securely handled by Razorpay.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Coupon Success Popup Modal */}
      {showCouponPopup && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div
            className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl"
            style={{
              animation: 'couponPopupIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <style>{`
              @keyframes couponPopupIn {
                0% { opacity: 0; transform: scale(0.85) translateY(10px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
            <div className="w-14 h-14 bg-[#2D5F4F] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{couponPopupTitle}</h3>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              {couponPopupMessage}
            </p>
          </div>
        </div>
      )}

      {/* Success dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2D5F4F] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Payment Successful!</h3>
            <p className="text-sm text-[#6B6B6B] mb-6 leading-relaxed">
              Your spot is confirmed. You&apos;ll be redirected to your profile shortly.
            </p>
            <div className="flex items-center justify-center gap-2 text-[#2C5F5F] font-semibold text-sm animate-pulse">
              <span className="w-4 h-4 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
              Redirecting...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading...</span>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
