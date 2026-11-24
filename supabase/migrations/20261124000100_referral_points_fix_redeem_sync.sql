-- Keep the existing recompute trigger (handles insert/update/delete) but exclude legacy rupee records,
-- and drop the incremental trigger from referral_points so approvals aren't counted twice.
drop trigger if exists redeem_history_on_approve on public.redeem_history;
drop function if exists public.redeem_history_on_approve();

create or replace function public.sync_redeemed_amount()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  target_user uuid;
begin
  target_user := case when tg_op = 'DELETE' then old."user" else new."user" end;
  update referral_account
  set redeemed_amount = (
    select coalesce(sum(amount), 0) from redeem_history
    where "user" = target_user and is_approved = true and not legacy
  )
  where id = target_user;
  return null;
end $$;

-- Recompute everyone once (legacy rows now excluded -> all 0).
update public.referral_account a set redeemed_amount = (
  select coalesce(sum(amount), 0) from public.redeem_history h
  where h."user" = a.id and h.is_approved = true and not h.legacy
);
