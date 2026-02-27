'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";

const FEARLogo = localFont({
  src: "../../fonts/FEARLogo-Regular.woff2"
})

// Eye icon components
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

// Floating label input with optional password toggle
function FloatingInput({
  label,
  type = 'text',
  name,
  disabled,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  name: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  error?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className="relative block w-full group">
      <input
        type={inputType}
        name={name}
        placeholder=" "
        required
        disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={`
          peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]
          border rounded-xl outline-none
          text-sm font-medium
          transition-all duration-200
          ${isPassword ? 'pr-11' : ''}
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
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4B4B4B] transition-colors disabled:opacity-40"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </label>
  );
}

type View = 'auth' | 'forgot';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [forgotSuccessDialog, setForgotSuccessDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [view, setView] = useState<View>('auth');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/onboarding');
    };
    checkUser();
  }, [router, supabase]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });
      if (error) throw error;
      router.push('/onboarding');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.get('email') as string,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) throw error;
      setForgotSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordMismatch = isSignup && confirmPassword.length > 0 && password !== confirmPassword;

  const switchToAuth = () => {
    setView('auth');
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center px-4">

      {/* Error toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3 shadow-lg">
          <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
          <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Sign-up success dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2C5F5F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">📬</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your inbox</h3>
            <p className="text-sm text-[#6B6B6B] mb-1">We've sent you a confirmation link.</p>
            <p className="text-xs font-bold text-[#C85D3E] uppercase tracking-wider mb-7">
              Also check your spam folder
            </p>
            <button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Forgot password success dialog */}
      {forgotSuccessDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2C5F5F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Reset link sent</h3>
            <p className="text-sm text-[#6B6B6B] mb-1">Check your email for a password reset link.</p>
            <p className="text-xs font-bold text-[#C85D3E] uppercase tracking-wider mb-7">
              Also check your spam folder
            </p>
            <button
              onClick={() => { setForgotSuccessDialog(false); switchToAuth(); }}
              className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
            >
              Back to sign in
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
            {view === 'forgot' ? 'Reset password' : isSignup ? 'Create account' : 'Sign in'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {view === 'forgot'
              ? "We'll send a reset link to your email"
              : isSignup
              ? 'Join to register for events'
              : 'Continue to your dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-5">

          {view === 'forgot' ? (
            /* ── Forgot password form ── */
            <>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <FloatingInput label="Email address" type="email" name="email" disabled={isLoading} />
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                      ${isLoading
                        ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                        : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                          Sending reset link...
                        </span>
                      : 'Send reset link →'
                    }
                  </button>
                </div>
              </form>
              <p className="text-xs text-center text-[#8B8B8B]">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={switchToAuth}
                  className="text-[#2C5F5F] font-semibold hover:underline"
                >
                  Back to sign in
                </button>
              </p>
            </>
          ) : (
            /* ── Login / Sign-up forms ── */
            <>
              {/* Tab switcher */}
              <div className="flex bg-[#EDEBDF] rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => { setIsSignup(false); setError(null); setPassword(''); setConfirmPassword(''); }}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${!isSignup
                      ? 'bg-white text-[#2C5F5F] shadow-sm border border-[#D0CEC2]'
                      : 'text-[#8B8B8B] hover:text-[#4B4B4B]'
                    }
                  `}
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignup(true); setError(null); setPassword(''); setConfirmPassword(''); }}
                  className={`
                    flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${isSignup
                      ? 'bg-white text-[#2C5F5F] shadow-sm border border-[#D0CEC2]'
                      : 'text-[#8B8B8B] hover:text-[#4B4B4B]'
                    }
                  `}
                >
                  Sign up
                </button>
              </div>

              {/* Form */}
              <form
                key={isSignup ? 'signup' : 'login'}
                onSubmit={isSignup ? handleSignup : handleLogin}
                className="space-y-3"
              >
                <FloatingInput label="Email address" type="email" name="email" disabled={isLoading} />
                <FloatingInput
                  label="Password"
                  type="password"
                  name="password"
                  disabled={isLoading}
                  onChange={isSignup ? setPassword : undefined}
                />

                {/* Forgot password link — login only */}
                {!isSignup && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(null); }}
                      className="text-xs text-[#2C5F5F] font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Confirm password — signup only */}
                {isSignup && (
                  <div className="relative">
                    <label className="relative block w-full group">
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder=" "
                        required
                        disabled={isLoading}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`
                          peer w-full px-4 pt-6 pb-2 pr-11 text-[#1A1A1A] bg-[#F8F7F2]
                          border rounded-xl outline-none
                          text-sm font-medium
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${passwordMismatch
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
                        ${passwordMismatch
                          ? 'text-[#C85D3E] peer-focus:text-[#C85D3E] peer-[&:not(:placeholder-shown)]:text-[#C85D3E]'
                          : 'text-[#8B8B8B] peer-focus:text-[#2C5F5F] peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]'
                        }
                      `}>
                        Confirm password
                      </span>
                      <ConfirmPasswordToggle disabled={isLoading} />
                    </label>
                    {passwordMismatch && (
                      <p className="mt-1.5 text-xs text-[#C85D3E] font-medium pl-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || passwordMismatch}
                    className={`
                      w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                      ${isLoading || passwordMismatch
                        ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                        : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                          {isSignup ? 'Creating account...' : 'Signing in...'}
                        </span>
                      : isSignup ? 'Create account →' : 'Sign in →'
                    }
                  </button>
                </div>
              </form>

              {/* Footer hint */}
              <p className="text-xs text-center text-[#8B8B8B]">
                {isSignup
                  ? 'Already have an account? '
                  : "Don't have an account? "
                }
                <button
                  type="button"
                  onClick={() => { setIsSignup(!isSignup); setError(null); setPassword(''); setConfirmPassword(''); }}
                  className="text-[#2C5F5F] font-semibold hover:underline"
                >
                  {isSignup ? 'Log in' : 'Sign up'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline confirm-password eye toggle (manages its own visibility state independently)
function ConfirmPasswordToggle({ disabled }: { disabled?: boolean }) {
  const [show, setShow] = useState(false);

  // We need to control the sibling input — use a ref approach via DOM
  const handleToggle = () => {
    setShow((v) => {
      const next = !v;
      // Walk up to the label, find the input, flip its type
      const btn = document.activeElement as HTMLElement;
      const label = btn?.closest('label');
      const input = label?.querySelector('input') as HTMLInputElement | null;
      if (input) input.type = next ? 'text' : 'password';
      return next;
    });
  };

  return (
    <button
      type="button"
      tabIndex={-1}
      disabled={disabled}
      onClick={handleToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4B4B4B] transition-colors disabled:opacity-40"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}
