-- Daily Check-outs table
-- One row per staff per day. Enforced via UNIQUE (staff_id, date) so the
-- client can rely on the insert failing when a second check-out is attempted.
--
-- Column mapping from the CheckoutPage.jsx form:
--   end_of_day_score    ← rating        (1-10 integer, required)
--   what_accomplished   ← activities    (text, required)
--   challenges          ← improvements  (text, optional)
--   tomorrow_focus      ← tomorrow_plan (text, optional)

CREATE TABLE IF NOT EXISTS daily_checkouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id            uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date                date NOT NULL DEFAULT (CURRENT_DATE),
  end_of_day_score    integer NOT NULL CHECK (end_of_day_score BETWEEN 1 AND 10),
  what_accomplished   text NOT NULL,
  challenges          text,
  tomorrow_focus      text,
  submitted_at        timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT daily_checkouts_staff_date_unique UNIQUE (staff_id, date)
);

CREATE INDEX IF NOT EXISTS daily_checkouts_date_idx    ON daily_checkouts(date);
CREATE INDEX IF NOT EXISTS daily_checkouts_staff_idx   ON daily_checkouts(staff_id);

-- RLS — match the project's existing open-policy pattern.
ALTER TABLE daily_checkouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_checkouts' AND policyname = 'Public read daily_checkouts'
  ) THEN
    CREATE POLICY "Public read daily_checkouts"   ON daily_checkouts FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'daily_checkouts' AND policyname = 'Public insert daily_checkouts'
  ) THEN
    CREATE POLICY "Public insert daily_checkouts" ON daily_checkouts FOR INSERT WITH CHECK (true);
  END IF;
END $$;
