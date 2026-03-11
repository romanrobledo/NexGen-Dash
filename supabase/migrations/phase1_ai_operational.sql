-- ═══════════════════════════════════════════════════════════
-- NexGen OS — Phase 1: AI Chat Foundation + Operational Tracking
-- 7 new tables: chat_sessions, chat_messages, knowledge_base,
--               kpi_definitions, kpi_scores, meetings, memos
-- ═══════════════════════════════════════════════════════════

-- ─── TABLE: chat_sessions ─────────────────────────────────
CREATE TABLE chat_sessions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id    UUID REFERENCES staff(id) ON DELETE SET NULL,
  role_id     TEXT,
  title       TEXT DEFAULT 'New Conversation',
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_sessions_staff ON chat_sessions(staff_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chat_sessions" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert chat_sessions" ON chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chat_sessions" ON chat_sessions FOR UPDATE USING (true);
CREATE POLICY "Public delete chat_sessions" ON chat_sessions FOR DELETE USING (true);

-- ─── TABLE: chat_messages ─────────────────────────────────
CREATE TABLE chat_messages (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content       TEXT NOT NULL,
  token_count   INT,
  model         TEXT,
  context_refs  JSONB DEFAULT '[]'::jsonb,
  metadata      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chat_messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public insert chat_messages" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update chat_messages" ON chat_messages FOR UPDATE USING (true);
CREATE POLICY "Public delete chat_messages" ON chat_messages FOR DELETE USING (true);

-- ─── TABLE: knowledge_base ────────────────────────────────
CREATE TABLE knowledge_base (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  source_page   TEXT,
  role_ids      TEXT[] DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  priority      INT DEFAULT 5,
  version       INT DEFAULT 1,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kb_category ON knowledge_base(category);
CREATE INDEX idx_kb_tags ON knowledge_base USING GIN(tags);
CREATE INDEX idx_kb_role_ids ON knowledge_base USING GIN(role_ids);
CREATE INDEX idx_kb_active ON knowledge_base(is_active);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read knowledge_base" ON knowledge_base FOR SELECT USING (true);
CREATE POLICY "Public insert knowledge_base" ON knowledge_base FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update knowledge_base" ON knowledge_base FOR UPDATE USING (true);
CREATE POLICY "Public delete knowledge_base" ON knowledge_base FOR DELETE USING (true);

-- ─── TABLE: kpi_definitions ───────────────────────────────
CREATE TABLE kpi_definitions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  role_ids          TEXT[] DEFAULT '{}',
  unit              TEXT DEFAULT '',
  target_value      TEXT,
  green_threshold   TEXT,
  yellow_threshold  TEXT,
  red_threshold     TEXT,
  cadence           TEXT DEFAULT 'weekly',
  description       TEXT DEFAULT '',
  is_active         BOOLEAN DEFAULT true,
  sort_order        INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kpi_defs_category ON kpi_definitions(category);
CREATE INDEX idx_kpi_defs_role_ids ON kpi_definitions USING GIN(role_ids);

ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read kpi_definitions" ON kpi_definitions FOR SELECT USING (true);
CREATE POLICY "Public insert kpi_definitions" ON kpi_definitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update kpi_definitions" ON kpi_definitions FOR UPDATE USING (true);
CREATE POLICY "Public delete kpi_definitions" ON kpi_definitions FOR DELETE USING (true);

-- ─── TABLE: kpi_scores ────────────────────────────────────
CREATE TABLE kpi_scores (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_id        UUID NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  value         NUMERIC NOT NULL,
  status        TEXT CHECK (status IN ('green', 'yellow', 'red')),
  notes         TEXT DEFAULT '',
  entered_by    UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kpi_scores_kpi ON kpi_scores(kpi_id);
CREATE INDEX idx_kpi_scores_period ON kpi_scores(period_start);
CREATE UNIQUE INDEX idx_kpi_scores_unique ON kpi_scores(kpi_id, period_start);

ALTER TABLE kpi_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read kpi_scores" ON kpi_scores FOR SELECT USING (true);
CREATE POLICY "Public insert kpi_scores" ON kpi_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update kpi_scores" ON kpi_scores FOR UPDATE USING (true);
CREATE POLICY "Public delete kpi_scores" ON kpi_scores FOR DELETE USING (true);

-- ─── TABLE: meetings ──────────────────────────────────────
CREATE TABLE meetings (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT NOT NULL,
  meeting_type  TEXT NOT NULL,
  cadence       TEXT NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_min  INT,
  status        TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
  attendees     TEXT[] DEFAULT '{}',
  agenda        JSONB DEFAULT '[]'::jsonb,
  outcomes      TEXT DEFAULT '',
  action_items  JSONB DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_meetings_type ON meetings(meeting_type);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read meetings" ON meetings FOR SELECT USING (true);
CREATE POLICY "Public insert meetings" ON meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update meetings" ON meetings FOR UPDATE USING (true);
CREATE POLICY "Public delete meetings" ON meetings FOR DELETE USING (true);

-- ─── TABLE: memos ─────────────────────────────────────────
CREATE TABLE memos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id            UUID REFERENCES staff(id) ON DELETE SET NULL,
  role_id             TEXT,
  week_of             DATE NOT NULL,
  memo_type           TEXT NOT NULL DEFAULT 'weekly' CHECK (memo_type IN ('weekly', 'daily', 'monthly')),
  content             JSONB NOT NULL DEFAULT '{}'::jsonb,
  highlights          TEXT[] DEFAULT '{}',
  concerns            TEXT[] DEFAULT '{}',
  action_items        JSONB DEFAULT '[]'::jsonb,
  ai_summary          TEXT,
  ai_recommendations  JSONB DEFAULT '[]'::jsonb,
  submitted_at        TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_memos_staff ON memos(staff_id);
CREATE INDEX idx_memos_week ON memos(week_of);
CREATE INDEX idx_memos_type ON memos(memo_type);

ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read memos" ON memos FOR SELECT USING (true);
CREATE POLICY "Public insert memos" ON memos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update memos" ON memos FOR UPDATE USING (true);
CREATE POLICY "Public delete memos" ON memos FOR DELETE USING (true);

-- ─── Triggers (reuse existing update_updated_at function) ─
CREATE TRIGGER chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER kpi_definitions_updated_at BEFORE UPDATE ON kpi_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER memos_updated_at BEFORE UPDATE ON memos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
