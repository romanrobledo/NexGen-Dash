-- ─────────────────────────────────────────────────────────────────────────────
-- SUBMISSIONS SCHEMA — Check In / Out, Issues, Ideas.
-- ─────────────────────────────────────────────────────────────────────────────
-- RLS pattern here is more permissive than the other tables: any
-- authenticated staff can INSERT their own row (they need to be able to
-- clock in / raise an issue / submit an idea without books-admin rights).
-- Books admins can read + update everything for triage. Non-admin staff
-- can only read their OWN check events.

BEGIN;

-- ── staff_check_events ──────────────────────────────────────────────────────
-- One row per clock event. Pair inbound/outbound by ordering on staff_id
-- + event_at. This way the app doesn't have to update anything on
-- check-out — every event is immutable and reports pair them up.
CREATE TABLE IF NOT EXISTS public.staff_check_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      uuid        NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  event_type    text        NOT NULL CHECK (event_type IN ('check_in', 'check_out')),
  event_at      timestamptz NOT NULL DEFAULT now(),
  room_number   int,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_check_events_staff_idx
  ON public.staff_check_events (staff_id, event_at DESC);

CREATE INDEX IF NOT EXISTS staff_check_events_event_at_idx
  ON public.staff_check_events (event_at DESC);

ALTER TABLE public.staff_check_events ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can insert a row FOR THEMSELVES.
DROP POLICY IF EXISTS staff_check_events_self_insert ON public.staff_check_events;
CREATE POLICY staff_check_events_self_insert ON public.staff_check_events
  FOR INSERT TO authenticated
  WITH CHECK (
    staff_id = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid())
  );

-- Read: your own rows always; books admins get all.
DROP POLICY IF EXISTS staff_check_events_read ON public.staff_check_events;
CREATE POLICY staff_check_events_read ON public.staff_check_events
  FOR SELECT TO authenticated
  USING (
    public.current_staff_is_books_admin()
    OR staff_id = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid())
  );

-- Update / delete: books admins only (audit corrections).
DROP POLICY IF EXISTS staff_check_events_admin_write ON public.staff_check_events;
CREATE POLICY staff_check_events_admin_write ON public.staff_check_events
  FOR UPDATE TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

DROP POLICY IF EXISTS staff_check_events_admin_delete ON public.staff_check_events;
CREATE POLICY staff_check_events_admin_delete ON public.staff_check_events
  FOR DELETE TO authenticated
  USING (public.current_staff_is_books_admin());

-- ── staff_issues ────────────────────────────────────────────────────────────
-- Submitted by staff, triaged by admin. severity + status live inline
-- so we don't need a lookup table. resolver_notes is written by the
-- admin during triage; separate from the original description so the
-- history isn't overwritten.
CREATE TABLE IF NOT EXISTS public.staff_issues (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by     uuid        NOT NULL REFERENCES public.staff(id) ON DELETE SET NULL,
  submitted_at     timestamptz NOT NULL DEFAULT now(),
  category         text        NOT NULL CHECK (category IN
                     ('facility','safety','child_behavior','parent','equipment','staffing','other')),
  severity         text        NOT NULL DEFAULT 'medium'
                     CHECK (severity IN ('low','medium','high','urgent')),
  description      text        NOT NULL,
  status           text        NOT NULL DEFAULT 'open'
                     CHECK (status IN ('open','in_progress','resolved','dismissed')),
  resolver_id      uuid        REFERENCES public.staff(id),
  resolver_notes   text,
  resolved_at      timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_issues_status_idx    ON public.staff_issues (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS staff_issues_submitted_idx ON public.staff_issues (submitted_by, submitted_at DESC);

DROP TRIGGER IF EXISTS staff_issues_touch_updated_at ON public.staff_issues;
CREATE TRIGGER staff_issues_touch_updated_at
  BEFORE UPDATE ON public.staff_issues
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.staff_issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_issues_self_insert ON public.staff_issues;
CREATE POLICY staff_issues_self_insert ON public.staff_issues
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS staff_issues_read ON public.staff_issues;
CREATE POLICY staff_issues_read ON public.staff_issues
  FOR SELECT TO authenticated
  USING (
    public.current_staff_is_books_admin()
    OR submitted_by = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS staff_issues_admin_write ON public.staff_issues;
CREATE POLICY staff_issues_admin_write ON public.staff_issues
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

-- ── staff_ideas ─────────────────────────────────────────────────────────────
-- Same pattern as issues but a smaller status enum + no severity. Every
-- idea deserves a response even if the answer is "not right now".
CREATE TABLE IF NOT EXISTS public.staff_ideas (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by   uuid        NOT NULL REFERENCES public.staff(id) ON DELETE SET NULL,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  category       text        NOT NULL CHECK (category IN
                   ('curriculum','operations','marketing','facility','staff','tech','other')),
  title          text        NOT NULL,
  description    text,
  status         text        NOT NULL DEFAULT 'submitted'
                   CHECK (status IN ('submitted','reviewing','planned','implementing','implemented','declined')),
  response_notes text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_ideas_status_idx ON public.staff_ideas (status, submitted_at DESC);

DROP TRIGGER IF EXISTS staff_ideas_touch_updated_at ON public.staff_ideas;
CREATE TRIGGER staff_ideas_touch_updated_at
  BEFORE UPDATE ON public.staff_ideas
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.staff_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staff_ideas_self_insert ON public.staff_ideas;
CREATE POLICY staff_ideas_self_insert ON public.staff_ideas
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS staff_ideas_read ON public.staff_ideas;
CREATE POLICY staff_ideas_read ON public.staff_ideas
  FOR SELECT TO authenticated
  USING (
    public.current_staff_is_books_admin()
    OR submitted_by = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS staff_ideas_admin_write ON public.staff_ideas;
CREATE POLICY staff_ideas_admin_write ON public.staff_ideas
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

COMMIT;

-- ── VERIFICATION ────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name IN ('staff_check_events','staff_issues','staff_ideas')
ORDER BY table_name, ordinal_position;

SELECT tablename, policyname
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  tablename IN ('staff_check_events','staff_issues','staff_ideas')
ORDER BY tablename, policyname;
