'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Registration = {
  id: string;
  team_id: string;
  group: string;
  category: string;
  team_type: string;
  country: string;
  paid: boolean;
  has_submitted: boolean | null;
  created_at: string;
};

export default function SubmissionApprovalPage() {
  // ── Auth ──────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // ── Data ──────────────────────────────────────────────────────────────
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────
  const [filterSubmitted, setFilterSubmitted] = useState<'all' | 'submitted' | 'not_submitted'>('all');
  const [filterGroup, setFilterGroup] = useState<'all' | 'A' | 'B'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'mangoman') {
      setIsAuthenticated(true);
      setPasswordError(false);
      fetchRegistrations();
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 3000);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('registrations')
        .select('id, team_id, "group", category, team_type, country, paid, has_submitted, created_at')
        .eq('paid', true)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setRegistrations((data as Registration[]) ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmitted = async (reg: Registration) => {
    setUpdatingId(reg.id);
    const newValue = !reg.has_submitted;
    try {
      const { error: updateError } = await supabase
        .from('registrations')
        .update({ has_submitted: newValue })
        .eq('id', reg.id);

      if (updateError) throw updateError;

      setRegistrations((prev) =>
        prev.map((r) => (r.id === reg.id ? { ...r, has_submitted: newValue } : r))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update registration');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Filtered list ─────────────────────────────────────────────────────
  const filtered = registrations.filter((r) => {
    if (filterSubmitted === 'submitted' && !r.has_submitted) return false;
    if (filterSubmitted === 'not_submitted' && r.has_submitted) return false;
    if (filterGroup !== 'all' && r.group !== filterGroup) return false;
    if (searchQuery && !r.team_id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const submittedCount = registrations.filter((r) => r.has_submitted).length;
  const notSubmittedCount = registrations.filter((r) => !r.has_submitted).length;

  // ── Password gate ─────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#EDEBDF] flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-[#F8F7F2] p-8 rounded-2xl border border-[#D0CEC2] w-full max-w-md shadow-lg"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Admin Access</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">Enter password to manage submissions</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                className={`w-full px-4 py-3 bg-white border rounded-xl outline-none transition-colors
                  ${passwordError
                    ? 'border-[#C85D3E] ring-2 ring-[#C85D3E]/20'
                    : 'border-[#D0CEC2] focus:border-[#2C5F5F] focus:ring-2 focus:ring-[#2C5F5F]/10'
                  }`}
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

  // ── Main UI ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Submission Approval</h1>
            <p className="text-[#6B6B6B] mt-1 text-sm">
              Total: {filtered.length} / {registrations.length} &nbsp;|&nbsp;
              Submitted: {submittedCount} &nbsp;|&nbsp;
              Not submitted: {notSubmittedCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team ID…"
              className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm"
            />

            {/* Filter: submitted */}
            <select
              value={filterSubmitted}
              onChange={(e) => setFilterSubmitted(e.target.value as typeof filterSubmitted)}
              className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
            >
              <option value="all">Status: All</option>
              <option value="submitted">Submitted</option>
              <option value="not_submitted">Not Submitted</option>
            </select>

            {/* Filter: group */}
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value as typeof filterGroup)}
              className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F] shadow-sm appearance-none"
            >
              <option value="all">Group: All</option>
              <option value="A">Group: A</option>
              <option value="B">Group: B</option>
            </select>

            {/* Refresh */}
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#F0EFE6] shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-[#C85D3E]/10 border border-[#C85D3E]/30 rounded-xl text-[#C85D3E] flex justify-between items-center text-sm">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-10 bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2]">
                <p className="text-[#6B6B6B]">No registrations found for the selected filter.</p>
              </div>
            )}

            {filtered.map((reg) => {
              const isUpdating = updatingId === reg.id;
              return (
                <div
                  key={reg.id}
                  className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] overflow-hidden"
                >
                  <div className="p-5 flex flex-wrap gap-4 items-center justify-between bg-white/50">
                    {/* Left: info */}
                    <div>
                      <div className="font-mono font-bold text-lg text-[#1A1A1A]">
                        {reg.team_id || <span className="text-[#8B8B8B] italic">No Team ID</span>}
                      </div>
                      <div className="text-sm text-[#6B6B6B] mt-1 space-x-2">
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">
                          Group {reg.group}
                        </span>
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">
                          Cat {reg.category}
                        </span>
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold capitalize">
                          {reg.team_type}
                        </span>
                        <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">
                          {reg.country}
                        </span>
                      </div>
                    </div>

                    {/* Right: status + action */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Paid badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          reg.paid
                            ? 'bg-[#2D5F4F]/10 text-[#2D5F4F] border border-[#2D5F4F]/20'
                            : 'bg-[#C85D3E]/10 text-[#C85D3E] border border-[#C85D3E]/20'
                        }`}
                      >
                        {reg.paid ? 'PAID' : 'UNPAID'}
                      </span>

                      {/* Submitted badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                          reg.has_submitted
                            ? 'bg-[#2C5F5F] text-white shadow-sm'
                            : 'bg-[#8B7355]/10 text-[#8B7355] border border-[#8B7355]/20'
                        }`}
                      >
                        {reg.has_submitted ? '✓ SUBMITTED' : 'NOT SUBMITTED'}
                      </span>

                      {/* Toggle button */}
                      <button
                        onClick={() => toggleSubmitted(reg)}
                        disabled={isUpdating}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50 ${
                          reg.has_submitted
                            ? 'bg-white border border-[#C85D3E] text-[#C85D3E] hover:bg-[#C85D3E] hover:text-white'
                            : 'bg-[#2C5F5F] text-white hover:bg-[#1A4D4D]'
                        }`}
                      >
                        {isUpdating
                          ? '…'
                          : reg.has_submitted
                          ? 'Mark Unsubmitted'
                          : 'Mark Submitted'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
