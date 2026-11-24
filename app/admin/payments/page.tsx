'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type EventRow = { id: string; title: string };

type Currency = 'INR' | 'USD';
type Outcome = 'paid' | 'failed' | 'other';

type Preset = 'today' | '7d' | '30d' | '90d' | 'lifetime' | 'custom';
const PRESETS: { key: Preset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: 'lifetime', label: 'Lifetime' },
  { key: 'custom', label: 'Custom' },
];

// local-date YYYY-MM-DD
const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// One normalised payment, whichever table it came from. Amounts are in major units (₹ / $).
type Payment = {
  id: string;
  source: 'v1' | 'v2' | 'v3';
  eventId: string | null;
  currency: Currency;
  outcome: Outcome;
  gross: number;
  gatewayFee: number; // Razorpay fee, INR only (see note on the page)
  tax: number; // GST on the fee, INR only
  method: string;
  createdAt: string;
};

type Referral = { earned: number; redeemed: number; pendingRedeems: number; pendingAmount: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};

const money = (n: number, currency: Currency = 'INR') =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(n);

const outcomeOf = (status: string): Outcome => {
  const s = (status || '').toLowerCase();
  if (s === 'paid' || s === 'captured') return 'paid';
  // a payment that was started but never completed counts as failed
  if (s === 'created' || s === 'authorized' || s === 'failed') return 'failed';
  return 'other'; // unpaid / refunded / anything else
};

// v1/v2 `method` is free text, mostly manual notes like "+215 bulk reg".
const methodLabel = (m: string | null | undefined) => {
  const s = (m ?? '').trim().toLowerCase();
  if (!s) return 'Online (unspecified)';
  if (/bulk|bilk/.test(s)) return 'Bulk / manual';
  // Recorded by an admin from the registration list (see /api/v3/admin/manual-payment).
  if (s.startsWith('manual_')) return `Manual · ${s.slice(7).replace(/_/g, ' ').toUpperCase()}`;
  return s.toUpperCase();
};

const pointsFmt = (n: number) => Math.floor(n).toLocaleString('en-IN');

const monthKey = (iso: string) => iso.slice(0, 7);

const sum = (rows: Payment[], f: (p: Payment) => number) => rows.reduce((a, p) => a + f(p), 0);

// ─── Small UI pieces ──────────────────────────────────────────────────────────

const card = 'bg-[#F8F7F2] border border-[#D0CEC2] rounded-2xl p-5';

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-[#E5E3D7] rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-[#8B8B8B]">{label}</p>
      <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value}</p>
      {sub && <p className="text-xs text-[#6B6B6B] mt-0.5">{sub}</p>}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
  currency,
}: {
  title: string;
  rows: { label: string; count: number; gross: number }[];
  currency: Currency;
}) {
  const total = rows.reduce((a, r) => a + r.gross, 0);
  return (
    <div className={card}>
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F] mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[#8B8B8B] italic">No paid payments.</p>
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {rows.map(r => (
              <tr key={r.label} className="border-t border-[#E5E3D7] first:border-t-0">
                <td className="py-2 pr-2 text-[#1A1A1A]">
                  {r.label}
                  <div className="h-1 mt-1 rounded bg-[#E5E3D7]">
                    <div className="h-1 rounded bg-[#2C5F5F]" style={{ width: `${total ? (r.gross / total) * 100 : 0}%` }} />
                  </div>
                </td>
                <td className="py-2 px-2 text-right text-[#6B6B6B] whitespace-nowrap">{r.count}×</td>
                <td className="py-2 pl-2 text-right font-semibold text-[#1A1A1A] whitespace-nowrap">{money(r.gross, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const group = (rows: Payment[], key: (p: Payment) => string) => {
  const m = new Map<string, { label: string; count: number; gross: number }>();
  for (const p of rows) {
    const k = key(p);
    const cur = m.get(k) ?? { label: k, count: 0, gross: 0 };
    cur.count += 1;
    cur.gross += p.gross;
    m.set(k, cur);
  }
  return Array.from(m.values());
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPaymentsPage() {
  const supabase = createClient();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [referral, setReferral] = useState<Referral | null>(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [preset, setPreset] = useState<Preset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ev, p1, p2, p3, ref, redeems] = await Promise.all([
          supabase.from('events').select('id, title').order('title'),
          supabase.from('payments').select('payment_id, amount, currency, razorpay_fee, tax, method, status, created_at, registrations(event_id)'),
          supabase.from('payments_2').select('payment_id, amount, currency, razorpay_fee, tax, method, status, created_at, registrations_2(event_id)'),
          supabase.from('payments_v3').select('payment_id, amount, currency, razorpay_fee, tax, method, status, created_at, registrations_v3(event_id)'),
          supabase.from('referral_account').select('earned_amount, redeemed_amount'),
          supabase.from('redeem_history').select('amount, is_approved, action_time').eq('legacy', false),
        ]);
        const firstError = [ev, p1, p2, p3, ref, redeems].find(r => r.error)?.error;
        if (firstError) throw firstError;

        setEvents((ev.data as EventRow[]) ?? []);

        const eventOf = (row: any, rel: string): string | null => {
          const r = row[rel];
          return (Array.isArray(r) ? r[0]?.event_id : r?.event_id) ?? null;
        };
        const cur = (c: string): Currency => (c === 'USD' ? 'USD' : 'INR');

        const all: Payment[] = [];
        // v1 / v2: text columns, rupees (major units)
        for (const [rows, source, rel] of [
          [p1.data, 'v1', 'registrations'],
          [p2.data, 'v2', 'registrations_2'],
        ] as const) {
          for (const r of (rows as any[]) ?? []) {
            const currency = cur(r.currency);
            all.push({
              id: `${source}-${r.payment_id}`,
              source,
              eventId: eventOf(r, rel),
              currency,
              outcome: outcomeOf(r.status),
              gross: num(r.amount),
              gatewayFee: currency === 'INR' ? num(r.razorpay_fee) : 0,
              tax: currency === 'INR' ? num(r.tax) : 0,
              method: methodLabel(r.method),
              createdAt: r.created_at,
            });
          }
        }
        // v3: integers in minor units (paise / cents)
        for (const r of (p3.data as any[]) ?? []) {
          const currency = cur(r.currency);
          all.push({
            id: `v3-${r.payment_id}`,
            source: 'v3',
            eventId: eventOf(r, 'registrations_v3'),
            currency,
            outcome: outcomeOf(r.status),
            gross: num(r.amount) / 100,
            // for USD payments Razorpay's fee is settled in INR, so it can't be netted against dollars
            gatewayFee: currency === 'INR' ? num(r.razorpay_fee) / 100 : 0,
            tax: currency === 'INR' ? num(r.tax) / 100 : 0,
            method: methodLabel(r.method),
            createdAt: r.created_at,
          });
        }
        setPayments(all);

        const pending = ((redeems.data as any[]) ?? []).filter(r => r.is_approved !== true && !r.action_time);
        setReferral({
          earned: sum2(ref.data as any[], 'earned_amount'),
          redeemed: sum2(ref.data as any[], 'redeemed_amount'),
          pendingRedeems: pending.length,
          pendingAmount: sum2(pending, 'amount'),
        });
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const eventTitle = useMemo(() => new Map(events.map(e => [e.id, e.title])), [events]);

  // inclusive [from, to] range as local dates; null = unbounded
  const range = useMemo(() => {
    const today = new Date();
    const daysAgo = (n: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - n);
      return ymd(d);
    };
    switch (preset) {
      case 'today': return { from: ymd(today), to: ymd(today) };
      case '7d': return { from: daysAgo(6), to: ymd(today) };
      case '30d': return { from: daysAgo(29), to: ymd(today) };
      case '90d': return { from: daysAgo(89), to: ymd(today) };
      case 'custom': return { from: customFrom || null, to: customTo || null };
      default: return { from: null, to: null };
    }
  }, [preset, customFrom, customTo]);

  const scoped = useMemo(
    () =>
      payments.filter(p => {
        if (eventFilter !== 'all' && p.eventId !== eventFilter) return false;
        const day = ymd(new Date(p.createdAt));
        if (range.from && day < range.from) return false;
        if (range.to && day > range.to) return false;
        return true;
      }),
    [payments, eventFilter, range],
  );

  const recent = useMemo(
    () => scoped.filter(p => p.outcome === 'paid').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 15),
    [scoped],
  );

  const currenciesPresent = (['INR', 'USD'] as Currency[]).filter(c => scoped.some(p => p.currency === c));

  return (
    <div className="min-h-screen bg-[#EDEBDF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Payments</h1>
            <p className="text-sm text-[#6B6B6B] mt-1">Money collected across all registration versions.</p>
          </div>
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#D0CEC2] rounded-xl text-sm font-semibold text-[#1A1A1A] outline-none focus:border-[#2C5F5F] min-w-[200px]"
          >
            <option value="all">All events</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map(pr => (
            <button
              key={pr.key}
              onClick={() => setPreset(pr.key)}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                preset === pr.key
                  ? 'bg-[#2C5F5F] text-white border-[#2C5F5F]'
                  : 'bg-[#F8F7F2] text-[#1A1A1A] border-[#D0CEC2] hover:bg-white'
              }`}
            >
              {pr.label}
            </button>
          ))}
          {preset === 'custom' && (
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <input type="date" value={customFrom} max={customTo || undefined} onChange={e => setCustomFrom(e.target.value)} className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-xl outline-none focus:border-[#2C5F5F]" />
              to
              <input type="date" value={customTo} min={customFrom || undefined} onChange={e => setCustomTo(e.target.value)} className="px-3 py-2 bg-white border border-[#D0CEC2] rounded-xl outline-none focus:border-[#2C5F5F]" />
            </div>
          )}
        </div>

        {error && <div className="px-4 py-2.5 rounded-xl bg-[#C85D3E]/10 text-[#C85D3E] text-sm font-medium">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#2C5F5F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currenciesPresent.length === 0 ? (
          <div className={`${card} text-center text-[#6B6B6B]`}>No payments for this selection. Try a wider date range.</div>
        ) : (
          <>
            {currenciesPresent.map(c => {
              const rows = scoped.filter(p => p.currency === c);
              const paid = rows.filter(p => p.outcome === 'paid');
              const failed = rows.filter(p => p.outcome === 'failed');
              const gross = sum(paid, p => p.gross);
              const fees = sum(paid, p => p.gatewayFee);
              const tax = sum(paid, p => p.tax);
              return (
                <section key={c} className="space-y-4">
                  <h2 className="text-xl font-bold text-[#1A1A1A]">{c === 'INR' ? 'Indian payments (INR)' : 'International payments (USD)'}</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label="Collected" value={money(gross, c)} sub={`${paid.length} paid payments`} />
                    <Stat
                      label="Average payment"
                      value={money(paid.length ? gross / paid.length : 0, c)}
                    />
                    {c === 'INR' ? (
                      <>
                        <Stat label="Gateway fees + tax" value={money(fees + tax, c)} sub={`${money(fees, c)} fee · ${money(tax, c)} tax`} />
                        <Stat label="Net after fees" value={money(gross - fees - tax, c)} />
                      </>
                    ) : (
                      <>
                        <Stat label="Gateway fees" value="—" sub="Settled in INR, not netted here" />
                        <Stat label="Net after fees" value="—" />
                      </>
                    )}
                    <Stat label="Failed / not completed" value={String(failed.length)} sub={`${money(sum(failed, p => p.gross), c)} not collected`} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <BreakdownTable
                      title="By event"
                      currency={c}
                      rows={group(paid, p => (p.eventId && eventTitle.get(p.eventId)) || 'Unknown event').sort((a, b) => b.gross - a.gross)}
                    />
                    <BreakdownTable
                      title="By method"
                      currency={c}
                      rows={group(paid, p => p.method).sort((a, b) => b.gross - a.gross)}
                    />
                    <BreakdownTable
                      title="By month"
                      currency={c}
                      rows={group(paid, p => monthKey(p.createdAt)).sort((a, b) => b.label.localeCompare(a.label))}
                    />
                    <BreakdownTable
                      title="By registration form"
                      currency={c}
                      rows={group(paid, p => ({ v1: 'Team registrations (v1)', v2: 'Solo registrations (v2)', v3: 'Current form (v3)' })[p.source]).sort(
                        (a, b) => b.gross - a.gross,
                      )}
                    />
                  </div>
                </section>
              );
            })}

            {/* Recent */}
            <div className={card}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#2C5F5F] mb-3">Latest paid payments</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-[#8B8B8B]">
                      <th className="py-1 pr-3 font-medium">Date</th>
                      <th className="py-1 pr-3 font-medium">Event</th>
                      <th className="py-1 pr-3 font-medium">Method</th>
                      <th className="py-1 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(p => (
                      <tr key={p.id} className="border-t border-[#E5E3D7]">
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 pr-3">{(p.eventId && eventTitle.get(p.eventId)) || 'Unknown event'}</td>
                        <td className="py-2 pr-3">{p.method}</td>
                        <td className="py-2 text-right font-semibold whitespace-nowrap">{money(p.gross, p.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Referral liability — not event-specific */}
        {referral && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Referral payouts</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Earned by referrers" value={pointsFmt(referral.earned)} sub="MR POINTS" />
              <Stat label="Redeemed" value={pointsFmt(referral.redeemed)} sub="MR POINTS" />
              <Stat label="Outstanding balance" value={pointsFmt(referral.earned - referral.redeemed)} sub="MR POINTS" />
              <Stat label="Pending redeem requests" value={String(referral.pendingRedeems)} sub={`${pointsFmt(referral.pendingAmount)} MR POINTS`} />
            </div>
            <p className="text-xs text-[#8B8B8B]">Referral figures cover all events and aren&apos;t affected by the event filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function sum2(rows: any[] | null | undefined, key: string) {
  return (rows ?? []).reduce((a, r) => a + num(r[key]), 0);
}
