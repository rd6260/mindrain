'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/onboarding');
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) throw error;
      
      setShowSuccessPopup(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edebdf' }}>
      {/* Error Toast */}
      {error && (
        <div className="fixed top-5 right-5 px-5 py-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] z-50 animate-slide-in">
          {error}
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-md mx-4">
            <div className="text-2xl font-black text-[#323232] mb-4 text-center">
              Check your email!
            </div>
            <p className="text-[#323232] text-center mb-2">
              We've sent you a confirmation link.
            </p>
            <p className="text-[#323232] font-semibold text-center mb-6">
              CHECK SPAM FOLDER
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="w-full h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[17px] font-semibold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      
      <div className="relative flex flex-col items-center justify-center gap-8 w-12 h-5 -translate-y-48">
        {/* Switch Labels */}
        <div className="absolute -left-[70px] top-0 w-24 font-semibold text-[#323232]" style={{ textDecoration: !isSignup ? 'underline' : 'none' }}>
          Log in
        </div>
        <div className="absolute left-[70px] top-0 w-24 font-semibold text-[#323232]" style={{ textDecoration: isSignup ? 'underline' : 'none' }}>
          Sign up
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setIsSignup(!isSignup)}
          className="absolute top-0 left-0 right-0 bottom-0 bg-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] cursor-pointer transition-all duration-300"
          style={{ backgroundColor: isSignup ? '#2d8cf0' : '#fff' }}
        >
          <span 
            className="absolute h-5 w-5 border-2 border-[#323232] rounded-md -left-0.5 bottom-0.5 bg-white shadow-[0_3px_0_0_#323232] transition-transform duration-300"
            style={{ transform: isSignup ? 'translateX(30px)' : 'translateX(0)' }}
          />
        </button>

        {/* Flip Card Container */}
        <div 
          className="w-[300px] h-[350px] relative mt-12 transition-transform duration-[800ms]"
          style={{ 
            perspective: '1000px',
            transformStyle: 'preserve-3d',
            transform: isSignup ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Login Card (Front) */}
          <div 
            className="absolute w-full p-5 flex flex-col justify-center gap-5 bg-[lightgrey] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              boxShadow: isSignup ? 'none' : '4px 4px 0 0 #323232'
            }}
          >
            <div className="my-5 text-2xl font-black text-center text-[#323232]">
              Log in
            </div>
            <form onSubmit={handleLogin} className="flex flex-col items-center gap-5">
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="w-[250px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                className="w-[250px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="my-5 w-[120px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[17px] font-semibold text-[#323232] cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : "Let's go!"}
              </button>
            </form>
          </div>

          {/* Signup Card (Back) */}
          <div 
            className="absolute w-full p-5 flex flex-col justify-center gap-5 bg-[lightgrey] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="my-5 text-2xl font-black text-center text-[#323232]">
              Sign up
            </div>
            <form onSubmit={handleSignup} className="flex flex-col items-center gap-5">
              <input
                type="email"
                placeholder="Email"
                name="email"
                className="w-[250px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                name="password"
                className="w-[250px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="my-5 w-[120px] h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[17px] font-semibold text-[#323232] cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Confirm!'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
