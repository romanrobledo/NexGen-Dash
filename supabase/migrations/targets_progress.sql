-- ═══════════════════════════════════════════════════════════
-- NexGen Targets — Progress Tracking
-- Adds current_value and goal_value columns so each target
-- can track progress (e.g. 14 / 20 New Students → 70%).
-- Run this in the Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════

ALTER TABLE targets ADD COLUMN IF NOT EXISTS current_value INT DEFAULT 0;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS goal_value    INT DEFAULT NULL;

-- Backfill sensible defaults for the seeded rows
UPDATE targets SET goal_value = 20  WHERE label = '20 New Students'      AND goal_value IS NULL;
UPDATE targets SET goal_value = 100 WHERE label = '100 Customer Reviews' AND goal_value IS NULL;
