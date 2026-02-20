'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';

interface RegistrationData {
  id: string;
  country: string;
  team_type: 'solo' | 'group';
  registration_by: string;
  group: 'A' | 'B';
}

interface FeeCalculation {
  amount: number;
  currency: string;
  registrationType: 'Early Bird' | 'Regular' | 'Last Minute';
  mindrain_fee: number;
}

// Section heading with accent dot — matching registration page
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

  const supabase = createClient();

  const getFeeStructure = () => ({
    earlyBird: {
      india_monetary:    { solo: 549,  group: 999  },
      india_no_monetary: { solo: 275,  group: 559  },
      international:     { solo: 35,   group: 79   },
    },
    regular: {
      india_monetary:    { solo: 699,  group: 1499 },
      india_no_monetary: { solo: 275,  group: 559  },
      international:     { solo: 45,   group: 99   },
    },
    lastMinute: {
      india_monetary:    { solo: 999,  group: 1999 },
      india_no_monetary: { solo: 375,  group: 819  },
      international:     { solo: 69,   group: 149  },
    },
  });

  const getRegistrationType = (): 'Early Bird' | 'Regular' | 'Last Minute' => {
    const now = new Date();
    if (now >= new Date('2026-02-19') && now <= new Date('2026-03-15T23:59:59')) return 'Early Bird';
    if (now >= new Date('2026-03-16') && now <= new Date('2026-05-31T23:59:59')) return 'Regular';
    if (now >= new Date('2026-06-01') && now <= new Date('2026-06-25T23:59:59')) return 'Last Minute';
    return 'Regular';
  };

  const calculateFee = (country: string, awardGroup: 'A' | 'B', teamType: 'solo' | 'group'): FeeCalculation => {
    const fees = getFeeStructure();
    const registrationType = getRegistrationType();
    const isIndian = country.toLowerCase() === 'india';
    const currency = isIndian ? 'INR' : 'USD';

    const tier = registrationType === 'Early Bird' ? fees.earlyBird
      : registrationType === 'Regular' ? fees.regular
      : fees.lastMinute;

    const bucket = !isIndian ? tier.international
      : awardGroup === 'A' ? tier.india_monetary
      : tier.india_no_monetary;

    const amount = bucket[teamType];
    return { amount, currency, registrationType, mindrain_fee: amount };
  };

  useEffect(() => {
    const loadRegistration = async () => {
      if (!registrationId) { setError('No registration ID provided'); setIsLoading(false); return; }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('User not authenticated'); setIsLoading(false); return; }

        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('id, country, team_type, registration_by, group, paid')
          .eq('id', registrationId)
          .single();

        if (regError || !regData) { setError('Registration not found'); setIsLoading(false); return; }
        if (regData.registration_by !== user.id) { setError('Unauthorized access'); setIsLoading(false); return; }

        if (regData.paid) {
          setAlreadyPaid(true);
          setIsLoading(false);
          return;
        }

        setRegistration(regData);
        setFeeDetails(calculateFee(regData.country, regData.group, regData.team_type));
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
      const res = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: feeDetails.amount * 100,
          currency: feeDetails.currency,
          registration_id: registrationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.razorpay_order_id,
        amount: feeDetails.amount * 100,
        currency: feeDetails.currency,
        name: 'MindDrain Event Registration',
        description: `${feeDetails.registrationType} Registration - ${registration.team_type}`,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/verifyOrder', {
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
          ondismiss: () => { setIsProcessing(false); setError('Payment cancelled'); },
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
            onClick={() => router.push('/registration')}
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
                  value={registration.team_type === 'solo' ? 'Solo (1 member)' : 'Group (up to 3 members)'}
                  highlight
                />
                <SummaryRow label="Country" value={registration.country} highlight />
                <SummaryRow
                  label="Award Category"
                  value={registration.group === 'A' ? 'Group A — Monetary Award' : 'Group B — No Monetary Award'}
                  highlight
                />
                <SummaryRow
                  label="Total Amount"
                  value={`${currencySymbol}${feeDetails.amount.toLocaleString()}`}
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
                  : `Pay ${currencySymbol}${feeDetails.amount.toLocaleString()} →`
                }
              </button>

              <p className="text-xs text-center text-[#8B8B8B]">
                By proceeding, you agree to our terms and conditions. Payment is securely handled by Razorpay.
              </p>
            </>
          )}
        </div>
      </div>

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
