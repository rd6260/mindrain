'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

interface ParticipantData {
  name: string;
  email: string;
  phone: string;
  institute: string;
  year_of_completion: string;
}

interface Event {
  id: string;
  title: string;
  code_name: string;
}

type RegistrationStatus = 'already_paid' | 'payment_pending' | null;

// Floating label input component
function FloatingInput({
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="relative block w-full group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder ?? ' '}
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
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  options: { value: string | number; label: string }[];
}) {
  const hasValue = value !== '' && value !== undefined;
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

// Toggle button
function ToggleBtn({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 py-3 px-4 rounded-xl text-sm font-semibold border transition-all duration-200
        ${active
          ? 'bg-[#2C5F5F] text-white border-[#2C5F5F] shadow-md shadow-[#2C5F5F]/20'
          : 'bg-[#F8F7F2] text-[#6B6B6B] border-[#D0CEC2] hover:border-[#2C5F5F] hover:text-[#2C5F5F]'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );
}

// Registration status popup
function RegistrationStatusDialog({
  status,
  registrationId,
  onClose,
}: {
  status: RegistrationStatus;
  registrationId: string | null;
  onClose: () => void;
}) {
  if (!status) return null;

  const isPaid = status === 'already_paid';

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${isPaid ? 'bg-[#2D5F4F]' : 'bg-[#D97757]'}`}
        >
          {isPaid ? (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
          {isPaid ? 'Already Registered' : 'Payment Pending'}
        </h3>
        <p className="text-sm text-[#6B6B6B] mb-7 leading-relaxed">
          {isPaid
            ? 'You have already completed registration and payment for this event.'
            : 'You have a registration for this event but payment is still pending. Complete payment to confirm your spot.'}
        </p>

        {isPaid ? (
          <button
            onClick={() => { window.location.href = '/'; }}
            className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
          >
            Go to Home
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { window.location.href = '/payment-2?registration_id=' + registrationId; }}
              className="w-full py-3.5 rounded-xl bg-[#D97757] text-white text-sm font-bold hover:bg-[#C06640] transition-colors shadow-lg shadow-[#D97757]/20"
            >
              Complete Payment →
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-[#D0CEC2] text-sm font-semibold text-[#6B6B6B] hover:border-[#2C5F5F] transition-colors"
            >
              Edit Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const COMPLETION_YEARS = Array.from({ length: 8 }, (_, i) => String(2019 + i)); // 2019–2026

function RegistrationContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('event_id');

  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventIdFromUrl);
  const [eventPreCode, setEventPreCode] = useState<string>('');
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [group, setGroup] = useState<'A' | 'B' | ''>('');
  const [participant, setParticipant] = useState<ParticipantData>({
    name: '',
    email: '',
    phone: '',
    institute: '',
    year_of_completion: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>(null);
  const [existingRegistrationId, setExistingRegistrationId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchEventData = async () => {
      setLoadingEvents(true);
      if (eventIdFromUrl) {
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, title, code_name')
          .eq('id', eventIdFromUrl)
          .maybeSingle();
        if (eventError || !event) {
          setSelectedEventId(null);
          await fetchAllEvents();
        } else {
          setSelectedEventId(event.id);
          setEventPreCode(event.code_name);
          await loadExistingRegistration(event.id);
        }
      } else {
        await fetchAllEvents();
      }
      setLoadingEvents(false);
    };

    const fetchAllEvents = async () => {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, code_name')
        .order('title');
      if (!eventsError && events) setAvailableEvents(events);
    };

    fetchEventData();
  }, [eventIdFromUrl]);

  const loadExistingRegistration = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingReg, error: regError } = await supabase
        .from('registrations_2')
        .select('*')
        .eq('registration_by', user.id)
        .eq('event_id', eventId)
        .maybeSingle();

      if (regError) { console.error('Error fetching registration:', regError); return; }

      if (!existingReg) {
        setExistingRegistrationId(null);
        setIsEditMode(false);
        setGroup('');
        setParticipant({ name: '', email: '', phone: '', institute: '', year_of_completion: '' });
        return;
      }

      if (existingReg.paid === true) {
        setExistingRegistrationId(existingReg.id);
        setIsPaid(true);
        setRegistrationStatus('already_paid');
      } else {
        setExistingRegistrationId(existingReg.id);
        setIsPaid(false);
        setRegistrationStatus('payment_pending');
      }

      setIsEditMode(true);
      setGroup(existingReg.group);
      setParticipant({
        name: existingReg.name || '',
        email: existingReg.email || '',
        phone: existingReg.phone || '',
        institute: existingReg.institute || '',
        year_of_completion: existingReg.year_of_completion || '',
      });
    } catch (err) {
      console.error('Error loading existing registration:', err);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    const event = availableEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEventId(event.id);
      setEventPreCode(event.code_name);
      await loadExistingRegistration(event.id);
    }
  };

  const canSubmit = () => {
    if (isPaid) return false;
    if (!selectedEventId || !group) return false;
    return !!(participant.name && participant.email && participant.phone && participant.institute && participant.year_of_completion);
  };

  const generateTeamId = async (
    eventId: string,
    codeName: string,
    grp: string,
    retryCount = 0
  ): Promise<string> => {
    const maxRetries = 5;
    try {
      const { data: existingRegs, error: fetchError } = await supabase
        .from('registrations_2')
        .select('team_id')
        .eq('event_id', eventId);

      if (fetchError) throw fetchError;

      let maxNumber = 0;
      if (existingRegs && existingRegs.length > 0) {
        existingRegs.forEach(reg => {
          if (!reg.team_id) return;
          const parts = reg.team_id.split('-');
          const numberPart = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(numberPart) && numberPart > maxNumber) maxNumber = numberPart;
        });
      }

      const nextNumber = maxNumber + 1;
      const paddedNumber = nextNumber.toString().padStart(4, '0');
      return `${codeName}-${grp}-${paddedNumber}`;
    } catch (err) {
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
        return generateTeamId(eventId, codeName, grp, retryCount + 1);
      }
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit()) { setError('Please complete all required fields'); return; }
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let registrationId = existingRegistrationId;

      if (isEditMode && existingRegistrationId) {
        const { error: updateError } = await supabase.from('registrations_2')
          .update({
            group,
            name: participant.name,
            email: participant.email,
            phone: participant.phone,
            institute: participant.institute,
            year_of_completion: participant.year_of_completion,
          })
          .eq('id', existingRegistrationId);
        if (updateError) throw updateError;
      } else {
        let teamId: string | null = null;
        let insertSuccess = false;
        let insertRetry = 0;

        while (!insertSuccess && insertRetry < 5) {
          try {
            teamId = await generateTeamId(selectedEventId!, eventPreCode, group);

            const { data: registration, error: regError } = await supabase.from('registrations_2')
              .insert({
                registration_by: user.id,
                event_id: selectedEventId,
                group,
                team_id: teamId,
                name: participant.name,
                email: participant.email,
                phone: participant.phone,
                institute: participant.institute,
                year_of_completion: participant.year_of_completion,
              })
              .select()
              .single();

            if (regError) {
              if (regError.code === '23505') { insertRetry++; await new Promise(r => setTimeout(r, 100 * insertRetry)); continue; }
              throw regError;
            }

            registrationId = registration.id;
            setExistingRegistrationId(registration.id);
            insertSuccess = true;
          } catch (err: any) {
            if (err?.code === '23505' && insertRetry < 4) {
              insertRetry++;
              await new Promise(r => setTimeout(r, 100 * insertRetry));
            } else {
              throw err;
            }
          }
        }

        if (!insertSuccess) throw new Error('Failed to generate a unique team ID. Please try again.');
      }

      setIsEditMode(true);
      setShowPaymentDialog(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#2C5F5F]">
          <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          <span className="text-base font-semibold">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Select an Event</h1>
            <p className="text-[#6B6B6B] mt-2 text-sm">Choose the event you'd like to register for</p>
          </div>
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-2 space-y-1.5">
            {availableEvents.length === 0 ? (
              <p className="text-[#8B8B8B] text-center py-10 text-sm">No events available at the moment.</p>
            ) : (
              availableEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEventSelect(event.id)}
                  className="w-full p-4 text-left rounded-xl bg-white border border-transparent hover:border-[#2C5F5F] hover:shadow-md transition-all duration-200 group"
                >
                  <div className="font-semibold text-[#1A1A1A] group-hover:text-[#2C5F5F] transition-colors">{event.title}</div>
                  <div className="text-xs text-[#8B8B8B] mt-0.5 font-mono">{event.code_name}</div>
                </button>
              ))
            )}
          </div>
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
              {isEditMode ? 'Edit Mode' : 'New Registration'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
            {isEditMode ? 'Update Registration' : 'Event Registration'}
          </h1>
          <p className="text-[#6B6B6B] mt-1 text-sm">
            {isEditMode ? 'Update your details below and resubmit' : 'Complete all sections to secure your spot'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl flex items-start gap-3">
            <span className="text-[#C85D3E] text-lg mt-0.5">⚠</span>
            <p className="text-[#C85D3E] text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-6 space-y-7">

          {/* Group */}
          <div>
            <SectionHeading>Group</SectionHeading>
            <div className="flex gap-2">
              <ToggleBtn active={group === 'A'} onClick={() => setGroup('A')} disabled={isLoading || isPaid}>
                Group A — Monetary Award
              </ToggleBtn>
              <ToggleBtn active={group === 'B'} onClick={() => setGroup('B')} disabled={isLoading || isPaid}>
                Group B — No Monetary Award
              </ToggleBtn>
            </div>
          </div>

          <div className="border-t border-[#E5E3D7]" />

          {/* Participant Details */}
          <div>
            <SectionHeading>Your Details</SectionHeading>
            <div className="space-y-3">
              <FloatingInput
                label="Full Name"
                value={participant.name}
                onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
                disabled={isLoading || isPaid}
              />
              <FloatingInput
                label="Email Address"
                type="email"
                value={participant.email}
                onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
                disabled={isLoading || isPaid}
              />
              <FloatingInput
                label="Phone Number"
                type="tel"
                value={participant.phone}
                onChange={(e) => setParticipant({ ...participant, phone: e.target.value })}
                disabled={isLoading || isPaid}
              />
              <FloatingInput
                label="Institute / University"
                value={participant.institute}
                onChange={(e) => setParticipant({ ...participant, institute: e.target.value })}
                disabled={isLoading || isPaid}
              />
              <FloatingSelect
                label="Year of Completion"
                value={participant.year_of_completion}
                onChange={(e) => setParticipant({ ...participant, year_of_completion: e.target.value })}
                disabled={isLoading || isPaid}
                options={COMPLETION_YEARS.map(y => ({ value: y, label: y }))}
              />
            </div>
          </div>

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
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || isLoading}
                className={`
                  w-full py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${canSubmit() && !isLoading
                    ? 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D] shadow-lg shadow-[#2C5F5F]/20 hover:shadow-xl hover:shadow-[#2C5F5F]/30 hover:-translate-y-0.5'
                    : 'bg-[#D0CEC2] text-[#8B8B8B] cursor-not-allowed'
                  }
                `}
              >
                {isLoading
                  ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditMode ? 'Updating...' : 'Registering...'}
                    </span>
                  )
                  : isEditMode ? 'Update Registration' : 'Complete Registration'
                }
              </button>
            )}
            {!canSubmit() && !isLoading && !isPaid && (
              <p className="text-xs text-[#8B8B8B] text-center mt-2">
                Complete all sections above to enable submission
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Registration Status Dialog */}
      <RegistrationStatusDialog
        status={registrationStatus}
        registrationId={existingRegistrationId}
        onClose={() => setRegistrationStatus(null)}
      />

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
            <div className="w-14 h-14 bg-[#2D5F4F] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              {isEditMode ? 'Registration Updated!' : 'Registration Complete!'}
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-7 leading-relaxed">
              {isEditMode
                ? 'Your registration has been updated. Proceed to payment to confirm your spot.'
                : 'Your registration is saved. Complete payment to confirm your spot.'}
            </p>
            <button
              onClick={() => {
                setShowPaymentDialog(false);
                window.location.href = '/payment?registration_id=' + existingRegistrationId;
              }}
              className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20"
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      )}
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
