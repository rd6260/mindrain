'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import localFont from "next/font/local";

const FEARLogo = localFont({
  src: "../../fonts/FEARLogo-Regular.woff2"
})

// Floating label input — matching registration page
function FloatingInput({
  label,
  type = 'text',
  name,
  disabled,
}: {
  label: string;
  type?: string;
  name: string;
  disabled?: boolean;
}) {
  return (
    <label className="relative block w-full group">
      <input
        type={type}
        name={name}
        placeholder=" "
        required
        disabled={disabled}
        className="
          peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]
          border border-[#D0CEC2] rounded-xl outline-none
          text-sm font-medium
          transition-all duration-200
          focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
      <span className="
        absolute left-4 top-4 text-[#8B8B8B] text-sm
        transition-all duration-200 pointer-events-none
        peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#2C5F5F]
        peer-[&:not(:placeholder-shown)]:top-2
        peer-[&:not(:placeholder-shown)]:text-xs
        peer-[&:not(:placeholder-shown)]:font-semibold
        peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]
      ">
        {label}
      </span>
    </label>
  );
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
    setIsLoading(true);
    setError(null);
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
            {isSignup ? 'Create account' : 'Sign in'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {isSignup ? 'Join to register for events' : 'Continue to your dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-5">

          {/* Tab switcher */}
          <div className="flex bg-[#EDEBDF] rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => { setIsSignup(false); setError(null); }}
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
              onClick={() => { setIsSignup(true); setError(null); }}
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
            <FloatingInput label="Password" type="password" name="password" disabled={isLoading} />

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
              onClick={() => { setIsSignup(!isSignup); setError(null); }}
              className="text-[#2C5F5F] font-semibold hover:underline"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
