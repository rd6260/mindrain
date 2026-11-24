'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Shown to users in points only — never convert to money in the UI.
const MIN_REDEEM_POINTS = 3000;

// ─── Types ────────────────────────────────────────────────────────────────────

type Account = {
  referral_code: string;
  earned_amount: number;
  redeemed_amount: number;
  created_at: string;
  is_blocked: boolean;
};

type Earning = { id: string; created_at: string; points: number; event_title: string };

type Redeem = {
  id: number;
  created_at: string;
  action_time: string | null;
  is_approved: boolean | null;
  amount: number;
  upi_id: string;
};

type Tab = 'overview' | 'referrals' | 'wallet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pts = (n: number) => Math.floor(n).toLocaleString('en-IN');

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const redeemStatus = (r: Redeem): 'completed' | 'rejected' | 'pending' =>
  r.is_approved ? 'completed' : r.action_time ? 'rejected' : 'pending';

const STATUS_STYLE = {
  completed: { label: 'Completed', bg: 'rgba(45,95,79,0.12)', fg: '#2D5F4F' },
  rejected: { label: 'Rejected', bg: 'rgba(200,93,62,0.12)', fg: '#C85D3E' },
  pending: { label: 'Pending', bg: 'rgba(217,119,87,0.12)', fg: '#B5603F' },
} as const;

const card = 'rounded-2xl border border-[#D0CEC2] bg-[#F8F7F2]';

// ─── Pieces ───────────────────────────────────────────────────────────────────

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-[#E5E3D7] bg-[#EDEBDF] p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#8B8B8B]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#1A1A1A]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#6B6B6B]">{sub}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#2C5F5F] border-t-transparent" />
    </div>
  );
}

function CodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-xl border border-[#D0CEC2] bg-[#EDEBDF] px-5 py-3 font-mono text-lg font-bold tracking-widest text-[#2C5F5F] break-all">
        {code}
      </div>
      <button
        onClick={copy}
        className="shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-[#EDEBDF] transition-colors"
        style={{ background: copied ? '#2D5F4F' : '#2C5F5F' }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function Overview({ account, available, pending, earnings, onRedeem }: {
  account: Account;
  available: number;
  pending: number;
  earnings: Earning[];
  onRedeem: () => void;
}) {
  const progress = Math.min(100, (available / MIN_REDEEM_POINTS) * 100);
  const canRedeem = available >= MIN_REDEEM_POINTS && !account.is_blocked;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A]">Overview</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">Member since {fmtDate(account.created_at)}</p>
      </div>

      {account.is_blocked && (
        <div className="rounded-xl border border-[#C85D3E]/30 bg-[#C85D3E]/10 p-4 text-sm font-medium text-[#C85D3E]">
          This earn account is blocked. Your code no longer works and redemptions are paused. Please contact Mind Rain.
        </div>
      )}

      {/* Balance */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2C5F5F] p-6 md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#EDEBDF] opacity-10" />
        <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-[#EDEBDF]/60">Available</p>
        <p className="text-5xl font-bold text-[#EDEBDF] md:text-6xl">
          {pts(available)} <span className="text-lg font-semibold md:text-xl">MR POINTS</span>
        </p>

        <div className="mt-6">
          <div className="h-2 rounded-full bg-white/15">
            <div className="h-2 rounded-full bg-[#EDEBDF]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#EDEBDF]/70">
            {canRedeem
              ? 'You can apply for redemption.'
              : `${pts(Math.max(0, MIN_REDEEM_POINTS - available))} more points to reach the ${pts(MIN_REDEEM_POINTS)} redemption minimum.`}
          </p>
        </div>

        {canRedeem && (
          <button
            onClick={onRedeem}
            className="mt-5 rounded-xl bg-[#EDEBDF] px-5 py-3 text-sm font-bold text-[#2C5F5F] transition-transform hover:-translate-y-0.5"
          >
            Apply for Redemption →
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total earned" value={pts(account.earned_amount)} sub="MR POINTS" />
        <Stat label="Redeemed" value={pts(account.redeemed_amount)} sub="MR POINTS" />
        <Stat label="In process" value={pts(pending)} sub="Pending redemptions" />
        <Stat label="Referrals" value={String(earnings.length)} sub="Paid by your code" />
      </div>

      <div className={`${card} p-6`}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#8B8B8B]">Your referral code</p>
        <CodeBox code={account.referral_code} />
        <p className="mt-2 text-xs text-[#8B8B8B]">
          Share it with participants. They get a discount on the payment page, and you earn MR POINTS once they pay.
        </p>
      </div>
    </div>
  );
}

function Referrals({ earnings }: { earnings: Earning[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A]">Referrals</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">Every confirmed payment made with your code</p>
      </div>
      {earnings.length === 0 ? (
        <div className={`${card} p-8 text-center text-sm text-[#6B6B6B]`}>
          No referrals yet. Share your code to start earning MR POINTS.
        </div>
      ) : (
        <div className="space-y-3">
          {earnings.map(e => (
            <div key={e.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E3D7] bg-[#F8F7F2] px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1A1A1A]">{e.event_title}</p>
                <p className="text-xs text-[#8B8B8B]">{fmtDate(e.created_at)}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#2C5F5F]">+{pts(e.points)} pts</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Wallet({ account, available, redeems, onRedeem }: {
  account: Account;
  available: number;
  redeems: Redeem[];
  onRedeem: () => void;
}) {
  const canRedeem = available >= MIN_REDEEM_POINTS && !account.is_blocked;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1A1A1A]">Wallet</h2>
        <p className="mt-1 text-sm text-[#6B6B6B]">Redeem your MR POINTS via UPI</p>
      </div>

      {canRedeem ? (
        <button
          onClick={onRedeem}
          className="w-full rounded-xl bg-[#2C5F5F] py-4 text-sm font-bold tracking-wide text-[#EDEBDF] transition-colors hover:bg-[#1A4D4D]"
        >
          Apply for Redemption ({pts(available)} points available) →
        </button>
      ) : (
        <div className="rounded-xl border border-[#D0CEC2] bg-[#F8F7F2] px-5 py-4 text-sm text-[#6B6B6B]">
          You need at least <strong className="text-[#1A1A1A]">{pts(MIN_REDEEM_POINTS)} MR POINTS</strong> to redeem.
          {!account.is_blocked && (
            <> You&apos;re <strong className="text-[#2C5F5F]">{pts(Math.max(0, MIN_REDEEM_POINTS - available))}</strong> away.</>
          )}
        </div>
      )}

      <div>
        <h3 className="mb-4 text-base font-semibold text-[#1A1A1A]">Redemption history</h3>
        {redeems.length === 0 ? (
          <p className="text-sm text-[#8B8B8B]">No redemptions yet.</p>
        ) : (
          <div className="space-y-3">
            {redeems.map(r => {
              const st = STATUS_STYLE[redeemStatus(r)];
              return (
                <div key={r.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#E5E3D7] bg-[#F8F7F2] px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">Redemption to {r.upi_id}</p>
                    <p className="text-xs text-[#8B8B8B]">{fmtDate(r.created_at)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#1A1A1A]">{pts(r.amount)} pts</p>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: st.bg, color: st.fg }}>
                      {st.label}
                    </span>
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

function RedeemModal({ available, onClose, onDone }: { available: number; onClose: () => void; onDone: () => void }) {
  const supabase = createClient();
  const [points, setPoints] = useState(String(Math.floor(available)));
  const [upi, setUpi] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const n = Math.floor(Number(points));
    if (!Number.isFinite(n) || n < MIN_REDEEM_POINTS) return setError(`Minimum redemption is ${pts(MIN_REDEEM_POINTS)} MR POINTS.`);
    if (n > available) return setError(`You can redeem at most ${pts(available)} MR POINTS.`);
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) return setError('Enter a valid UPI ID (e.g. name@bank).');

    setBusy(true);
    setError(null);
    // Validated again server-side, atomically, by the request_redeem function.
    const { error: rpcError } = await supabase.rpc('request_redeem', { p_points: n, p_upi: upi.trim() });
    setBusy(false);
    if (rpcError) return setError(rpcError.message || 'Something went wrong. Please try again.');
    setDone(true);
    setTimeout(onDone, 1500);
  };

  const inputCls =
    'w-full rounded-xl border border-[#D0CEC2] bg-[#EDEBDF] px-4 py-3 text-sm font-medium text-[#1A1A1A] outline-none focus:border-[#2C5F5F]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={() => !busy && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-[#D0CEC2] bg-[#F8F7F2] p-6 md:p-8" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2D5F4F]/15 text-2xl text-[#2D5F4F]">✓</div>
            <p className="text-lg font-semibold text-[#1A1A1A]">Request submitted!</p>
            <p className="text-sm text-[#6B6B6B]">We&apos;ll process it within 7 working days.</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Apply for Redemption</h3>
            <p className="mb-5 text-sm text-[#6B6B6B]">
              Available: <strong className="text-[#2C5F5F]">{pts(available)} MR POINTS</strong>
            </p>
            <label className="mb-1 block text-xs font-semibold text-[#8B8B8B]">MR POINTS to redeem</label>
            <input type="number" min={MIN_REDEEM_POINTS} max={Math.floor(available)} value={points}
              onChange={e => { setPoints(e.target.value); setError(null); }} disabled={busy} className={inputCls} />
            <label className="mb-1 mt-4 block text-xs font-semibold text-[#8B8B8B]">UPI ID</label>
            <input type="text" value={upi} placeholder="name@bank"
              onChange={e => { setUpi(e.target.value); setError(null); }} disabled={busy} className={inputCls} />
            <p className={`mt-3 text-xs ${error ? 'font-medium text-[#C85D3E]' : 'text-[#8B8B8B]'}`}>
              {error ?? `Minimum ${pts(MIN_REDEEM_POINTS)} MR POINTS · Paid via UPI within 7 working days.`}
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={onClose} disabled={busy}
                className="flex-1 rounded-xl border border-[#D0CEC2] py-3 text-sm font-semibold text-[#6B6B6B] hover:bg-[#EDEBDF]">
                Cancel
              </button>
              <button onClick={submit} disabled={busy || !upi.trim()}
                className="flex-1 rounded-xl bg-[#2C5F5F] py-3 text-sm font-bold text-[#EDEBDF] hover:bg-[#1A4D4D] disabled:bg-[#D0CEC2] disabled:text-[#8B8B8B]">
                {busy ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'referrals', label: 'Referrals' },
  { key: 'wallet', label: 'Wallet' },
];

export default function EarnDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('overview');
  const [account, setAccount] = useState<Account | null>(null);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [redeems, setRedeems] = useState<Redeem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRedeem, setShowRedeem] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');

      const [acc, earn, red] = await Promise.all([
        supabase.from('referral_account')
          .select('referral_code, earned_amount, redeemed_amount, created_at, is_blocked')
          .eq('id', user.id).maybeSingle(),
        supabase.from('referral_earnings')
          .select('id, created_at, points, events(title)')
          .eq('referral_id', user.id).order('created_at', { ascending: false }),
        supabase.from('redeem_history')
          .select('id, created_at, action_time, is_approved, amount, upi_id')
          .eq('user', user.id).eq('legacy', false).order('created_at', { ascending: false }),
      ]);

      if (!acc.data) return router.replace('/earn/onboarding');
      const err = acc.error || earn.error || red.error;
      if (err) throw err;

      setAccount({
        ...acc.data,
        earned_amount: Number(acc.data.earned_amount) || 0,
        redeemed_amount: Number(acc.data.redeemed_amount) || 0,
      });
      setEarnings(((earn.data as any[]) ?? []).map(e => ({
        id: e.id,
        created_at: e.created_at,
        points: e.points,
        event_title: (Array.isArray(e.events) ? e.events[0]?.title : e.events?.title) ?? 'Mind Rain',
      })));
      setRedeems(((red.data as Redeem[]) ?? []).map(r => ({ ...r, amount: Number(r.amount) || 0 })));
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load your earn account');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

  const pending = redeems.filter(r => redeemStatus(r) === 'pending').reduce((a, r) => a + r.amount, 0);
  const available = account ? Math.max(0, account.earned_amount - account.redeemed_amount - pending) : 0;

  return (
    <div className="min-h-screen bg-[#EDEBDF] md:flex">
      {/* Sidebar (top bar on mobile) */}
      <aside className="border-b border-[#D0CEC2] bg-[#F5F1ED] px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:py-8">
        <div className="mb-4 px-3 md:mb-10">
          <p className="text-xl font-bold tracking-tight text-[#2C5F5F]">MR Earn</p>
          <p className="mt-0.5 text-xs text-[#8B8B8B]">Referral Dashboard</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-[#2C5F5F] text-[#EDEBDF]' : 'text-[#6B6B6B] hover:bg-[#EDEBDF] hover:text-[#1A1A1A]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="w-full max-w-4xl flex-1 p-4 md:p-10">
        {error && <div className="mb-6 rounded-xl bg-[#C85D3E]/10 p-4 text-sm font-medium text-[#C85D3E]">{error}</div>}
        {loading || !account ? (
          !error && <Spinner />
        ) : tab === 'overview' ? (
          <Overview account={account} available={available} pending={pending} earnings={earnings} onRedeem={() => setShowRedeem(true)} />
        ) : tab === 'referrals' ? (
          <Referrals earnings={earnings} />
        ) : (
          <Wallet account={account} available={available} redeems={redeems} onRedeem={() => setShowRedeem(true)} />
        )}
      </main>

      {showRedeem && account && (
        <RedeemModal
          available={available}
          onClose={() => setShowRedeem(false)}
          onDone={() => { setShowRedeem(false); load(); }}
        />
      )}
    </div>
  );
}
