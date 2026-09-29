-- ─────────────────────────────────────────────────────────────────────────────
-- OFFERS SCHEMA — full offer pages (Sterling-style typed section blocks).
-- ─────────────────────────────────────────────────────────────────────────────
-- Each offer has header fields (name, subtitle, slug, price headline)
-- plus a jsonb `sections` array. Section shapes are enforced in the app,
-- not in Postgres — the DB is a dumb store so new section types can ship
-- without a migration.
--
-- Supported section types (as of this migration):
--   stance     { heading, paragraphs[], facts?: [{label,value}] }
--   bullets    { heading, intro?, items[] }
--   chapters   { heading, intro?, items[]: {number,title,poweredBy?,tagline?,bullets[]} }
--   streams    { heading, intro?, items[]: {name,style?,bullets[]} }
--   terms      { heading, intro?, blocks[]: {headline,amount?,unitNote?,bullets[]} }
--   table      { heading, intro?, columns[], rows[][], footer? }
--   playbook   { heading, intro?, rows[]: {moment,say} }
--   notes      { heading, items[] }
--   provenance { text }
--
-- Read is open to any authenticated staff; write is admin-only. Same
-- RLS pattern as the avatars table.

BEGIN;

CREATE TABLE IF NOT EXISTS public.offers (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        NOT NULL UNIQUE,
  name           text        NOT NULL,
  subtitle       text,
  summary        text,                          -- optional paragraph rendered under the header
  price_headline text,                          -- e.g. "$4,000"
  price_note     text,                          -- e.g. "per month, flat, all clubs · $0 setup"
  sections       jsonb       NOT NULL DEFAULT '[]'::jsonb,
  position       int         NOT NULL DEFAULT 0,
  active         boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT offers_slug_kebab_ck CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS offers_active_position_idx
  ON public.offers (active DESC, position, name);

DROP TRIGGER IF EXISTS offers_touch_updated_at ON public.offers;
CREATE TRIGGER offers_touch_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS offers_read ON public.offers;
CREATE POLICY offers_read ON public.offers
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS offers_admin_write ON public.offers;
CREATE POLICY offers_admin_write ON public.offers
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

-- ── Seed: 3 Month Scholarship (demo of every major section type) ────────────
-- Uses the "3 Month Scholarship" concept already living in the navItems
-- taxonomy so the seed content is on-brand for NexGen. Roman edits or
-- deletes via the UI; ON CONFLICT prevents clobbering later edits.
INSERT INTO public.offers
  (slug, name, subtitle, summary, price_headline, price_note, sections, position)
VALUES (
  '3-month-scholarship',
  '3 Month Scholarship — Free Goodwill Offer',
  'Three months of tuition on the house — a goodwill offer to families in the neighborhood who need care they can''t start paying for today',
  'The 3 Month Scholarship is how NexGen fills seats without discounting the school. Families who need immediate care get three months at no cost; by month four they''ve seen the classroom, know the teachers, and either continue at full tuition or refer someone who does.',
  '$0 for 3 months',
  'covers tuition, snacks, and enrollment fee · 6 seats per cohort',
  '[
    {
      "type": "stance",
      "heading": "The stance: prove the room, then charge for it",
      "paragraphs": [
        "Discounting tuition tells the neighborhood the sticker price was wrong. Free tells them the room is worth trying. Families who trial rarely leave — and the ones who do become the loudest referrers.",
        "The scholarship pays for itself the first month a graduated family stays at full tuition. Everything after that is upside."
      ],
      "facts": [
        { "label": "Cohort size",        "value": "6 seats / quarter" },
        { "label": "Tuition covered",    "value": "$0 for months 1–3" },
        { "label": "Month 4 conversion", "value": "target 70%" },
        { "label": "Referral rate",      "value": "target 1.5 / graduate" }
      ]
    },
    {
      "type": "bullets",
      "heading": "What the family gets",
      "intro": "Everything a full-paying family gets. No footnotes.",
      "items": [
        "Three full months of care at their assigned classroom",
        "All snacks and meals during care hours",
        "Enrollment fee waived",
        "First-week transition support with the teacher",
        "Same paperwork checklist and background checks as any family",
        "A named point of contact in the office for the full 90 days"
      ]
    },
    {
      "type": "notes",
      "heading": "Guardrails",
      "items": [
        "Not stackable with CCMS — CCMS families use the CCMS pathway",
        "Six seats per quarter across the whole center, not per room",
        "One scholarship per household",
        "Month 4 conversion decision is the family''s; no penalty if they leave"
      ]
    },
    {
      "type": "provenance",
      "text": "Terms locked 2026-09. Cohort sizing and month-4 targets are internal projections, not measured; revisit after the first two cohorts."
    }
  ]'::jsonb,
  0
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ── VERIFICATION ────────────────────────────────────────────────────────────
SELECT slug, name, position, active,
       jsonb_array_length(sections) AS section_count
FROM   public.offers
ORDER BY position, name;

SELECT policyname
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename = 'offers'
ORDER BY policyname;
