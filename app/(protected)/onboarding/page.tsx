'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const ROLES = ['Student', 'Educator', 'Architect', 'Professional', 'Enthusiast', 'Other'];
const ROLES_WITH_INSTITUTE = ['Student', 'Educator'];

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [customRole, setCustomRole] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [academicLevel, setAcademicLevel] = useState<string>(''); // 'UG' or 'PG'
  const [name, setName] = useState<string>('');
  const [institute, setInstitute] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Reset year when academic level changes
  useEffect(() => {
    setSelectedYear('');
  }, [academicLevel]);

  // Reset academic fields when role changes
  useEffect(() => {
    setSelectedYear('');
    setAcademicLevel('');
  }, [selectedRole]);

  useEffect(() => {
    const checkUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userInfo, error: fetchError } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user info:', fetchError);
      }

      if (userInfo) {
        router.push('/home');
      } else {
        setIsChecking(false);
      }
    };
    checkUserAndData();
  }, [router, supabase]);

  const yearOptions = academicLevel === 'PG' ? [1, 2, 3] : [1, 2, 3, 4, 5];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!selectedRole) {
      setError('Please select a role');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'Other' && !customRole.trim()) {
      setError('Please enter your profession');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'Student' && !academicLevel) {
      setError('Please select an academic level');
      setIsLoading(false);
      return;
    }

    if (selectedRole === 'Student' && !selectedYear) {
      setError('Please select an academic year');
      setIsLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const finalRole = selectedRole === 'Other' ? customRole.trim() : selectedRole;

      const { error: insertError } = await supabase
        .from('user_info')
        .insert({
          id: user.id,
          name,
          role: finalRole,
          institute: ROLES_WITH_INSTITUTE.includes(selectedRole) ? institute : null,
          academic_year: selectedRole === 'Student' ? parseInt(selectedYear) : null,
          academic_level: selectedRole === 'Student' ? academicLevel : null,
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
      {isChecking && (
        <div className="text-2xl font-black text-[#323232]">Loading...</div>
      )}

      {error && (
        <div className="fixed top-5 right-5 px-5 py-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] z-50 animate-slide-in">
          {error}
        </div>
      )}

      {!isChecking && (
        <div className="w-[440px] p-8 bg-[lightgrey] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]">
          <div className="mb-8 text-3xl font-black text-center text-[#323232]">
            Welcome! Let's set up your account
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#323232]">Full Name</label>
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
              <label className="text-[15px] font-semibold text-[#323232]">Profession</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <option value="" disabled>Select a profession</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Custom Role (if Other) */}
            {selectedRole === 'Other' && (
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#323232]">Your Profession</label>
                <input
                  type="text"
                  placeholder="Enter your profession"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Institute (Student or Educator) */}
            {ROLES_WITH_INSTITUTE.includes(selectedRole) && (
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#323232]">Institute</label>
                <input
                  type="text"
                  placeholder="University / Institution Name"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none placeholder:text-[#666] placeholder:opacity-80 focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Academic Level (Student only) */}
            {selectedRole === 'Student' && (
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#323232]">Academic Level</label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <option value="" disabled>Select academic level</option>
                  <option value="UG">Under Graduate</option>
                  <option value="PG">Post Graduate</option>
                </select>
              </div>
            )}

            {/* Academic Year (Student only, after level is selected) */}
            {selectedRole === 'Student' && academicLevel && (
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-semibold text-[#323232]">Academic Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  <option value="" disabled>Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year.toString()}>Year {year}</option>
                  ))}
                </select>
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
