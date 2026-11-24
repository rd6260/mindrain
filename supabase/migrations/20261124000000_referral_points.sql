-- Referral system v2: MR POINTS, per-event reward/discount settings, earnings ledger.
-- referral_account.earned_amount / redeemed_amount / current_balance and redeem_history.amount
-- are now in MR POINTS (previously rupees).

-- ─── 1. Reset legacy rupee balances (backup kept) ────────────────────────────

create table if not exists public.referral_account_legacy_backup as
  select id, referral_code, earned_amount, redeemed_amount, now() as backed_up_at
  from public.referral_account;
-- No policies: only the service role / SQL editor can read the backup.
alter table public.referral_account_legacy_backup enable row level security;

update public.referral_account set earned_amount = 0, redeemed_amount = 0;

-- Old redeem requests were in rupees; keep them for the record but out of point totals.
alter table public.redeem_history add column if not exists legacy boolean not null default false;
update public.redeem_history set legacy = true;

-- ─── 2. Per-event settings ───────────────────────────────────────────────────
-- D1 = what the referrer earns, D2 = discount for the payer.
-- 'percent' uses *_percent of the original amount; 'fixed' uses *_inr / *_usd (major units)
-- depending on the payment currency. Events without a row use the defaults in code (10% / 5%).

create table if not exists public.referral_settings (
  event_id uuid primary key references public.events(id) on delete cascade,
  enabled boolean not null default true,
  d1_type text not null default 'percent' check (d1_type in ('percent', 'fixed')),
  d1_percent numeric not null default 10 check (d1_percent >= 0 and d1_percent <= 100),
  d1_inr numeric not null default 0 check (d1_inr >= 0),
  d1_usd numeric not null default 0 check (d1_usd >= 0),
  d2_type text not null default 'percent' check (d2_type in ('percent', 'fixed')),
  d2_percent numeric not null default 5 check (d2_percent >= 0 and d2_percent <= 100),
  d2_inr numeric not null default 0 check (d2_inr >= 0),
  d2_usd numeric not null default 0 check (d2_usd >= 0),
  updated_at timestamptz not null default now()
);

alter table public.referral_settings enable row level security;

create policy "referral_settings readable by everyone"
  on public.referral_settings for select using (true);

create policy "referral_settings writable by admins"
  on public.referral_settings for all
  using (exists (select 1 from public.user_info u where u.id = auth.uid() and u.is_admin))
  with check (exists (select 1 from public.user_info u where u.id = auth.uid() and u.is_admin));

-- ─── 3. Per-payment referral / coupon details ────────────────────────────────

alter table public.payments_v3
  add column if not exists original_amount integer,
  add column if not exists discount_amount integer not null default 0,
  add column if not exists coupon_code text,
  add column if not exists referral_id uuid references public.referral_account(id),
  add column if not exists referral_points integer not null default 0;

-- ─── 4. Earnings ledger (one row per captured referred payment) ──────────────

create table if not exists public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referral_account(id),
  payment_id uuid not null unique references public.payments_v3(payment_id),
  registration_id uuid not null references public.registrations_v3(id),
  event_id uuid not null references public.events(id),
  currency text not null,
  original_amount integer not null,
  points integer not null check (points >= 0),
  created_at timestamptz not null default now()
);

create index if not exists referral_earnings_referral_id_idx on public.referral_earnings(referral_id);

alter table public.referral_earnings enable row level security;

-- Referrers see their own earnings; admins see all. Inserts only via the service role.
create policy "referral_earnings own rows"
  on public.referral_earnings for select
  using (referral_id = auth.uid()
         or exists (select 1 from public.user_info u where u.id = auth.uid() and u.is_admin));

create or replace function public.referral_earnings_credit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update referral_account set earned_amount = earned_amount + new.points where id = new.referral_id;
  return new;
end $$;

drop trigger if exists referral_earnings_credit on public.referral_earnings;
create trigger referral_earnings_credit after insert on public.referral_earnings
  for each row execute function public.referral_earnings_credit();

-- ─── 5. Redemptions ──────────────────────────────────────────────────────────
-- (Approval bookkeeping is done by the existing trg_sync_redeemed_amount; see the _fix_redeem_sync migration.)

-- Approving a request moves its points into redeemed_amount.
create or replace function public.redeem_history_on_approve()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_approved is true and old.is_approved is distinct from true and not new.legacy then
    update referral_account set redeemed_amount = redeemed_amount + new.amount where id = new."user";
  end if;
  return new;
end $$;

drop trigger if exists redeem_history_on_approve on public.redeem_history;
create trigger redeem_history_on_approve after update on public.redeem_history
  for each row execute function public.redeem_history_on_approve();

-- Validated, race-free redeem request for the signed-in user.
-- Pending = not legacy, not yet actioned. Available = balance - pending.
create or replace function public.request_redeem(p_points integer, p_upi text)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  acc referral_account%rowtype;
  pending numeric;
  available numeric;
  new_id bigint;
  min_points constant integer := 3000;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;

  select * into acc from referral_account where id = auth.uid() for update;
  if not found then raise exception 'No earn account'; end if;
  if acc.is_blocked then raise exception 'This earn account is blocked'; end if;

  if p_upi is null or length(trim(p_upi)) < 3 then raise exception 'Enter a valid UPI ID'; end if;
  if p_points is null or p_points < min_points then
    raise exception 'Minimum redemption is % MR POINTS', min_points;
  end if;

  select coalesce(sum(amount), 0) into pending
    from redeem_history
    where "user" = auth.uid() and not legacy and action_time is null and is_approved is not true;

  available := acc.earned_amount - acc.redeemed_amount - pending;
  if p_points > available then
    raise exception 'You can redeem at most % MR POINTS right now', floor(available);
  end if;

  insert into redeem_history ("user", amount, upi_id) values (auth.uid(), p_points, trim(p_upi))
    returning id into new_id;
  return new_id;
end $$;

revoke all on function public.request_redeem(integer, text) from public, anon;
grant execute on function public.request_redeem(integer, text) to authenticated;
