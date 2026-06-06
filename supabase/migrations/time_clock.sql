-- Time Clock — edit tracking + payroll submission state.
--
-- 1. Adds audit columns to daily_checkins / daily_checkouts so we can see
--    when a staff member edited their own time entry and why.
-- 2. Creates payroll_submissions, one row per (staff_id, date), tracking
--    the lifecycle of a day's timesheet through the payroll pipeline.

-- ── Edit tracking on check-in / check-out rows ──────────────────────────

ALTER TABLE daily_checkins  ADD COLUMN IF NOT EXISTS edited_at   timestamptz;
ALTER TABLE daily_checkins  ADD COLUMN IF NOT EXISTS edit_reason text;

ALTER TABLE daily_checkouts ADD COLUMN IF NOT EXISTS edited_at   timestamptz;
ALTER TABLE daily_checkouts ADD COLUMN IF NOT EXISTS edit_reason text;

-- ── Payroll submissions ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payroll_submissions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date            date NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'submitted', 'synced', 'failed')),
  submitted_at    timestamptz,
  synced_at       timestamptz,
  webhook_response text,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payroll_submissions_staff_date_unique UNIQUE (staff_id, date)
);

CREATE INDEX IF NOT EXISTS payroll_submissions_date_idx   ON payroll_submissions(date);
CREATE INDEX IF NOT EXISTS payroll_submissions_staff_idx  ON payroll_submissions(staff_id);
CREATE INDEX IF NOT EXISTS payroll_submissions_status_idx ON payroll_submissions(status);

ALTER TABLE payroll_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payroll_submissions' AND policyname = 'Public read payroll_submissions'
  ) THEN
    CREATE POLICY "Public read payroll_submissions"   ON payroll_submissions FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payroll_submissions' AND policyname = 'Public insert payroll_submissions'
  ) THEN
    CREATE POLICY "Public insert payroll_submissions" ON payroll_submissions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'payroll_submissions' AND policyname = 'Public update payroll_submissions'
  ) THEN
    CREATE POLICY "Public update payroll_submissions" ON payroll_submissions FOR UPDATE USING (true);
  END IF;
END $$;
