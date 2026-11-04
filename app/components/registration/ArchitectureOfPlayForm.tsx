'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FloatingInput, SectionHeading, ToggleBtn } from './ui';
import type { RegistrationFormProps } from './types';

interface MemberData {
  name: string;
  email: string;
  phone: string;
  institute: string;
  academic_year: number;
  institute_id_file: File | null;
  institute_id_url?: string;
}

const STORAGE_BUCKET = 'college_id/architecture_of_play';

const emptyMember = (year: number): MemberData => ({
  name: '', email: '', phone: '', institute: '', academic_year: year, institute_id_file: null,
});

export default function ArchitectureOfPlayForm({ initialData, onSubmit }: RegistrationFormProps) {
  const supabase = createClient();
  const fd = initialData ?? {};

  const [countryType, setCountryType] = useState<'India' | 'Other'>(
    !fd.country || fd.country === 'India' ? 'India' : 'Other'
  );
  const [country, setCountry] = useState<string>(fd.country || 'India');
  const [group, setGroup] = useState<'A' | 'B' | ''>(fd.group || '');
  const [category, setCategory] = useState<'1' | '2' | ''>(fd.category || '');
  const [teamType, setTeamType] = useState<'solo' | 'group' | ''>(fd.team_type || '');
  const [members, setMembers] = useState<MemberData[]>(
    (fd.members ?? []).map((m: any) => ({
      name: m.name || '', email: m.email || '', phone: m.phone || '',
      institute: m.institute || '', academic_year: m.academic_year || 1,
      institute_id_file: null, institute_id_url: m.institute_id_url || '',
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberData>(emptyMember(1));

  const changeTeamType = (t: 'solo' | 'group') => {
    setTeamType(t);
    if (t === 'solo' && members.length > 1) setMembers([members[0]]);
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
    if (!country || !group || !category || !teamType) return false;
    if (teamType === 'solo') return members.length === 1;
    return members.length >= 2 && members.length <= 3;
  };

  const handleAddMember = () => {
    setCurrentMember(emptyMember(category === '2' ? 3 : 1));
    setShowAddMember(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setCurrentMember({ ...currentMember, institute_id_file: e.target.files[0] });
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
    setShowAddMember(false);
    setError(null);
  };

  const uploadInstituteId = async (file: File, userId: string, memberIndex: number): Promise<string> => {
    const ext = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}_${memberIndex}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName).data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) { setError('Please complete all required fields'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const processed = [];
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const url = m.institute_id_file
          ? await uploadInstituteId(m.institute_id_file, user.id, i)
          : m.institute_id_url || '';
        processed.push({
          name: m.name, email: m.email, phone: m.phone,
          institute: m.institute, academic_year: m.academic_year,
          institute_id_url: url,
        });
      }

      await onSubmit({ country, group, category, team_type: teamType, members: processed });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && !showAddMember && (
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
            <ToggleBtn active={countryType === 'India'} onClick={() => { setCountryType('India'); setCountry('India'); }} disabled={isLoading}>India</ToggleBtn>
            <ToggleBtn active={countryType === 'Other'} onClick={() => { setCountryType('Other'); setGroup('A'); }} disabled={isLoading}>Others</ToggleBtn>
          </div>
          {countryType === 'Other' && (
            <FloatingInput label="Enter your country" value={country === 'India' ? '' : country}
              onChange={e => setCountry(e.target.value)} disabled={isLoading} />
          )}
        </div>

        {/* Group */}
        {countryType === 'India' && (
          <div>
            <SectionHeading>Group</SectionHeading>
            <div className="flex gap-2">
              <ToggleBtn active={group === 'A'} onClick={() => setGroup('A')} disabled={isLoading}>Group A — Monetary Award</ToggleBtn>
              <ToggleBtn active={group === 'B'} onClick={() => setGroup('B')} disabled={isLoading}>Group B — No Monetary Award</ToggleBtn>
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <SectionHeading>Category</SectionHeading>
          <div className="flex gap-2">
            <ToggleBtn active={category === '1'} onClick={() => setCategory('1')} disabled={isLoading}>
              <span className="block text-xs font-bold">Category I</span>
              <span className="block text-[10px] opacity-70 mt-0.5">1st & 2nd year</span>
            </ToggleBtn>
            <ToggleBtn active={category === '2'} onClick={() => setCategory('2')} disabled={isLoading}>
              <span className="block text-xs font-bold">Category II</span>
              <span className="block text-[10px] opacity-70 mt-0.5">3rd, 4th & 5th year</span>
            </ToggleBtn>
          </div>
        </div>

        {/* Team Type */}
        <div>
          <SectionHeading>Entry Type</SectionHeading>
          <div className="flex gap-2">
            <ToggleBtn active={teamType === 'solo'} onClick={() => changeTeamType('solo')} disabled={isLoading}>
              <span className="block text-xs font-bold">Solo</span>
              <span className="block text-[10px] opacity-70 mt-0.5">1 member</span>
            </ToggleBtn>
            <ToggleBtn active={teamType === 'group'} onClick={() => changeTeamType('group')} disabled={isLoading}>
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
                {canAddMore() && (
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
                      <button onClick={() => setMembers(members.filter((_, i) => i !== index))} disabled={isLoading}
                        className="text-[#8B8B8B] hover:text-[#C85D3E] transition-colors text-xl leading-none ml-3 mt-0.5">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-[#D0CEC2] rounded-xl text-[#8B8B8B] text-sm">
                  No members yet — click &quot;Add Member&quot; to begin
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
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#1A1A1A]">Add Team Member</h3>
              <p className="text-sm text-[#8B8B8B] mt-1">Fill in the member&apos;s details below</p>
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
    </>
  );
}
