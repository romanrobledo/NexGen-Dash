-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILIES AUTO-POPULATE — SQL version of seed-families-autopopulate.mjs.
-- ─────────────────────────────────────────────────────────────────────────────
-- The .mjs script couldn't see any children because the anon key was
-- blocked by the new RLS policies. This runs as the postgres role
-- (Supabase SQL editor) which bypasses RLS, so it just works.
--
-- Rules (same as the .mjs version):
--   1. Group active children by surname derived from full_name.
--        "Barrientos, Raelynn"  → "Barrientos"
--        "Ariel Mata Alaniz"    → "Alaniz"      (last whitespace token)
--        "Emma Sanchez"         → "Sanchez"
--   2. Upsert one family per surname (natural key = primary_last_name,
--      the UNIQUE constraint added in families-schema.sql).
--   3. Link every unlinked child to their family via children.family_id.
--   4. Skip children that already have a family_id set — those were
--      manually curated and stay put.
--
-- Safe to re-run: INSERT ... ON CONFLICT DO NOTHING + UPDATE that only
-- touches rows where family_id IS NULL.
--
-- After it runs, the verification SELECTs at the bottom print:
--   * total families created
--   * total children linked
--   * per-surname counts (for spot-checking that the Guzmans landed together)

BEGIN;

-- ── Step 1: create a family row per distinct surname ─────────────────────────
INSERT INTO public.families (family_name, primary_last_name, active)
SELECT DISTINCT
  surname AS family_name,
  surname AS primary_last_name,
  true
FROM (
  SELECT
    CASE
      WHEN full_name ~ ','
        THEN trim(split_part(full_name, ',', 1))
      ELSE trim(regexp_replace(full_name, '.*\s+', ''))
    END AS surname
  FROM public.children
  WHERE active = true
    AND family_id IS NULL
    AND full_name IS NOT NULL
    AND full_name <> ''
) src
WHERE surname IS NOT NULL AND surname <> ''
ON CONFLICT (primary_last_name) DO NOTHING;

-- ── Step 2: link each child to their family ──────────────────────────────────
UPDATE public.children c
SET family_id = f.id
FROM public.families f
WHERE c.active = true
  AND c.family_id IS NULL
  AND f.primary_last_name = CASE
    WHEN c.full_name ~ ','
      THEN trim(split_part(c.full_name, ',', 1))
    ELSE trim(regexp_replace(c.full_name, '.*\s+', ''))
  END;

COMMIT;

-- ── VERIFICATION ─────────────────────────────────────────────────────────────
-- 1. Total families + children linked.
SELECT
  (SELECT count(*) FROM public.families)                        AS total_families,
  (SELECT count(*) FROM public.children WHERE family_id IS NOT NULL) AS children_linked,
  (SELECT count(*) FROM public.children WHERE active = true)    AS total_active_children;

-- 2. Per-surname count — eyeball for Guzmans (should be 6+), Garcias (5+),
--    Barrientos (3), Alaniz-Mata (2), etc. If a surname you expect isn't
--    here or has the wrong count, tell Claude and we'll adjust.
SELECT
  f.family_name,
  f.primary_last_name,
  count(c.id) AS child_count
FROM   public.families f
LEFT JOIN public.children c ON c.family_id = f.id
GROUP BY f.id, f.family_name, f.primary_last_name
ORDER BY count(c.id) DESC, f.family_name;

-- 3. Any active children still unlinked? Should be 0. If not, they
--    have unparseable names or a family_id already set.
SELECT id, full_name, room_number
FROM   public.children
WHERE  active = true AND family_id IS NULL;
