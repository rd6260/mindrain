# Supabase V3 Migration — Registration Progress Tracking

> Run in the Supabase SQL Editor. Creates new tables only; nothing existing is modified
> apart from a new trigger on `registrations_v3`.

Progress is one row per (registration, stage). A stage's status is one of
`pending | in_progress | approved | rejected`. Rejection can happen at any stage — the
rejected stage is marked `rejected` and later stages simply stay `pending` (the UI greys them out).

Stages per event live in `event_progress_stages`, so a new event needs only inserts, no code in the DB.
Rows are created automatically by a trigger when a registration is inserted (users have **no**
insert/update rights on progress — only staff change statuses, via dashboard / service role).

```sql
-- 1. Stage definitions per event ------------------------------------------------
create table public.event_progress_stages (
  event_id       uuid    not null references public.events (id) on delete cascade,
  stage          text    not null,
  position       integer not null,
  initial_status text    not null default 'pending',

  constraint event_progress_stages_pkey primary key (event_id, stage),
  constraint event_progress_stages_position_key unique (event_id, position),
  constraint event_progress_stages_initial_status_check
    check (initial_status in ('pending', 'in_progress', 'approved', 'rejected'))
);

alter table public.event_progress_stages enable row level security;
create policy "authenticated can read stages"
  on public.event_progress_stages for select to authenticated using (true);

-- 2. Per-registration progress ---------------------------------------------------
create table public.registration_progress_v3 (
  id              uuid        not null default gen_random_uuid(),
  registration_id uuid        not null references public.registrations_v3 (id) on delete cascade,
  stage           text        not null,
  status          text        not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint registration_progress_v3_pkey primary key (id),
  constraint registration_progress_v3_unique_stage unique (registration_id, stage),
  constraint registration_progress_v3_status_check
    check (status in ('pending', 'in_progress', 'approved', 'rejected'))
);

create index idx_registration_progress_v3_registration_id
  on public.registration_progress_v3 using btree (registration_id);

create trigger update_registration_progress_v3_updated_at
  before update on public.registration_progress_v3
  for each row execute function update_updated_at_column();

alter table public.registration_progress_v3 enable row level security;

-- Users can only READ progress of their own registrations
create policy "users read own progress"
  on public.registration_progress_v3 for select to authenticated
  using (exists (
    select 1 from public.registrations_v3 r
    where r.id = registration_progress_v3.registration_id
      and r.registration_by = auth.uid()
  ));

-- 3. Auto-create progress rows when a registration is created ---------------------
create or replace function public.seed_registration_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.registration_progress_v3 (registration_id, stage, status)
  select new.id, s.stage, s.initial_status
  from public.event_progress_stages s
  where s.event_id = new.event_id
  on conflict (registration_id, stage) do nothing;
  return new;
end;
$$;

create trigger seed_registration_progress_trg
  after insert on public.registrations_v3
  for each row execute function public.seed_registration_progress();

-- 4. Function Follows Form stages --------------------------------------------------
insert into public.event_progress_stages (event_id, stage, position, initial_status) values
  ('6159b71a-f973-453a-a383-6b2bbfca707a', 'application',     1, 'approved'),     -- shown as "Submitted"
  ('6159b71a-f973-453a-a383-6b2bbfca707a', 'shortlisting',    2, 'in_progress'),
  ('6159b71a-f973-453a-a383-6b2bbfca707a', 'interview',       3, 'pending'),
  ('6159b71a-f973-453a-a383-6b2bbfca707a', 'final_selection', 4, 'pending'),
  ('6159b71a-f973-453a-a383-6b2bbfca707a', 'fee_payment',     5, 'pending');

-- 5. Backfill registrations that already exist for this event ---------------------
insert into public.registration_progress_v3 (registration_id, stage, status)
select r.id, s.stage, s.initial_status
from public.registrations_v3 r
join public.event_progress_stages s on s.event_id = r.event_id
on conflict (registration_id, stage) do nothing;
```

## Updating a status (staff)

```sql
update public.registration_progress_v3
set status = 'approved'
where registration_id = '<registration uuid>' and stage = 'shortlisting';

update public.registration_progress_v3
set status = 'in_progress'
where registration_id = '<registration uuid>' and stage = 'interview';

-- rejection at any stage
update public.registration_progress_v3
set status = 'rejected'
where registration_id = '<registration uuid>' and stage = 'interview';
```
