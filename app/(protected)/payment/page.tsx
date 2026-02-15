'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';

interface RegistrationData {
  id: string;
  country: string;
  team_type: 'solo' | 'group';
  registration_by: string;
}

interface FeeCalculation {
  amount: number;
  currency: string;
  registrationType: 'Early Bird' | 'Advance' | 'Late Minute';
  mindrain_fee: number;
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get('registration_id');

  const [registration, setRegistration] = useState<RegistrationData | null>(null);
  const [feeDetails, setFeeDetails] = useState<FeeCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const supabase = createClient();

  // Fee structure
  const getFeeStructure = () => {
    return {
      earlyBird: {
        indian: { solo: 349, group: 999 },
        international: { solo: 25, group: 69 },
      },
      advance: {
        indian: { solo: 699, group: 1499 },
        international: { solo: 35, group: 99 },
      },
      lateMinute: {
        indian: { solo: 999, group: 1999 },
        international: { solo: 49, group: 129 },
      },
    };
  };

  // Determine registration type based on current date
  const getRegistrationType = (): 'Early Bird' | 'Advance' | 'Late Minute' => {
    const currentDate = new Date();
    
    // Early Bird: Feb 2 - Feb 28, 2026
    const earlyBirdStart = new Date('2026-02-02');
    const earlyBirdEnd = new Date('2026-02-28T23:59:59');
    
    // Advance: Mar 1 - May 31, 2026
    const advanceStart = new Date('2026-03-01');
    const advanceEnd = new Date('2026-05-31T23:59:59');
    
    // Late: Jun 1 - Jun 25, 2026
    const lateStart = new Date('2026-06-01');
    const lateEnd = new Date('2026-06-25T23:59:59');

    if (currentDate >= earlyBirdStart && currentDate <= earlyBirdEnd) {
      return 'Early Bird';
    } else if (currentDate >= advanceStart && currentDate <= advanceEnd) {
      return 'Advance';
    } else if (currentDate >= lateStart && currentDate <= lateEnd) {
      return 'Late Minute';
    } else {
      // Default to advance if outside all ranges
      return 'Advance';
    }
  };

  // Calculate fee based on country, team type, and current date
  const calculateFee = (country: string, teamType: 'solo' | 'group'): FeeCalculation => {
    const feeStructure = getFeeStructure();
    const registrationType = getRegistrationType();
    const isIndian = country.toLowerCase() === 'india';
    const currency = isIndian ? 'INR' : 'USD';

    let amount = 0;

    if (registrationType === 'Early Bird') {
      amount = isIndian 
        ? feeStructure.earlyBird.indian[teamType]
        : feeStructure.earlyBird.international[teamType];
    } else if (registrationType === 'Advance') {
      amount = isIndian 
        ? feeStructure.advance.indian[teamType]
        : feeStructure.advance.international[teamType];
    } else {
      amount = isIndian 
        ? feeStructure.lateMinute.indian[teamType]
        : feeStructure.lateMinute.international[teamType];
    }

    return {
      amount,
      currency,
      registrationType,
      mindrain_fee: amount,
    };
  };

  // Load registration data
  useEffect(() => {
    const loadRegistration = async () => {
      if (!registrationId) {
        setError('No registration ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Fetch registration data
        const { data: regData, error: regError } = await supabase
          .from('registrations')
          .select('id, country, team_type, registration_by, paid')
          .eq('id', registrationId)
          .single();

        if (regError || !regData) {
          setError('Registration not found');
          setIsLoading(false);
          return;
        }

        // Check if user owns this registration
        if (regData.registration_by !== user.id) {
          setError('Unauthorized access to this registration');
          setIsLoading(false);
          return;
        }

        // Check if already paid
        if (regData.paid) {
          setError('This registration has already been paid');
          setIsLoading(false);
          return;
        }

        setRegistration(regData);

        // Calculate fee
        const fee = calculateFee(regData.country, regData.team_type);
        setFeeDetails(fee);

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
      // Create order via API
      const res = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: feeDetails.amount * 100, // Convert to paise/cents
          currency: feeDetails.currency,
          registration_id: registrationId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Initialize Razorpay payment
      const paymentData = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: data.razorpay_order_id,
        amount: feeDetails.amount * 100,
        currency: feeDetails.currency,
        name: 'MindDrain Event Registration',
        description: `${feeDetails.registrationType} Registration - ${registration.team_type}`,
        handler: async function (response: any) {
          try {
            // Verify payment
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
              // Redirect after 3 seconds
              setTimeout(() => {
                router.push('/profile');
              }, 3000);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Failed to verify payment. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setError('Payment cancelled');
          },
        },
        theme: {
          color: '#2d8cf0',
        },
      };

      const payment = new (window as any).Razorpay(paymentData);
      payment.open();
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8e6db] flex items-center justify-center">
        <div className="text-2xl font-bold text-[#323232]">Loading payment details...</div>
      </div>
    );
  }

  // Error state
  if (error && !feeDetails) {
    return (
      <div className="min-h-screen bg-[#e8e6db] flex items-center justify-center p-6">
        <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-4xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-black text-[#323232] mb-2">Error</h2>
          <p className="text-[#666] mb-6">{error}</p>
          <button
            onClick={() => router.push('/register')}
            className="h-12 px-6 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8e6db] p-6">
      <Script
        type="text/javascript"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232]">
          {/* Header */}
          <div className="border-b-2 border-[#323232] p-6">
            <h1 className="text-3xl font-black text-[#323232]">Complete Payment</h1>
            <p className="text-[#666] mt-2">Review your registration details and proceed with payment</p>
          </div>

          {/* Error Toast */}
          {error && (
            <div className="m-6 p-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Registration Details */}
            {registration && feeDetails && (
              <>
                <div className="bg-[#edebdf] rounded-lg border-2 border-[#323232] shadow-[2px_2px_0_0_#323232] p-6">
                  <h3 className="text-xl font-black text-[#323232] mb-4">Registration Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#666] font-semibold">Registration Type:</span>
                      <span className="text-[#323232] font-bold">{feeDetails.registrationType}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[#666] font-semibold">Team Type:</span>
                      <span className="text-[#323232] font-bold capitalize">{registration.team_type}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-[#666] font-semibold">Country:</span>
                      <span className="text-[#323232] font-bold">{registration.country}</span>
                    </div>

                    <div className="border-t-2 border-[#323232] pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#323232] font-bold text-lg">Total Amount:</span>
                        <span className="text-[#2d8cf0] font-black text-2xl">
                          {feeDetails.currency === 'INR' ? '₹' : '$'}{feeDetails.amount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Period Info */}
                <div className="bg-blue-50 rounded-lg border-2 border-[#2d8cf0] p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2d8cf0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">i</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#323232] mb-1">Payment Information</h4>
                      <p className="text-sm text-[#666]">
                        You are registering during the <strong>{feeDetails.registrationType}</strong> period. 
                        The registration fee is non-refundable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={createOrder}
                  disabled={isProcessing}
                  className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[17px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isProcessing ? 'Processing...' : `Pay ${feeDetails.currency === 'INR' ? '₹' : '$'}${feeDetails.amount}`}
                </button>

                <p className="text-xs text-center text-[#666]">
                  By proceeding with payment, you agree to our terms and conditions. 
                  Your payment will be securely processed through Razorpay.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-[#323232] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-[#323232] mb-2">
                Payment Successful!
              </h3>
              
              <p className="text-[#666] mb-4">
                Your payment has been processed successfully. You will be redirected to your profile shortly.
              </p>

              <div className="animate-pulse text-[#2d8cf0] font-semibold">
                Redirecting...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
