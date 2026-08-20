# Supabase V3 Migration — Registration & Payment

> Run these SQL statements in your Supabase SQL Editor **in order**.
> These create brand-new tables. **No existing tables are modified.**
> Invoices are sent as emails immediately after payment — no separate table needed.

---

## 1. `registrations_v3` — Flexible, Event-Agnostic Registrations

Uses a **JSONB** `form_data` column so each event can have completely different registration form structures without schema changes.

```sql
create table public.registrations_v3 (
  id              uuid        not null default gen_random_uuid(),
  registration_by uuid        not null,
  event_id        uuid        not null,
  team_id         text        not null,
  form_data       jsonb       not null default '{}'::jsonb,
  paid            boolean     not null default false,
  referral_used   uuid        null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint registrations_v3_pkey primary key (id),
  constraint registrations_v3_team_id_key unique (team_id),
  constraint registrations_v3_unique_user_event unique (registration_by, event_id),

  constraint registrations_v3_registration_by_fkey
    foreign key (registration_by) references auth.users (id) on delete cascade,
  constraint registrations_v3_event_id_fkey
    foreign key (event_id) references events (id) on delete cascade,
  constraint registrations_v3_referral_used_fkey
    foreign key (referral_used) references referral_account (id)

);

create index idx_registrations_v3_event_id
  on public.registrations_v3 using btree (event_id);

create index idx_registrations_v3_registration_by
  on public.registrations_v3 using btree (registration_by);

create index idx_registrations_v3_team_id
  on public.registrations_v3 using btree (team_id);

create index idx_registrations_v3_form_data
  on public.registrations_v3 using gin (form_data);

create trigger update_registrations_v3_updated_at
  before update on registrations_v3
  for each row
  execute function update_updated_at_column();
```

### Example `form_data` for "The Architecture of Play"

```json
{
  "country": "India",
  "group": "A",
  "category": "1",
  "team_type": "solo",
  "members": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "institute": "IIT Bombay",
      "academic_year": "2",
      "institute_id_url": "https://..."
    }
  ]
}
```

---

## 2. `payments_v3` — Payment Records

Amounts stored as **integers in smallest currency unit** (paisa for INR, cents for USD) — consistent with Razorpay's API and avoids text-parsing issues from V1/V2.

```sql
create table public.payments_v3 (
  payment_id          uuid        not null default gen_random_uuid(),
  registration_id     uuid        not null,
  razorpay_order_id   text        null,
  razorpay_payment_id text        null,
  razorpay_signature  text        null,
  method              text        null,
  amount              integer     not null,
  currency            text        not null default 'INR',
  mindrain_fee        integer     not null default 0,
  razorpay_fee        integer     null,
  tax                 integer     null default 0,
  status              text        not null default 'created',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint payments_v3_pkey primary key (payment_id),

  constraint payments_v3_registration_id_fkey
    foreign key (registration_id) references registrations_v3 (id) on delete cascade,

  constraint payments_v3_status_check
    check (status = any (array['created', 'authorized', 'captured', 'failed', 'refunded']))
);

create index idx_payments_v3_registration_id
  on public.payments_v3 using btree (registration_id);

create index idx_payments_v3_razorpay_order_id
  on public.payments_v3 using btree (razorpay_order_id);

create index idx_payments_v3_status
  on public.payments_v3 using btree (status);

create trigger update_payments_v3_updated_at
  before update on payments_v3
  for each row
  execute function update_updated_at_column();
```

---

## 3. Verification Queries

Run after migration to confirm everything is set up:

```sql
-- Check tables exist
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('registrations_v3', 'payments_v3');

-- Check indexes
select indexname from pg_indexes
where tablename in ('registrations_v3', 'payments_v3');

-- Check constraints
select conname, contype from pg_constraint
where conrelid in (
  'registrations_v3'::regclass,
  'payments_v3'::regclass
);
```

---

## Key Improvements Over V1/V2

| Feature | V1/V2 | V3 |
|---|---|---|
| **Schema flexibility** | Hard-coded columns per event | JSONB `form_data` — any event format |
| **Amount storage** | Text strings (`"299900"`) | Integer in smallest unit (`29900`) |
| **Invoices** | Fire-and-forget / batch scripts | Sent immediately on payment via email |
| **Updated timestamps** | Inconsistent | Auto-trigger on all tables |
| **Unique constraints** | Varies | Consistent: unique user+event, unique team_id |
| **Existing tables** | — | Untouched, all new `_v3` tables |
