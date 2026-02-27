'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";

const FEARLogo = localFont({ src: "../../fonts/FEARLogo-Regular.woff2" });

const RESEND_COOLDOWN = 90; // 1 min 30 sec

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── Floating label input with optional password eye toggle ───────────────────

function FloatingInput({
  label, type = 'text', name, disabled, onChange, error,
}: {
  label: string; type?: string; name: string;
  disabled?: boolean; onChange?: (v: string) => void; error?: boolean;
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <label className="relative block w-full">
      <input
        type={inputType} name={name} placeholder=" " required disabled={disabled}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={[
          'peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]',
          'border rounded-xl outline-none text-sm font-medium transition-all duration-200',
          isPassword ? 'pr-11' : '',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-[#C85D3E] focus:border-[#C85D3E] focus:ring-2 focus:ring-[#C85D3E]/10'
            : 'border-[#D0CEC2] focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10',
        ].join(' ')}
      />
      <span className={[
        'absolute left-4 top-4 text-sm transition-all duration-200 pointer-events-none',
        'peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold',
        'peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-semibold',
        error
          ? 'text-[#C85D3E] peer-focus:text-[#C85D3E] peer-[&:not(:placeholder-shown)]:text-[#C85D3E]'
          : 'text-[#8B8B8B] peer-focus:text-[#2C5F5F] peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]',
      ].join(' ')}>
        {label}
      </span>
      {isPassword && (
        <button type="button" tabIndex={-1} disabled={disabled}
          onClick={() => setShowPw(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4B4B4B] transition-colors disabled:opacity-40"
          aria-label={showPw ? 'Hide password' : 'Show password'}>
          {showPw ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </label>
  );
}

// ─── Confirm password toggle (DOM-based since input is uncontrolled) ──────────

function ConfirmPasswordToggle({ disabled }: { disabled?: boolean }) {
  const [show, setShow] = useState(false);
  const handleToggle = () => {
    setShow(v => {
      const next  = !v;
      const btn   = document.activeElement as HTMLElement;
      const input = btn?.closest('label')?.querySelector('input') as HTMLInputElement | null;
      if (input) input.type = next ? 'text' : 'password';
      return next;
    });
  };
  return (
    <button type="button" tabIndex={-1} disabled={disabled} onClick={handleToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B8B8B] hover:text-[#4B4B4B] transition-colors disabled:opacity-40"
      aria-label={show ? 'Hide password' : 'Show password'}>
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

// ─── Shared resend button UI ──────────────────────────────────────────────────

function ResendButton({
  onResend, cooldown, isResending, resendSuccess, label,
}: {
  onResend: () => void;
  cooldown: number;
  isResending: boolean;
  resendSuccess: boolean;
  label: string;
}) {
  const circ = 2 * Math.PI * 12;
  const fmt  = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <button
      onClick={onResend}
      disabled={cooldown > 0 || isResending}
      className={[
        'w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 mb-3',
        isResending || cooldown > 0
          ? 'bg-[#EDEBDF] text-[#8B8B8B] cursor-not-allowed border border-[#D0CEC2]'
          : resendSuccess
            ? 'bg-[#2C5F5F]/10 text-[#2C5F5F] border border-[#2C5F5F]/30 cursor-default'
            : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20',
      ].join(' ')}
    >
      {isResending ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
          Sending…
        </span>
      ) : resendSuccess ? (
        <span className="flex items-center justify-center gap-2">
          <span className="text-base leading-none">✓</span> Email sent!
        </span>
      ) : cooldown > 0 ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="#D0CEC2" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="12" fill="none" stroke="#8B8B8B" strokeWidth="3"
              strokeDasharray={String(circ)}
              strokeDashoffset={String(circ * (cooldown / RESEND_COOLDOWN))}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          Resend in {fmt(cooldown)}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type View = 'auth' | 'forgot';

export default function LoginPage() {
  const [isLoading,             setIsLoading]             = useState(false);
  const [error,                 setError]                 = useState<string | null>(null);
  const [isSignup,              setIsSignup]               = useState(false);
  const [showSuccessDialog,     setShowSuccessDialog]     = useState(false);
  const [forgotSuccessDialog,   setForgotSuccessDialog]   = useState(false);
  const [password,              setPassword]               = useState('');
  const [confirmPassword,       setConfirmPassword]       = useState('');
  const [view,                  setView]                   = useState<View>('auth');

  // Signup resend state
  const [signupEmail,           setSignupEmail]           = useState('');
  const [resendCooldown,        setResendCooldown]         = useState(0);
  const [isResending,           setIsResending]           = useState(false);
  const [resendSuccess,         setResendSuccess]         = useState(false);

  // Forgot-password resend state (independent cooldown)
  const [forgotEmail,           setForgotEmail]           = useState('');
  const [forgotResendCooldown,  setForgotResendCooldown]  = useState(0);
  const [isForgotResending,     setIsForgotResending]     = useState(false);
  const [forgotResendSuccess,   setForgotResendSuccess]   = useState(false);

  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.push('/onboarding');
    });
  }, [router, supabase]);

  // Signup resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Forgot resend countdown
  useEffect(() => {
    if (forgotResendCooldown <= 0) return;
    const t = setTimeout(() => setForgotResendCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [forgotResendCooldown]);

  // ── Auth handlers ────────────────────────────────────────────────────────────

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email:    fd.get('email')    as string,
        password: fd.get('password') as string,
      });
      if (error) throw error;
      router.push('/onboarding'); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setIsLoading(false); }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    const fd    = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: fd.get('password') as string,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      setSignupEmail(email);
      setResendCooldown(RESEND_COOLDOWN);
      setShowSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setIsLoading(false); }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    const fd    = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotEmail(email);
      setForgotResendCooldown(RESEND_COOLDOWN);
      setForgotSuccessDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setIsLoading(false); }
  };

  const handleResendSignupEmail = async () => {
    if (resendCooldown > 0 || isResending || !signupEmail) return;
    setIsResending(true); setResendSuccess(false);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup', email: signupEmail,
        options: { emailRedirectTo: `${window.location.origin}/onboarding` },
      });
      if (error) throw error;
      setResendSuccess(true);
      setResendCooldown(RESEND_COOLDOWN);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally { setIsResending(false); }
  };

  const handleResendResetEmail = async () => {
    if (forgotResendCooldown > 0 || isForgotResending || !forgotEmail) return;
    setIsForgotResending(true); setForgotResendSuccess(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setForgotResendSuccess(true);
      setForgotResendCooldown(RESEND_COOLDOWN);
      setTimeout(() => setForgotResendSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally { setIsForgotResending(false); }
  };

  const passwordMismatch = isSignup && confirmPassword.length > 0 && password !== confirmPassword;
  const switchToAuth = () => { setView('auth'); setError(null); setPassword(''); setConfirmPassword(''); };

  return (
    <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center px-4">

      {/* Error toast */}
      {error && (
        <div className="fixed top-5 right-5 z-50 max-w-sm p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3 shadow-lg">
          <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
          <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Sign-up success / resend dialog ── */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2C5F5F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">📬</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Check your inbox</h3>
            <p className="text-sm text-[#6B6B6B] mb-1">
              We sent a confirmation link to{' '}
              <span className="font-semibold text-[#1A1A1A]">{signupEmail}</span>
            </p>
            <p className="text-xs font-bold text-[#C85D3E] uppercase tracking-wider mb-6">
              Also check your spam folder
            </p>
            <ResendButton
              onResend={handleResendSignupEmail}
              cooldown={resendCooldown}
              isResending={isResending}
              resendSuccess={resendSuccess}
              label="Resend confirmation email"
            />
            <button type="button" onClick={() => setShowSuccessDialog(false)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Forgot-password success / resend dialog ── */}
      {forgotSuccessDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2C5F5F]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">🔑</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Reset link sent</h3>
            <p className="text-sm text-[#6B6B6B] mb-1">
              We sent a reset link to{' '}
              <span className="font-semibold text-[#1A1A1A]">{forgotEmail}</span>
            </p>
            <p className="text-xs font-bold text-[#C85D3E] uppercase tracking-wider mb-6">
              Also check your spam folder
            </p>
            <ResendButton
              onResend={handleResendResetEmail}
              cooldown={forgotResendCooldown}
              isResending={isForgotResending}
              resendSuccess={forgotResendSuccess}
              label="Resend reset email"
            />
            <button type="button" onClick={() => { setForgotSuccessDialog(false); switchToAuth(); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
              Back to sign in
            </button>
          </div>
        </div>
      )}

      {/* ── Main card ── */}
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              Welcome to <span className={FEARLogo.className}> Mind Rain </span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            {view === 'forgot' ? 'Reset password' : isSignup ? 'Create account' : 'Sign in'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {view === 'forgot'
              ? "We'll send a reset link to your email"
              : isSignup ? 'Join to register for events' : 'Continue to your dashboard'}
          </p>
        </div>

        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-5">

          {view === 'forgot' ? (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <FloatingInput label="Email address" type="email" name="email" disabled={isLoading} />
                <div className="pt-2">
                  <button type="submit" disabled={isLoading}
                    className={['w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200',
                      isLoading
                        ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                        : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:-translate-y-0.5',
                    ].join(' ')}>
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                          Sending reset link...
                        </span>
                      : 'Send reset link →'}
                  </button>
                </div>
              </form>
              <p className="text-xs text-center text-[#8B8B8B]">
                Remember your password?{' '}
                <button type="button" onClick={switchToAuth} className="text-[#2C5F5F] font-semibold hover:underline">
                  Back to sign in
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Tab switcher */}
              <div className="flex bg-[#EDEBDF] rounded-xl p-1 gap-1">
                {(['Log in', 'Sign up'] as const).map((label, i) => {
                  const active = isSignup === Boolean(i);
                  return (
                    <button key={label} type="button"
                      onClick={() => { setIsSignup(Boolean(i)); setError(null); setPassword(''); setConfirmPassword(''); }}
                      className={['flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
                        active ? 'bg-white text-[#2C5F5F] shadow-sm border border-[#D0CEC2]' : 'text-[#8B8B8B] hover:text-[#4B4B4B]',
                      ].join(' ')}>
                      {label}
                    </button>
                  );
                })}
              </div>

              <form key={isSignup ? 'signup' : 'login'} onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-3">
                <FloatingInput label="Email address" type="email" name="email" disabled={isLoading} />
                <FloatingInput label="Password" type="password" name="password" disabled={isLoading}
                  onChange={isSignup ? setPassword : undefined} />

                {!isSignup && (
                  <div className="flex justify-end -mt-1">
                    <button type="button" onClick={() => { setView('forgot'); setError(null); }}
                      className="text-xs text-[#2C5F5F] font-semibold hover:underline">
                      Forgot password?
                    </button>
                  </div>
                )}

                {isSignup && (
                  <div>
                    <label className="relative block w-full">
                      <input type="password" name="confirmPassword" placeholder=" " required disabled={isLoading}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={[
                          'peer w-full px-4 pt-6 pb-2 pr-11 text-[#1A1A1A] bg-[#F8F7F2]',
                          'border rounded-xl outline-none text-sm font-medium transition-all duration-200',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          passwordMismatch
                            ? 'border-[#C85D3E] focus:border-[#C85D3E] focus:ring-2 focus:ring-[#C85D3E]/10'
                            : 'border-[#D0CEC2] focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10',
                        ].join(' ')}
                      />
                      <span className={[
                        'absolute left-4 top-4 text-sm transition-all duration-200 pointer-events-none',
                        'peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold',
                        'peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-semibold',
                        passwordMismatch
                          ? 'text-[#C85D3E] peer-focus:text-[#C85D3E] peer-[&:not(:placeholder-shown)]:text-[#C85D3E]'
                          : 'text-[#8B8B8B] peer-focus:text-[#2C5F5F] peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]',
                      ].join(' ')}>
                        Confirm password
                      </span>
                      <ConfirmPasswordToggle disabled={isLoading} />
                    </label>
                    {passwordMismatch && (
                      <p className="mt-1.5 text-xs text-[#C85D3E] font-medium pl-1">Passwords do not match</p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button type="submit" disabled={isLoading || passwordMismatch}
                    className={['w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200',
                      isLoading || passwordMismatch
                        ? 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                        : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:-translate-y-0.5',
                    ].join(' ')}>
                    {isLoading
                      ? <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-[#8B8B8B] border-t-transparent rounded-full animate-spin" />
                          {isSignup ? 'Creating account...' : 'Signing in...'}
                        </span>
                      : isSignup ? 'Create account →' : 'Sign in →'}
                  </button>
                </div>
              </form>

              <p className="text-xs text-center text-[#8B8B8B]">
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                <button type="button"
                  onClick={() => { setIsSignup(!isSignup); setError(null); setPassword(''); setConfirmPassword(''); }}
                  className="text-[#2C5F5F] font-semibold hover:underline">
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
