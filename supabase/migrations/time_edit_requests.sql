-- Time Edit Requests
-- Staff submit a request to change check-in, check-out, or lunch times on a
-- past (or today's) entry. Admin reviews and approves or rejects.
-- On approval, an admin applies the change to daily_checkins / daily_checkouts
-- / lunch_breaks (done from the admin review UI, not here).
--
-- One PENDING request per staff per date (enforced by partial unique index).
-- Historical approved/rejected rows accumulate for audit.

CREATE TABLE IF NOT EXISTS time_edit_requests (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id              uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date                  date NOT NULL,

  status                text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','cancelled')),
  reason                text NOT NULL,

  -- Proposed values. NULL = no change requested for that field.
  proposed_checkin_at   timestamptz,
  proposed_checkout_at  timestamptz,
  proposed_lunch_start  timestamptz,
  proposed_lunch_end    timestamptz,

  -- Originals captured at request time so admin can see what's changing.
  original_checkin_at   timestamptz,
  original_checkout_at  timestamptz,
  original_lunch_start  timestamptz,
  original_lunch_end    timestamptz,

  -- Admin resolution
  resolved_by           uuid REFERENCES staff(id) ON DELETE SET NULL,
  resolved_at           timestamptz,
  resolution_note       text,

  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS time_edit_requests_staff_idx  ON time_edit_requests(staff_id);
CREATE INDEX IF NOT EXISTS time_edit_requests_status_idx ON time_edit_requests(status);
CREATE INDEX IF NOT EXISTS time_edit_requests_date_idx   ON time_edit_requests(date);

-- Only one pending request per staff+date. Approved/rejected rows are fine.
CREATE UNIQUE INDEX IF NOT EXISTS time_edit_requests_one_pending_per_day
  ON time_edit_requests(staff_id, date)
  WHERE status = 'pending';

ALTER TABLE time_edit_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_edit_requests' AND policyname = 'Public read time_edit_requests'
  ) THEN
    CREATE POLICY "Public read time_edit_requests"   ON time_edit_requests FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_edit_requests' AND policyname = 'Public insert time_edit_requests'
  ) THEN
    CREATE POLICY "Public insert time_edit_requests" ON time_edit_requests FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'time_edit_requests' AND policyname = 'Public update time_edit_requests'
  ) THEN
    CREATE POLICY "Public update time_edit_requests" ON time_edit_requests FOR UPDATE USING (true);
  END IF;
END $$;
