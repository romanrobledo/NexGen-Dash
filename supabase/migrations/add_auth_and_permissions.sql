-- ============================================================================
-- Auth & Permissions Migration
-- Adds auth_user_id to staff, creates role_permissions + app_settings tables,
-- and seeds default permission matrix for all 12 roles.
-- ============================================================================

-- 1. Link staff table to Supabase Auth
ALTER TABLE staff ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id);

-- 2. Role permissions table (toggleable per-role access)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role, permission_key)
);

-- 3. App settings table (key-value system config)
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies for role_permissions
CREATE POLICY "Authenticated users can read permissions"
  ON role_permissions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Founder can manage permissions"
  ON role_permissions FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid() AND staff.role = 'founder'
    )
  );

-- 6. RLS policies for app_settings
CREATE POLICY "Authenticated users can read settings"
  ON app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Founder can manage settings"
  ON app_settings FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.auth_user_id = auth.uid() AND staff.role = 'founder'
    )
  );

-- 7. Seed default permissions for all 12 roles
-- Permission keys: dashboard, targets, compass, staff_database, library,
--                  calendars, lesson_plans, families, classrooms, books,
--                  billing, admin_panel

-- FOUNDER — full access
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('founder', 'dashboard', true),
  ('founder', 'targets', true),
  ('founder', 'compass', true),
  ('founder', 'staff_database', true),
  ('founder', 'library', true),
  ('founder', 'calendars', true),
  ('founder', 'lesson_plans', true),
  ('founder', 'families', true),
  ('founder', 'classrooms', true),
  ('founder', 'books', true),
  ('founder', 'billing', true),
  ('founder', 'admin_panel', true);

-- OPERATOR — everything except admin
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('operator', 'dashboard', true),
  ('operator', 'targets', true),
  ('operator', 'compass', true),
  ('operator', 'staff_database', true),
  ('operator', 'library', true),
  ('operator', 'calendars', true),
  ('operator', 'lesson_plans', true),
  ('operator', 'families', true),
  ('operator', 'classrooms', true),
  ('operator', 'books', true),
  ('operator', 'billing', true),
  ('operator', 'admin_panel', false);

-- DIRECTOR
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('director', 'dashboard', true),
  ('director', 'targets', true),
  ('director', 'compass', true),
  ('director', 'staff_database', true),
  ('director', 'library', true),
  ('director', 'calendars', true),
  ('director', 'lesson_plans', true),
  ('director', 'families', true),
  ('director', 'classrooms', true),
  ('director', 'books', false),
  ('director', 'billing', false),
  ('director', 'admin_panel', false);

-- TEACHER
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('teacher', 'dashboard', true),
  ('teacher', 'targets', true),
  ('teacher', 'compass', true),
  ('teacher', 'staff_database', false),
  ('teacher', 'library', true),
  ('teacher', 'calendars', true),
  ('teacher', 'lesson_plans', true),
  ('teacher', 'families', true),
  ('teacher', 'classrooms', true),
  ('teacher', 'books', false),
  ('teacher', 'billing', false),
  ('teacher', 'admin_panel', false);

-- TEACHER-ASSISTANT
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('teacher-assistant', 'dashboard', true),
  ('teacher-assistant', 'targets', true),
  ('teacher-assistant', 'compass', true),
  ('teacher-assistant', 'staff_database', false),
  ('teacher-assistant', 'library', true),
  ('teacher-assistant', 'calendars', true),
  ('teacher-assistant', 'lesson_plans', true),
  ('teacher-assistant', 'families', true),
  ('teacher-assistant', 'classrooms', true),
  ('teacher-assistant', 'books', false),
  ('teacher-assistant', 'billing', false),
  ('teacher-assistant', 'admin_panel', false);

-- FRONT-DESK
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('front-desk', 'dashboard', true),
  ('front-desk', 'targets', true),
  ('front-desk', 'compass', true),
  ('front-desk', 'staff_database', false),
  ('front-desk', 'library', true),
  ('front-desk', 'calendars', true),
  ('front-desk', 'lesson_plans', false),
  ('front-desk', 'families', true),
  ('front-desk', 'classrooms', false),
  ('front-desk', 'books', false),
  ('front-desk', 'billing', true),
  ('front-desk', 'admin_panel', false);

-- HIRING-MANAGER
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('hiring-manager', 'dashboard', true),
  ('hiring-manager', 'targets', true),
  ('hiring-manager', 'compass', true),
  ('hiring-manager', 'staff_database', true),
  ('hiring-manager', 'library', true),
  ('hiring-manager', 'calendars', true),
  ('hiring-manager', 'lesson_plans', false),
  ('hiring-manager', 'families', false),
  ('hiring-manager', 'classrooms', false),
  ('hiring-manager', 'books', false),
  ('hiring-manager', 'billing', false),
  ('hiring-manager', 'admin_panel', false);

-- TOUR-MANAGER
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('tour-manager', 'dashboard', true),
  ('tour-manager', 'targets', true),
  ('tour-manager', 'compass', true),
  ('tour-manager', 'staff_database', false),
  ('tour-manager', 'library', true),
  ('tour-manager', 'calendars', true),
  ('tour-manager', 'lesson_plans', false),
  ('tour-manager', 'families', true),
  ('tour-manager', 'classrooms', false),
  ('tour-manager', 'books', false),
  ('tour-manager', 'billing', false),
  ('tour-manager', 'admin_panel', false);

-- LESSON-PLANS
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('lesson-plans', 'dashboard', true),
  ('lesson-plans', 'targets', true),
  ('lesson-plans', 'compass', true),
  ('lesson-plans', 'staff_database', false),
  ('lesson-plans', 'library', true),
  ('lesson-plans', 'calendars', true),
  ('lesson-plans', 'lesson_plans', true),
  ('lesson-plans', 'families', false),
  ('lesson-plans', 'classrooms', true),
  ('lesson-plans', 'books', false),
  ('lesson-plans', 'billing', false),
  ('lesson-plans', 'admin_panel', false);

-- KITCHEN-MANAGER
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('kitchen-manager', 'dashboard', true),
  ('kitchen-manager', 'targets', true),
  ('kitchen-manager', 'compass', true),
  ('kitchen-manager', 'staff_database', false),
  ('kitchen-manager', 'library', true),
  ('kitchen-manager', 'calendars', true),
  ('kitchen-manager', 'lesson_plans', false),
  ('kitchen-manager', 'families', false),
  ('kitchen-manager', 'classrooms', false),
  ('kitchen-manager', 'books', false),
  ('kitchen-manager', 'billing', false),
  ('kitchen-manager', 'admin_panel', false);

-- ASST-KITCHEN
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('asst-kitchen', 'dashboard', true),
  ('asst-kitchen', 'targets', true),
  ('asst-kitchen', 'compass', true),
  ('asst-kitchen', 'staff_database', false),
  ('asst-kitchen', 'library', true),
  ('asst-kitchen', 'calendars', true),
  ('asst-kitchen', 'lesson_plans', false),
  ('asst-kitchen', 'families', false),
  ('asst-kitchen', 'classrooms', false),
  ('asst-kitchen', 'books', false),
  ('asst-kitchen', 'billing', false),
  ('asst-kitchen', 'admin_panel', false);

-- BUS-DRIVER
INSERT INTO role_permissions (role, permission_key, enabled) VALUES
  ('bus-driver', 'dashboard', true),
  ('bus-driver', 'targets', false),
  ('bus-driver', 'compass', true),
  ('bus-driver', 'staff_database', false),
  ('bus-driver', 'library', true),
  ('bus-driver', 'calendars', true),
  ('bus-driver', 'lesson_plans', false),
  ('bus-driver', 'families', false),
  ('bus-driver', 'classrooms', false),
  ('bus-driver', 'books', false),
  ('bus-driver', 'billing', false),
  ('bus-driver', 'admin_panel', false);

-- 8. Seed default app settings
INSERT INTO app_settings (key, value) VALUES
  ('school_name', '"NexGen School"'),
  ('timezone', '"America/Chicago"'),
  ('branding_primary_color', '"#2563eb"')
ON CONFLICT (key) DO NOTHING;
