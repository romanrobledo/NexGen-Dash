-- Add type column to distinguish check-in vs check-out responses
ALTER TABLE checkin_responses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'checkin';

-- Ensure RLS is enabled
ALTER TABLE checkin_responses ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (matching other tables in this project)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checkin_responses' AND policyname = 'Public read checkin_responses') THEN
    CREATE POLICY "Public read checkin_responses" ON checkin_responses FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checkin_responses' AND policyname = 'Public insert checkin_responses') THEN
    CREATE POLICY "Public insert checkin_responses" ON checkin_responses FOR INSERT WITH CHECK (true);
  END IF;
END $$;
