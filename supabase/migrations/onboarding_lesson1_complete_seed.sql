-- ============================================================================
-- ONBOARDING MODULE 1 — LESSON 1: INTRODUCTION TO NEXGEN (REVISED & COMPLETE)
-- ============================================================================
-- Replaces ALL prior Lesson 1 content with the complete 8-section version
-- 8 topics, 10 steps, ~60 minutes total
-- ============================================================================

-- STEP 1: Clean up ALL old topics and steps for this subject
DELETE FROM training_steps WHERE topic_id IN (
  SELECT id FROM training_topics WHERE subject_id = 'a1000000-0000-0000-0000-000000000001'
);
DELETE FROM training_topics WHERE subject_id = 'a1000000-0000-0000-0000-000000000001';

-- STEP 2: Update the subject
UPDATE training_subjects SET
  title = 'Lesson 1: Introduction to NexGen',
  description = 'Your complete introduction to NexGen — who we are, what we stand for, where everything is, how your first week works, and how payroll and benefits operate. Everything you need before your first shift.',
  icon = 'book-open',
  section = 'onboarding',
  trs_category = NULL,
  order_index = 1
WHERE id = 'a1000000-0000-0000-0000-000000000001';


-- ============================================================================
-- STEP 3: Insert 8 Topics
-- ============================================================================

INSERT INTO training_topics (id, subject_id, title, order_index) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Learning Objectives', 1),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'The NexGen Story', 2),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mission, Vision & Core Values', 3),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Tour of the Facility & Classrooms', 4),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Your First Week Checklist', 5),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 'Time Clock & Payroll', 6),
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 'Benefits & Team Culture', 7),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 'Knowledge Check', 8)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;


-- ============================================================================
-- STEP 4: Insert Steps (10 total across 8 topics)
-- ============================================================================


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 1: Learning Objectives — 1 step (5 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'Lesson Overview',
  '<div style="margin-bottom: 24px; padding: 16px 20px; background: #F0FDF4; border-left: 3px solid #16A34A; border-radius: 8px;">
  <strong style="color: #166534;">LESSON OVERVIEW</strong>
  <p style="margin-top: 8px; color: #14532D;">This is the most comprehensive first-day lesson in the NexGen onboarding program. By the time you complete it, you will understand our mission, know every room in the building, know exactly how your first five days are structured, and be set up in payroll. Nothing should be a surprise after this.</p>
</div>

<h3>Upon completing this lesson, you will be able to:</h3>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>01 — Articulate NexGen''s mission, vision, and five core values in your own words</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">The single most important outcome of Day 1. You should be able to explain our mission to a parent without reading from a card.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>02 — Identify every room in the building, its age group, and its capacity</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">You will be responsible for knowing where children are and who is in each space at all times. The facility tour is safety-critical, not just orientation.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>03 — Complete your Day 1 checklist and understand your Day 2–5 goals</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Your first week is structured intentionally. Understanding what is expected on each day removes ambiguity and sets you up for a strong start.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>04 — Understand how to use the NexGen Time Clock system correctly from your first shift</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Payroll accuracy depends on correct clock-in/out behavior. Errors create administrative work and delays. Knowing the system on Day 1 prevents both.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>05 — Know your pay schedule, payroll process, and team benefits</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Financial clarity is a professional courtesy. You will know exactly when you get paid, how to correct an error, and what NexGen offers its team beyond a paycheck.</p>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 8px;">
  <strong style="color: #92400E;">WHY THIS LESSON COMES FIRST</strong>
  <p style="margin-top: 8px; color: #78350F;">Everything else in this onboarding — safety protocols, curriculum planning, family communication — is only meaningful when you understand the ''why'' behind it. But you also cannot function on Day 1 without knowing where things are and how systems work. This lesson gives you both.</p>
</div>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 2: The NexGen Story — 1 step (5 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000002',
  'Our Founding & Commitment',
  '<p>NexGen School for Early Life Foundations was built on a belief that early childhood education in Harlingen deserved more — more intentionality, more rigor, and more heart. What began as a vision for a different kind of childcare center has grown into a facility that families choose because they see the difference the moment they walk through the door.</p>

<blockquote style="margin: 24px 0; padding: 20px 24px; background: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "We didn''t build NexGen to compete with other childcare centers. We built it to raise the bar for what families in this community should expect — and what children deserve from day one."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">— NexGen Founding Vision</span>
</blockquote>

<h3>A Timeline of Our Commitment</h3>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE VISION</p>
  <strong>Founded in Harlingen, TX</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Established in the Rio Grande Valley to serve families who expect more during the most critical developmental window — birth through five. The Valley deserved a school, not just a babysitter.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE COMMITMENT</p>
  <strong>Pursuing Texas Rising Star 4-Star Certification</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">TRS 4-star is the highest voluntary quality recognition in Texas. We pursue it not for a plaque — but because every standard it requires makes our children''s experience measurably better.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE STANDARD</p>
  <strong>Building Systems That Sustain Excellence</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">NexGen invests in staff training, curriculum frameworks, documentation systems, and family partnerships that most centers never build. That investment is why you''re in a structured onboarding program right now.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">TODAY</p>
  <strong>You Are Part of What Comes Next</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">The team you join is the reason families trust us with the most important people in their lives. The standard you uphold every day is what makes this mission real.</p>
</div>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 3: Mission, Vision & Core Values — 2 steps (5 + 5 min)
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Mission & Vision Statements
INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000003',
  'Mission & Vision Statements',
  '<h3>Mission Statement</h3>

<blockquote style="margin: 20px 0; padding: 20px 24px; background: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "To nurture every child''s growth through intentional teaching, safe and stimulating environments, and genuine partnership with families — preparing young minds for a lifetime of learning."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">NexGen School for Early Life Foundations</span>
</blockquote>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Nurture every child''s growth</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">ALL children — regardless of ability, background, or learning style. No child is invisible here.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Intentional teaching</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Everything has a developmental purpose. We don''t watch children — we teach them, with intention every day.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Safe and stimulating environments</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Safety is the floor, not the ceiling. Above it we build rich, joyful, curiosity-driven spaces.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Genuine partnership with families</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Parents are co-educators. We communicate proactively, listen genuinely, and build trust through consistency.</p>
</div>

<h3 style="margin-top: 32px;">Vision Statement</h3>

<blockquote style="margin: 20px 0; padding: 20px 24px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "To be the most trusted name in early childhood education in our community — the school families seek out, staff are proud to grow within, and children remember as where they first discovered what they could do."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">NexGen School for Early Life Foundations</span>
</blockquote>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;

-- Step 2: Our Five Core Values
INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000003',
  'Our Five Core Values',
  '<p>These are not decorations on a wall. They are the lens through which every decision at NexGen is made.</p>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #2563EB; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #2563EB; margin: 0 0 8px 0;">01 &nbsp; GROWTH ABOVE ALL</h4>
  <p style="margin: 0;">Every child, every family, every team member is capable of more. We create the conditions for growth — and never stop growing ourselves.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #D97706; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #D97706; margin: 0 0 8px 0;">02 &nbsp; INTENTIONALITY</h4>
  <p style="margin: 0;">Every routine, room setup, and interaction has a developmental purpose. We are deliberate, always. Ask yourself daily: what is the learning goal right now?</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #059669; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #059669; margin: 0 0 8px 0;">03 &nbsp; GENUINE PARTNERSHIP</h4>
  <p style="margin: 0;">With families, with colleagues, with the community. We do not operate in silos. Partnership makes the work sustainable and outcomes extraordinary.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #DC2626; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #DC2626; margin: 0 0 8px 0;">04 &nbsp; EXCELLENCE AS A STANDARD</h4>
  <p style="margin: 0;">Good enough is never the goal. Not in how we set up a reading center, not in how we document an observation, not in how we greet a family at 7am.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #7C3AED; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #7C3AED; margin: 0 0 8px 0;">05 &nbsp; HEART-CENTERED CARE</h4>
  <p style="margin: 0;">At the end of every procedure and policy is a child who needs to feel safe, seen, and loved. That is the job. Everything else is in service of that.</p>
</div>',
  5, true, 2
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 4: Tour of the Facility & Classrooms — 1 step (10 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000005',
  'b1000000-0000-0000-0000-000000000004',
  'Facility Floor Plan & Classroom Guide',
  '<p>Before you step into a classroom, you need to know the building. Memorize it — knowing where children are at all times is a safety responsibility, not just orientation.</p>

<h3>Classroom Reference Guide</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
  <thead>
    <tr style="background: #F1F5F9;">
      <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #E2E8F0; width: 90px;">Room</th>
      <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #E2E8F0;">Age Group</th>
      <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #E2E8F0; width: 130px;">Capacity</th>
      <th style="padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #E2E8F0;">Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-weight: 600; color: #DC2626;">Room 1</td>
      <td style="padding: 12px;">Infants — 0 to 11 months</td>
      <td style="padding: 12px;">4 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Lowest ratio. Highest interaction demand. Every care routine is a teaching moment.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
      <td style="padding: 12px; font-weight: 600; color: #EA580C;">Room 2</td>
      <td style="padding: 12px;">Mobile Infants — 12 to 17 months</td>
      <td style="padding: 12px;">3 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Crawling to walking stage. Floor-level exploration zone required.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-weight: 600; color: #D97706;">Room 3</td>
      <td style="padding: 12px;">Young Toddlers — 18 to 23 months</td>
      <td style="padding: 12px;">5 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Language explosion stage. Parallel play. High sensory needs.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
      <td style="padding: 12px; font-weight: 600; color: #D97706;">Room 4</td>
      <td style="padding: 12px;">Toddlers — 2 Years</td>
      <td style="padding: 12px;">6 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Possessiveness peaks. Multiple sets of same toy. Transition signals essential.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-weight: 600; color: #16A34A;">Room 5</td>
      <td style="padding: 12px;">Preschool — 3 Years</td>
      <td style="padding: 12px;">8 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Cooperative play emerging. Dramatic play center primary. Follow their ''why?'' questions.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
      <td style="padding: 12px; font-weight: 600; color: #16A34A;">Room 6</td>
      <td style="padding: 12px;">Pre-K — 4 Years</td>
      <td style="padding: 12px;">9 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Literacy and numeracy readiness. Project-based learning. Writing center active.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-weight: 600; color: #7C3AED;">Room 7</td>
      <td style="padding: 12px;">Afterschool — 4 Year Olds</td>
      <td style="padding: 12px;">9 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Afternoon program. Snack, homework support, enrichment activities.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
      <td style="padding: 12px; font-weight: 600; color: #7C3AED;">Room 8</td>
      <td style="padding: 12px;">Afterschool — 5 Year Olds</td>
      <td style="padding: 12px;">10 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Kindergarteners. Skill reinforcement and project-based afternoon enrichment.</td>
    </tr>
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-weight: 600; color: #7C3AED;">Room 9</td>
      <td style="padding: 12px;">Afterschool — 6 to 8 Year Olds</td>
      <td style="padding: 12px;">11 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Elementary. Homework completion, STEM projects, social skills development.</td>
    </tr>
    <tr>
      <td style="padding: 12px; font-weight: 600; color: #7C3AED;">Room 10</td>
      <td style="padding: 12px;">Afterschool — 9 to 13 Year Olds</td>
      <td style="padding: 12px;">11 kids / 1 Teacher</td>
      <td style="padding: 12px; color: #475569;">Pre-teen program. Independent work time, leadership activities, mentorship.</td>
    </tr>
  </tbody>
</table>

<div style="margin-top: 24px; padding: 16px 20px; background: #F0FDF4; border-left: 3px solid #16A34A; border-radius: 8px;">
  <strong style="color: #166534;">KEY SHARED SPACES</strong>
  <p style="margin-top: 8px; color: #14532D; font-size: 14px;"><strong>Main Office</strong> — the operational hub: enrollment, family check-in, director access, and all administrative functions. <strong>Teacher Workroom</strong> — lesson planning, copying, and materials prep. <strong>Principal''s Office</strong> — confidential meetings and staff reviews. <strong>Outdoor Flex &amp; Flex Room</strong> — multi-purpose spaces for outdoor play and special programs. <strong>Indoor Gym</strong> — Dance and Karate programs.</p>
</div>',
  10, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 5: Your First Week Checklist — 1 step (5 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000005',
  'Day 1 Checklist & Day 2–5 Goals',
  '<p>Your first week is designed intentionally. Each day has a focus area. By Day 5 you will have your baseline orientation complete, be set up in all systems, and have had your first real experience in the classroom.</p>

<h3>Day 1 — Orientation &amp; Foundation</h3>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Complete Lesson 1: Introduction to NexGen</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">This document — mission, values, facility, payroll, and benefits.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Receive and review your Employee Handbook</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Sign acknowledgement form and return to director before leaving.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Complete all new-hire HR paperwork</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">W-4, I-9, direct deposit authorization, emergency contact form.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Set up NexGen app account and clock in/out</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Your director will create your account. Complete a test clock-in before you leave.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Facility walkthrough with director or lead</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Walk every room, every exit, every emergency station. Ask questions.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Meet your immediate team</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Introduce yourself to every staff member on shift today. Learn names.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #2563EB; background: #EFF6FF; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Priority</span>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
  <div>
    <strong>Review posted emergency procedures in your room</strong>
    <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Fire exit route, lockdown protocol, and reunification procedure.</p>
  </div>
  <span style="font-size: 11px; font-weight: 700; color: #DC2626; background: #FEF2F2; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">Required</span>
</div>

<h3 style="margin-top: 28px;">Day 2–5 Goals</h3>

<div style="margin: 12px 0; padding: 14px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">DAY 2</p>
  <p style="margin: 0; color: #334155; font-size: 14px;">Shadow your lead teacher for the full shift. Observe how transitions, routines, and interactions are managed. Take notes. Ask questions.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">DAY 3</p>
  <p style="margin: 0; color: #334155; font-size: 14px;">Complete Lessons 2 and 3 (The NexGen Standard + Your Role &amp; Your Impact). Begin actively participating in routines under lead teacher guidance.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">DAY 4</p>
  <p style="margin: 0; color: #334155; font-size: 14px;">Complete your 30-day check-in scheduling with the director. Begin Module 2 (Child Development). Lead at least one transition or routine independently.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">DAY 5</p>
  <p style="margin: 0; color: #334155; font-size: 14px;">Review your first week with your facilitator. Reflect on: what is natural, what needs growth, what questions remain. Confirm upcoming training schedule.</p>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 8px;">
  <strong style="color: #92400E;">THE FIRST WEEK IS AN OBSERVATION — BOTH WAYS</strong>
  <p style="margin-top: 8px; color: #78350F; font-size: 14px;">You are learning NexGen during your first week. NexGen is also learning you. Show up on time, ask good questions, follow direction without resistance, and bring your best attitude even on days that feel overwhelming. The habits you build in Week 1 set the pattern for everything that follows.</p>
</div>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 6: Time Clock & Payroll — 2 steps (10 + 5 min)
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: How to Clock In and Out
INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000007',
  'b1000000-0000-0000-0000-000000000006',
  'How to Clock In & Out — Step by Step',
  '<p>NexGen uses an integrated Time Clock &amp; Payroll Sync system built directly into the NexGen staff app. Your clock-ins and clock-outs are tracked in real time, tied to your payroll record, and synced to our payroll processing system. Accuracy is your responsibility.</p>

<h3>How to Clock In and Out</h3>

<div style="margin: 16px 0; padding: 16px 20px; background: #F5F3FF; border-left: 4px solid #7C3AED; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #7C3AED; margin: 0 0 6px;">STEP 1</p>
  <strong>Open the NexGen App → Go to Staff → Time Clock &amp; Payroll</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">The Time Clock screen shows your Current Shift status, worked hours, break time, and a Payroll Snapshot. You must be on premises for your clock-in to register. A location check runs automatically.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; background: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #16A34A; margin: 0 0 6px;">STEP 2</p>
  <strong>Tap ''Clock In'' to start your shift</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">The button activates when you arrive. Your shift begins the moment you tap. Do not clock in from home, from the parking lot before your start time, or on behalf of another employee — this is a compliance violation.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; background: #FFFBEB; border-left: 4px solid #D97706; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #D97706; margin: 0 0 6px;">STEP 3</p>
  <strong>Log your lunch break accurately</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">When you step away for a meal break, use the break feature. The app tracks Break 1, Break 2, etc. with timestamps. Break time is not paid time — accurate logging protects both you and NexGen.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #3B82F6; margin: 0 0 6px;">STEP 4</p>
  <strong>Add an Employee Note if anything needs context</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">If something about your shift requires admin awareness (late arrival approved by director, equipment issue, coverage change), add a note in the Employee Note field before submitting. This creates a documented record.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; background: #FEF2F2; border-left: 4px solid #DC2626; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #DC2626; margin: 0 0 6px;">STEP 5</p>
  <strong>Request an Edit if a punch time is incorrect</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Made an error? Use ''Request Edit'' — describe what needs to be corrected. Do not wait until payday. Corrections must be submitted within 48 hours of the shift. After submission, the shift is locked for review.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; background: #F0FDF4; border-left: 4px solid #059669; border-radius: 0 10px 10px 0;">
  <p style="font-size: 12px; font-weight: 700; color: #059669; margin: 0 0 6px;">STEP 6</p>
  <strong>Tap ''Sync &amp; Submit'' to finalize your shift</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">When your shift is complete and all details are accurate, tap Sync &amp; Submit. This sends your approved time entry to payroll via Zapier → Google Sheets. Once submitted, the shift is locked. Do not leave without submitting.</p>
</div>',
  10, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;

-- Step 2: Payroll Schedule & Processing
INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000008',
  'b1000000-0000-0000-0000-000000000006',
  'Payroll Schedule & Processing',
  '<h3>Payroll Schedule &amp; Processing</h3>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
  <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
    <td style="padding: 12px; font-weight: 700; width: 140px;">Pay Frequency</td>
    <td style="padding: 12px; color: #334155;">Bi-weekly (every two weeks). Pay period closes Sunday. Payday is the following Friday.</td>
  </tr>
  <tr style="border-bottom: 1px solid #E2E8F0;">
    <td style="padding: 12px; font-weight: 700;">Payment Method</td>
    <td style="padding: 12px; color: #334155;">Direct deposit to the bank account on file. Complete your direct deposit form on Day 1 to ensure your first check processes on time.</td>
  </tr>
  <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
    <td style="padding: 12px; font-weight: 700;">Payroll System</td>
    <td style="padding: 12px; color: #334155;">Approved shifts are synced from the NexGen app to Google Sheets via Zapier. The payroll team reviews and processes from that record.</td>
  </tr>
  <tr style="border-bottom: 1px solid #E2E8F0;">
    <td style="padding: 12px; font-weight: 700;">Discrepancies</td>
    <td style="padding: 12px; color: #334155;">If your paycheck does not match your logged hours, submit a written correction request to your director within 3 business days of receiving your pay stub.</td>
  </tr>
  <tr style="border-bottom: 1px solid #E2E8F0; background: #FAFAFA;">
    <td style="padding: 12px; font-weight: 700;">Overtime Policy</td>
    <td style="padding: 12px; color: #334155;">Any hours over 40 in a workweek are paid at 1.5x your regular rate per Texas labor law. Overtime must be pre-approved by the director.</td>
  </tr>
  <tr>
    <td style="padding: 12px; font-weight: 700;">Tax Documents</td>
    <td style="padding: 12px; color: #334155;">W-2s are issued by January 31 each year. Access prior pay stubs through the payroll records section of the NexGen app or by request.</td>
  </tr>
</table>

<div style="margin-top: 24px; padding: 16px 20px; background: #FEF2F2; border-left: 3px solid #DC2626; border-radius: 8px;">
  <strong style="color: #991B1B;">CLOCK-IN ACCOUNTABILITY</strong>
  <p style="margin-top: 8px; color: #7F1D1D; font-size: 14px;">Your Time Clock record is your professional accountability record. Chronic late arrivals, missed clock-outs, and unsubmitted shifts are tracked and reviewed during performance evaluations. Accurate timekeeping is not just a payroll issue — it is a professional conduct expectation.</p>
</div>',
  5, true, 2
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 7: Benefits & Team Culture — 1 step (5 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000009',
  'b1000000-0000-0000-0000-000000000007',
  'What NexGen Invests in You',
  '<p>NexGen''s commitment to its team goes beyond compensation. We believe that staff who feel invested in, valued, and supported show up differently — and that difference is felt by every child and family in this building.</p>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #EC4899; background: #FDF2F8; border-radius: 0 12px 12px 0;">
  <h4 style="color: #BE185D; margin: 0 0 10px;">Team Outings &amp; Culture Events</h4>
  <p style="margin: 0 0 12px; color: #334155;">NexGen hosts a minimum of 5 team outings per year — dinners, activities, and experiences designed to build genuine team connection outside of work. These are intentional investments in the relationships that make this team function at a high level.</p>
  <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
    <li>Minimum 5 outings per calendar year</li>
    <li>Mix of meals, activities, and experiences</li>
    <li>Attendance is encouraged — your presence builds team culture</li>
    <li>Locations and dates communicated at least 2 weeks in advance</li>
  </ul>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #059669; background: #F0FDF4; border-radius: 0 12px 12px 0;">
  <h4 style="color: #059669; margin: 0 0 10px;">Professional Development</h4>
  <p style="margin: 0 0 12px; color: #334155;">NexGen funds and supports ongoing professional growth for every team member. TRS requires documented PD hours — we go beyond the minimum because we believe growth is part of the job, not a burden on top of it.</p>
  <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
    <li>Required PD hours funded by NexGen where possible</li>
    <li>CDA credential support and pathway planning</li>
    <li>Internal training through the NexGen Onboarding &amp; Training Program</li>
    <li>Access to workshops, conferences, and NAEYC resources</li>
  </ul>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #D97706; background: #FFFBEB; border-radius: 0 12px 12px 0;">
  <h4 style="color: #92400E; margin: 0 0 10px;">Recognition &amp; Performance Incentives</h4>
  <p style="margin: 0 0 12px; color: #334155;">Excellence at NexGen is noticed and rewarded. The performance framework is transparent — staff who consistently hold the standard are recognized through compensation reviews, advancement opportunities, and public acknowledgment.</p>
  <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
    <li>Annual performance review tied to compensation decisions</li>
    <li>Director recognition programs for consistent excellence</li>
    <li>Advancement pathways within the organization as NexGen grows</li>
    <li>Peer recognition opportunities built into team culture</li>
  </ul>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #3B82F6; background: #EFF6FF; border-radius: 0 12px 12px 0;">
  <h4 style="color: #1D4ED8; margin: 0 0 10px;">Compass Staff System Access</h4>
  <p style="margin: 0 0 12px; color: #334155;">All NexGen staff have access to the Compass staff portal — your operational hub for training, schedules, communications, resources, and your performance record.</p>
  <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px;">
    <li>Full onboarding and training curriculum</li>
    <li>Shift scheduling and time clock integration</li>
    <li>Direct messaging and team communication</li>
    <li>Personal performance dashboard and KPI tracking</li>
  </ul>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #F0FDF4; border-left: 3px solid #16A34A; border-radius: 8px;">
  <strong style="color: #166534;">A WORD FROM LEADERSHIP</strong>
  <p style="margin-top: 8px; color: #14532D; font-size: 14px;">NexGen was built to be the kind of place people are proud to work at. That pride is not accidental — it is built through investment in people, through clarity of purpose, and through a culture where excellence and care go hand in hand. Welcome to the team. We are glad you are here.</p>
</div>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 8: Knowledge Check — 1 step (5 min)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000010',
  'b1000000-0000-0000-0000-000000000008',
  'Knowledge Check — 6 Questions',
  '<p>Answer each question before reviewing the answer key. This lesson covers 8 sections — make sure you feel confident across all of them before moving forward.</p>

<div style="margin: 24px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>1. What does NexGen''s mission specifically name as the purpose of our work with families?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Providing affordable childcare options<br/>B. Genuine partnership with families<br/>C. Meeting state licensing minimums<br/>D. Offering extended care hours</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>2. Room 1 serves which age group, and what is its classroom capacity?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. 12–17 months, 3 kids with 1 teacher<br/>B. Infants 0–11 months, 4 kids with 1 teacher<br/>C. 18–23 months, 5 kids with 1 teacher<br/>D. 2 years, 6 kids with 1 teacher</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>3. After completing your shift in the NexGen app, what is the final required step before leaving?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Tap ''Clock Out'' and close the app<br/>B. Email your hours to the director for review<br/>C. Tap ''Sync &amp; Submit'' to finalize and send your shift to payroll<br/>D. Nothing — the app auto-submits at the end of your scheduled shift</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>4. NexGen''s pay schedule is:</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Weekly — every Friday for the prior week<br/>B. Monthly — on the 1st of each month<br/>C. Bi-weekly — pay period closes Sunday, payday is the following Friday<br/>D. Bi-monthly — on the 15th and last day of each month</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>5. Which NexGen core value is best described by: ''Every routine, room setup, and interaction has a developmental purpose — we are deliberate, always''?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Heart-Centered Care<br/>B. Genuine Partnership<br/>C. Intentionality<br/>D. Excellence as a Standard</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>6. NexGen hosts team outings at minimum how many times per year, and what is their primary purpose?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Once per year — an annual holiday party<br/>B. Twice per year — summer and winter team events<br/>C. Five times per year — to build genuine team connection and invest in relationships<br/>D. Monthly — performance recognition events</p>
</div>

<hr style="margin: 32px 0; border: none; border-top: 2px solid #E2E8F0;"/>

<h3>Answer Key</h3>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">1. → B</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">''Genuine partnership with families'' is explicitly named in our mission. Families are collaborators, not drop-off customers. This language defines the relationship standard every staff member upholds.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">2. → B</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">Room 1 is the infant room — 0 to 11 months, 4 children, 1 teacher. It carries the lowest ratio and highest interaction demand of any classroom in the building. Every care routine is a teaching moment.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">3. → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">''Sync &amp; Submit'' is the final required step. It sends your approved shift to payroll via the integrated system. Shifts that are not submitted do not process. Never leave without completing this step.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">4. → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">Pay periods are bi-weekly. The period closes on Sunday, and direct deposit is processed the following Friday. Direct deposit authorization must be on file from Day 1 to ensure your first paycheck processes on schedule.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">5. → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">Intentionality is the value that separates a teacher from a babysitter. If you cannot explain why you are doing something in terms of a developmental purpose, the standard has not been met.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">6. → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">NexGen hosts a minimum of 5 team outings per year. These are intentional culture investments — not optional extras. The relationships built outside the building directly strengthen how the team functions inside it.</p>
</div>',
  5, true, 1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html, estimated_minutes = EXCLUDED.estimated_minutes;
