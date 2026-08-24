'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Navigation from '@/app/components/Navigation';
import { isOnboardingComplete } from '@/utils/onboarding';
import { isCertificatesAvailable } from '@/utils/registration';
import { useRouter } from 'next/navigation';

// ─── Submission Links ─────────────────────────────────────────────────────────
const SUBMISSION_LINKS: Record<string, string> = {
  TUH: 'https://forms.gle/ZcnqVNnbVNazzAW5A',
  MRTA2: 'https://forms.gle/gnjPH2TBZk8P1RYXA',
};

function getSubmissionLink(teamId: string): string | null {
  if (teamId.startsWith('TUH')) return SUBMISSION_LINKS.TUH;
  if (teamId.startsWith('MRTA2')) return SUBMISSION_LINKS.MRTA2;
  return null;
}


// Types
interface UserInfo {
  id: string;
  name: string;
  role: string;
  institute: string;
  academic_year: number;
  academic_level: string | null;
}

interface Event {
  id: string;
  title: string;
  code_name: string;
}

interface Member {
  id: string;
  name: string;
}

interface Registration {
  id: string;
  country: string;
  group: 'A' | 'B';
  category: '1' | '2';
  team_type: 'solo' | 'group';
  team_id: string;
  paid: boolean;
  has_submitted: boolean | null;
  participation_certificates: string[] | null;
  event_id: string;
  events: Event;
  members?: Member[];
}

// ─── Certificates Modal ───────────────────────────────────────────────────────
function CertificatesModal({
  urls,
  onClose,
}: {
  urls: string[];
  onClose: () => void;
}) {
  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `participation_certificate_${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open in new tab if fetch fails
      window.open(url, '_blank');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(26,26,26,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl border"
        style={{ backgroundColor: '#F8F7F2', borderColor: '#D0CEC2' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: '#EDEBDF', color: '#6B6B6B' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D0CEC2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#EDEBDF')}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2C5F5F' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7L2 9h7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: '#1A1A1A' }}>Participation Certificates</h3>
            <p className="text-xs" style={{ color: '#6B6B6B' }}>{urls.length} certificate{urls.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        {/* Certificate rows */}
        <div className="space-y-2">
          {urls.map((url, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl px-4 py-3 border"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E3D7' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EDEBDF' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2C5F5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <span className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>Certificate {i + 1}</span>
              </div>
              <button
                id={`download-cert-${i + 1}`}
                onClick={() => handleDownload(url, i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                style={{ backgroundColor: '#2C5F5F', color: '#FFFFFF' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface Registration2 {
  id: string;
  group: 'A' | 'B';
  team_id: string;
  paid: boolean;
  event_id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  year_of_completion: string;
  events: Event;
}

interface FormDataMember {
  name: string;
  email?: string;
  phone?: string;
  institute?: string;
  academic_year?: string;
  institute_id_url?: string;
}

interface Registration3FormData {
  country?: string;
  group?: string;
  category?: string;
  team_type?: string;
  members?: FormDataMember[];
  [key: string]: unknown;
}

interface Registration3 {
  id: string;
  registration_by: string;
  event_id: string;
  team_id: string;
  form_data: Registration3FormData;
  paid: boolean;
  referral_used: string | null;
  created_at: string;
  updated_at: string;
  events: Event;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrations2, setRegistrations2] = useState<Registration2[]>([]);
  const [registrations3, setRegistrations3] = useState<Registration3[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [certPopup, setCertPopup] = useState<string[] | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const certAvailable = isCertificatesAvailable();


  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        window.location.href = '/login';
        return;
      }
      setUser(currentUser);

      const { data: userInfoData } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      // Redirect to onboarding if profile is missing or incomplete
      if (!isOnboardingComplete(userInfoData)) {
        router.push('/onboarding');
        return;
      }

      setUserInfo(userInfoData);

      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            id,
            title,
            code_name
          ),
          members (
            id,
            name
          )
        `)
        .eq('registration_by', currentUser.id);

      if (registrationsError) throw registrationsError;
      setRegistrations((registrationsData || []) as Registration[]);

      // Fetch registrations_2
      const { data: registrations2Data, error: registrations2Error } = await supabase
        .from('registrations_2')
        .select(`
          *,
          events (
            id,
            title,
            code_name
          )
        `)
        .eq('registration_by', currentUser.id);

      if (registrations2Error) throw registrations2Error;
      setRegistrations2(registrations2Data || []);

      // Fetch registrations_v3
      const { data: registrations3Data, error: registrations3Error } = await supabase
        .from('registrations_v3')
        .select(`
          *,
          events (
            id,
            title,
            code_name
          )
        `)
        .eq('registration_by', currentUser.id);

      if (registrations3Error) throw registrations3Error;
      setRegistrations3((registrations3Data || []) as Registration3[]);

      // Merge unique events from all tables
      const allRegs = [
        ...(registrationsData || []),
        ...(registrations2Data || []),
        ...(registrations3Data || []),
      ];
      const uniqueEvents = allRegs.reduce((acc: Event[], reg) => {
        const event = reg.events as unknown as Event;
        if (event && !acc.find(e => e.id === event.id)) {
          acc.push(event);
        }
        return acc;
      }, []);

      setParticipatedEvents(uniqueEvents);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const hasPendingPayments = registrations.some(reg => !reg.paid) || registrations2.some(reg => !reg.paid) || registrations3.some(reg => !reg.paid);

  const formatAcademicLevel = (level: string | null) => {
    if (level === 'UG') return 'Under Graduate';
    if (level === 'PG') return 'Post Graduate';
    return null;
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEBDF' }}>
          <div className="animate-pulse text-2xl font-semibold" style={{ color: '#2C5F5F' }}>
            Loading...
          </div>
        </div>
      </>
    );
  }

  if (!userInfo) {
    // Still loading or redirecting — show spinner so there's no flash
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEBDF' }}>
          <div className="animate-pulse text-2xl font-semibold" style={{ color: '#2C5F5F' }}>
            Loading...
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBDF' }}>
      {certPopup && (
        <CertificatesModal urls={certPopup} onClose={() => setCertPopup(null)} />
      )}
      <Navigation />

      <div className="py-8 px-2">
        <div className="max-w-[90%] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
              My Profile
            </h1>
            <p style={{ color: '#6B6B6B' }}>
              View your information, registrations, and events
            </p>
          </div>

          {/* Warning Banner */}
          {hasPendingPayments && (
            <div
              className="mb-6 p-4 rounded-lg border-l-4 flex items-center gap-3"
              style={{
                backgroundColor: '#F8F7F2',
                borderColor: '#D97757',
                borderLeftWidth: '4px'
              }}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#D97757">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                  Registration Incomplete | Payment Pending
                </p>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                  You have pending payments for some registrations. Please complete them to confirm your participation.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <div
                className="rounded-xl shadow-md p-6 border"
                style={{
                  backgroundColor: '#F8F7F2',
                  borderColor: '#D0CEC2'
                }}
              >
                <div className="flex items-center justify-center mb-6">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold"
                    style={{
                      backgroundColor: '#2C5F5F',
                      color: '#FFFFFF'
                    }}
                  >
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#1A1A1A' }}>
                  {userInfo.name}
                </h2>

                <div className="space-y-4">
                  {userInfo.institute && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#6B6B6B' }}>
                        Institution
                      </p>
                      <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                        {userInfo.institute}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#6B6B6B' }}>
                      Profession
                    </p>
                    <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                      {userInfo.role}
                    </p>
                  </div>

                  {userInfo.academic_year && userInfo.academic_level && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: '#6B6B6B' }}>
                        {formatAcademicLevel(userInfo.academic_level)}
                      </p>
                      <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                        Year {userInfo.academic_year}
                      </p>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t" style={{ borderColor: '#D0CEC2' }}>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#C85D3E',
                      border: '1px solid #C85D3E'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#C85D3E';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#C85D3E';
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Registrations Section */}
              <div
                className="rounded-xl shadow-md p-6 border"
                style={{
                  backgroundColor: '#F8F7F2',
                  borderColor: '#D0CEC2'
                }}
              >
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  My Registrations
                </h3>

                {registrations.length === 0 && registrations2.length === 0 && registrations3.length === 0 ? (
                  <p style={{ color: '#6B6B6B' }}>
                    You haven't registered for any events yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Registrations (v1) */}
                    {registrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="rounded-lg p-4 border"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: registration.paid ? '#D0CEC2' : '#D97757'
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                              {registration.events.title}
                            </h4>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: '#6B6B6B' }}>
                              Mind ID:{' '}
                              <span
                                className="px-1.5 py-0.5 rounded font-mono"
                                style={{ backgroundColor: '#EDEBDF', color: registration.paid ? '#2C5F5F' : '#8B8B8B' }}
                              >
                                {registration.paid ? registration.team_id : 'Not applicable'}
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {!registration.paid ? (
                              <a
                                href={`/payment?registration_id=${registration.id}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                style={{
                                  backgroundColor: '#2C5F5F',
                                  color: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
                              >
                                Complete Payment →
                              </a>
                            ) : certAvailable && registration.has_submitted && registration.participation_certificates?.length ? (
                              <button
                                id={`open-certs-${registration.id}`}
                                onClick={() => setCertPopup(registration.participation_certificates!)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md flex items-center gap-1.5"
                                style={{ backgroundColor: '#2C5F5F', color: '#FFFFFF' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 5v14M5 12l7 7 7-7" />
                                </svg>
                                Participation Certificate
                              </button>
                            ) : !registration.has_submitted && getSubmissionLink(registration.team_id) ? (
                              <a
                                href={getSubmissionLink(registration.team_id)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                style={{
                                  backgroundColor: '#D97757',
                                  color: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C04B2B')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D97757')}
                              >
                                Submit Entry →
                              </a>
                            ) : null}
                          </div>
                        </div>

                        {/* Registration Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Country</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.country}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Team Type</p>
                            <p className="font-semibold capitalize" style={{ color: '#1A1A1A' }}>
                              {registration.team_type}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Group</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.group === 'A' ? 'A (Monetary Award)' : 'B (No Monetary Award)'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Category</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.category === '1' ? 'Category 1 (Year 1-2)' : 'Category 2 (Year 3-5)'}
                            </p>
                          </div>
                        </div>

                        {/* Members */}
                        {registration.members && registration.members.length > 0 && (
                          <div
                            className="pt-3 border-t"
                            style={{ borderColor: '#EDEBDF' }}
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B6B6B' }}>
                              Team Members
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {registration.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="rounded-md px-3 py-2"
                                  style={{ backgroundColor: '#F8F7F2' }}
                                >
                                  <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                                    {member.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Registrations (v2 — Thesis Award etc.) */}
                    {registrations2.map((registration) => (
                      <div
                        key={registration.id}
                        className="rounded-lg p-4 border"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: registration.paid ? '#D0CEC2' : '#D97757'
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                              {registration.events.title}
                            </h4>
                            <p className="text-xs font-semibold mt-0.5" style={{ color: '#6B6B6B' }}>
                              Mind ID:{' '}
                              <span
                                className="px-1.5 py-0.5 rounded font-mono"
                                style={{ backgroundColor: '#EDEBDF', color: registration.paid ? '#2C5F5F' : '#8B8B8B' }}
                              >
                                {registration.paid ? registration.team_id : 'Not applicable'}
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {!registration.paid ? (
                              <a
                                href={`/payment-2?registration_id=${registration.id}`}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                style={{
                                  backgroundColor: '#2C5F5F',
                                  color: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
                              >
                                Complete Payment →
                              </a>
                            ) : getSubmissionLink(registration.team_id) ? (
                              <a
                                href={getSubmissionLink(registration.team_id)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                style={{
                                  backgroundColor: '#D97757',
                                  color: '#FFFFFF',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C04B2B')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D97757')}
                              >
                                Submit Entry →
                              </a>
                            ) : null}
                          </div>
                        </div>

                        {/* Registration Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Name</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.name}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Email</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.email}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Group</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.group === 'A' ? 'A (Monetary Award)' : 'B (No Monetary Award)'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Institute</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.institute}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Year of Completion</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.year_of_completion}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: '#6B6B6B' }}>Phone</p>
                            <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                              {registration.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Registrations (v3 — JSONB form_data) */}
                    {registrations3.map((registration) => {
                      const fd = registration.form_data || {};
                      const members = fd.members || [];
                      return (
                        <div
                          key={registration.id}
                          className="rounded-lg p-4 border"
                          style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: registration.paid ? '#D0CEC2' : '#D97757'
                          }}
                        >
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                                {registration.events.title}
                              </h4>
                              <p className="text-xs font-semibold mt-0.5" style={{ color: '#6B6B6B' }}>
                                Mind ID:{' '}
                                <span
                                  className="px-1.5 py-0.5 rounded font-mono"
                                  style={{ backgroundColor: '#EDEBDF', color: registration.paid ? '#2C5F5F' : '#8B8B8B' }}
                                >
                                  {registration.paid ? registration.team_id : 'Not applicable'}
                                </span>
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {!registration.paid ? (
                                <a
                                  href={`/payment-3?registration_id=${registration.id}`}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                  style={{
                                    backgroundColor: '#2C5F5F',
                                    color: '#FFFFFF',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A4D4D')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2C5F5F')}
                                >
                                  Complete Payment →
                                </a>
                              ) : getSubmissionLink(registration.team_id) ? (
                                <a
                                  href={getSubmissionLink(registration.team_id)!}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:shadow-md"
                                  style={{
                                    backgroundColor: '#D97757',
                                    color: '#FFFFFF',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C04B2B')}
                                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D97757')}
                                >
                                  Submit Entry →
                                </a>
                              ) : null}
                            </div>
                          </div>

                          {/* Registration Details from form_data */}
                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            {fd.country && (
                              <div>
                                <p style={{ color: '#6B6B6B' }}>Country</p>
                                <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                                  {fd.country}
                                </p>
                              </div>
                            )}
                            {fd.team_type && (
                              <div>
                                <p style={{ color: '#6B6B6B' }}>Team Type</p>
                                <p className="font-semibold capitalize" style={{ color: '#1A1A1A' }}>
                                  {fd.team_type}
                                </p>
                              </div>
                            )}
                            {fd.group && (
                              <div>
                                <p style={{ color: '#6B6B6B' }}>Group</p>
                                <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                                  {fd.group === 'A' ? 'A (Monetary Award)' : 'B (No Monetary Award)'}
                                </p>
                              </div>
                            )}
                            {fd.category && (
                              <div>
                                <p style={{ color: '#6B6B6B' }}>Category</p>
                                <p className="font-semibold" style={{ color: '#1A1A1A' }}>
                                  {fd.category === '1' ? 'Category 1 (Year 1-2)' : 'Category 2 (Year 3-5)'}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Members from form_data */}
                          {members.length > 0 && (
                            <div
                              className="pt-3 border-t"
                              style={{ borderColor: '#EDEBDF' }}
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#6B6B6B' }}>
                                Team Members
                              </p>
                              <div className="flex flex-col gap-1.5">
                                {members.map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-md px-3 py-2"
                                    style={{ backgroundColor: '#F8F7F2' }}
                                  >
                                    <p className="text-sm font-semibold" style={{ color: '#1A1A1A' }}>
                                      {member.name}
                                    </p>
                                    {member.institute && (
                                      <p className="text-xs" style={{ color: '#6B6B6B' }}>
                                        {member.institute}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Participated Events Section */}
              <div
                className="rounded-xl shadow-md p-6 border"
                style={{
                  backgroundColor: '#F8F7F2',
                  borderColor: '#D0CEC2'
                }}
              >
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
                  Events Participation History
                </h3>

                {participatedEvents.length === 0 ? (
                  <p style={{ color: '#6B6B6B' }}>
                    You haven't participated in any events yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {participatedEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-lg p-4 border transition-all duration-200 hover:shadow-md"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#D0CEC2'
                        }}
                      >
                        <h4 className="font-bold mb-2" style={{ color: '#1A1A1A' }}>
                          {event.title}
                        </h4>
                        <p
                          className="text-sm px-3 py-1 rounded inline-block"
                          style={{
                            backgroundColor: '#EDEBDF',
                            color: '#2C5F5F',
                            fontWeight: 600
                          }}
                        >
                          {event.code_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
