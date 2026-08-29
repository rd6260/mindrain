'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import confetti from 'canvas-confetti';
import { FEES, getCurrentTier, type Tier, type FeeKey, type EntryType } from '@/utils/architectureOfPlayData';

interface RegistrationData {
  id: string;
  form_data: {
    country: string;
    team_type: 'solo' | 'group';
    group: 'A' | 'B';
    [key: string]: any;
  };
  registration_by: string;
  paid: boolean;
}

interface FeeCalculation {
  amount: number; // raw value like 449
  currency: string;
  registrationType: Tier;
  mindrain_fee: number;
}

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

  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [feeDetails, setFeeDetails] = useState<FeeCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [discountedFee, setDiscountedFee] = useState<FeeCalculation | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const [couponPopupMessage, setCouponPopupMessage] = useState('');
  const [couponPopupTitle, setCouponPopupTitle] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const supabase = createClient();

  const calculateFee = (
    country: string,
    awardGroup: 'A' | 'B',
    teamType: 'solo' | 'group',
    overrideTier?: Tier
  ): FeeCalculation => {
    const registrationType = overrideTier ?? getCurrentTier();
    const isIndian = country.toLowerCase() === 'india';
    const currency = isIndian ? 'INR' : 'USD';

    const feeKey: FeeKey = !isIndian ? 'international' : (awardGroup === 'A' ? 'india_monetary' : 'india_no_monetary');
    const entryType: EntryType = teamType;

    const amountStr = FEES[registrationType][feeKey][entryType];
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10);

    return { amount, currency, registrationType, mindrain_fee: amount };
  };

  const VALID_COUPONS: Record<string, { from: Date; to: Date; tierOverride: Tier; label: string }> = {
    'MR-EARLY': {
      from: new Date('2026-09-15T00:00:00'),
      to: new Date('2026-09-17T23:59:59'),
      tierOverride: 'Early Bird Registration',
      label: 'Early Bird price applied',
    },
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
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setIsVerifying(true);
    const now = new Date();

    // 1. Check tier-override coupons first (MR-EARLY etc)
    const coupon = VALID_COUPONS[code];
    if (coupon) {
      if (now < coupon.from || now > coupon.to) {
        setCouponError('This coupon is not valid at this time.');
        setCouponApplied(false);
        setDiscountedFee(null);
        setIsVerifying(false);
        return;
      }
      if (!registration) {
        setIsVerifying(false);
        return;
      }
      const newFee = calculateFee(registration.form_data.country, registration.form_data.group, registration.form_data.team_type, coupon.tierOverride);
      setDiscountedFee(newFee);
      setCouponApplied(true);
      setDiscountPercent(null);
      setReferralId(null);
      setCouponPopupTitle('Code Applied!');
      setCouponPopupMessage(`${coupon.label}`);
      setShowCouponPopup(true);
      fireConfetti();
      setTimeout(() => setShowCouponPopup(false), 2500);
      setIsVerifying(false);
      return;
    }

    // 2. Check MINDRAIN20 (only valid during Early Bird Registration)
    if (code === 'MINDRAIN20' && registration) {
      if (getCurrentTier() !== 'Early Bird Registration') {
        setCouponError('This coupon is only valid during the Early Bird Registration period.');
        setCouponApplied(false);
        setDiscountedFee(null);
        setIsVerifying(false);
        return;
      }
      try {
        const { data: v1Reg } = await supabase
          .from('registrations')
          .select('id')
          .eq('registration_by', registration.registration_by)
          .eq('paid', true)
          .limit(1)
          .maybeSingle();

        const { data: v2Reg } = await supabase
          .from('registrations_2')
          .select('id')
          .eq('registration_by', registration.registration_by)
          .eq('paid', true)
          .limit(1)
          .maybeSingle();

        const hasExisting = v1Reg || v2Reg;
        const discountPct = hasExisting ? 20 : 10;
        if (feeDetails) {
          const discountedAmount = Math.round(feeDetails.amount * (1 - discountPct / 100));
          setDiscountedFee({ ...feeDetails, amount: discountedAmount });
        }
        setDiscountPercent(discountPct);
        setCouponApplied(true);
        setReferralId(null);

        setCouponPopupTitle('Code Applied!');
        setCouponPopupMessage(`MINDRAIN20 verified! You get ${discountPct}% off${hasExisting ? ' as a returning participant' : ' as a new participant'}.`);
        setShowCouponPopup(true);
        fireConfetti();
        setTimeout(() => setShowCouponPopup(false), 2500);
      } catch (err) {
        setCouponError('Error verifying coupon.');
      }
      setIsVerifying(false);
      return;
    }

    // 3. Check referral codes
    try {
      const { data: referral } = await supabase
        .from('referral_account')
        .select('id')
        .eq('code', code)
        .eq('status', 'active')
        .maybeSingle();

      if (referral) {
        setReferralId(referral.id);
        setCouponApplied(true);
        setDiscountedFee(null);
        setDiscountPercent(null);
        setCouponPopupTitle('Referral Applied!');
        setCouponPopupMessage('Referral code verified successfully.');
        setShowCouponPopup(true);
        fireConfetti();
        setTimeout(() => setShowCouponPopup(false), 2500);
        setIsVerifying(false);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // 4. Nothing matched
    setCouponError('Invalid coupon or referral code.');
    setCouponApplied(false);
    setDiscountedFee(null);
    setIsVerifying(false);
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponError(null);
    setDiscountedFee(null);
    setDiscountPercent(null);
    setReferralId(null);
  };

  useEffect(() => {
    const loadRegistration = async () => {
      if (!registrationId) { setError('No registration ID provided'); setIsLoading(false); return; }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('User not authenticated'); setIsLoading(false); return; }

        const { data: regData, error: regError } = await supabase
          .from('registrations_v3')
          .select('id, form_data, registration_by, paid')
          .eq('id', registrationId)
          .single();

        if (regError || !regData) { setError('Registration not found'); setIsLoading(false); return; }
        if (regData.registration_by !== user.id) { setError('Unauthorized access'); setIsLoading(false); return; }

        if (regData.paid) {
          setAlreadyPaid(true);
          setIsLoading(false);
          return;
        }

        setRegistration(regData as RegistrationData);
        setFeeDetails(calculateFee(regData.form_data.country, regData.form_data.group, regData.form_data.team_type));
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading registration:', err);
        setError('Failed to load registration details');
        setIsLoading(false);
      }
    };
    loadRegistration();
  }, [registrationId]);

  const createOrder = async () => {
    if (!feeDetails || !registration) return;
    setIsProcessing(true);
    setError(null);
    try {
      const effectiveFee = couponApplied && discountedFee ? discountedFee : feeDetails;
      const res = await fetch('/api/v3/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveFee.amount * 100, // Pass in paisa/cents
          currency: effectiveFee.currency,
          registration_id: registrationId,
          ...(referralId && { referral_id: referralId }),
          ...(couponApplied && couponCode && !referralId && { coupon_code: couponCode }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const paymentData = {
        key: data.key,
        order_id: data.razorpay_order_id,
        amount: data.amount,
        currency: data.currency,
        name: 'MindDrain Event Registration',
        description: `${effectiveFee.registrationType} Registration - ${registration.form_data.team_type}`,
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
            
            // Log cancellation in database
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

      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
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
  if (error && !feeDetails) {
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

  const currencySymbol = feeDetails?.currency === 'INR' ? '₹' : '$';

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

          {registration && feeDetails && (
            <>
              {/* Registration period badge */}
              <div className="flex items-center justify-between">
                <SectionHeading>Registration Summary</SectionHeading>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#2C5F5F]/10 text-[#2C5F5F] border border-[#2C5F5F]/20">
                  {feeDetails.registrationType}
                </span>
              </div>

              {/* Summary card */}
              <div className="bg-white rounded-xl border border-[#E5E3D7] px-5 py-1">
                <SummaryRow label="Registration Period" value={feeDetails.registrationType} highlight />
                <SummaryRow
                  label="Entry Type"
                  value={registration.form_data.team_type === 'solo' ? 'Solo (1 member)' : 'Group (up to 3 members)'}
                  highlight
                />
                <SummaryRow label="Country" value={registration.form_data.country} highlight />
                <SummaryRow
                  label="Award Category"
                  value={registration.form_data.group === 'A' ? 'Group A — Monetary Award' : 'Group B — No Monetary Award'}
                  highlight
                />
                {couponApplied && discountedFee && discountedFee.amount !== feeDetails.amount && discountPercent && (
                  <SummaryRow
                    label="Discount"
                    value={`${discountPercent}% off (-${currencySymbol}${(feeDetails.amount - discountedFee.amount).toLocaleString()})`}
                  />
                )}
                {couponApplied && discountedFee && discountedFee.amount !== feeDetails.amount && (
                  <div className="flex items-center justify-between py-3 border-b border-[#E5E3D7] last:border-0">
                    <span className="text-sm text-[#6B6B6B] font-medium">Original Amount</span>
                    <span className="text-sm text-[#8B8B8B] line-through">
                      {currencySymbol}{feeDetails.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                <SummaryRow
                  label="Total Amount"
                  value={`${currencySymbol}${(couponApplied && discountedFee ? discountedFee.amount : feeDetails.amount).toLocaleString()}`}
                />
              </div>

              {/* Info notice */}
              <div className="flex items-start gap-3 p-4 bg-[#2C5F5F]/5 border border-[#2C5F5F]/20 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-[#2C5F5F] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <p className="text-sm text-[#4B4B4B] leading-relaxed">
                  You're registering under the <strong className="text-[#2C5F5F]">{feeDetails.registrationType}</strong> period.
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
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); if (couponApplied) removeCoupon(); }}
                      placeholder="Enter coupon or referral code"
                      disabled={couponApplied || isVerifying}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-[#D0CEC2] bg-white text-sm font-mono font-semibold text-[#1A1A1A] outline-none focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed tracking-widest placeholder:tracking-normal placeholder:font-normal"
                    />
                    {couponApplied ? (
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

                  {couponApplied && discountedFee && !discountPercent && (
                    <div className="flex items-center gap-2 p-3 bg-[#2D5F4F]/10 border border-[#2D5F4F]/25 rounded-xl">
                      <svg className="w-4 h-4 text-[#2D5F4F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs font-semibold text-[#2D5F4F]">
                        Coupon applied — Early Bird price ({currencySymbol}{discountedFee.amount.toLocaleString()}) will be charged.
                      </p>
                    </div>
                  )}

                  {couponApplied && discountedFee && discountPercent && (
                    <div className="flex items-center gap-2 p-3 bg-[#2D5F4F]/10 border border-[#2D5F4F]/25 rounded-xl">
                      <svg className="w-4 h-4 text-[#2D5F4F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs font-semibold text-[#2D5F4F]">
                        Code applied — {discountPercent === 20 ? 'Returning participant — 20% off' : 'New participant — 10% off'}.
                      </p>
                    </div>
                  )}

                  {couponApplied && referralId && (
                    <div className="flex items-center gap-2 p-3 bg-[#2D5F4F]/10 border border-[#2D5F4F]/25 rounded-xl">
                      <svg className="w-4 h-4 text-[#2D5F4F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs font-semibold text-[#2D5F4F]">
                        Referral applied — verified successfully.
                      </p>
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
                  : `Pay ${currencySymbol}${(couponApplied && discountedFee ? discountedFee.amount : feeDetails.amount).toLocaleString()} →`
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
              Your spot is confirmed. You'll be redirected to your profile shortly.
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
