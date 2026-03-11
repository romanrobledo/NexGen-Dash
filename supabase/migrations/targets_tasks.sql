-- ═══════════════════════════════════════════════════════════
-- NexGen Targets & Tasks — Supabase Migration
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── TABLE: targets ─────────────────────────────────────
CREATE TABLE targets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label       TEXT NOT NULL,
  detail      TEXT DEFAULT '',
  icon        TEXT DEFAULT '🎯',
  color       TEXT DEFAULT '#2563EB',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read targets" ON targets FOR SELECT USING (true);
CREATE POLICY "Public insert targets" ON targets FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update targets" ON targets FOR UPDATE USING (true);
CREATE POLICY "Public delete targets" ON targets FOR DELETE USING (true);

-- ─── TABLE: priorities ──────────────────────────────────
CREATE TABLE priorities (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#2563EB',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read priorities" ON priorities FOR SELECT USING (true);
CREATE POLICY "Public insert priorities" ON priorities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update priorities" ON priorities FOR UPDATE USING (true);
CREATE POLICY "Public delete priorities" ON priorities FOR DELETE USING (true);

-- ─── TABLE: tasks ───────────────────────────────────────
CREATE TABLE tasks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  priority_id   UUID NOT NULL REFERENCES priorities(id) ON DELETE CASCADE,
  task_number   INT NOT NULL,
  name          TEXT NOT NULL,
  objective     TEXT DEFAULT '',
  time_estimate TEXT DEFAULT '',
  timeline      TEXT DEFAULT 'Ongoing',
  owner         TEXT DEFAULT '',
  owner_note    TEXT DEFAULT '',
  tools         JSONB DEFAULT '[]'::jsonb,
  notes         JSONB DEFAULT '[]'::jsonb,
  steps         JSONB DEFAULT '[]'::jsonb,
  cross_links   JSONB DEFAULT '[]'::jsonb,
  is_completed  BOOLEAN DEFAULT false,
  completed_at  TIMESTAMPTZ,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_priority_id ON tasks(priority_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public insert tasks" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tasks" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete tasks" ON tasks FOR DELETE USING (true);

-- ─── updated_at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER priorities_updated_at BEFORE UPDATE ON priorities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════

-- ─── Targets ────────────────────────────────────────────
INSERT INTO targets (label, detail, icon, color, sort_order) VALUES
  ('20 New Students', 'Robyn + Robyne + Ed', '🎯', '#2563EB', 1),
  ('100 Customer Reviews', 'Google / Facebook — social proof', '⭐', '#EAB308', 2);

-- ─── Priorities ─────────────────────────────────────────
INSERT INTO priorities (code, name, color, sort_order) VALUES
  ('P1', 'Bizsync + Role Integration', '#2563EB', 1),
  ('P2', 'Memo System + AI Feedback Loop', '#7C3AED', 2),
  ('P3', 'Customer Success Feedback Push', '#059669', 3),
  ('P4', 'Spring Break Bus Project', '#D97706', 4),
  ('P5', 'Facility Improvement — Turf / Grass', '#10B981', 5),
  ('P6', 'Appointment Booking Support Role', '#EC4899', 6),
  ('P7', 'Course Creation for Expansion', '#6366F1', 7);

-- ─── Tasks ──────────────────────────────────────────────
-- P1 Task 1
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, owner_note, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P1'), 1,
  'Officially Onboard New Team Member',
  'Clean onboarding with strict role clarity and facility disconnect.',
  '4-6 hours', 'Immediate', 'Andrea', 'Target = 5 Booked Tours / week',
  '["Slack", "ChatGPT", "Notion", "Bizsync"]',
  '["Record the actions of the role — you do the role first, then hand it off", "Connect onboarding to Compass: What am I doing? How do I do it? How do I know? Where do I go?", "KPIs + Memos + Dashboard all connected"]',
  '["Finalize all Loom training videos (How-To''s for her role)", "Create structured training folder: Bizsync Training, Automations (adjust for role), Memos System, Check-In/Check-Out System", "Upload all Loom videos to training folders", "Create onboarding checklist: Slack setup, tool access, review training videos, first 7-day deliverables", "Send Slack introduction message: remote-only role, clear reporting structure", "Schedule key meetings: 30-min kickoff + weekly standing meeting"]',
  '[{"label":"What Do I Do","path":"/dashboard/what-do-i-do"},{"label":"How Do I Do It","path":"/dashboard/how-do-i-do-it"},{"label":"How Do I Know","path":"/dashboard/how-do-i-know"},{"label":"Where Do We Go","path":"/dashboard/where-to-go"},{"label":"Onboarding Library","path":"/trainings/onboarding"}]',
  1
);

-- P1 Task 2
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P1'), 2,
  'Build Bizsync Tool Walkthrough Video',
  'Robyn understands exactly when to use each Bizsync tool.',
  '2-3 hours', 'Immediate', 'You (Founder)',
  '["Notion", "Notebook LLM", "Kollab", "Loom"]',
  '["Tool priority: Notion 1st → Notebook LLM 2nd → Kollab 3rd", "Include check-in/out forms walkthrough", "Using Kollab for getting certificates"]',
  '["Outline tools: Slack, SurveyMonkey, Google Forms, check-in/out forms, Sheets, Memos, AI Bot workflow", "Record comprehensive Loom walkthrough", "Add real examples: Trigger → Automation → Response flow, manual vs. automated", "Upload to training folder", "Confirm Robyn watches and demonstrates understanding"]',
  '[{"label":"How Do I Do It","path":"/dashboard/how-do-i-do-it"},{"label":"Tools Library","path":"/trainings/tools"}]',
  2
);

-- P2 Task 3
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P2'), 3,
  'Build Weekly Memo System',
  'Central command system that accumulates data and generates AI-driven next steps.',
  '5-7 hours', 'Week 1-2', 'You (Founder)',
  '["Google Forms", "Google Sheets", "AI Bot", "Slack"]',
  '["This is a Process — systematize it fully", "Schedule review with Robyn / Team if needed after memo submission"]',
  '["Create Google Forms: Check-in (start of day/week) + Check-out (end of day/week)", "Connect forms to Google Sheet", "Create Sheet tabs: Raw inputs, Weekly summary, KPI tracking", "Build AI bot prompt: targets, guidelines, last week''s performance, auto-generate recommendations", "Automate weekly memo generation", "Schedule weekly review block with Robyn / Team"]',
  '[{"label":"What Do We Talk About","path":"/dashboard/what-do-we-talk-about"},{"label":"When Do We Meet","path":"/dashboard/when-do-we-meet"}]',
  3
);

-- P2 Task 4
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P2'), 4,
  'Create Check-In / Check-Out System (Admin Level)',
  'Faster feedback loops for leadership decisions.',
  '3-4 hours', 'Week 1-2', 'You (Founder)',
  '["Google Forms", "Google Sheets"]',
  '["Same process as memo system — systematize"]',
  '["Finalize form questions (daily pulse check)", "Test full submission flow end-to-end", "Ensure Sheet correctly logs: Date, User, Category", "Build weekly compiled memo template", "Train Robyn and Andrea on daily usage"]',
  '[{"label":"What Do We Talk About","path":"/dashboard/what-do-we-talk-about"},{"label":"Important Metrics","path":"/dashboard/important-metrics"}]',
  4
);

-- P2 Task 5
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P2'), 5,
  'Build Teacher Check-In / Check-Out (After 30 Days)',
  'Mold teacher routine based on real data patterns.',
  '4-6 hours', 'After 30 Days', 'You (Founder)',
  '["Google Forms", "Google Sheets"]',
  '["Wait for 30 days of admin-level data collection first"]',
  '["Collect 30 days of admin-level inputs first", "Identify patterns: Bottlenecks, Emotional triggers, Time drains", "Draft teacher-specific version of the form", "Pilot with 1-2 teachers for feedback", "Adjust based on pilot results", "Roll out facility-wide"]',
  '[{"label":"What Do We Talk About","path":"/dashboard/what-do-we-talk-about"}]',
  5
);

-- P3 Task 6
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, owner_note, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P3'), 6,
  'Launch Customer Success Feedback Initiative',
  'Identify real community pain points and improve messaging.',
  '4-5 hrs + ongoing', 'Week 2-3', 'Robyn+', 'ASAP — SMS in GHL',
  '["SurveyMonkey", "Slack", "GHL (SMS)", "Email"]',
  '["ASAP with Robyn — this feeds the 100 Reviews target", "Use SMS in GoHighLevel for parent outreach"]',
  '["Design SurveyMonkey survey: Satisfaction (1-10), What would make this 10/10?, Biggest frustration, Why NexGen", "Push through channels: Slack reminder for in-person prompts, SMS blast, Email campaign", "Block weekly review time: review results, identify themes, adjust messaging + ads"]',
  '[{"label":"Important Metrics","path":"/dashboard/important-metrics"},{"label":"What Do We Talk About","path":"/dashboard/what-do-we-talk-about"}]',
  6
);

-- P4 Task 7
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P4'), 7,
  'Plan Bus A/C Repair + Painting + Stickers',
  'Bundle all bus improvements during Spring Break downtime.',
  '2-3 hrs (mgmt)', 'Before Break', 'Dad + Vendors',
  '[]',
  '["Connect with Repair vendor", "Connect with Sticker vendor", "Coordinate with Dad"]',
  '["Confirm Spring Break dates", "Get A/C repair quote and timeline", "Get paint estimate from vendor", "Design updated sticker branding", "Approve vendor and lock in installation week", "Inspect buses after completion (quality check)"]',
  '[]',
  7
);

-- P5 Task 8
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P5'), 8,
  'Replace Rocks with Better Outdoor Solution',
  'Upgrade outdoor aesthetics and child safety.',
  '1-2 hrs (mgmt)', 'Week 2-4', 'Dad + Vendor',
  '[]',
  '["Get with Dad to coordinate"]',
  '["Call turf vendor (end the phone tag)", "Get multiple quotes: Turf, Natural grass, Alternatives", "Compare on: Cost, Maintenance, Drainage", "Decide on solution and get approval", "Schedule installation"]',
  '[]',
  8
);

-- P6 Task 9
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, owner_note, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P6'), 9,
  'Structure Remote Appointment Booker Role',
  'Remove distractions from Robyn and create a dedicated booking function.',
  '3-4 hours', 'Week 2-3', 'Andrea', 'Feeds into 20 New Students target',
  '["CRM", "Slack"]',
  '["Andrea takes ownership of this role", "Directly connected to the 20 New Students enrollment target"]',
  '["Define clear KPIs: Daily call quota, Follow-up cadence, Booking targets", "Provide call scripts and objection handling", "Give CRM access with proper permissions", "Track weekly: Calls made, Appointments booked, Show rate", "Establish weekly performance review cadence"]',
  '[{"label":"What Do I Do","path":"/dashboard/what-do-i-do"},{"label":"Important Metrics","path":"/dashboard/important-metrics"}]',
  9
);

-- P7 Task 10
INSERT INTO tasks (priority_id, task_number, name, objective, time_estimate, timeline, owner, tools, notes, steps, cross_links, sort_order)
VALUES (
  (SELECT id FROM priorities WHERE code = 'P7'), 10,
  'Turn Training Into Repeatable Course',
  'Use for next facility opening and scalable onboarding.',
  '8-12 hours', 'Ongoing', 'Robyn + Andrea + Ed/VA',
  '["Loom", "Notion", "LMS"]',
  '["For Robyn + Andrea + Ed/VA", "Build incrementally — this is ongoing work"]',
  '["Organize Loom videos into modules: Bizsync Tools, Memo System, Customer Success, Admin Systems", "Create simple module checklist per section", "Store inside Notion or LMS platform", "Test with current team for gaps", "Refine based on feedback"]',
  '[{"label":"Library","path":"/trainings"},{"label":"How Do I Do It","path":"/dashboard/how-do-i-do-it"}]',
  10
);
