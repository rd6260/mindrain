'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type Event = {
  id: string;
  title: string;
  code_name: string;
};

type UserInfo = {
  id: string;
  name: string;
  role: string;
  institute: string | null;
  academic_year: number | null;
  academic_level: string | null;
};

type MemberDisplay = {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  academic_year: number | string;
  institute_id?: string;
};

type UnifiedRegistration = {
  id: string;
  created_at: string;
  group: string;
  category: string;
  team_type: string;
  country: string;
  paid: boolean;
  team_id: string;
  registration_by: string;
  user_info?: UserInfo | null;
  members: MemberDisplay[];
  source: 'v1' | 'v2' | 'v3';
  event_title: string;
  // v2-specific fields
  document?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminRegistrationList() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [registrations, setRegistrations] = useState<UnifiedRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | 'A' | 'B'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | '1' | '2'>('all');
  const [filterTeamType, setFilterTeamType] = useState<'all' | 'solo' | 'group'>('all');
  const [filterCountry, setFilterCountry] = useState<'all' | 'india' | 'international'>('all');
  const [sortBy, setSortBy] = useState<'time' | 'institute'>('time');

  const [registrationToDelete, setRegistrationToDelete] = useState<UnifiedRegistration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();

  // ─── Fetch Events ─────────────────────────────────────────────────────────

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('events')
        .select('id, title, code_name')
        .order('title');

      if (fetchError) throw fetchError;
      setEvents(data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // ─── Fetch Registrations ──────────────────────────────────────────────────

  const fetchRegistrations = async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const allRegs: UnifiedRegistration[] = [];

      // --- V1: registrations + members ---
      const v1Query = supabase
        .from('registrations')
        .select(`
          id,
          created_at,
          "group",
          category,
          team_type,
          country,
          paid,
          team_id,
          registration_by,
          event_id,
          events (
            id,
            title,
            code_name
          ),
          members (
            id,
            name,
            email,
            phone,
            institute,
            academic_year,
            institute_id
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId !== 'all') {
        v1Query.eq('event_id', eventId);
      }

      const { data: v1Data, error: v1Error } = await v1Query;
      if (v1Error) console.error('V1 fetch error:', v1Error);

      if (v1Data) {
        for (const reg of v1Data as any[]) {
          const eventInfo = reg.events as Event | null;
          allRegs.push({
            id: reg.id,
            created_at: reg.created_at,
            group: reg.group || '',
            category: reg.category || '',
            team_type: reg.team_type || '',
            country: reg.country || '',
            paid: reg.paid,
            team_id: reg.team_id || '',
            registration_by: reg.registration_by,
            members: (reg.members || []).map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              phone: m.phone,
              institute: m.institute,
              academic_year: m.academic_year,
              institute_id: m.institute_id,
            })),
            source: 'v1',
            event_title: eventInfo?.title || 'Unknown Event',
          });
        }
      }

      // --- V2: registrations_2 (flat, single participant) ---
      const v2Query = supabase
        .from('registrations_2')
        .select(`
          id,
          created_at,
          "group",
          team_id,
          paid,
          registration_by,
          event_id,
          name,
          email,
          phone,
          institute,
          year_of_completion,
          document,
          events (
            id,
            title,
            code_name
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId !== 'all') {
        v2Query.eq('event_id', eventId);
      }

      const { data: v2Data, error: v2Error } = await v2Query;
      if (v2Error) console.error('V2 fetch error:', v2Error);

      if (v2Data) {
        for (const reg of v2Data as any[]) {
          const eventInfo = reg.events as Event | null;
          allRegs.push({
            id: reg.id,
            created_at: reg.created_at,
            group: reg.group || '',
            category: '',
            team_type: 'solo',
            country: '',
            paid: reg.paid,
            team_id: reg.team_id || '',
            registration_by: reg.registration_by,
            members: [{
              id: reg.id,
              name: reg.name || '',
              email: reg.email || '',
              phone: reg.phone || '',
              institute: reg.institute || '',
              academic_year: reg.year_of_completion || '',
            }],
            source: 'v2',
            event_title: eventInfo?.title || 'Unknown Event',
            document: reg.document,
          });
        }
      }

      // --- V3: registrations_v3 (JSONB form_data) ---
      const v3Query = supabase
        .from('registrations_v3')
        .select(`
          id,
          created_at,
          registration_by,
          event_id,
          team_id,
          form_data,
          paid,
          referral_used,
          events (
            id,
            title,
            code_name
          )
        `)
        .order('created_at', { ascending: false });

      if (eventId !== 'all') {
        v3Query.eq('event_id', eventId);
      }

      const { data: v3Data, error: v3Error } = await v3Query;
      if (v3Error) console.error('V3 fetch error:', v3Error);

      if (v3Data) {
        for (const reg of v3Data as any[]) {
          const eventInfo = reg.events as Event | null;
          const fd = reg.form_data || {};
          const fdMembers = fd.members || [];

          allRegs.push({
            id: reg.id,
            created_at: reg.created_at,
            group: fd.group || '',
            category: fd.category || '',
            team_type: fd.team_type || '',
            country: fd.country || '',
            paid: reg.paid,
            team_id: reg.team_id || '',
            registration_by: reg.registration_by,
            members: fdMembers.map((m: any, i: number) => ({
              id: `${reg.id}-m${i}`,
              name: m.name || '',
              email: m.email || '',
              phone: m.phone || '',
              institute: m.institute || '',
              academic_year: m.academic_year || '',
              institute_id: m.institute_id_url,
            })),
            source: 'v3',
            event_title: eventInfo?.title || 'Unknown Event',
          });
        }
      }

      // Fetch user_info for submitters
      const userIds = Array.from(new Set(allRegs.map(r => r.registration_by).filter(Boolean)));
      if (userIds.length > 0) {
        const { data: userInfos } = await supabase
          .from('user_info')
          .select('id, name, role, institute, academic_year, academic_level')
          .in('id', userIds);

        if (userInfos) {
          const userInfoMap = new Map(userInfos.map(u => [u.id, u]));
          allRegs.forEach(r => {
            if (r.registration_by && userInfoMap.has(r.registration_by)) {
              r.user_info = userInfoMap.get(r.registration_by) as UserInfo;
            }
          });
        }
      }

      // Sort by time descending
      allRegs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRegistrations(allRegs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to fetch registrations');
      } else {
        setError('Failed to fetch registrations');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const confirmDelete = async () => {
    if (!registrationToDelete) return;
    const reg = registrationToDelete;
    setIsDeleting(true);
    setError(null);

    try {
      if (reg.source === 'v1') {
        // Delete member files from storage
        if (reg.members && reg.members.length > 0) {
          const pathsToDelete: string[] = [];
          const marker = '/object/public/college_id/';

          reg.members.forEach(member => {
            if (member.institute_id) {
              const markerIndex = member.institute_id.indexOf(marker);
              if (markerIndex !== -1) {
                const storagePath = member.institute_id
                  .slice(markerIndex + marker.length)
                  .split('?')[0];
                pathsToDelete.push(storagePath);
              }
            }
          });

          if (pathsToDelete.length > 0) {
            await supabase.storage.from('college_id').remove(pathsToDelete);
          }
        }

        // Delete from payments table
        await supabase.from('payments').delete().eq('registration_id', reg.id);

        // Delete from registrations table (members cascade)
        const { error: deleteError } = await supabase.from('registrations').delete().eq('id', reg.id);
        if (deleteError) throw deleteError;

      } else if (reg.source === 'v2') {
        // Delete document from storage if exists
        if (reg.document) {
          const marker = '/object/public/college_id/';
          const markerIndex = reg.document.indexOf(marker);
          if (markerIndex !== -1) {
            const storagePath = reg.document.slice(markerIndex + marker.length).split('?')[0];
            await supabase.storage.from('college_id').remove([storagePath]);
          }
        }

        // Delete from payments_2 table if exists
        await supabase.from('payments_2').delete().eq('registration_id', reg.id);

        // Delete from registrations_2
        const { error: deleteError } = await supabase.from('registrations_2').delete().eq('id', reg.id);
        if (deleteError) throw deleteError;

      } else if (reg.source === 'v3') {
        // Delete member files from storage (institute_id_url in form_data)
        if (reg.members && reg.members.length > 0) {
          const pathsToDelete: string[] = [];
          const marker = '/object/public/college_id/';

          reg.members.forEach(member => {
            if (member.institute_id) {
              const markerIndex = member.institute_id.indexOf(marker);
              if (markerIndex !== -1) {
                const storagePath = member.institute_id
                  .slice(markerIndex + marker.length)
                  .split('?')[0];
                pathsToDelete.push(storagePath);
              }
            }
          });

          if (pathsToDelete.length > 0) {
            await supabase.storage.from('college_id').remove(pathsToDelete);
          }
        }

        // Delete from payments_v3
        await supabase.from('payments_v3').delete().eq('registration_id', reg.id);

        // Delete from registrations_v3
        const { error: deleteError } = await supabase.from('registrations_v3').delete().eq('id', reg.id);
        if (deleteError) throw deleteError;
      }

      setRegistrations(prev => prev.filter(r => r.id !== reg.id));
      setRegistrationToDelete(null);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to delete registration');
      } else {
        setError('Failed to delete registration');
      }
      console.error(err);
      window.scrollTo(0, 0);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'mangoman') {
      setIsAuthenticated(true);
      fetchEvents();
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
    }
  };

  // ─── Event change handler ─────────────────────────────────────────────────

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    fetchRegistrations(eventId);
  };

  // ─── Filtering & Sorting ──────────────────────────────────────────────────

  const filteredRegistrations = registrations.filter(reg => {
    if (filterPaid === 'paid' && !reg.paid) return false;
    if (filterPaid === 'unpaid' && reg.paid) return false;
    if (filterGroup !== 'all' && reg.group !== filterGroup) return false;
    if (filterCategory !== 'all' && reg.category !== filterCategory) return false;
    if (filterTeamType !== 'all' && reg.team_type !== filterTeamType) return false;

    if (filterCountry !== 'all' && reg.country) {
      const isIndian = reg.country.toLowerCase() === 'india';
      if (filterCountry === 'india' && !isIndian) return false;
      if (filterCountry === 'international' && isIndian) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      const instA = a.user_info?.institute || a.members?.[0]?.institute || '';
      const instB = b.user_info?.institute || b.members?.[0]?.institute || '';
      return instA.localeCompare(instB);
    }
  });

  // Check which filters are applicable based on loaded data
  const hasGroups = registrations.some(r => r.group);
  const hasCategories = registrations.some(r => r.category);
  const hasTeamTypes = registrations.some(r => r.team_type);
  const hasCountries = registrations.some(r => r.country);

  // ─── Login Screen ─────────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-[#F8F7F2] p-8 rounded-2xl border border-[#D0CEC2] w-full max-w-md shadow-lg"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Admin Access</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">Enter password to view registrations</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-white border rounded-xl outline-none transition-colors
                  ${passwordError ? 'border-[#C85D3E] focus:ring-[#C85D3E]' : 'border-[#D0CEC2] focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10'}`}
                autoFocus
              />
              {passwordError && (
                <p className="text-[#C85D3E] text-xs mt-1.5 font-medium pl-1">Incorrect password</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2C5F5F] text-white rounded-xl font-bold hover:bg-[#1A4D4D] transition-colors"
            >
              Access Data
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Main View ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Registrations</h1>
            <p className="text-[#6B6B6B] mt-1 text-sm">
              {selectedEventId === 'all' && registrations.length === 0
                ? 'Select an event to view registrations'
                : `Total: ${filteredRegistrations.length} / ${registrations.length} · Paid: ${filteredRegistrations.filter(r => r.paid).length} · Unpaid: ${filteredRegistrations.filter(r => !r.paid).length}`
              }
            </p>
          </div>

          {/* Event Selector */}
          <div className="flex items-center gap-2">
            {loadingEvents ? (
              <div className="flex items-center px-4 py-2 text-sm text-[#8B8B8B]">
                <span className="w-4 h-4 border-2 border-[#2C5F5F] border-t-transparent rounded-full animate-spin mr-2" />
                Loading events…
              </div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="px-4 py-2.5 bg-white border border-[#D0CEC2] rounded-xl text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none min-w-[200px]"
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Filters — only show when we have data */}
          {registrations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
              >
                <option value="time">Sort: Time</option>
                <option value="institute">Sort: Institute</option>
              </select>

              <select
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
              >
                <option value="all">Status: All</option>
                <option value="paid">Status: Paid</option>
                <option value="unpaid">Status: Unpaid</option>
              </select>

              {hasGroups && (
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
                >
                  <option value="all">Group: All</option>
                  <option value="A">Group: A</option>
                  <option value="B">Group: B</option>
                </select>
              )}

              {hasCategories && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
                >
                  <option value="all">Category: All</option>
                  <option value="1">Category: 1</option>
                  <option value="2">Category: 2</option>
                </select>
              )}

              {hasTeamTypes && (
                <select
                  value={filterTeamType}
                  onChange={(e) => setFilterTeamType(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
                >
                  <option value="all">Type: All</option>
                  <option value="solo">Type: Solo</option>
                  <option value="group">Type: Group</option>
                </select>
              )}

              {hasCountries && (
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
                >
                  <option value="all">Region: All</option>
                  <option value="india">Indian</option>
                  <option value="international">International</option>
                </select>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl text-[#C85D3E]">
            {error}
          </div>
        )}

        {/* Data List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : registrations.length === 0 && selectedEventId !== 'all' ? (
          <div className="text-center py-16 bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2]">
            <p className="text-[#6B6B6B]">No registrations found for this event.</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2]">
            <div className="w-14 h-14 rounded-full bg-[#E5E3D7] flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#8B8B8B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-[#6B6B6B] font-medium">Select an event above to view registrations</p>
            <p className="text-[#8B8B8B] text-sm mt-1">or click &quot;All Events&quot; to see everything</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => (
              <div key={`${reg.source}-${reg.id}`} className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] overflow-hidden">
                {/* Registration Header */}
                <div className="p-5 border-b border-[#E5E3D7] flex flex-wrap gap-4 items-start justify-between bg-white/50">
                  <div>
                    <div className="font-mono font-bold text-lg text-[#1A1A1A]">
                      {reg.team_id || <span className="text-[#8B8B8B] italic">No Team ID</span>}
                    </div>
                    <div className="text-sm text-[#6B6B6B] mt-1 space-x-2 flex flex-wrap gap-1">
                      {/* Event name badge */}
                      {selectedEventId === 'all' && (
                        <span className="inline-block bg-[#2C5F5F]/10 text-[#2C5F5F] px-2 py-0.5 rounded text-xs font-semibold">
                          {reg.event_title}
                        </span>
                      )}
                      {reg.group && (
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">Group {reg.group}</span>
                      )}
                      {reg.category && (
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">Cat {reg.category}</span>
                      )}
                      {reg.team_type && (
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold capitalize">{reg.team_type}</span>
                      )}
                      {reg.country && (
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">{reg.country}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!reg.paid && (
                        <button
                          onClick={() => setRegistrationToDelete(reg)}
                          className="px-3 py-1 bg-white border border-[#C85D3E] text-[#C85D3E] rounded-full text-xs font-bold hover:bg-[#C85D3E] hover:text-white transition-colors"
                          title="Delete unpaid registration"
                        >
                          DELETE
                        </button>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        reg.paid
                          ? 'bg-[#2D5F4F]/10 text-[#2D5F4F] border border-[#2D5F4F]/20'
                          : 'bg-[#C85D3E]/10 text-[#C85D3E] border border-[#C85D3E]/20'
                      }`}>
                        {reg.paid ? 'PAID' : 'UNPAID'}
                      </span>
                    </div>
                    <span className="text-xs text-[#8B8B8B]">
                      {new Date(reg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Submitter Info */}
                {reg.user_info && (
                  <div className="bg-[#E5E3D7]/30 px-5 py-3 border-b border-[#E5E3D7] text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[#6B6B6B]">
                      <div className="flex items-center gap-1.5 font-medium text-[#1A1A1A]">
                        <svg className="w-4 h-4 text-[#2C5F5F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate" title={reg.user_info.name}>By: {reg.user_info.name}</span>
                      </div>
                      <div className="hidden sm:block text-[#D0CEC2]">•</div>
                      <div>Role: <span className="capitalize">{reg.user_info.role}</span></div>

                      {reg.user_info.institute && (
                        <>
                          <div className="hidden sm:block text-[#D0CEC2]">•</div>
                          <div className="truncate" title={reg.user_info.institute}>Institute: {reg.user_info.institute}</div>
                        </>
                      )}

                      {(reg.user_info.academic_year || reg.user_info.academic_level) && (
                        <>
                          <div className="hidden sm:block text-[#D0CEC2]">•</div>
                          <div>
                            {reg.user_info.academic_level && <span className="capitalize mr-1">{reg.user_info.academic_level}</span>}
                            {reg.user_info.academic_year && `Year ${reg.user_info.academic_year}`}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F] mb-3">
                    {reg.source === 'v2' ? 'Participant' : `Members (${reg.members?.length || 0})`}
                  </h3>

                  {reg.members && reg.members.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {reg.members.map((member, i) => (
                        <div key={member.id} className="bg-white p-3 rounded-xl border border-[#E5E3D7] text-sm">
                          <div className="font-semibold text-[#1A1A1A] mb-1 flex justify-between">
                            <span>{member.name}</span>
                            {reg.source !== 'v2' && (
                              <span className="text-[#8B8B8B] text-xs font-normal">#{i+1}</span>
                            )}
                          </div>
                          <div className="text-[#6B6B6B] truncate" title={member.email}>{member.email}</div>
                          {member.phone && <div className="text-[#6B6B6B]">{member.phone}</div>}
                          <div className="text-[#8B8B8B] mt-1.5 pt-1.5 border-t border-[#F0EFE6] text-xs flex items-center justify-between">
                            <span className="truncate pr-2" title={member.institute}>
                              {member.institute}
                              {member.academic_year && ` · ${reg.source === 'v2' ? 'Completion' : 'Yr'} ${member.academic_year}`}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {member.institute_id && (
                                <a
                                  href={member.institute_id}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-[#2C5F5F]/10 text-[#2C5F5F] hover:bg-[#2C5F5F] hover:text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                                  title="View College ID"
                                >
                                  View ID
                                </a>
                              )}
                              {reg.source === 'v2' && reg.document && (
                                <a
                                  href={reg.document}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-[#5F4B2C]/10 text-[#5F4B2C] hover:bg-[#5F4B2C] hover:text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                                  title="View Document"
                                >
                                  Doc
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-[#8B8B8B] italic">No members added yet</div>
                  )}
                </div>
              </div>
            ))}

            {filteredRegistrations.length === 0 && registrations.length > 0 && (
              <div className="text-center py-10 bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2]">
                <p className="text-[#6B6B6B]">No registrations found for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {registrationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/60 backdrop-blur-sm">
          <div className="bg-[#F8F7F2] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#D0CEC2]">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#C85D3E]/10 flex items-center justify-center text-[#C85D3E]">⚠</span>
              Confirm Deletion
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-5 leading-relaxed">
              Are you sure you want to permanently delete this registration? All associated data will be removed.
            </p>

            <div className="bg-white border border-[#E5E3D7] rounded-xl p-4 mb-6">
              <div className="text-sm font-semibold text-[#1A1A1A] mb-1 flex items-center gap-2">
                Team ID: <span className="font-mono text-[#C85D3E]">{registrationToDelete.team_id || 'N/A'}</span>
              </div>
              <div className="text-sm text-[#6B6B6B] flex items-center gap-2">
                Registered By: <span className="font-medium text-[#1A1A1A]">{registrationToDelete.user_info?.name || 'Unknown User'}</span>
              </div>
              <div className="text-xs text-[#8B8B8B] mt-1">
                Event: {registrationToDelete.event_title}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRegistrationToDelete(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#6B6B6B] bg-white border border-[#D0CEC2] hover:bg-[#F0EFE6] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#C85D3E] hover:bg-[#A94C31] shadow-lg shadow-[#C85D3E]/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete Registration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
