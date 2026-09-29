-- ─────────────────────────────────────────────────────────────────────────────
-- AVATARS SCHEMA — customer personas for the Revenue Framework.
-- ─────────────────────────────────────────────────────────────────────────────
-- Modeled on the "Public Course Pete" template:
--   Header:  name + subtitle
--   Body:    an "Avatar Profile" summary paragraph
--   Cards:   Identity (key-value pairs), Pain Points, Goals, Objections
--
-- Identity is stored as jsonb because rows vary by persona (Pete has
-- Title/Course type/Revenue/Staff/Age/Reports to; Cassandra will have
-- different fields). Storing free-form { label, value } pairs avoids
-- schema churn every time a new persona wants a different attribute.
--
-- Pains / goals / objections are simple jsonb string arrays — the UI
-- renders one line per entry.
--
-- Editable by books admins; readable by any authenticated staff (personas
-- aren't sensitive PII, and support-tier roles may want to reference them).

BEGIN;

CREATE TABLE IF NOT EXISTS public.avatars (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text        NOT NULL UNIQUE,   -- URL segment, kebab-case
  name         text        NOT NULL,
  subtitle     text,                          -- one-line role/context
  summary      text,                          -- the "Avatar Profile" paragraph
  identity     jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- [{label, value}, ...]
  pains        jsonb       NOT NULL DEFAULT '[]'::jsonb,  -- ["...", "..."]
  goals        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  objections   jsonb       NOT NULL DEFAULT '[]'::jsonb,
  position     int         NOT NULL DEFAULT 0,           -- sort key on the list page
  active       boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT avatars_slug_kebab_ck CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS avatars_active_position_idx
  ON public.avatars (active DESC, position, name);

DROP TRIGGER IF EXISTS avatars_touch_updated_at ON public.avatars;
CREATE TRIGGER avatars_touch_updated_at
  BEFORE UPDATE ON public.avatars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS avatars_read ON public.avatars;
CREATE POLICY avatars_read ON public.avatars
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS avatars_admin_write ON public.avatars;
CREATE POLICY avatars_admin_write ON public.avatars
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

-- ── Seed: CCMS Cassandra ────────────────────────────────────────────────────
-- Draft copy; Roman will edit through the UI. Kept ON CONFLICT DO NOTHING
-- so re-running the migration doesn't clobber edits.
INSERT INTO public.avatars
  (slug, name, subtitle, summary, identity, pains, goals, objections, position)
VALUES (
  'ccms-cassandra',
  'CCMS Cassandra',
  'Subsidized-enrollment parent qualifying through CCMS — juggling work, school pickups, and paperwork deadlines',
  'Cassandra is a working parent whose childcare is subsidized by CCMS (the Texas Child Care Management System). She needs a center that accepts CCMS, keeps her paperwork moving, and won''t drop her when a form is late. She''s not shopping on price — she''s shopping on trust, warmth, and whether the office answers the phone.',
  '[
    {"label": "Household",        "value": "Single parent or dual-income working household"},
    {"label": "Age",              "value": "24–38"},
    {"label": "Kids",             "value": "1–3, ages 0–5"},
    {"label": "Employment",       "value": "Full-time hourly, shift work, or in school"},
    {"label": "Funding",          "value": "CCMS subsidy covers most/all of tuition"},
    {"label": "Discovery",        "value": "Word of mouth, Workforce Solutions referral, Facebook"}
  ]'::jsonb,
  '[
    "Paperwork deadlines she didn''t know about until the letter arrived",
    "Being told ''we don''t accept CCMS'' or ''we''re full for CCMS''",
    "Waitlists that never move",
    "Losing subsidy over a missed re-cert",
    "Feeling judged for using a subsidy",
    "Center closures on days she has to work"
  ]'::jsonb,
  '[
    "Reliable full-time care that accepts her CCMS voucher",
    "A center that reminds her before deadlines instead of after",
    "Warm teachers who know her child by name",
    "A place close to work or home, open the hours she works",
    "Peace of mind that her spot won''t vanish"
  ]'::jsonb,
  '[
    "\"Are you actually taking CCMS right now, or is there a waitlist?\"",
    "\"I''ve been dropped before when my paperwork got behind.\"",
    "\"Do I have to pay anything out of pocket?\"",
    "\"How early can I drop off / how late can I pick up?\"",
    "\"My friend said her center was rough — how do I know yours is different?\""
  ]'::jsonb,
  0
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ── VERIFICATION ────────────────────────────────────────────────────────────
SELECT slug, name, position, active,
       jsonb_array_length(identity)   AS identity_rows,
       jsonb_array_length(pains)      AS pains,
       jsonb_array_length(goals)      AS goals,
       jsonb_array_length(objections) AS objections
FROM   public.avatars
ORDER BY position, name;

SELECT policyname
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename = 'avatars'
ORDER BY policyname;
