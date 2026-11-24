'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventRow = { id: string; title: string };

type Settings = {
  enabled: boolean;
  d1_type: 'percent' | 'fixed';
  d1_percent: number;
  d1_inr: number;
  d1_usd: number;
  d2_type: 'percent' | 'fixed';
  d2_percent: number;
  d2_inr: number;
  d2_usd: number;
};

// Same defaults as lib/referral.ts (used when an event has no row).
const DEFAULTS: Settings = {
  enabled: true,
  d1_type: 'percent', d1_percent: 10, d1_inr: 0, d1_usd: 0,
  d2_type: 'percent', d2_percent: 5, d2_inr: 0, d2_usd: 0,
};

type RedeemRow = {
  id: number;
  created_at: string;
  action_time: string | null;
  is_approved: boolean | null;
  amount: number;
  upi_id: string;
  user: string;
};

type AccountRow = {
  id: string;
  referral_code: string;
  earned_amount: number;
  redeemed_amount: number;
  is_blocked: boolean;
  created_at: string;
};

type Tab = 'settings' | 'redeems' | 'accounts';

// ─── Shared UI ────────────────────────────────────────────────────────────────

const card = 'bg-[#F8F7F2] border border-[#D0CEC2] rounded-2xl p-5';
const inputCls = 'w-full px-3 py-2 bg-white border border-[#D0CEC2] rounded-lg text-sm outline-none focus:border-[#2C5F5F] disabled:opacity-50';
const pts = (n: number) => Math.floor(Number(n) || 0).toLocaleString('en-IN');
const fmt = (iso: string) => new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

function NumField({ label, value, onChange, disabled, suffix }: {
  label: string; value: number; onChange: (n: number) => void; disabled?: boolean; suffix?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#6B6B6B] mb-1">{label}{suffix && ` (${suffix})`}</span>
      <input type="number" min={0} step="any" value={value} disabled={disabled}
        onChange={e => onChange(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
    </label>
  );
}

function RewardEditor({ title, help, prefix, s, set }: {
  title: string;
  help: string;
  prefix: 'd1' | 'd2';
  s: Settings;
  set: (patch: Partial<Settings>) => void;
}) {
  const type = s[`${prefix}_type`];
  return (
    <div className="bg-white border border-[#E5E3D7] rounded-xl p-4 space-y-3">
      <div>
        <p className="font-semibold text-[#1A1A1A]">{title}</p>
        <p className="text-xs text-[#6B6B6B]">{help}</p>
      </div>
      <div className="flex gap-2">
        {(['percent', 'fixed'] as const).map(t => (
          <button key={t} type="button" onClick={() => set({ [`${prefix}_type`]: t } as Partial<Settings>)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
              type === t ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]' : 'bg-[#F8F7F2] text-[#1A1A1A] border-[#D0CEC2]'
            }`}>
            {t === 'percent' ? 'Percentage' : 'Fixed amount'}
          </button>
        ))}
      </div>
      {type === 'percent' ? (
        <NumField label="Percent of original amount" suffix="%" value={s[`${prefix}_percent`]}
          onChange={n => set({ [`${prefix}_percent`]: Math.min(100, n) } as Partial<Settings>)} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <NumField label="For INR payments" suffix="₹" value={s[`${prefix}_inr`]}
            onChange={n => set({ [`${prefix}_inr`]: n } as Partial<Settings>)} />
          <NumField label="For USD payments" suffix="$" value={s[`${prefix}_usd`]}
            onChange={n => set({ [`${prefix}_usd`]: n } as Partial<Settings>)} />
        </div>
      )}
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ events }: { events: EventRow[] }) {
  const supabase = createClient();
  const [eventId, setEventId] = useState('');
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [hasRow, setHasRow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setMsg(null);
    supabase.from('referral_settings').select('*').eq('event_id', eventId).maybeSingle().then(({ data, error }) => {
      if (error) setMsg({ ok: false, text: error.message });
      setHasRow(!!data);
      setS(data
        ? {
            enabled: data.enabled,
            d1_type: data.d1_type, d1_percent: Number(data.d1_percent), d1_inr: Number(data.d1_inr), d1_usd: Number(data.d1_usd),
            d2_type: data.d2_type, d2_percent: Number(data.d2_percent), d2_inr: Number(data.d2_inr), d2_usd: Number(data.d2_usd),
          }
        : DEFAULTS);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const set = (patch: Partial<Settings>) => setS(prev => ({ ...prev, ...patch }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('referral_settings')
      .upsert({ event_id: eventId, ...s, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setHasRow(true);
    setMsg({ ok: true, text: 'Saved. New quotes use these values right away.' });
  };

  return (
    <div className="space-y-4">
      <select value={eventId} onChange={e => setEventId(e.target.value)}
        className="px-4 py-2.5 bg-white border border-[#D0CEC2] rounded-xl text-sm font-semibold outline-none focus:border-[#2C5F5F] min-w-[240px]">
        <option value="">Select an event…</option>
        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
      </select>

      {eventId && (loading ? (
        <p className="text-sm text-[#6B6B6B]">Loading…</p>
      ) : (
        <div className={`${card} space-y-4`}>
          {!hasRow && (
            <p className="text-xs text-[#6B6B6B]">This event has no custom settings yet. The defaults below (10% / 5%) are in effect.</p>
          )}
          <label className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
            <input type="checkbox" checked={s.enabled} onChange={e => set({ enabled: e.target.checked })} className="w-4 h-4 accent-[#2C5F5F]" />
            Accept referral codes for this event
          </label>
          <div className={`grid gap-4 md:grid-cols-2 ${s.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <RewardEditor title="D1 · Referrer earns" prefix="d1" s={s} set={set}
              help="Credited to the code owner as MR POINTS when the payment is captured. Based on the original (pre-discount) price." />
            <RewardEditor title="D2 · Payer discount" prefix="d2" s={s} set={set}
              help="Taken off the original price on the payment page. Never reduces the price below 1 ₹/$." />
          </div>
          {msg && <p className={`text-sm font-medium ${msg.ok ? 'text-[#2D5F4F]' : 'text-[#C85D3E]'}`}>{msg.text}</p>}
          <button onClick={save} disabled={saving}
            className="px-5 py-2.5 bg-[#2C5F5F] text-white rounded-xl text-sm font-bold hover:bg-[#1A4D4D] disabled:opacity-50">
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Redeems tab ──────────────────────────────────────────────────────────────

function RedeemsTab({ names, codes }: { names: Map<string, string>; codes: Map<string, string> }) {
  const supabase = createClient();
  const [rows, setRows] = useState<RedeemRow[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('redeem_history')
      .select('id, created_at, action_time, is_approved, amount, upi_id, user')
      .eq('legacy', false)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRows((data as RedeemRow[]) ?? []);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (r: RedeemRow, approve: boolean) => {
    const verb = approve ? 'Approve' : 'Reject';
    if (!window.confirm(`${verb} redemption of ${pts(r.amount)} points to ${r.upi_id}?${approve ? ' Only approve once the UPI payout has been sent.' : ''}`)) return;
    setBusyId(r.id);
    setError(null);
    const { error } = await supabase
      .from('redeem_history')
      .update({ is_approved: approve, action_time: new Date().toISOString() })
      .eq('id', r.id)
      .is('action_time', null); // only act on still-pending requests
    setBusyId(null);
    if (error) return setError(error.message);
    load();
  };

  const isPending = (r: RedeemRow) => !r.action_time && !r.is_approved;
  const shown = filter === 'pending' ? rows.filter(isPending) : rows;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['pending', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold border ${
              filter === f ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]' : 'bg-[#F8F7F2] border-[#D0CEC2]'
            }`}>
            {f === 'pending' ? `Pending (${rows.filter(isPending).length})` : 'All'}
          </button>
        ))}
      </div>
      {error && <div className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>}
      {loading ? <p className="text-sm text-[#6B6B6B]">Loading…</p> : shown.length === 0 ? (
        <div className={`${card} text-center text-sm text-[#6B6B6B]`}>No {filter === 'pending' ? 'pending ' : ''}redemption requests.</div>
      ) : (
        <div className="space-y-3">
          {shown.map(r => (
            <div key={r.id} className={`${card} flex flex-wrap items-center justify-between gap-4`}>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A1A]">
                  {names.get(r.user) ?? 'Unknown user'} <span className="font-mono text-xs text-[#2C5F5F]">{codes.get(r.user)}</span>
                </p>
                <p className="text-sm text-[#6B6B6B] break-all">UPI: <span className="font-mono">{r.upi_id}</span></p>
                <p className="text-xs text-[#8B8B8B]">Requested {fmt(r.created_at)}{r.action_time && ` · Actioned ${fmt(r.action_time)}`}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-[#1A1A1A]">{pts(r.amount)} pts</p>
                {isPending(r) ? (
                  <>
                    <button onClick={() => act(r, true)} disabled={busyId === r.id}
                      className="px-3 py-1.5 bg-[#2D5F4F] text-white rounded-lg text-sm font-bold disabled:opacity-50">Approve</button>
                    <button onClick={() => act(r, false)} disabled={busyId === r.id}
                      className="px-3 py-1.5 border border-[#C85D3E]/40 text-[#C85D3E] rounded-lg text-sm font-bold disabled:opacity-50">Reject</button>
                  </>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    r.is_approved ? 'bg-[#2D5F4F]/10 text-[#2D5F4F]' : 'bg-[#C85D3E]/10 text-[#C85D3E]'
                  }`}>{r.is_approved ? 'Approved' : 'Rejected'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Accounts tab ─────────────────────────────────────────────────────────────

function AccountsTab({ accounts, names, reload }: { accounts: AccountRow[]; names: Map<string, string>; reload: () => void }) {
  const supabase = createClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  const toggle = async (a: AccountRow) => {
    if (!window.confirm(`${a.is_blocked ? 'Unblock' : 'Block'} ${a.referral_code}?${a.is_blocked ? '' : ' The code stops working immediately.'}`)) return;
    setBusy(a.id);
    const { error } = await supabase.from('referral_account').update({ is_blocked: !a.is_blocked }).eq('id', a.id);
    setBusy(null);
    if (error) return setError(error.message);
    reload();
  };

  const query = q.trim().toLowerCase();
  const shown = accounts
    .filter(a => !query || a.referral_code.toLowerCase().includes(query) || (names.get(a.id) ?? '').toLowerCase().includes(query))
    .sort((a, b) => b.earned_amount - a.earned_amount);

  return (
    <div className="space-y-4">
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search code or name…" className={`${inputCls} max-w-xs`} />
      {error && <div className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>}
      <div className={`${card} overflow-x-auto p-0`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#8B8B8B]">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium text-right">Earned</th>
              <th className="px-4 py-3 font-medium text-right">Redeemed</th>
              <th className="px-4 py-3 font-medium text-right">Balance</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {shown.map(a => (
              <tr key={a.id} className="border-t border-[#E5E3D7]">
                <td className="px-4 py-3 font-mono font-bold text-[#2C5F5F]">{a.referral_code}</td>
                <td className="px-4 py-3">{names.get(a.id) ?? '—'}</td>
                <td className="px-4 py-3 text-right">{pts(a.earned_amount)}</td>
                <td className="px-4 py-3 text-right">{pts(a.redeemed_amount)}</td>
                <td className="px-4 py-3 text-right font-semibold">{pts(a.earned_amount - a.redeemed_amount)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggle(a)} disabled={busy === a.id}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border disabled:opacity-50 ${
                      a.is_blocked ? 'border-[#2D5F4F]/40 text-[#2D5F4F]' : 'border-[#C85D3E]/40 text-[#C85D3E]'
                    }`}>
                    {a.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'settings', label: 'Rewards per event' },
  { key: 'redeems', label: 'Redemption requests' },
  { key: 'accounts', label: 'Earn accounts' },
];

export default function AdminReferralsPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>('settings');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [ev, acc] = await Promise.all([
      supabase.from('events').select('id, title').order('created_at', { ascending: false }),
      supabase.from('referral_account').select('id, referral_code, earned_amount, redeemed_amount, is_blocked, created_at'),
    ]);
    if (ev.error || acc.error) setError((ev.error || acc.error)!.message);
    setEvents((ev.data as EventRow[]) ?? []);
    const rows = ((acc.data as AccountRow[]) ?? []).map(a => ({
      ...a, earned_amount: Number(a.earned_amount) || 0, redeemed_amount: Number(a.redeemed_amount) || 0,
    }));
    setAccounts(rows);
    if (rows.length) {
      const { data } = await supabase.from('user_info').select('id, name').in('id', rows.map(r => r.id));
      setNames(new Map(((data as { id: string; name: string }[]) ?? []).map(u => [u.id, u.name])));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const codes = new Map(accounts.map(a => [a.id, a.referral_code]));

  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Referrals</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">Rewards, discounts, redemptions and earn accounts. Balances are in MR POINTS.</p>
        </div>
        {error && <div className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                tab === t.key ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]' : 'bg-[#F8F7F2] text-[#1A1A1A] border-[#D0CEC2] hover:bg-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'settings' && <SettingsTab events={events} />}
        {tab === 'redeems' && <RedeemsTab names={names} codes={codes} />}
        {tab === 'accounts' && <AccountsTab accounts={accounts} names={names} reload={load} />}
      </div>
    </div>
  );
}
