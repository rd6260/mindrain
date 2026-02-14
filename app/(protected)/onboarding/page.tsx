'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [institute, setInstitute] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user_info already exists
      const { data: userInfo, error: fetchError } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - any other error is a problem
        console.error('Error fetching user info:', fetchError);
      }

      if (userInfo) {
        // Data exists, redirect to home
        router.push('/home');
      } else {
        // No data exists, allow form to show
        setIsChecking(false);
      }
    };
    checkUserAndData();
  }, [router, supabase]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedRole) {
      setError('Please select a role');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'student' && !selectedYear) {
      setError('Please select an academic year');
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      const { error: insertError } = await supabase
        .from('user_info')
        .insert({
          id: user.id,
          name,
          role: selectedRole,
          institute,
          academic_year: selectedRole === 'student' ? parseInt(selectedYear) : null,
        });

      if (insertError) throw insertError;
      
      router.push('/home');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edebdf' }}>
      {/* Loading State */}
      {isChecking && (
        <div className="text-2xl font-black text-[#323232]">
          Loading...
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-5 right-5 px-5 py-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] z-50 animate-slide-in">
          {error}
        </div>
      )}

      {!isChecking && (
        <div className="w-[400px] p-8 bg-[lightgrey] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]">
          <div className="mb-8 text-3xl font-black text-center text-[#323232]">
            Welcome! Let's set up your account
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#323232]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#323232]">
                Role
              </label>
              <div className="flex gap-3">
                {['student', 'faculty'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 h-10 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed ${
                      selectedRole === role
                        ? 'bg-[#2d8cf0] text-white'
                        : 'bg-white text-[#323232]'
                    }`}
                    disabled={isLoading}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Institute */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#323232]">
                Institute
              </label>
              <input
                type="text"
                placeholder="University Name"
                value={institute}
                onChange={(e) => setInstitute(e.target.value)}
                className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>

            {/* Academic Year (only for students) */}
            {selectedRole === 'student' && (
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#323232]">
                  Academic Year
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setSelectedYear(year.toString())}
                      className={`h-10 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed ${
                        selectedYear === year.toString()
                          ? 'bg-[#2d8cf0] text-white'
                          : 'bg-white text-[#323232]'
                      }`}
                      disabled={isLoading}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-5 w-full h-12 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[18px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
