-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  NexGen Data Integrity — Phase 1 Migration                           ║
-- ║                                                                      ║
-- ║  • 9 tables (8 domain tables + 1 verification log)                   ║
-- ║  • is_ed_bague() helper for RLS gating                               ║
-- ║  • RLS: any_authed can SELECT; only Ed can INSERT/UPDATE/DELETE      ║
-- ║  • Service role bypasses RLS automatically (used by N8N)             ║
-- ║  • Hybrid seed: real data where available, placeholders elsewhere    ║
-- ║                                                                      ║
-- ║  Idempotent — safe to re-run. Existing rows are NOT overwritten.     ║
-- ╚══════════════════════════════════════════════════════════════════════╝


-- ─────────────────────────────────────────────────────────────────────────
-- 1. HELPER FUNCTION — only Ed Bague (hardcoded staff.id) can write.
--    Returns true if the current authenticated user matches Ed's staff row.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_ed_bague()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.staff
    where id = 'bf23ac5b-add5-464e-b8f6-6efa58c5f2a9'::uuid
      and auth_user_id = auth.uid()
  );
$$;


-- ─────────────────────────────────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────────────────────────────────

-- 2.1 Baseline Numbers
create table if not exists public.data_integrity_baseline_numbers (
  id uuid primary key default gen_random_uuid(),
  metric_name text not null,
  metric_value numeric,
  period_type text check (period_type in ('weekly','monthly')),
  period_ending date,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.2 Staff Roster (mirrors intake; separate from production staff table)
create table if not exists public.data_integrity_staff_roster (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff(id),
  full_name text not null,
  role text,
  classroom text,
  hire_date date,
  employment_type text check (employment_type in ('full_time','part_time','substitute') or employment_type is null),
  active boolean default true,
  phone text,
  email text,
  emergency_contact text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.3 Strategic Priorities
create table if not exists public.data_integrity_strategic_priorities (
  id uuid primary key default gen_random_uuid(),
  owner text not null check (owner in ('roman','robyn','ed')),
  priority_rank int not null check (priority_rank between 1 and 10),
  priority_text text not null,
  quarter text not null,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.4 Rooms (room layout)
create table if not exists public.data_integrity_rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null,
  age_range text,
  max_capacity int,
  lead_teacher text,
  required_ratio text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.5 Room-level TRS Scores
create table if not exists public.data_integrity_room_scores (
  id uuid primary key default gen_random_uuid(),
  teacher_name text not null,
  age_range text,
  score numeric check (score between 0 and 10),
  date_assessed date,
  notes text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.6 Teacher-level TRS Assessment Scores
create table if not exists public.data_integrity_teacher_scores (
  id uuid primary key default gen_random_uuid(),
  teacher_name text not null,
  score numeric check (score between 0 and 10),
  date_assessed date,
  positives text,
  negatives text,
  things_to_work_on text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.7 HHSC Compliance
create table if not exists public.data_integrity_compliance_hhsc (
  id uuid primary key default gen_random_uuid(),
  field_name text not null,
  field_value text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.8 Policy Documents
create table if not exists public.data_integrity_compliance_policies (
  id uuid primary key default gen_random_uuid(),
  policy_name text not null,
  exists boolean default false,
  last_reviewed date,
  file_location text,
  last_verified_at timestamptz,
  last_verified_by uuid references public.staff(id),
  verification_status text default 'needs_review'
    check (verification_status in ('verified','needs_review','overdue','flagged')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2.9 Verification Log (full audit trail; feeds Google Sheet archive)
create table if not exists public.data_integrity_verification_log (
  id uuid primary key default gen_random_uuid(),
  domain text not null check (domain in (
    'baseline_numbers','staff_roster','strategic_priorities',
    'rooms','room_scores','teacher_scores','compliance_hhsc','compliance_policies'
  )),
  action text not null check (action in ('verified','corrected','flagged')),
  field_changed text,
  old_value text,
  new_value text,
  verified_by uuid references public.staff(id),
  notes text,
  created_at timestamptz default now()
);


-- Helpful indexes
create index if not exists di_baseline_numbers_status_idx     on public.data_integrity_baseline_numbers(verification_status);
create index if not exists di_staff_roster_status_idx          on public.data_integrity_staff_roster(verification_status);
create index if not exists di_strategic_priorities_status_idx  on public.data_integrity_strategic_priorities(verification_status);
create index if not exists di_rooms_status_idx                 on public.data_integrity_rooms(verification_status);
create index if not exists di_room_scores_status_idx           on public.data_integrity_room_scores(verification_status);
create index if not exists di_teacher_scores_status_idx        on public.data_integrity_teacher_scores(verification_status);
create index if not exists di_compliance_hhsc_status_idx       on public.data_integrity_compliance_hhsc(verification_status);
create index if not exists di_compliance_policies_status_idx   on public.data_integrity_compliance_policies(verification_status);
create index if not exists di_verification_log_domain_idx      on public.data_integrity_verification_log(domain);
create index if not exists di_verification_log_created_idx     on public.data_integrity_verification_log(created_at);


-- ─────────────────────────────────────────────────────────────────────────
-- 3. RLS + POLICIES
--    Any authenticated user:  SELECT (read)
--    Only Ed Bague:           INSERT / UPDATE / DELETE
--    Service role (N8N):      bypasses RLS automatically
--
--    DROP IF EXISTS before each CREATE so this block is re-runnable.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  t text;
  tables text[] := array[
    'data_integrity_baseline_numbers',
    'data_integrity_staff_roster',
    'data_integrity_strategic_priorities',
    'data_integrity_rooms',
    'data_integrity_room_scores',
    'data_integrity_teacher_scores',
    'data_integrity_compliance_hhsc',
    'data_integrity_compliance_policies',
    'data_integrity_verification_log'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);

    -- read: any authenticated user
    execute format('drop policy if exists "any_auth_read_%s" on public.%I;', t, t);
    execute format(
      'create policy "any_auth_read_%s" on public.%I for select to authenticated using (true);',
      t, t
    );

    -- insert: Ed only
    execute format('drop policy if exists "ed_only_insert_%s" on public.%I;', t, t);
    execute format(
      'create policy "ed_only_insert_%s" on public.%I for insert to authenticated with check (public.is_ed_bague());',
      t, t
    );

    -- update: Ed only
    execute format('drop policy if exists "ed_only_update_%s" on public.%I;', t, t);
    execute format(
      'create policy "ed_only_update_%s" on public.%I for update to authenticated using (public.is_ed_bague()) with check (public.is_ed_bague());',
      t, t
    );

    -- delete: Ed only
    execute format('drop policy if exists "ed_only_delete_%s" on public.%I;', t, t);
    execute format(
      'create policy "ed_only_delete_%s" on public.%I for delete to authenticated using (public.is_ed_bague());',
      t, t
    );
  end loop;
end $$;


-- ─────────────────────────────────────────────────────────────────────────
-- 4. SEED DATA
--
--    Hybrid strategy (per your choice):
--     • staff_roster            → real data from public.staff
--     • strategic_priorities    → 3 placeholder rows per owner (roman/robyn/ed)
--     • baseline_numbers        → common childcare KPI placeholder rows
--     • rooms                   → one placeholder row per known classroom
--     • compliance_policies     → placeholder rows for common childcare policies
--     • compliance_hhsc         → placeholder rows for key HHSC fields
--     • room_scores             → empty (Ed fills after first assessment)
--     • teacher_scores          → empty (Ed fills after first assessment)
--     • verification_log        → empty (populates as Ed acts)
--
--    All seeds use `verification_status = 'needs_review'` so Ed sees them all
--    on his first pass. Guarded with NOT EXISTS so re-runs don't duplicate.
-- ─────────────────────────────────────────────────────────────────────────

-- 4.1 Staff Roster — mirror the real staff table
-- Note: staff.status uses title-case values ('Active', etc.)
insert into public.data_integrity_staff_roster
  (staff_id, full_name, role, phone, email, active, verification_status)
select
  s.id,
  coalesce(s.full_name, trim(s.first_name || ' ' || s.last_name)),
  s.role,
  s.phone,
  s.email,
  (s.status = 'Active'),
  'needs_review'
from public.staff s
where not exists (
  select 1 from public.data_integrity_staff_roster r where r.staff_id = s.id
);

-- 4.2 Strategic Priorities — 3 placeholder slots per owner for current quarter
insert into public.data_integrity_strategic_priorities (owner, priority_rank, priority_text, quarter)
select owner, rank, '(to be filled in)', to_char(current_date, 'YYYY') || '-Q' || extract(quarter from current_date)::text
from (
  values
    ('roman', 1), ('roman', 2), ('roman', 3),
    ('robyn', 1), ('robyn', 2), ('robyn', 3),
    ('ed',    1), ('ed',    2), ('ed',    3)
) as seed(owner, rank)
where not exists (
  select 1 from public.data_integrity_strategic_priorities p
  where p.owner = seed.owner
    and p.priority_rank = seed.rank
    and p.quarter = to_char(current_date, 'YYYY') || '-Q' || extract(quarter from current_date)::text
);

-- 4.3 Baseline Numbers — Roman's locked KPI set (Ed fills in values)
insert into public.data_integrity_baseline_numbers (metric_name, period_type, period_ending)
select metric, period, null::date from (values
  ('new_leads_this_week',         'weekly'),
  ('tours_held_this_week',        'weekly'),
  ('new_enrollments_this_week',   'weekly'),
  ('withdrawals_this_week',       'weekly'),
  ('tour_to_enrollment_rate',     'weekly'),
  ('active_enrollment_count',     'weekly'),
  ('occupancy_rate',              'weekly'),
  ('arpc_per_week_per_child',     'weekly'),
  ('revenue_this_month',          'monthly'),
  ('net_profit_this_month',       'monthly'),
  ('churn_rate_this_month',       'monthly'),
  ('average_trs_room_score',      'monthly')
) as seed(metric, period)
where not exists (
  select 1 from public.data_integrity_baseline_numbers b
  where b.metric_name = seed.metric and b.period_type = seed.period
);

-- 4.4 Rooms — known classrooms from sidebar layout
insert into public.data_integrity_rooms (room_number, age_range)
select room, age from (
  values
    ('Infant Room',         '0-12 months'),
    ('Young Toddler Room',  '12-18 months'),
    ('Toddler Room',        '18-36 months'),
    ('Pre-Kinder Room',     '3-4 years'),
    ('Pre-School Room',     '4-5 years'),
    ('After School 1',      '5-12 years'),
    ('After School 2',      '5-12 years')
) as seed(room, age)
where not exists (
  select 1 from public.data_integrity_rooms r where r.room_number = seed.room
);

-- 4.5 Compliance Policies — common childcare policy inventory
insert into public.data_integrity_compliance_policies (policy_name)
select p from (values
  ('Employee Handbook'),
  ('Parent Handbook'),
  ('Safe Sleep Policy'),
  ('Emergency Evacuation Plan'),
  ('Child Abuse Reporting Procedure'),
  ('Medication Administration Policy'),
  ('Sick Child Policy'),
  ('Discipline Policy'),
  ('Field Trip Policy'),
  ('Transportation Policy'),
  ('Incident Report Procedure'),
  ('Background Check Policy'),
  ('Staff Training Log Policy'),
  ('Food Service / Allergy Policy'),
  ('COVID / Illness Response Policy')
) as seed(p)
where not exists (
  select 1 from public.data_integrity_compliance_policies cp where cp.policy_name = seed.p
);

-- 4.6 HHSC Compliance — key fields Ed needs to keep current
insert into public.data_integrity_compliance_hhsc (field_name)
select f from (values
  ('HHSC Operation Number'),
  ('HHSC License Expiration'),
  ('Last HHSC Inspection Date'),
  ('Open HHSC Deficiencies'),
  ('Licensed Capacity'),
  ('Director of Record'),
  ('Permit Holder Name')
) as seed(f)
where not exists (
  select 1 from public.data_integrity_compliance_hhsc h where h.field_name = seed.f
);

-- 4.7 Room Scores, Teacher Scores, Verification Log — left empty by design.

-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  End Phase 1 migration.                                              ║
-- ║  Verify with:                                                        ║
-- ║    select table_name from information_schema.tables                  ║
-- ║    where table_schema = 'public' and table_name like 'data_integrity%';║
-- ║    (should return 9 rows)                                            ║
-- ║                                                                      ║
-- ║    select count(*) from public.data_integrity_staff_roster;          ║
-- ║    (should match your active staff count)                            ║
-- ╚══════════════════════════════════════════════════════════════════════╝
