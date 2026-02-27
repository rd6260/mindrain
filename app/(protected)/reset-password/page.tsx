'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";

const FEARLogo = localFont({
  src: "../../fonts/FEARLogo-Regular.woff2"
})

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function PasswordField({
  label,
  name,
  disabled,
  onChange,
  error,
}: {
  label: string;
  name: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  error?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <label className="relative block w-full">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        placeholder=" "
        required
        disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`
          peer w-full px-4 pt-6 pb-2 pr-11 text-[#1A1A1A] bg-[#F8F7F2]
          border rounded-xl outline-none
          text-sm font-medium
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-[#C85D3E] focus:border-[#C85D3E] focus:ring-2 focus:ring-[#C85D3E]/10'
            : 'border-[#D0CEC2] focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10'
          }
        `}
      />
      <span className={`
        absolute left-4 top-4 text-sm
        transition-all duration-200 pointer-events-none
        peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold
        peer-[&:not(:placeholder-shown)]:top-2
        peer-[&:not(:placeholder-shown)]:text-xs
        peer-[&:not(:placeholder-shown)]:font-semibold
        ${error
          ? 'text-[#C85D3E] peer-focus:text-[#C85D3E] peer-[&:not(:placeholder-shown)]:text-[#C85D3E]'
          : 'text-[#8B8B8B] peer-focus:text-[#2C5F5F] peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]'
        }
      `}>
        {label}
      </span>
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4B4B4B] transition-colors disabled:opacity-40"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </label>
  );
}

// Simple password strength meter
function StrengthMeter({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', '#C85D3E', '#E8A84B', '#5B9B8A', '#2C5F5F'];

  if (!password) return null;

  return (
    <div className="space-y-1.5 px-0.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : '#D0CEC2' }}
          />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs font-semibold transition-colors" style={{ color: colors[score] }}>
          {labels[score]}
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Supabase sends the user back with a token in the URL hash.
  // The client SDK exchanges it automatically on load — we just need
  // to wait for the session to be established.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });
    // Also check if already in a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center px-4">

      {/* Error toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3 shadow-lg">
          <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
          <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success dialog */}
      {done && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2C5F5F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">✅</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Password updated!</h3>
            <p className="text-sm text-[#6B6B6B] mb-7">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
            >
              Go to sign in
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">

        {/* Page header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              Welcome to <span className={`${FEARLogo.className}`}> Mind Rain </span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            New password
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            Choose a strong password for your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-5">

          {!sessionReady ? (
            /* Waiting for token exchange */
            <div className="py-8 flex flex-col items-center gap-3 text-[#6B6B6B]">
              <span className="w-6 h-6 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Verifying your reset link…</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <PasswordField
                label="New password"
                name="password"
                disabled={isLoading}
                onChange={setPassword}
              />

              {/* Strength meter */}
              <StrengthMeter password={password} />

              <div className="relative">
                <PasswordField
                  label="Confirm new password"
                  name="confirmPassword"
                  disabled={isLoading}
                  onChange={setConfirmPassword}
                  error={passwordMismatch}
                />
                {passwordMismatch && (
                  <p className="mt-1.5 text-xs text-[#C85D3E] font-medium pl-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || passwordMismatch || !password}
                  className={`
                    w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                    ${isLoading || passwordMismatch || !password
                      ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                      : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isLoading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                        Updating password…
                      </span>
                    : 'Update password →'
                  }
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-center text-[#8B8B8B]">
            Remember your password?{' '}
            <a href="/login" className="text-[#2C5F5F] font-semibold hover:underline">
              Sign in
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}
