'use client';

import { useState, useEffect, Suspense, createElement } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getProjectConfig, fromStoredFormData } from '@/config/projects';
import { isOnboardingComplete } from '@/utils/onboarding';
import { getRegistrationForm, hasRegistrationForm } from '@/app/components/registration/registry';

interface EventRow {
  id: string;
  title: string;
  code_name: string;
}

const Spinner = ({ label }: { label: string }) => (
  <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center">
    <div className="flex items-center gap-3 text-[#2C5F5F]">
      <div className="w-5 h-5 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
      <span className="text-base font-semibold">{label}</span>
    </div>
  </div>
);

function Notice({ title, body, action }: { title: string; body: string; action: { label: string; onClick: () => void } }) {
  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] w-full max-w-sm p-8 text-center shadow-2xl">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#2D5F4F]">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{title}</h3>
        <p className="text-sm text-[#6B6B6B] mb-7 leading-relaxed">{body}</p>
        <button onClick={action.onClick}
          className="w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors shadow-lg shadow-[#2C5F5F]/20">
          {action.label}
        </button>
      </div>
    </div>
  );
}

function RegistrationContent() {
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get('event_id');

  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [availableEvents, setAvailableEvents] = useState<EventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [initialData, setInitialData] = useState<Record<string, any> | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAlreadyPaid, setShowAlreadyPaid] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setOnboardingChecked(true); return; }
      const { data: userInfo } = await supabase
        .from('user_info').select('name, role, institute, academic_year, academic_level')
        .eq('id', user.id).maybeSingle();
      setOnboardingDone(isOnboardingComplete(userInfo));
      setOnboardingChecked(true);
    })();
  }, []);

  /** Select an event and load the user's existing registration for it, if any. */
  const selectEvent = async (eventId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: reg } = await supabase
        .from('registrations_v3').select('form_data, paid')
        .eq('registration_by', user.id).eq('event_id', eventId).maybeSingle();

      if (reg?.paid) {
        setShowAlreadyPaid(true);
      } else if (reg) {
        setInitialData(fromStoredFormData(eventId, reg.form_data));
        setIsEditMode(true);
      }
    }
    setSelectedEventId(eventId);
  };

  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      if (eventIdFromUrl) {
        const { data: event } = await supabase
          .from('events').select('id').eq('id', eventIdFromUrl).maybeSingle();
        if (event) {
          await selectEvent(event.id);
          setLoadingEvents(false);
          return;
        }
      }
      const { data: events } = await supabase.from('events').select('id, title, code_name').order('title');
      // Only list events that actually have a registration form.
      setAvailableEvents((events ?? []).filter(e => hasRegistrationForm(e.id)));
      setLoadingEvents(false);
    })();
  }, [eventIdFromUrl]);

  const submitRegistration = async (formData: Record<string, any>) => {
    const res = await fetch('/api/v3/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: selectedEventId, form_data: formData }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.payment_required) {
      window.location.href = `/payment-3?registration_id=${data.registration_id}`;
    } else {
      setSubmitted(true);
    }
  };

  if (!onboardingChecked || loadingEvents) return <Spinner label="Loading..." />;

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

  if (submitted) {
    return (
      <Notice
        title="Application Submitted"
        body="Thank you! We've received your application. We'll be in touch with next steps."
        action={{ label: 'Go to Home', onClick: () => { window.location.href = '/'; } }}
      />
    );
  }

  if (showAlreadyPaid) {
    return (
      <Notice
        title="Already Registered"
        body="You have already completed registration and payment for this event."
        action={{ label: 'Go to Home', onClick: () => { window.location.href = '/'; } }}
      />
    );
  }

  if (!selectedEventId) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Select an Event</h1>
            <p className="text-[#6B6B6B] mt-2 text-sm">Choose the event you&apos;d like to register for</p>
          </div>
          <div className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-2 space-y-1.5">
            {availableEvents.length === 0
              ? <p className="text-[#8B8B8B] text-center py-10 text-sm">No events available.</p>
              : availableEvents.map(event => (
                  <button key={event.id} onClick={() => selectEvent(event.id)}
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

  const projectForm = getRegistrationForm(selectedEventId);
  if (!projectForm) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] p-8 text-center shadow-xl">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Registration not open</h2>
          <p className="text-sm text-[#6B6B6B] mb-7">Registration for this event isn&apos;t available yet.</p>
          <Link href="/" className="block w-full py-3.5 rounded-xl bg-[#2C5F5F] text-white text-sm font-bold hover:bg-[#1A4D4D] transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const paymentEnabled = !!getProjectConfig(selectedEventId)?.paymentEnabled;

  return (
    <div className="min-h-screen bg-[#EDEBDF] py-10 px-4">
      <div className="max-w-2xl mx-auto">
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
            {isEditMode
              ? `Update your details below${paymentEnabled ? ' and proceed to payment' : ''}`
              : 'Complete all sections to secure your spot'}
          </p>
        </div>

        {createElement(projectForm, {
          key: selectedEventId,
          eventId: selectedEventId,
          initialData,
          isEditMode,
          onSubmit: submitRegistration,
        })}
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <RegistrationContent />
    </Suspense>
  );
}
