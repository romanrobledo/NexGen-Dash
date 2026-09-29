-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILIES PHASE 4 SCHEMA — Communications + Tours.
-- ─────────────────────────────────────────────────────────────────────────────
-- Two tables:
--   * family_communications  — every interaction: call, email, text,
--                              in-person chat, staff note. SMS-send
--                              button on the family page logs into this
--                              table AND fires the GoHighLevel /
--                              Bizsync webhook.
--   * family_tours           — post-enrollment tours (room visits,
--                              parent walk-throughs, follow-up meetings).
--                              Separate from /leads/tours which tracks
--                              pre-enrollment prospect tours.
--
-- RLS gated on current_staff_is_books_admin(). Both tables cascade on
-- family delete + child delete so we don't leave orphans when a family
-- withdraws.

BEGIN;

-- ── family_communications ────────────────────────────────────────────────────
-- `direction` is nullable — a staff note has no direction, but a call or
-- SMS is either inbound (parent → us) or outbound (us → parent).
-- `child_id` optional so a note like "talked with Guzman about Caleb's
-- tantrum" can scope to one kid; leave null for family-wide items.
-- `sms_provider_ref` is where the webhook's message id lands so we can
-- correlate deliveries / bounces later.
CREATE TABLE IF NOT EXISTS public.family_communications (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id          uuid        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id           uuid        REFERENCES public.children(id) ON DELETE SET NULL,
  contact_at         timestamptz NOT NULL DEFAULT now(),
  method             text        NOT NULL,   -- 'call' | 'email' | 'sms' | 'in_person' | 'note'
  direction          text,                   -- 'inbound' | 'outbound' | NULL for notes
  subject            text,
  body               text,
  follow_up_needed   boolean     NOT NULL DEFAULT false,
  follow_up_by       date,
  sms_provider_ref   text,                   -- returned message id from GoHighLevel/Bizsync
  logged_by          uuid        REFERENCES public.staff(id),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_communications_family_id_idx
  ON public.family_communications (family_id, contact_at DESC);

CREATE INDEX IF NOT EXISTS family_communications_follow_up_idx
  ON public.family_communications (follow_up_by) WHERE follow_up_needed;

DROP TRIGGER IF EXISTS family_communications_touch_updated_at ON public.family_communications;
CREATE TRIGGER family_communications_touch_updated_at
  BEFORE UPDATE ON public.family_communications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.family_communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS books_admins_family_communications ON public.family_communications;
CREATE POLICY books_admins_family_communications ON public.family_communications
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

-- ── family_tours ─────────────────────────────────────────────────────────────
-- Post-enrollment tours only. Pre-enrollment prospect tours stay in the
-- separate leads/tours pipeline (they're a different funnel with
-- different qualification signals).
CREATE TABLE IF NOT EXISTS public.family_tours (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      uuid        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  tour_at        timestamptz NOT NULL DEFAULT now(),
  tour_type      text        NOT NULL,   -- 'room_visit' | 'parent_walkthrough' | 'follow_up' | 'other'
  led_by         uuid        REFERENCES public.staff(id),
  notes          text,
  outcome        text,                   -- 'positive' | 'neutral' | 'concern' | NULL
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_tours_family_id_idx
  ON public.family_tours (family_id, tour_at DESC);

DROP TRIGGER IF EXISTS family_tours_touch_updated_at ON public.family_tours;
CREATE TRIGGER family_tours_touch_updated_at
  BEFORE UPDATE ON public.family_tours
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.family_tours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS books_admins_family_tours ON public.family_tours;
CREATE POLICY books_admins_family_tours ON public.family_tours
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

COMMIT;

-- ── VERIFICATION ─────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name IN ('family_communications', 'family_tours')
ORDER BY table_name, ordinal_position;

SELECT tablename, policyname
FROM   pg_policies
WHERE  schemaname = 'public'
  AND  tablename IN ('family_communications', 'family_tours');
