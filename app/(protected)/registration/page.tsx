'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

interface MemberData {
  name: string;
  email: string;
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

function RegistrationContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('event_id');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdFromUrl);
  const [eventPreCode, setEventPreCode] = useState<string>('');
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
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberData>({
    name: '',
    email: '',
    institute: '',
    academic_year: 1,
    institute_id_file: null,
  });

  const [existingRegistrationId, setExistingRegistrationId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const supabase = createClient();

  // Fetch event details or list of events
  useEffect(() => {
    const fetchEventData = async () => {
      setLoadingEvents(true);
      
      if (eventIdFromUrl) {
        // Check if the event_id exists in database
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, title, code_name')
          .eq('id', eventIdFromUrl)
          .maybeSingle();

        if (eventError || !event) {
          // Event not found, fetch all events
          setSelectedEventId(null);
          await fetchAllEvents();
        } else {
          // Event found
          setSelectedEventId(event.id);
          setEventPreCode(event.code_name);
          
          // Check for existing registration
          await loadExistingRegistration(event.id);
        }
      } else {
        // No event_id provided, fetch all events
        await fetchAllEvents();
      }
      
      setLoadingEvents(false);
    };

    const fetchAllEvents = async () => {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, code_name')
        .order('title');

      if (!eventsError && events) {
        setAvailableEvents(events);
      }
    };

    fetchEventData();
  }, [eventIdFromUrl]);

  // Load existing registration if it exists
  const loadExistingRegistration = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already has a registration for this event
      const { data: existingReg, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_by', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (regError) {
        console.error('Error fetching registration:', regError);
        return;
      }

      if (!existingReg) {
        // No existing registration, reset to fresh form
        setExistingRegistrationId(null);
        setIsEditMode(false);
        setCountry('India');
        setGroup('');
        setCategory('');
        setTeamType('');
        setMembers([]);
        return;
      }

      // Load existing registration data
      setExistingRegistrationId(existingReg.id);
      setIsEditMode(true);
      setCountry(existingReg.country);
      setGroup(existingReg.group);
      setCategory(existingReg.category); // category is already text in database
      setTeamType(existingReg.team_type);

      // Load members
      const { data: existingMembers, error: membersError } = await supabase
        .from('members')
        .select('id, name, email, institute, academic_year, institute_id, created_at')
        .eq('registration_id', existingReg.id)
        .order('created_at');

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }

      if (existingMembers && existingMembers.length > 0) {
        const loadedMembers: MemberData[] = existingMembers.map(member => ({
          name: member.name,
          email: member.email,
          institute: member.institute,
          academic_year: member.academic_year,
          institute_id_file: null,
          institute_id_url: member.institute_id,
        }));
        setMembers(loadedMembers);
      }
    } catch (err) {
      console.error('Error loading existing registration:', err);
    }
  };

  // Handle team type change
  useEffect(() => {
    if (teamType === 'solo' && members.length > 1) {
      // Keep only the first member when switching to solo
      setMembers([members[0]]);
    }
  }, [teamType]);

  const handleEventSelect = async (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEventId(event.id);
      setEventPreCode(event.code_name);
      await loadExistingRegistration(event.id);
    }
  };

  const getAvailableAcademicYears = (): number[] => {
    if (category === '1') return [1, 2];
    if (category === '2') return [3, 4, 5];
    return [1, 2, 3, 4, 5];
  };

  const canAddMoreMembers = () => {
    if (teamType === 'solo') return members.length < 1;
    if (teamType === 'group') return members.length < 3;
    return false;
  };

  const canSubmit = () => {
    if (!selectedEventId || !country || !group || !category || !teamType) return false;
    if (teamType === 'solo') return members.length === 1;
    if (teamType === 'group') return members.length >= 2 && members.length <= 3;
    return false;
  };

  const handleAddMember = () => {
    // Set default academic year based on category
    const defaultYear = category === '1' ? 1 : category === '2' ? 3 : 1;
    setCurrentMember({
      name: '',
      email: '',
      institute: '',
      academic_year: defaultYear,
      institute_id_file: null,
    });
    setShowAddMember(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentMember({ ...currentMember, institute_id_file: e.target.files[0] });
    }
  };

  const handleSaveMember = () => {
    // For edit mode, allow adding member without file if institute_id_url exists
    if (!currentMember.name || !currentMember.email || !currentMember.institute) {
      setError('Please fill all member fields');
      return;
    }

    if (!currentMember.institute_id_file && !currentMember.institute_id_url) {
      setError('Please upload institute ID');
      return;
    }

    const allowedYears = getAvailableAcademicYears();
    if (!allowedYears.includes(currentMember.academic_year)) {
      setError(`Academic year must be ${allowedYears.join(' or ')} for the selected category`);
      return;
    }

    setMembers([...members, currentMember]);
    setCurrentMember({
      name: '',
      email: '',
      institute: '',
      academic_year: category === '1' ? 1 : 3,
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
      const { data: existingRegistrations, error: fetchError } = await supabase
        .from('registrations')
        .select('id')
        .eq('event_id', selectedEventId);

      if (fetchError) throw fetchError;

      if (!existingRegistrations || existingRegistrations.length === 0) {
        return 1;
      }

      const registrationIds = existingRegistrations.map(r => r.id);
      const { data: existingMembers, error: membersError } = await supabase
        .from('members')
        .select('code')
        .in('registration_id', registrationIds);

      if (membersError) throw membersError;

      let maxNumber = 0;
      if (existingMembers && existingMembers.length > 0) {
        existingMembers.forEach(member => {
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
    if (!canSubmit()) {
      setError('Please complete all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let registrationId = existingRegistrationId;

      if (isEditMode && existingRegistrationId) {
        // Update existing registration
        const { error: updateError } = await supabase
          .from('registrations')
          .update({
            country: country,
            group: group,
            category: category, // Keep as text ('1' or '2')
            team_type: teamType,
          })
          .eq('id', existingRegistrationId);

        if (updateError) throw updateError;

        // Delete existing members
        const { error: deleteError } = await supabase
          .from('members')
          .delete()
          .eq('registration_id', existingRegistrationId);

        if (deleteError) throw deleteError;
      } else {
        // Create new registration
        const { data: registration, error: regError } = await supabase
          .from('registrations')
          .insert({
            registration_by: user.id,
            event_id: selectedEventId,
            country: country,
            group: group,
            category: category, // Keep as text ('1' or '2')
            team_type: teamType,
          })
          .select()
          .single();

        if (regError) throw regError;
        registrationId = registration.id;
        setExistingRegistrationId(registration.id);
      }

      const startingNumber = await generateNextCode();
      
      for (let i = 0; i < members.length; i++) {
        const member = members[i];
        const currentNumber = startingNumber + i;
        const paddedNumber = currentNumber.toString().padStart(4, '0');
        
        const groupPart = group;
        const categoryPart = category === '1' ? 'I' : 'II';
        const teamPart = teamType === 'solo' ? 'IND' : 'GRP';
        let code = `${eventPreCode}-${groupPart}-${categoryPart}-${teamPart}-${paddedNumber}`;

        let instituteIdUrl = member.institute_id_url || '';
        
        // Only upload if there's a new file
        if (member.institute_id_file) {
          try {
            instituteIdUrl = await uploadInstituteId(member.institute_id_file, user.id, i);
          } catch (uploadErr) {
            console.error('Upload error:', uploadErr);
            throw new Error(`Failed to upload institute ID for ${member.name}`);
          }
        }

        let insertSuccess = false;
        let retryCount = 0;
        const maxRetries = 5;

        while (!insertSuccess && retryCount < maxRetries) {
          try {
            const { error: memberError } = await supabase
              .from('members')
              .insert({
                created_by: user.id,
                registration_id: registrationId,
                code: code,
                name: member.name,
                email: member.email,
                institute: member.institute,
                academic_year: member.academic_year,
                institute_id: instituteIdUrl,
              });

            if (memberError) {
              if (memberError.code === '23505') {
                retryCount++;
                const newNumber = await generateNextCode();
                const newPaddedNumber = (newNumber + i).toString().padStart(4, '0');
                code = `${eventPreCode}-${groupPart}-${categoryPart}-${teamPart}-${newPaddedNumber}`;
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

      // Success! Show payment dialog
      setIsEditMode(true);
      setShowPaymentDialog(true);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching events
  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-[#e8e6db] flex items-center justify-center">
        <div className="text-2xl font-bold text-[#323232]">Loading...</div>
      </div>
    );
  }

  // Show event selection if no event is selected
  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-[#e8e6db] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] p-6">
            <h1 className="text-3xl font-black text-[#323232] mb-6">Select an Event to Register</h1>
            
            {availableEvents.length === 0 ? (
              <p className="text-[#666] text-center py-8">No events available at the moment.</p>
            ) : (
              <div className="space-y-3">
                {availableEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="w-full p-4 text-left rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] hover:bg-[#edebdf] text-[#323232] cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                  >
                    <div className="font-bold text-lg">{event.title}</div>
                    <div className="text-sm text-[#666]">Code: {event.code_name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main registration form
  return (
    <div className="min-h-screen bg-[#e8e6db] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232]">
          {/* Header */}
          <div className="border-b-2 border-[#323232] p-6">
            <h1 className="text-3xl font-black text-[#323232]">
              {isEditMode ? 'Edit Registration' : 'Event Registration'}
            </h1>
            <p className="text-[#666] mt-2">
              {isEditMode 
                ? 'Update your registration details below' 
                : 'Complete all fields to register for the event'}
            </p>
          </div>

          {/* Error Toast */}
          {error && (
            <div className="m-6 p-4 bg-red-500 text-white rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232]">
              {error}
            </div>
          )}

          <div className="p-6 space-y-6">
          {/* Country */}
          <div className="space-y-3">
            <label className="text-lg font-bold text-[#323232]">Country *</label>
            
            {/* Radio buttons */}
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="countryType"
                  value="India"
                  checked={countryType === 'India'}
                  onChange={(e) => setCountryType('India')}
                  disabled={isLoading}
                  className="w-5 h-5 mr-2 cursor-pointer accent-[#2d8cf0]"
                />
                <span className="text-[15px] font-semibold text-[#323232]">India</span>
              </label>
              
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="countryType"
                  value="Other"
                  checked={countryType === 'Other'}
                  onChange={(e) => setCountryType('Other')}
                  disabled={isLoading}
                  className="w-5 h-5 mr-2 cursor-pointer accent-[#2d8cf0]"
                />
                <span className="text-[15px] font-semibold text-[#323232]">Other</span>
              </label>
            </div>
            
            {/* Text field for Other */}
            {countryType === 'Other' && (
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-4 outline-none focus:border-[#2d8cf0]"
                disabled={isLoading}
                placeholder="Enter your country"
              />
            )}
          </div>

            {/* Group Selection */}
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Select Group *</label>
              <div className="space-y-2">
                <button
                  onClick={() => setGroup('A')}
                  className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    group === 'A' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Group A (Opt for monetary award)
                </button>
                <button
                  onClick={() => setGroup('B')}
                  className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    group === 'B' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Group B (No monetary award)
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Select Category *</label>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory('1')}
                  className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    category === '1' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Category I (1st and 2nd year students)
                </button>
                <button
                  onClick={() => setCategory('2')}
                  className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    category === '2' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Category II (3rd, 4th and 5th year students)
                </button>
              </div>
            </div>

            {/* Team Type Selection */}
            <div className="space-y-3">
              <label className="text-lg font-bold text-[#323232]">Entry Type *</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTeamType('solo')}
                  className={`flex-1 h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    teamType === 'solo' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Solo (1 member)
                </button>
                <button
                  onClick={() => setTeamType('group')}
                  className={`flex-1 h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                    teamType === 'group' ? 'bg-[#2d8cf0] text-white' : 'bg-white text-[#323232]'
                  }`}
                  disabled={isLoading}
                >
                  Group (upto 3 members)
                </button>
              </div>
            </div>

            {/* Add Members Section */}
            {teamType && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-bold text-[#323232]">
                    Team Members * ({members.length}/{teamType === 'solo' ? '1' : '2-3'})
                  </label>
                  {canAddMoreMembers() && (
                    <button
                      onClick={handleAddMember}
                      className="h-10 px-6 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
                      disabled={isLoading}
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                {/* Members List */}
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="p-4 bg-[#edebdf] rounded-md border-2 border-[#323232] shadow-[2px_2px_0_0_#323232] flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-[#323232] text-lg">{member.name}</div>
                          <div className="text-sm text-[#666] mt-1">{member.email}</div>
                          <div className="text-sm text-[#666]">{member.institute}</div>
                          <div className="text-sm text-[#666]">Year {member.academic_year}</div>
                          {(member.institute_id_file || member.institute_id_url) && (
                            <div className="text-xs text-[#2d8cf0] mt-1">✓ ID Card uploaded</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveMember(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-2xl ml-4"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-[#666] bg-[#edebdf] rounded-md border-2 border-dashed border-[#323232]">
                    No members added yet. Click "Add Member" to get started.
                  </div>
                )}

                {teamType === 'group' && members.length === 1 && (
                  <p className="text-sm text-orange-600 font-semibold">
                    ⚠️ Group entries require at least 2 members (maximum 3)
                  </p>
                )}

                {teamType === 'solo' && members.length === 0 && (
                  <p className="text-sm text-orange-600 font-semibold">
                    ⚠️ Solo entry requires 1 member
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t-2 border-[#323232]">
              <button
                onClick={handleSubmit}
                className={`w-full h-14 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[17px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all ${
                  canSubmit() && !isLoading
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
                disabled={!canSubmit() || isLoading}
              >
                {isLoading 
                  ? (isEditMode ? 'Updating...' : 'Registering...') 
                  : (isEditMode ? 'Update Registration' : 'Complete Registration')}
              </button>
              
              {!canSubmit() && !isLoading && (
                <p className="text-sm text-[#666] text-center mt-2">
                  Please complete all required fields before submitting
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-[#323232] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-[#323232] mb-6">Add Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#323232] block mb-2">Full Name *</label>
                <input
                  type="text"
                  value={currentMember.name}
                  onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                  className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-4 outline-none focus:border-[#2d8cf0]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#323232] block mb-2">Email *</label>
                <input
                  type="email"
                  value={currentMember.email}
                  onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                  className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-4 outline-none focus:border-[#2d8cf0]"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#323232] block mb-2">Institute Name *</label>
                <input
                  type="text"
                  value={currentMember.institute}
                  onChange={(e) => setCurrentMember({ ...currentMember, institute: e.target.value })}
                  className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-4 outline-none focus:border-[#2d8cf0]"
                  placeholder="Enter institute/university name"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#323232] block mb-2">Academic Year *</label>
                <div className="grid grid-cols-5 gap-2">
                  {getAvailableAcademicYears().map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => setCurrentMember({ ...currentMember, academic_year: year })}
                      className={`h-12 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold cursor-pointer transition-all active:shadow-none active:translate-x-[3px] active:translate-y-[3px] ${
                        currentMember.academic_year === year
                          ? 'bg-[#2d8cf0] text-white'
                          : 'bg-white text-[#323232]'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#666] mt-2">
                  {category === '1' 
                    ? 'Category I: Only 1st and 2nd year students' 
                    : category === '2'
                    ? 'Category II: Only 3rd, 4th, and 5th year students'
                    : 'Select a category first'}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-[#323232] block mb-2">Institute ID Card *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-4 outline-none focus:border-[#2d8cf0] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#2d8cf0] file:text-white file:cursor-pointer"
                />
                <p className="text-xs text-[#666] mt-1">Upload a clear photo of your institute ID card</p>
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
                    academic_year: category === '1' ? 1 : 3,
                    institute_id_file: null,
                  });
                  setError(null);
                }}
                className="flex-1 h-12 rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-[#323232] cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMember}
                className="flex-1 h-12 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-[#323232] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-[#323232] shadow-[8px_8px_0_0_#323232] max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              
              <h3 className="text-2xl font-black text-[#323232] mb-2">
                Registration {isEditMode ? 'Updated' : 'Successful'}!
              </h3>
              
              <p className="text-[#666] mb-6">
                {isEditMode 
                  ? 'Your registration has been updated successfully. Complete your payment to confirm your spot.'
                  : 'Your registration has been completed successfully. Complete your payment to confirm your spot.'}
              </p>

              <button
                onClick={() => {
                  setShowPaymentDialog(false);
                  window.location.href = '/payment?registration_id=' + existingRegistrationId;
                }}
                className="w-full h-12 rounded-md border-2 border-[#323232] bg-[#2d8cf0] shadow-[4px_4px_0_0_#323232] text-[15px] font-bold text-white cursor-pointer active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e8e6db] flex items-center justify-center">
        <div className="text-2xl font-bold text-[#323232]">Loading...</div>
      </div>
    }>
      <RegistrationContent />
    </Suspense>
  );
}

