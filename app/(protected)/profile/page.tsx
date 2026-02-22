'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import Navigation from '@/app/components/Navigation';


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

interface Registration {
  id: string;
  country: string;
  group: 'A' | 'B';
  category: 1 | 2;
  team_type: 'solo' | 'group';
  paid: boolean;
  event_id: string;
  events: Event;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participatedEvents, setParticipatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();


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

      const { data: userInfoData, error: userInfoError } = await supabase
        .from('user_info')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (userInfoError) throw userInfoError;
      setUserInfo(userInfoData);

      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          *,
          events (
            id,
            title,
            code_name
          )
        `)
        .eq('registration_by', currentUser.id);

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);

      const uniqueEvents = registrationsData?.reduce((acc: Event[], reg) => {
        const event = reg.events as unknown as Event;
        if (event && !acc.find(e => e.id === event.id)) {
          acc.push(event);
        }
        return acc;
      }, []) || [];

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

  const hasPendingPayments = registrations.some(reg => !reg.paid);

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
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#EDEBDF' }}>
          <div className="text-xl" style={{ color: '#C85D3E' }}>
            User information not found
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBDF' }}>
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

                {/* Logout Button — lives naturally at the bottom of the profile card */}
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

                {registrations.length === 0 ? (
                  <p style={{ color: '#6B6B6B' }}>
                    You haven't registered for any events yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div
                        key={registration.id}
                        className="rounded-lg p-4 border"
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderColor: registration.paid ? '#D0CEC2' : '#D97757'
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>
                              {registration.events.title}
                            </h4>
                            <p className="text-sm" style={{ color: '#6B6B6B' }}>
                              Code: {registration.events.code_name}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-semibold"
                              style={{
                                backgroundColor: registration.paid ? '#2D5F4F' : '#D97757',
                                color: '#FFFFFF'
                              }}
                            >
                              {registration.paid ? 'Paid' : 'Payment Pending'}
                            </span>
                            {!registration.paid && (
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
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
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
                              {registration.category === 1 ? 'Category 1 (Year 1-2)' : 'Category 2 (Year 3-5)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  Events Participated
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
