'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { isOnboardingComplete } from '@/utils/onboarding';

interface MemberData {
  name: string;
  email: string;
  phone: string;
  institute: string;
  academic_year: number;
  institute_id_file: File | null;
  institute_id_url?: string;
}

interface Event {
  id: string;
  title: string;
  code_name: string;
}

// ─── Shared UI Components ────────────────────────────────────────────────────

function FloatingInput({
  label, type = 'text', value, onChange, disabled, accept, placeholder,
}: {
  label: string; type?: string; value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; accept?: string; placeholder?: string;
}) {
  return (
    <label className="relative block w-full group">
      <input
        type={type} value={value} onChange={onChange} disabled={disabled}
        accept={accept} placeholder={placeholder ?? ' '}
        className="
          peer w-full px-4 pt-6 pb-2 text-[#1A1A1A] bg-[#F8F7F2]
          border border-[#D0CEC2] rounded-xl outline-none text-sm font-medium
          transition-all duration-200
          focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10
          disabled:opacity-50 disabled:cursor-not-allowed
          file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0
          file:text-xs file:font-semibold file:bg-[#2C5F5F] file:text-white file:cursor-pointer
        "
      />
      <span className="
        absolute left-4 top-4 text-[#8B8B8B] text-sm transition-all duration-200 pointer-events-none
        peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#2C5F5F]
        peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs
        peer-[&:not(:placeholder-shown)]:font-semibold peer-[&:not(:placeholder-shown)]:text-[#6B6B6B]
      ">{label}</span>
    </label>
  );
}

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

function ToggleBtn({ active, onClick, disabled, children }: {
  active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
        ${active
          ? 'bg-[#2C5F5F] text-white border-[#2C5F5F] shadow-md shadow-[#2C5F5F]/20'
          : 'bg-[#F8F7F2] text-[#6B6B6B] border-[#D0CEC2] hover:border-[#2C5F5F] hover:text-[#2C5F5F]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
    >{children}</button>
  );
}

function RegistrationStatusDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#2D5F4F]">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Already Registered</h3>
        <p className="text-sm text-[#6B6B6B] mb-7 leading-relaxed">
          You have already completed registration and payment for this event.
        </p>
        <button onClick={() => { window.location.href = '/'; }}
          className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
        >Go to Home</button>
      </div>
    </div>
  );
}

// ─── Main Registration Form ──────────────────────────────────────────────────

function RegistrationContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('event_id');

  // Onboarding gate
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdFromUrl);
  const [eventPreCode, setEventPreCode] = useState('');
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [countryType, setCountryType] = useState<'India' | 'Other'>('India');
  const [country, setCountry] = useState('India');
  const [group, setGroup] = useState<'A' | 'B' | ''>('');
  const [category, setCategory] = useState<'1' | '2' | ''>('');
  const [teamType, setTeamType] = useState<'solo' | 'group' | ''>('');
  const [members, setMembers] = useState<MemberData[]>([]);


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlreadyPaid, setShowAlreadyPaid] = useState(false);
  const [existingRegistrationId, setExistingRegistrationId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberData>({
    name: '', email: '', phone: '', institute: '', academic_year: 1, institute_id_file: null,
  });

  const supabase = createClient();

  // Check onboarding on mount
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setOnboardingChecked(true); return; }
      const { data: userInfo } = await supabase
        .from('user_info').select('name, role, institute, academic_year, academic_level')
        .eq('id', user.id).maybeSingle();
      setOnboardingDone(isOnboardingComplete(userInfo));
      setOnboardingChecked(true);
    };
    check();
  }, []);

  // Load event and check existing registration
  useEffect(() => {
    const fetchEvent = async () => {
      setLoadingEvents(true);
      if (eventIdFromUrl) {
        const { data: event } = await supabase
          .from('events').select('id, title, code_name')
          .eq('id', eventIdFromUrl).maybeSingle();
        if (event) {
          setSelectedEventId(event.id);
          setEventPreCode(event.code_name);
          await loadExisting(event.id);
        } else {
          setSelectedEventId(null);
          await fetchAll();
        }
      } else {
        await fetchAll();
      }
      setLoadingEvents(false);
    };
    const fetchAll = async () => {
      const { data: events } = await supabase.from('events').select('id, title, code_name').order('title');
      if (events) setAvailableEvents(events);
    };
    fetchEvent();
  }, [eventIdFromUrl]);

  const loadExisting = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: reg } = await supabase
      .from('registrations_v3').select('*')
      .eq('registration_by', user.id).eq('event_id', eventId).maybeSingle();
    if (!reg) return;

    if (reg.paid) {
      setIsPaid(true);
      setShowAlreadyPaid(true);
      return;
    }

    setExistingRegistrationId(reg.id);
    setIsEditMode(true);
    const fd = reg.form_data || {};
    setCountry(fd.country || 'India');
    setCountryType(fd.country === 'India' || !fd.country ? 'India' : 'Other');
    setGroup(fd.group || '');
    setCategory(fd.category || '');
    setTeamType(fd.team_type || '');
    if (fd.members) {
      setMembers(fd.members.map((m: any) => ({
        name: m.name || '', email: m.email || '', phone: m.phone || '',
        institute: m.institute || '', academic_year: m.academic_year || 1,
        institute_id_file: null, institute_id_url: m.institute_id_url || '',
      })));
    }
  };

  useEffect(() => {
    if (teamType === 'solo' && members.length > 1) setMembers([members[0]]);
  }, [teamType]);

  const handleEventSelect = async (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEventId(event.id);
      setEventPreCode(event.code_name);
      await loadExisting(event.id);
    }
  };

  const getAvailableYears = (): number[] => {
    if (category === '1') return [1, 2];
    if (category === '2') return [3, 4, 5];
    return [1, 2, 3, 4, 5];
  };

  const canAddMore = () => {
    if (teamType === 'solo') return members.length < 1;
    if (teamType === 'group') return members.length < 3;
    return false;
  };

  const canSubmit = () => {
    if (isPaid) return false;
    if (!selectedEventId || !country || !group || !category || !teamType) return false;
    if (teamType === 'solo') return members.length === 1;
    if (teamType === 'group') return members.length >= 2 && members.length <= 3;
    return false;
  };

  const handleAddMember = () => {
    const year = category === '1' ? 1 : category === '2' ? 3 : 1;
    setCurrentMember({ name: '', email: '', phone: '', institute: '', academic_year: year, institute_id_file: null });
    setShowAddMember(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0])
      setCurrentMember({ ...currentMember, institute_id_file: e.target.files[0] });
  };

  const handleSaveMember = () => {
    if (!currentMember.name || !currentMember.email || !currentMember.phone || !currentMember.institute) {
      setError('Please fill all member fields'); return;
    }
    if (!currentMember.institute_id_file && !currentMember.institute_id_url) {
      setError('Please upload institute ID'); return;
    }
    const allowed = getAvailableYears();
    if (!allowed.includes(currentMember.academic_year)) {
      setError(`Academic year must be ${allowed.join(' or ')} for the selected category`); return;
    }
    setMembers([...members, currentMember]);
    setCurrentMember({ name: '', email: '', phone: '', institute: '', academic_year: category === '1' ? 1 : 3, institute_id_file: null });
    setShowAddMember(false);
    setError(null);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const uploadInstituteId = async (file: File, userId: string, memberIndex: number): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}_${memberIndex}.${ext}`;
    const { error } = await supabase.storage.from('college_id/architecture_of_play').upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('college_id/architecture_of_play').getPublicUrl(fileName);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) { setError('Please complete all required fields'); return; }
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload institute IDs for members that have new files
      const processedMembers = [];
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        let instituteIdUrl = m.institute_id_url || '';
        if (m.institute_id_file) {
          instituteIdUrl = await uploadInstituteId(m.institute_id_file, user.id, i);
        }
        processedMembers.push({
          name: m.name, email: m.email, phone: m.phone,
          institute: m.institute, academic_year: m.academic_year,
          institute_id_url: instituteIdUrl,
        });
      }

      // Build form_data JSONB
      const form_data: Record<string, any> = {
        country,
        group,
        category,
        team_type: teamType,
        members: processedMembers,
      };


      // Submit via v3 API
      const res = await fetch('/api/v3/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: selectedEventId, form_data }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Redirect to payment
      window.location.href = `/payment-3?registration_id=${data.registration_id}`;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading
  if (!onboardingChecked || loadingEvents) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  // Onboarding gate
  if (!onboardingDone) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#2C5F5F]/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-[#2C5F5F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Complete Your Profile First</h2>
            <p className="text-sm text-[#6B6B6B] mb-7">You need to finish setting up your account before registering.</p>
            <a href="/onboarding" className="block w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20">
              Set Up My Profile →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Event selection
  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Select an Event</h1>
            <p className="text-[#6B6B6B] mt-2 text-sm">Choose the event you'd like to register for</p>
          </div>
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-2 space-y-1.5">
            {availableEvents.length === 0
              ? <p className="text-[#8B8B8B] text-center py-10 text-sm">No events available.</p>
              : availableEvents.map(event => (
                  <button key={event.id} onClick={() => handleEventSelect(event.id)}
                    className="w-full p-4 text-left rounded-xl bg-white border border-transparent hover:border-[#2C5F5F] hover:shadow-md transition-all group">
                    <div className="font-semibold text-[#1A1A1A] group-hover:text-[#2C5F5F]">{event.title}</div>
                    <div className="text-xs text-[#8B8B8B] mt-0.5 font-mono">{event.code_name}</div>
                  </button>
                ))
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
              <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F]">
              {isEditMode ? 'Edit Mode' : 'New Registration'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            {isEditMode ? 'Update Registration' : 'Event Registration'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {isEditMode ? 'Update your details below and proceed to payment' : 'Complete all sections to secure your spot'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
            <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">

          {/* Country */}
          <div>
            <SectionHeading>Country</SectionHeading>
            <div className="flex gap-2 mb-3">
              <ToggleBtn active={countryType === 'India'} onClick={() => { setCountryType('India'); setCountry('India'); }} disabled={isLoading || isPaid}>India</ToggleBtn>
              <ToggleBtn active={countryType === 'Other'} onClick={() => { setCountryType('Other'); setGroup('A'); }} disabled={isLoading || isPaid}>Others</ToggleBtn>
            </div>
            {countryType === 'Other' && (
              <FloatingInput label="Enter your country" value={country === 'India' ? '' : country}
                onChange={e => setCountry(e.target.value)} disabled={isLoading || isPaid} />
            )}
          </div>

          {/* Group */}
          {countryType === 'India' && (
            <div>
              <SectionHeading>Group</SectionHeading>
              <div className="flex gap-2">
                <ToggleBtn active={group === 'A'} onClick={() => setGroup('A')} disabled={isLoading || isPaid}>Group A — Monetary Award</ToggleBtn>
                <ToggleBtn active={group === 'B'} onClick={() => setGroup('B')} disabled={isLoading || isPaid}>Group B — No Monetary Award</ToggleBtn>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <SectionHeading>Category</SectionHeading>
            <div className="flex gap-2">
              <ToggleBtn active={category === '1'} onClick={() => setCategory('1')} disabled={isLoading || isPaid}>
                <span className="block text-xs font-bold">Category I</span>
                <span className="block text-[10px] opacity-70 mt-0.5">1st & 2nd year</span>
              </ToggleBtn>
              <ToggleBtn active={category === '2'} onClick={() => setCategory('2')} disabled={isLoading || isPaid}>
                <span className="block text-xs font-bold">Category II</span>
                <span className="block text-[10px] opacity-70 mt-0.5">3rd, 4th & 5th year</span>
              </ToggleBtn>
            </div>
          </div>

          {/* Team Type */}
          <div>
            <SectionHeading>Entry Type</SectionHeading>
            <div className="flex gap-2">
              <ToggleBtn active={teamType === 'solo'} onClick={() => setTeamType('solo')} disabled={isLoading || isPaid}>
                <span className="block text-xs font-bold">Solo</span>
                <span className="block text-[10px] opacity-70 mt-0.5">1 member</span>
              </ToggleBtn>
              <ToggleBtn active={teamType === 'group'} onClick={() => setTeamType('group')} disabled={isLoading || isPaid}>
                <span className="block text-xs font-bold">Group</span>
                <span className="block text-[10px] opacity-70 mt-0.5">up to 3 members</span>
              </ToggleBtn>
            </div>
          </div>

          {/* Members */}
          {teamType && (
            <>
              <div className="border-t border-[#E5E3D7]" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-2.5 h-2.5">
                      <span className="absolute inset-0 rounded-full bg-[#2C5F5F]" />
                      <span className="absolute inset-0 rounded-full bg-[#2C5F5F] animate-ping opacity-50" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#2C5F5F]">
                      Members
                      <span className="ml-2 font-mono text-xs text-[#8B8B8B] normal-case tracking-normal">
                        {members.length}/{teamType === 'solo' ? '1' : '2–3'}
                      </span>
                    </h2>
                  </div>
                  {canAddMore() && !isPaid && (
                    <button onClick={handleAddMember} disabled={isLoading}
                      className="text-xs font-semibold text-white bg-[#2C5F5F] hover:bg-[#1A4D4D] px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                      + Add Member
                    </button>
                  )}
                </div>

                {members.length > 0 ? (
                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-start justify-between p-4 bg-white rounded-xl border border-[#E5E3D7]">
                        <div>
                          <div className="font-semibold text-[#1A1A1A] text-sm">{member.name}</div>
                          <div className="text-xs text-[#8B8B8B] mt-0.5">{member.email}</div>
                          {member.phone && <div className="text-xs text-[#8B8B8B]">{member.phone}</div>}
                          <div className="text-xs text-[#8B8B8B]">{member.institute} · Year {member.academic_year}</div>
                          {(member.institute_id_file || member.institute_id_url) && (
                            <div className="text-xs text-[#2D5F4F] mt-1 font-medium">✓ ID uploaded</div>
                          )}
                        </div>
                        <button onClick={() => handleRemoveMember(index)} disabled={isLoading}
                          className={`text-[#8B8B8B] hover:text-[#C85D3E] transition-colors text-xl leading-none ml-3 mt-0.5 ${isPaid ? 'hidden' : ''}`}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-[#D0CEC2] rounded-xl text-[#8B8B8B] text-sm">
                    No members yet — click "Add Member" to begin
                  </div>
                )}

                {teamType === 'group' && members.length === 1 && (
                  <p className="text-xs text-[#D97757] font-semibold mt-3 flex items-center gap-1.5">
                    <span>⚠</span> At least 2 members required for group entry
                  </p>
                )}
                {teamType === 'solo' && members.length === 0 && (
                  <p className="text-xs text-[#D97757] font-semibold mt-3 flex items-center gap-1.5">
                    <span>⚠</span> Add 1 member to complete solo entry
                  </p>
                )}
              </div>
            </>
          )}

          <div className="border-t border-[#E5E3D7]" />

          {/* Submit */}
          <div>
            {isPaid ? (
              <div className="w-full py-4 rounded-xl bg-[#2D5F4F]/10 border border-[#2D5F4F]/30 text-center">
                <p className="text-sm font-semibold text-[#2D5F4F] flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Registration locked — payment completed
                </p>
              </div>
            ) : (
              <>
                <button onClick={handleSubmit} disabled={!canSubmit() || isLoading}
                  className={`w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                    ${canSubmit() && !isLoading
                      ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                    }`}>
                  {isLoading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </span>
                    : 'Save & Proceed to Payment →'
                  }
                </button>
                {!canSubmit() && !isLoading && (
                  <p className="text-xs text-[#8B8B8B] text-center mt-2">Complete all sections above to enable submission</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Add Team Member</h3>
              <p className="text-sm text-[#8B8B8B] mt-1">Fill in the member's details below</p>
            </div>

            <div className="space-y-3">
              <FloatingInput label="Full Name" value={currentMember.name} onChange={e => setCurrentMember({ ...currentMember, name: e.target.value })} />
              <FloatingInput label="Email Address" type="email" value={currentMember.email} onChange={e => setCurrentMember({ ...currentMember, email: e.target.value })} />
              <FloatingInput label="Phone Number" type="tel" value={currentMember.phone} onChange={e => setCurrentMember({ ...currentMember, phone: e.target.value })} />
              <FloatingInput label="Institute / University" value={currentMember.institute} onChange={e => setCurrentMember({ ...currentMember, institute: e.target.value })} />

              <div>
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Academic Year</p>
                <div className="flex gap-2">
                  {getAvailableYears().map(year => (
                    <button key={year} type="button" onClick={() => setCurrentMember({ ...currentMember, academic_year: year })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200
                        ${currentMember.academic_year === year
                          ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]'
                          : 'bg-white text-[#6B6B6B] border-[#D0CEC2] hover:border-[#2C5F5F]'
                        }`}>
                      {year}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#8B8B8B] mt-1.5">
                  {category === '1' ? 'Category I: 1st & 2nd year only' : category === '2' ? 'Category II: 3rd, 4th & 5th year only' : 'Select a category first'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider mb-2">Institute ID Card</p>
                <FloatingInput label="Upload ID card image" type="file" accept="image/*" onChange={handleFileChange} />
                <p className="text-[12px] text-[#8B8B8B] mt-1">Upload a clear photo of your institute ID</p>
                <p className="text-[12px] text-[#8B8B8B] mt-1">Only image formats are allowed | Size limit 1MB</p>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-[#C85D3E] font-medium">{error}</p>}

            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowAddMember(false); setError(null); }}
                className="flex-1 py-3 rounded-xl border border-[#D0CEC2] text-sm font-semibold text-[#6B6B6B] bg-white hover:border-[#2C5F5F] transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveMember}
                className="flex-1 py-3 rounded-xl bg-[#2C5F5F] text-white text-sm font-semibold hover:bg-[#1A4D4D] transition-colors">
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlreadyPaid && <RegistrationStatusDialog onClose={() => setShowAlreadyPaid(false)} />}
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading...</span>
        </div>
      </div>
    }>
      <RegistrationContent />
    </Suspense>
  );
}
