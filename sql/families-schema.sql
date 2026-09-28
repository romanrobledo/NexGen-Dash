-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILIES + GUARDIANS SCHEMA — Phase 1 of the "one big Families page" build.
-- ─────────────────────────────────────────────────────────────────────────────
-- Two new tables (families, guardians) plus a family_id column on the existing
-- children table so siblings can be grouped into households.
--
-- Later phases add:
--   * family_documents      — paperwork uploads (Supabase Storage bucket)
--   * family_communications — check-in/out log, notes, staff messages
--   * family_tours          — post-enrollment room visits + follow-ups
--   * SMS-send button       — POSTs to GoHighLevel/Bizsync webhook
--
-- Run this in the Supabase SQL editor. Safe to re-run: every CREATE is
-- IF NOT EXISTS, and the ALTER TABLE on children is guarded by an
-- information_schema check.

BEGIN;

-- ── FAMILIES ──────────────────────────────────────────────────────────────────
-- One row per household. Siblings share the row. family_name is the display
-- label ("Barrientos"); primary_last_name is the exact string the auto-populate
-- script grouped children on, kept separate so a family can be renamed for
-- display without breaking the grouping key.
CREATE TABLE IF NOT EXISTS public.families (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name        text        NOT NULL,
  primary_last_name  text        NOT NULL UNIQUE,  -- natural key for auto-populate upsert
  active             boolean     NOT NULL DEFAULT true,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
-- Explicit index still useful for range/prefix queries even with the
-- UNIQUE constraint (unique creates a btree, but keeping the DDL
-- readable + idempotent-safe if someone drops the UNIQUE later).
CREATE INDEX IF NOT EXISTS families_primary_last_name_idx
  ON public.families (primary_last_name);

CREATE INDEX IF NOT EXISTS families_active_idx
  ON public.families (active);

-- ── GUARDIANS ────────────────────────────────────────────────────────────────
-- One row per person (mom, dad, grandma, aunt, family friend). Multiple
-- guardians can be pickup_authorized. `emergency_priority` is a small int
-- (1 = call first) so the emergency-info page can order the contact list.
CREATE TABLE IF NOT EXISTS public.guardians (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id           uuid        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  first_name          text        NOT NULL,
  last_name           text        NOT NULL,
  relationship        text,       -- 'Mother' | 'Father' | 'Grandmother' | 'Guardian' | ...
  phone               text,
  email               text,
  is_primary          boolean     NOT NULL DEFAULT false,
  pickup_authorized   boolean     NOT NULL DEFAULT true,
  emergency_priority  int,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS guardians_family_id_idx
  ON public.guardians (family_id);

CREATE INDEX IF NOT EXISTS guardians_is_primary_idx
  ON public.guardians (family_id, is_primary) WHERE is_primary;

-- ── CHILDREN.family_id ───────────────────────────────────────────────────────
-- Nullable so the migration can proceed before every child is linked; the
-- auto-populate seed script sets this for every current active child.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE  table_schema = 'public' AND table_name = 'children' AND column_name = 'family_id'
  ) THEN
    ALTER TABLE public.children
      ADD COLUMN family_id uuid REFERENCES public.families(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS children_family_id_idx
  ON public.children (family_id);

-- ── updated_at auto-touch triggers ───────────────────────────────────────────
-- Small helper so app writes don't have to remember to bump updated_at.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS families_touch_updated_at ON public.families;
CREATE TRIGGER families_touch_updated_at
  BEFORE UPDATE ON public.families
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS guardians_touch_updated_at ON public.guardians;
CREATE TRIGGER guardians_touch_updated_at
  BEFORE UPDATE ON public.guardians
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── ROW-LEVEL SECURITY ───────────────────────────────────────────────────────
-- Same predicate the Books tables use: current_staff_is_books_admin() lets
-- Founder/Operator/Co-Integrator read and write. Teachers get denied by default
-- (CLOSED). When teacher-side read access is scoped later, we'll add a policy
-- that JOINs children.room → staff assignment; for now the Families page is
-- an admin/director surface.

ALTER TABLE public.families  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS books_admins_families ON public.families;
CREATE POLICY books_admins_families ON public.families
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

DROP POLICY IF EXISTS books_admins_guardians ON public.guardians;
CREATE POLICY books_admins_guardians ON public.guardians
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

COMMIT;

-- ── VERIFICATION ─────────────────────────────────────────────────────────────
-- Quick post-run sanity check. Should return the two new tables, the
-- family_id column on children, and two RLS policies.
SELECT table_name, column_name, data_type
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  ((table_name IN ('families', 'guardians'))
        OR (table_name = 'children' AND column_name = 'family_id'))
ORDER BY table_name, ordinal_position;

SELECT tablename, policyname
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename IN ('families', 'guardians')
ORDER BY tablename, policyname;
