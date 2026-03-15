'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  institute: string;
  academic_year: number;
};

type Registration = {
  id: string;
  created_at: string;
  group: string;
  category: string;
  team_type: string;
  country: string;
  paid: boolean;
  team_id: string;
  members: Member[];
};

export default function AdminRegistrationList() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const supabase = createClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'mangoman') {
      setIsAuthenticated(true);
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
        .select(`
          id,
          created_at,
          "group",
          category,
          team_type,
          country,
          paid,
          team_id,
          members (
            id,
            name,
            email,
            phone,
            institute,
            academic_year
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRegistrations(data as unknown as Registration[]);
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

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'paid') return reg.paid;
    if (filter === 'unpaid') return !reg.paid;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Registrations</h1>
            <p className="text-[#6B6B6B] mt-1 text-sm">
              Total: {registrations.length} | Paid: {registrations.filter(r => r.paid).length} | Unpaid: {registrations.filter(r => !r.paid).length}
            </p>
          </div>
          
          <div className="flex bg-[#F8F7F2] p-1 rounded-xl border border-[#D0CEC2] self-start">
            {(['all', 'paid', 'unpaid'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  filter === f 
                    ? 'bg-[#2C5F5F] text-white shadow-sm' 
                    : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
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
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => (
              <div key={reg.id} className="bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2] overflow-hidden">
                {/* Registration Header */}
                <div className="p-5 border-b border-[#E5E3D7] flex flex-wrap gap-4 items-start justify-between bg-white/50">
                  <div>
                    <div className="font-mono font-bold text-lg text-[#1A1A1A]">
                      {reg.team_id || <span className="text-[#8B8B8B] italic">No Team ID</span>}
                    </div>
                    <div className="text-sm text-[#6B6B6B] mt-1 space-x-2">
                       <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">Group {reg.group}</span>
                       <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">Cat {reg.category}</span>
                       <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold capitalize">{reg.team_type}</span>
                       <span className="inline-block bg-[#E5E3D7] px-2 py-0.5 rounded text-xs font-semibold">{reg.country}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      reg.paid 
                        ? 'bg-[#2D5F4F]/10 text-[#2D5F4F] border border-[#2D5F4F]/20' 
                        : 'bg-[#C85D3E]/10 text-[#C85D3E] border border-[#C85D3E]/20'
                    }`}>
                      {reg.paid ? 'PAID' : 'UNPAID'}
                    </span>
                    <span className="text-xs text-[#8B8B8B]">
                      {new Date(reg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Members List */}
                <div className="p-5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F] mb-3">
                    Members ({reg.members?.length || 0})
                  </h3>
                  
                  {reg.members && reg.members.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {reg.members.map((member, i) => (
                        <div key={member.id} className="bg-white p-3 rounded-xl border border-[#E5E3D7] text-sm">
                          <div className="font-semibold text-[#1A1A1A] mb-1 flex justify-between">
                            <span>{member.name}</span>
                            <span className="text-[#8B8B8B] text-xs font-normal">#{i+1}</span>
                          </div>
                          <div className="text-[#6B6B6B] truncate" title={member.email}>{member.email}</div>
                          {member.phone && <div className="text-[#6B6B6B]">{member.phone}</div>}
                          <div className="text-[#8B8B8B] mt-1.5 pt-1.5 border-t border-[#F0EFE6] text-xs">
                            {member.institute} · Yr {member.academic_year}
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
            
            {filteredRegistrations.length === 0 && (
              <div className="text-center py-10 bg-[#F8F7F2] rounded-2xl border border-[#D0CEC2]">
                <p className="text-[#6B6B6B]">No registrations found for the selected filter.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
