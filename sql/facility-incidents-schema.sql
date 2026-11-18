-- ─────────────────────────────────────────────────────────────────────────────
-- FACILITY INCIDENTS — the data behind the Report menu (Family / Facility /
-- Classroom). Each row captures one documented event. Scope decides which
-- page it lives under.
-- ─────────────────────────────────────────────────────────────────────────────
-- Any authenticated staff can insert + read; admin can delete + update.

BEGIN;

CREATE TABLE IF NOT EXISTS public.facility_incidents (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  scope         text        NOT NULL CHECK (scope IN ('family', 'facility', 'classroom')),
  severity      text        NOT NULL DEFAULT 'info'
                 CHECK (severity IN ('info', 'minor', 'serious', 'critical')),
  child_name    text,
  parent_name   text,
  room_number   int,
  description   text        NOT NULL,
  reported_by   uuid        REFERENCES public.staff(id) ON DELETE SET NULL,
  reported_at   timestamptz NOT NULL DEFAULT now(),
  resolution_notes text,
  resolved_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS facility_incidents_scope_idx
  ON public.facility_incidents (scope, reported_at DESC);

CREATE INDEX IF NOT EXISTS facility_incidents_room_idx
  ON public.facility_incidents (room_number, reported_at DESC)
  WHERE room_number IS NOT NULL;

DROP TRIGGER IF EXISTS facility_incidents_touch_updated_at ON public.facility_incidents;
CREATE TRIGGER facility_incidents_touch_updated_at
  BEFORE UPDATE ON public.facility_incidents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.facility_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS facility_incidents_read ON public.facility_incidents;
CREATE POLICY facility_incidents_read ON public.facility_incidents
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS facility_incidents_insert ON public.facility_incidents;
CREATE POLICY facility_incidents_insert ON public.facility_incidents
  FOR INSERT TO authenticated
  WITH CHECK (
    reported_by IS NULL
    OR reported_by = (SELECT id FROM public.staff WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS facility_incidents_admin_write ON public.facility_incidents;
CREATE POLICY facility_incidents_admin_write ON public.facility_incidents
  FOR UPDATE TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

DROP POLICY IF EXISTS facility_incidents_admin_delete ON public.facility_incidents;
CREATE POLICY facility_incidents_admin_delete ON public.facility_incidents
  FOR DELETE TO authenticated
  USING (public.current_staff_is_books_admin());

COMMIT;

-- Verify
SELECT policyname FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'facility_incidents'
ORDER BY policyname;
