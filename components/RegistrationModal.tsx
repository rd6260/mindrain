'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event_id: string;
  event_pre_code?: string;
}

interface MemberData {
  name: string;
  email: string;
  institute: string;
  academic_year: number;
  institute_id_file: File | null;
  institute_id_url?: string;
}

export default function RegistrationModal({ 
  isOpen, 
  onClose, 
  event_id,
  event_pre_code = 'LLL'
}: RegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('India');
  const [group, setGroup] = useState<'A' | 'B' | ''>('');
  const [category, setCategory] = useState<'1' | '2' | ''>('');
  const [teamType, setTeamType] = useState<'solo' | 'group' | ''>('');
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add Member Modal state
  const [showAddMember, setShowAddMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberData>({
    name: '',
    email: '',
    institute: '',
    academic_year: 1,
    institute_id_file: null,
  });

  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStep(1);
      setCountry('India');
      setGroup('');
      setCategory('');
      setTeamType('');
      setMembers([]);
      setError(null);
    }
  }, [isOpen]);

  const canAddMoreMembers = () => {
    if (teamType === 'solo') return members.length < 1;
    if (teamType === 'group') return members.length < 3;
    return false;
  };

  const canProceedToSubmit = () => {
    if (teamType === 'solo') return members.length === 1;
    if (teamType === 'group') return members.length >= 2 && members.length <= 3;
    return false;
  };

  const handleAddMember = () => {
    setShowAddMember(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentMember({ ...currentMember, institute_id_file: e.target.files[0] });
    }
  };

  const handleSaveMember = () => {
    if (!currentMember.name || !currentMember.email || !currentMember.institute || !currentMember.institute_id_file) {
      setError('Please fill all member fields');
      return;
    }

    setMembers([...members, currentMember]);
    setCurrentMember({
      name: '',
      email: '',
      institute: '',
      academic_year: 1,
      institute_id_file: null,
    });
    setShowAddMember(false);
    setError(null);
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const generateNextCode = async (retryCount = 0): Promise<number> => {
    const maxRetries = 5;
    
    try {
      // Fetch all registrations for this event to find highest code number
      const { data: existingRegistrations, error: fetchError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', event_id);

      if (fetchError) throw fetchError;

      if (!existingRegistrations || existingRegistrations.length === 0) {
        return 1; // First registration
      }

      // Get all members for these registrations
      const registrationIds = existingRegistrations.map(r => r.id);
      const { data: existingMembers, error: membersError } = await supabase
        .from('members')
        .select('code')
        .in('registration_id', registrationIds);

      if (membersError) throw membersError;

      let maxNumber = 0;
      if (existingMembers && existingMembers.length > 0) {
        existingMembers.forEach(member => {
          // Extract the number from code like "TUH-A-I-IND-0050"
          const parts = member.code.split('-');
          const numberPart = parseInt(parts[parts.length - 1]);
          if (numberPart > maxNumber) {
            maxNumber = numberPart;
          }
        });
      }

      return maxNumber + 1;
    } catch (err) {
      if (retryCount < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
        return generateNextCode(retryCount + 1);
      }
      throw err;
    }
  };

  const uploadInstituteId = async (file: File, userId: string, memberIndex: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}_${memberIndex}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('college_id/unreal_home')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('college_id/unreal_home')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!canProceedToSubmit()) {
      setError('Please add the required number of members');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create registration entry
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          registration_by: user.id,
          event_id: event_id,
          country: country,
          group: group,
          category: parseInt(category),
          team_type: teamType,
        })
        .select()
        .single();

      if (regError) throw regError;

      // Generate codes and upload files for each member
      const startingNumber = await generateNextCode();
      
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const currentNumber = startingNumber + i;
        const paddedNumber = currentNumber.toString().padStart(4, '0');
        
        // Build code: TUH-A-I-IND-0001
        const groupPart = group;
        const categoryPart = category === '1' ? 'I' : 'II';
        const teamPart = teamType === 'solo' ? 'IND' : 'GRP';
        const code = `${event_pre_code}-${groupPart}-${categoryPart}-${teamPart}-${paddedNumber}`;

        // Upload institute ID
        let instituteIdUrl = '';
        if (member.institute_id_file) {
          try {
            instituteIdUrl = await uploadInstituteId(member.institute_id_file, user.id, i);
          } catch (uploadErr) {
            console.error('Upload error:', uploadErr);
            throw new Error(`Failed to upload institute ID for ${member.name}`);
          }
        }

        // Insert member with retry logic for race conditions
        let insertSuccess = false;
        let retryCount = 0;
        const maxRetries = 5;

        while (!insertSuccess && retryCount < maxRetries) {
          try {
            const { error: memberError } = await supabase
              .from('members')
              .insert({
                created_by: user.id,
                registration_id: registration.id,
                code: code,
                name: member.name,
                email: member.email,
                institute: member.institute,
                academic_year: member.academic_year,
                institute_id: instituteIdUrl,
              });

            if (memberError) {
              // Check if it's a unique constraint violation
              if (memberError.code === '23505') {
                // Code already exists, regenerate and retry
                retryCount++;
                const newNumber = await generateNextCode();
                const newPaddedNumber = (newNumber + i).toString().padStart(4, '0');
                code.replace(paddedNumber, newPaddedNumber);
                continue;
              }
              throw memberError;
            }

            insertSuccess = true;
          } catch (err) {
            if (retryCount >= maxRetries - 1) {
              throw err;
            }
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
          }
        }
      }

      // Success!
      onClose();
      // You might want to trigger a refresh or show a success message here
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#e8e6db] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-[#323232] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-[#323232]">Event Registration</h2>
          <button
            onClick={onClose}
            className="text-[#323232] hover:text-red-500 text-2xl font-bold"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="m-6 p-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Step 1: Country */}
          {step >= 1 && (
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0]"
                disabled={step > 1 || isLoading}
              />
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* Step 2: Group Selection */}
          {step >= 2 && (
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Select Group</label>
              <div className="space-y-2">
                <button
                  onClick={() => setGroup('A')}
                  className={`w-full h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    group === 'A' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 2 || isLoading}
                >
                  Group A (Opt for monetary award)
                </button>
                <button
                  onClick={() => setGroup('B')}
                  className={`w-full h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    group === 'B' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 2 || isLoading}
                >
                  Group B (No monetary award)
                </button>
              </div>
              {step === 2 && group && (
                <button
                  onClick={() => setStep(3)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* Step 3: Category Selection */}
          {step >= 3 && (
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Select Category</label>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('1')}
                  className={`w-full h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    category === '1' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 3 || isLoading}
                >
                  Category I (1st and 2nd year students)
                </button>
                <button
                  onClick={() => setCategory('2')}
                  className={`w-full h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    category === '2' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 3 || isLoading}
                >
                  Category II (3rd, 4th and 5th year students)
                </button>
              </div>
              {step === 3 && category && (
                <button
                  onClick={() => setStep(4)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* Step 4: Team Type Selection */}
          {step >= 4 && (
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Entry Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTeamType('solo')}
                  className={`flex-1 h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    teamType === 'solo' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 4 || isLoading}
                >
                  Solo
                </button>
                <button
                  onClick={() => setTeamType('group')}
                  className={`flex-1 h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    teamType === 'group' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={step > 4 || isLoading}
                >
                  Group
                </button>
              </div>
              {step === 4 && teamType && (
                <button
                  onClick={() => setStep(5)}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                >
                  Next
                </button>
              )}
            </div>
          )}

          {/* Step 5: Add Members */}
          {step >= 5 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-lg font-bold text-[#323232]">
                  Members ({members.length}/{teamType === 'solo' ? 1 : 3})
                </label>
                {canAddMoreMembers() && (
                  <button
                    onClick={handleAddMember}
                    className="h-10 px-4 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                    disabled={isLoading}
                  >
                    + Add Member
                  </button>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#edebdf] rounded-md border-2 border-[#323232] flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-[#323232]">{member.name}</div>
                      <div className="text-sm text-[#666]">{member.email}</div>
                      <div className="text-sm text-[#666]">{member.institute} - Year {member.academic_year}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-xl"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {canProceedToSubmit() && (
                <button
                  onClick={handleSubmit}
                  className="w-full h-12 rounded-md border-2 border-[#323232] bg-green-500 shadow-[4px_4px_0_0_#323232] text-[17px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] disabled:opacity-60"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                </button>
              )}

              {teamType === 'group' && members.length === 1 && (
                <p className="text-sm text-[#666] text-center">
                  Group entries require at least 2 members
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-[#e8e6db] bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-md w-full p-6">
            <h3 className="text-xl font-black text-[#323232] mb-4">Add Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#323232]">Full Name</label>
                <input
                  type="text"
                  value={currentMember.name}
                  onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0]"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#323232]">Email</label>
                <input
                  type="email"
                  value={currentMember.email}
                  onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0]"
                  placeholder="Email Address..."
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#323232]">Institute Name</label>
                <input
                  type="text"
                  value={currentMember.institute}
                  onChange={(e) => setCurrentMember({ ...currentMember, institute: e.target.value })}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0]"
                  placeholder="University Name"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#323232]">Academic Year</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setCurrentMember({ ...currentMember, academic_year: year })}
                      className={`h-10 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                        currentMember.academic_year === year
                          ? 'bg-[#2d8cf0] text-white'
                          : 'bg-white text-[#323232]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#323232]">Institute ID Card</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-2.5 outline-none focus:border-[#2d8cf0] file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#2d8cf0] file:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setCurrentMember({
                    name: '',
                    email: '',
                    institute: '',
                    academic_year: 1,
                    institute_id_file: null,
                  });
                  setError(null);
                }}
                className="flex-1 h-10 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="flex-1 h-10 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
