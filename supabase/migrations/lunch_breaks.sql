-- Lunch Breaks
-- One row per staff per day. Break is "in progress" while break_end is NULL.
-- Matches the audit-column pattern from daily_checkins / daily_checkouts so
-- the Time Clock edit flow works the same way across all three tables.

CREATE TABLE IF NOT EXISTS lunch_breaks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date          date NOT NULL DEFAULT (CURRENT_DATE),
  break_start   timestamptz NOT NULL,
  break_end     timestamptz,
  edited_at     timestamptz,
  edit_reason   text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lunch_breaks_staff_date_unique UNIQUE (staff_id, date),
  CONSTRAINT lunch_breaks_end_after_start   CHECK (break_end IS NULL OR break_end >= break_start)
);

CREATE INDEX IF NOT EXISTS lunch_breaks_date_idx  ON lunch_breaks(date);
CREATE INDEX IF NOT EXISTS lunch_breaks_staff_idx ON lunch_breaks(staff_id);

ALTER TABLE lunch_breaks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lunch_breaks' AND policyname = 'Public read lunch_breaks'
  ) THEN
    CREATE POLICY "Public read lunch_breaks"   ON lunch_breaks FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lunch_breaks' AND policyname = 'Public insert lunch_breaks'
  ) THEN
    CREATE POLICY "Public insert lunch_breaks" ON lunch_breaks FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'lunch_breaks' AND policyname = 'Public update lunch_breaks'
  ) THEN
    CREATE POLICY "Public update lunch_breaks" ON lunch_breaks FOR UPDATE USING (true);
  END IF;
END $$;
