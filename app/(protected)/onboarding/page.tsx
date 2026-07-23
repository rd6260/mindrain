'use client';

import { useState, FormEvent, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { isOnboardingComplete } from '@/utils/onboarding';

const ROLES = ['Student', 'Educator', 'Architect', 'Professional', 'Enthusiast', 'Other'];
const ROLES_WITH_INSTITUTE = ['Student', 'Educator'];

// Floating label input component — same style as registration page
function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="relative block w-full group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder=" "
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
        peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]
      ">
        {label}
      </span>
    </label>
  );
}

// Floating label select component
function FloatingSelect({
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  const hasValue = value !== '';
  return (
    <label className="relative block w-full group">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="
          peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]
          border border-[#D0CEC2] rounded-xl outline-none
          text-sm font-medium appearance-none
          transition-all duration-200
          focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <option value="" disabled hidden></option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className={`
        absolute left-4 pointer-events-none transition-all duration-200
        ${hasValue
          ? 'top-2 text-xs font-semibold text-[#6B6B6B]'
          : 'top-4 text-sm text-[#8B8B8B] peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#2C5F5F]'
        }
      `}>
        {label}
      </span>
      {/* Chevron icon */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8B8B8B]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </label>
  );
}

// Section heading with accent dot
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
  // Whether this is a resume/update of an existing incomplete record
  const [isResuming, setIsResuming] = useState(false);
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
        // If onboarding is fully complete, redirect away
        if (isOnboardingComplete(userInfo)) {
          router.push('/home');
          return;
        }

        // Pre-fill existing data so the user can complete the missing parts
        setIsResuming(true);
        if (userInfo.name) setName(userInfo.name);
        if (userInfo.role) {
          if (ROLES.includes(userInfo.role)) {
            setSelectedRole(userInfo.role);
          } else {
            setSelectedRole('Other');
            setCustomRole(userInfo.role);
          }
        }
        if (userInfo.institute) setInstitute(userInfo.institute);
        if (userInfo.academic_level) setAcademicLevel(userInfo.academic_level);
        if (userInfo.academic_year) setSelectedYear(String(userInfo.academic_year));
      }

      setIsChecking(false);
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

      const payload = {
        id: user.id,
        name,
        role: finalRole,
        institute: ROLES_WITH_INSTITUTE.includes(selectedRole) ? institute : null,
        academic_year: selectedRole === 'Student' ? parseInt(selectedYear) : null,
        academic_level: selectedRole === 'Student' ? academicLevel : null,
      };

      if (isResuming) {
        // Update the existing incomplete record
        const { error: updateError } = await supabase
          .from('user_info')
          .update({
            name: payload.name,
            role: payload.role,
            institute: payload.institute,
            academic_year: payload.academic_year,
            academic_level: payload.academic_level,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } else {
        // Insert a new record
        const { error: insertError } = await supabase
          .from('user_info')
          .insert(payload);

        if (insertError) throw insertError;
      }

      router.push('/home');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              {isResuming ? 'Complete Your Profile' : 'Getting Started'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            {isResuming ? 'Finish setting up your account' : 'Welcome! Let\'s set up your account'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {isResuming
              ? 'A few details are still missing — fill them in to unlock all features'
              : 'Tell us a bit about yourself to personalize your experience'}
          </p>
        </div>

        {/* Resume banner */}
        {isResuming && (
          <div className="mb-5 p-4 bg-[#2C5F5F]/10 border border-[#2C5F5F]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#2C5F5F] text-lg mt-0.5">ℹ</span>
            <p className="text-[#2C5F5F] text-sm font-medium">
              Your profile was partially saved. We've pre-filled what we have — just complete the missing fields below.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
            <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">

            {/* Full Name */}
            <div>
              <SectionHeading>Your Name</SectionHeading>
              <FloatingInput
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="border-t border-[#E5E3D7]" />

            {/* Profession */}
            <div>
              <SectionHeading>Profession</SectionHeading>
              <div className="space-y-3">
                <FloatingSelect
                  label="Select a profession"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={isLoading}
                  options={ROLES.map(role => ({ value: role, label: role }))}
                />

                {/* Custom Role (if Other) */}
                {selectedRole === 'Other' && (
                  <FloatingInput
                    label="Enter your profession"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    disabled={isLoading}
                  />
                )}
              </div>
            </div>

            {/* Institute (Student or Educator) */}
            {ROLES_WITH_INSTITUTE.includes(selectedRole) && (
              <>
                <div className="border-t border-[#E5E3D7]" />
                <div>
                  <SectionHeading>Institute</SectionHeading>
                  <FloatingInput
                    label="University / Institution Name"
                    value={institute}
                    onChange={(e) => setInstitute(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </>
            )}

            {/* Academic Level (Student only) */}
            {selectedRole === 'Student' && (
              <>
                <div className="border-t border-[#E5E3D7]" />
                <div>
                  <SectionHeading>Academic Details</SectionHeading>
                  <div className="space-y-3">
                    <FloatingSelect
                      label="Academic Level"
                      value={academicLevel}
                      onChange={(e) => setAcademicLevel(e.target.value)}
                      disabled={isLoading}
                      options={[
                        { value: 'UG', label: 'Under Graduate' },
                        { value: 'PG', label: 'Post Graduate' },
                      ]}
                    />

                    {/* Academic Year (after level is selected) */}
                    {academicLevel && (
                      <FloatingSelect
                        label="Academic Year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        disabled={isLoading}
                        options={yearOptions.map(y => ({ value: y.toString(), label: `Year ${y}` }))}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="border-t border-[#E5E3D7]" />

            {/* Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${!isLoading
                    ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                    : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                  }
                `}
              >
                {isLoading
                  ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Setting up...
                    </span>
                  )
                  : isResuming ? 'Save & Complete Setup' : 'Complete Setup'
                }
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
