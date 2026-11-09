-- Event briefs: one row per downloadable file of an event.
-- Files live in the public storage bucket `competition_brief`, under a folder named after the event id:
--   competition_brief/<event_id>/<file>
-- Public URL shape: https://<project>.supabase.co/storage/v1/object/public/competition_brief/<event_id>/<file>

create table public.event_briefs (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  name text not null,
  description text null,
  url text not null,
  created_at timestamp with time zone null default now(),
  constraint event_briefs_pkey primary key (id),
  constraint event_briefs_event_id_fkey foreign key (event_id) references public.events (id) on delete cascade
) TABLESPACE pg_default;

create index event_briefs_event_id_idx on public.event_briefs (event_id);

-- ─── Admin check ─────────────────────────────────────────────────────────────
-- security definer so it works even if user_info has RLS that hides other rows / the caller's own row.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select ui.is_admin from public.user_info ui where ui.id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Briefs are public (anyone can read). Only users with user_info.is_admin = true can write.

alter table public.event_briefs enable row level security;

create policy "event_briefs are publicly readable"
  on public.event_briefs for select
  using (true);

create policy "admins manage event_briefs"
  on public.event_briefs for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Storage (bucket: competition_brief) ─────────────────────────────────────
-- Public read is already provided by the bucket being public. Admins can write.
-- If you already have write policies on this bucket, skip or adjust these.

create policy "admins upload competition_brief"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'competition_brief' and public.is_admin());

create policy "admins update competition_brief"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'competition_brief' and public.is_admin());

create policy "admins delete competition_brief"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'competition_brief' and public.is_admin());
