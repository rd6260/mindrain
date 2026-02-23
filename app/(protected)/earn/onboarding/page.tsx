'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── Floating label input (same as registration page) ──────────────────────
function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  maxLength,
  hint,
}: {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div className="w-full">
      <label className="relative block w-full group">
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          placeholder=" "
          className="
            peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]
            border border-[#D0CEC2] rounded-xl outline-none
            text-sm font-medium tracking-widest
            transition-all duration-200
            focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10
            disabled:opacity-50 disabled:cursor-not-allowed
            uppercase
          "
        />
        <span className="
          absolute left-4 top-4 text-[#8B8B8B] text-sm tracking-normal
          transition-all duration-200 pointer-events-none
          peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#2C5F5F] peer-focus:tracking-normal
          peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:text-[#6B6B6B] peer-[&:not(:placeholder-shown)]:tracking-normal
        ">
          {label}
        </span>
      </label>
      {hint && <p className="text-[10px] text-[#8B8B8B] mt-1.5 pl-1">{hint}</p>}
    </div>
  );
}

// ── Section heading with animated dot ─────────────────────────────────────
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

// ── Checkbox row ───────────────────────────────────────────────────────────
function CheckRow({
  checked,
  onChange,
  disabled,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`
        w-full flex items-start gap-3 p-4 rounded-xl border text-left
        transition-all duration-200 group
        ${checked
          ? 'bg-[#2C5F5F]/5 border-[#2C5F5F] shadow-sm'
          : 'bg-white border-[#D0CEC2] hover:border-[#2C5F5F]/50'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {/* custom checkbox */}
      <div
        className={`
          shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5
          transition-all duration-200
          ${checked
            ? 'bg-[#2C5F5F] border-[#2C5F5F]'
            : 'bg-white border-[#D0CEC2] group-hover:border-[#2C5F5F]/60'
          }
        `}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm font-medium leading-relaxed ${checked ? 'text-[#1A1A1A]' : 'text-[#4A4A4A]'}`}>
        {children}
      </span>
    </button>
  );
}

// ── Policy Lorem Ipsum ─────────────────────────────────────────────────────
const POLICY_TEXT = `
1. WHO CAN PARTICIPATE

Any registered user of Mind Rain with a valid account can join the Refer & Earn program and start sharing their unique referral link.

2. HOW YOU EARN

You earn 10% of the competition registration fee when: A new user signs up using your referral link or code, and they complete the full payment for a competition. Unpaid registrations will not be counted.

3. REWARD STATUS LOCKED TO WITHDRAWABLE

Your earnings go through two stages: Locked Balance This appears once your referral makes a successful payment. Withdrawable Balance This becomes available after the registration is verified and the refund period if any is completed. If a participant cancels or gets a refund, the related reward is automatically removed.

4. WITHDRAWALS

Minimum withdrawal amount: ₹1500. Payout method: UPI. Processing time: 24 hours to 7 working days. Please ensure your UPI details are correct while submitting the withdrawal request.

5. MIND RAIN WALLET

Your referral earnings are stored in your Mind Rain Wallet. The wallet shows: Locked balance, Withdrawable balance, Total earnings. Wallet balance: Cannot be transferred to another user. Can only be withdrawn once the minimum amount is reached.

6. FAIR USE POLICY

To keep the program genuine and fair, the following activities are not allowed: Self referrals, Creating multiple or fake accounts, Payment manipulation to generate rewards, Spamming or misleading promotion. If such activity is detected, Mind Rain may: Cancel the rewards, Hold or reverse wallet balance, Suspend the account.

7. PROMOTION GUIDELINES

You are welcome to promote Mind Rain, but you may not: Claim to be an official representative of Mind Rain, Use our logo or brand assets without permission, Share false information about competitions, fees, or prizes, Run paid advertisements using the Mind Rain name without approval.

8. TAXES

Any taxes applicable on the rewards earned are the responsibility of the user.

9. PROGRAM UPDATES

Mind Rain reserves the right to: Modify the reward percentage, Update withdrawal conditions, Pause or end the program if required. Any changes will be reflected on this page.

10. FINAL DECISION

All referral tracking and reward validation is done through our system, and Mind Rain’s decision regarding eligibility and payouts will be final.

11. PRIVACY NOTE FOR REFERRALS

We use unique referral links and codes to track successful referrals. This helps us attribute rewards to the correct user. No sensitive personal data is shared with others.

`.trim();

// ── Main Page ──────────────────────────────────────────────────────────────
export default function EarnOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const policyRef = useRef<HTMLDivElement>(null);

  const [referralCode, setReferralCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  const [checks, setChecks] = useState({ policies: false, terms: false, create: false });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasScrolledPolicy, setHasScrolledPolicy] = useState(false);

  // Sanitise input: uppercase alphanumeric only
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setReferralCode(raw);
    if (raw.length > 0 && (raw.length < 6 || raw.length > 18)) {
      setCodeError('Code must be 6–18 uppercase letters or numbers');
    } else {
      setCodeError(null);
    }
  };

  const toggle = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isCodeValid = referralCode.length >= 6 && referralCode.length <= 18;
  const allChecked = checks.policies && checks.terms && checks.create;
  const canSubmit = isCodeValid && allChecked && !isLoading;

  // Detect policy scroll-to-bottom
  const handlePolicyScroll = () => {
    const el = policyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setHasScrolledPolicy(true);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setSubmitError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create an earn account.');

      // 1. Check referral code uniqueness
      const { data: existing, error: checkError } = await supabase
        .from('referral_account')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        setSubmitError('This referral code is already taken. Please choose a different one.');
        setIsLoading(false);
        return;
      }

      // 2. Insert into referral_account
      const { error: insertError } = await supabase
        .from('referral_account')
        .insert({ id: user.id, referral_code: referralCode });

      if (insertError) throw insertError;

      // 3. Set earn_account = true in user_info
      const { error: updateError } = await supabase
        .from('user_info')
        .update({ earn_account: true })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Redirect
      router.push('/earn/dashboard');

    } catch (err) {
      console.error('Earn onboarding error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              Refer &amp; Earn
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Create Earn Account</h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            Read through the policies, set your referral code, and you're in.
          </p>
        </div>

        {/* ── Error ── */}
        {submitError && (
          <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
            <p className="text-[#C85D3E] text-sm font-medium">{submitError}</p>
          </div>
        )}

        {/* ── Card ── */}
        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">

          {/* 1. Policies */}
          <div>
            <SectionHeading>Program Policies</SectionHeading>
            <div className="relative">
              <div
                ref={policyRef}
                onScroll={handlePolicyScroll}
                className="h-80 overflow-y-auto rounded-xl border border-[#D0CEC2] bg-white p-5 text-sm text-[#3A3A3A] leading-relaxed space-y-4 scroll-smooth"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0CEC2 transparent' }}
              >
                {POLICY_TEXT.split('\n\n').map((para, i) => (
                  <p key={i} className={para.match(/^\d+\./) ? 'font-bold text-[#1A1A1A] mt-4 first:mt-0' : ''}>
                    {para}
                  </p>
                ))}
              </div>
              {/* fade-out at bottom when not scrolled */}
              {!hasScrolledPolicy && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 rounded-b-xl bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            {!hasScrolledPolicy && (
              <p className="text-[10px] text-[#8B8B8B] mt-1.5 pl-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Scroll to read all policies
              </p>
            )}
            {hasScrolledPolicy && (
              <p className="text-[10px] text-[#2D5F4F] mt-1.5 pl-1 flex items-center gap-1 font-semibold">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Policies fully reviewed
              </p>
            )}
          </div>

          <div className="border-t border-[#E5E3D7]" />

          {/* 2. Referral code */}
          <div>
            <SectionHeading>Your Referral Code</SectionHeading>
            <FloatingInput
              label="Create your referral code"
              value={referralCode}
              onChange={handleCodeChange}
              disabled={isLoading}
              maxLength={18}
              hint={
                referralCode.length === 0
                  ? 'Only uppercase letters (A–Z) and numbers (0–9) · 6 to 18 characters'
                  : codeError
                    ? undefined
                    : `${referralCode.length}/18 characters · looking good!`
              }
            />
            {codeError && (
              <p className="text-xs text-[#C85D3E] font-medium mt-1.5 pl-1">{codeError}</p>
            )}

            {/* Live preview badge */}
            {referralCode.length >= 6 && !codeError && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B8B8B]">Preview</span>
                <span className="px-3 py-1.5 rounded-lg bg-[#2C5F5F]/10 border border-[#2C5F5F]/20 font-mono font-bold text-sm text-[#2C5F5F] tracking-widest">
                  {referralCode}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-[#E5E3D7]" />

          {/* 3. Checkboxes */}
          <div>
            <SectionHeading>Confirm &amp; Agree</SectionHeading>
            <div className="space-y-2">
              <CheckRow
                checked={checks.policies}
                onChange={() => toggle('policies')}
                disabled={isLoading}
              >
                I have read all the program policies and understand the terms of participation.
              </CheckRow>
              <CheckRow
                checked={checks.terms}
                onChange={() => toggle('terms')}
                disabled={isLoading}
              >
                I agree with the Terms &amp; Conditions governing the Refer &amp; Earn program.
              </CheckRow>
              <CheckRow
                checked={checks.create}
                onChange={() => toggle('create')}
                disabled={isLoading}
              >
                I wish to create an Earn Account and understand that this cannot be undone.
              </CheckRow>
            </div>
          </div>

          <div className="border-t border-[#E5E3D7]" />

          {/* 4. Submit */}
          <div>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`
                w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                ${canSubmit
                  ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                  : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                }
              `}
            >
              {isLoading
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating your account…
                  </span>
                )
                : 'Create Earn Account →'
              }
            </button>

            {!canSubmit && !isLoading && (
              <p className="text-xs text-[#8B8B8B] text-center mt-2">
                {!isCodeValid
                  ? 'Enter a valid referral code to continue'
                  : !allChecked
                    ? 'Check all boxes above to enable account creation'
                    : ''
                }
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
