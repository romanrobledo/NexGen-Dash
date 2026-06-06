-- ============================================================================
-- ONBOARDING MODULE 1 — LESSON 1: INTRODUCTION TO NEXGEN
-- ============================================================================
-- Structure: training_subjects → training_topics → training_steps
-- Section: 'onboarding'
-- This lesson maps to: New Staff Orientation > Welcome & Mission of NexGen
-- TRS Alignment: Domain 1 — Program Administration
-- ============================================================================

-- 1. Insert the Subject (Lesson 1)
INSERT INTO training_subjects (
  id, title, description, icon, section, trs_category, order_index
) VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Lesson 1: Introduction to NexGen',
  'Who we are, why we exist, and what makes NexGen different. This lesson sets the foundation for everything that follows — because great childcare starts with a shared belief system, not just a job description.',
  'book-open',
  'onboarding',
  NULL,
  1
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  section = EXCLUDED.section,
  trs_category = EXCLUDED.trs_category,
  order_index = EXCLUDED.order_index;


-- 2. Insert Topics (Sections 1–5)

-- Topic 1: Learning Objectives
INSERT INTO training_topics (id, subject_id, title, order_index) VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'Learning Objectives',
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;

-- Topic 2: The NexGen Story
INSERT INTO training_topics (id, subject_id, title, order_index) VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'The NexGen Story',
  2
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;

-- Topic 3: Mission & Vision
INSERT INTO training_topics (id, subject_id, title, order_index) VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'Mission & Vision',
  3
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;

-- Topic 4: Core Values
INSERT INTO training_topics (id, subject_id, title, order_index) VALUES (
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000001',
  'Core Values',
  4
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;

-- Topic 5: Knowledge Check
INSERT INTO training_topics (id, subject_id, title, order_index) VALUES (
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'Knowledge Check',
  5
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;


-- 3. Insert Steps (content for each topic)

-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 1: Learning Objectives
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'Lesson Overview',
  '<p>By the end of this lesson, every new team member will understand who NexGen is, why we exist, and what it means to operate at a 4-star standard of care. This is not a history lecture — it is your foundation.</p>

<h3>Upon completing this lesson, you will be able to:</h3>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>01 — Articulate NexGen''s mission and vision in your own words</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">This is the single most important outcome of Lesson 1. You should be able to explain our mission to a parent, a colleague, or a stranger without reading from a card.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>02 — Identify the five core values and explain how each shows up in daily practice</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Values are only useful when they are actionable. You will be able to give a real-world example for each value by the time you complete Section 4.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>03 — Describe what sets NexGen apart from a standard childcare facility</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Understanding our differentiation is not about pride — it is about understanding the standard you are being asked to uphold and why it exists.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>04 — Explain the significance of Texas Rising Star 4-star certification and why it matters to families</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">TRS will come up throughout this onboarding and throughout your time at NexGen. You need to understand what it is and why families choose us because of it.</p>
</div>

<div style="margin: 16px 0; padding: 16px; border-left: 3px solid #2563EB; background: #F8FAFC;">
  <strong>05 — Connect your personal role to the larger mission of the organization</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Whether you are a lead teacher, a floater, or an administrator — your daily actions are either advancing or undermining the mission. This lesson helps you see how.</p>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 8px;">
  <strong style="color: #92400E;">WHY THIS LESSON COMES FIRST</strong>
  <p style="margin-top: 8px; color: #78350F;">Everything else in this onboarding — safety protocols, curriculum planning, family communication — is only meaningful when you understand the ''why'' behind it. NexGen is not just a childcare center. It is a school. This lesson gives you that lens before anything else.</p>
</div>',
  5,
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 2: The NexGen Story
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000002',
  'b1000000-0000-0000-0000-000000000002',
  'Our Founding & Commitment',
  '<p>NexGen School for Early Life Foundations was built on a belief that early childhood education in our community deserved more — more intentionality, more rigor, and more heart. What began as a vision for a different kind of childcare center has grown into a facility that families choose because they see the difference the moment they walk through the door.</p>

<p>This is not a story about becoming the biggest. It is a story about becoming the best — and building the systems, the team, and the culture to sustain that standard day after day.</p>

<blockquote style="margin: 24px 0; padding: 20px 24px; background: #F0FDF4; border-left: 4px solid #16A34A; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "We didn''t build NexGen to compete with other childcare centers. We built it to raise the bar for what families in this community should expect — and what children deserve from day one."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">— NexGen Founding Vision</span>
</blockquote>

<h3>A Timeline of Our Commitment</h3>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE VISION</p>
  <strong>Founded in Harlingen, TX</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">Established in the Rio Grande Valley with a clear purpose: serve families who expect more for their children during the most critical developmental window of their lives — birth through age five. The Valley deserved a school, not just a babysitter.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE COMMITMENT</p>
  <strong>Pursuing Texas Rising Star 4-Star Certification</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">TRS 4-star is the highest voluntary quality recognition in Texas. Fewer than a fraction of childcare centers in the state achieve it. We pursue it not for a plaque — but because every standard it requires makes our children''s experience measurably better.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">THE STANDARD</p>
  <strong>Building Systems That Sustain Excellence</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">NexGen invests in staff training, curriculum frameworks, documentation systems, and family partnerships that most centers never build. That investment is why you are in a structured onboarding program right now instead of being handed a key and pointed to a classroom.</p>
</div>

<div style="margin: 16px 0; padding: 16px 20px; border-left: 3px solid #059669; background: #F8FAFC; border-radius: 0 8px 8px 0;">
  <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 4px;">TODAY & BEYOND</p>
  <strong>You Are Part of What Comes Next</strong>
  <p style="margin-top: 6px; color: #64748B; font-size: 14px;">The team you join is the reason families trust us with the most important people in their lives. The chapter you contribute to is being written now — and the standard you uphold every day is what makes this mission real.</p>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #F0FDF4; border-left: 3px solid #16A34A; border-radius: 8px;">
  <strong style="color: #166534;">WHAT THIS MEANS FOR YOU</strong>
  <p style="margin-top: 8px; color: #14532D;">You were hired because you demonstrated the potential to uphold this standard. Every decision you make in your classroom — how you greet a child, how you set up a learning center, how you speak to a parent — is a reflection of this story. You are not just an employee. You are the mission made visible.</p>
</div>',
  10,
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 3: Mission & Vision
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000003',
  'b1000000-0000-0000-0000-000000000003',
  'Mission Statement',
  '<h3>Mission Statement</h3>

<blockquote style="margin: 20px 0; padding: 20px 24px; background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "To nurture every child''s growth through intentional teaching, safe and stimulating environments, and genuine partnership with families — preparing young minds for a lifetime of learning."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">NexGen School for Early Life Foundations — Mission</span>
</blockquote>

<h3>Breaking It Down — What Each Part Demands of Us</h3>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Nurture every child''s growth</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">This means ALL children — regardless of ability, background, home language, or learning style. There are no invisible children at NexGen. Every child is seen, named, and actively supported every day.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Intentional teaching</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">We do not watch children. We teach. Every activity, every room arrangement, every transition, every conversation has a developmental purpose behind it. Ask yourself daily: ''What is the learning goal in what I am doing right now?''</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Safe and stimulating environments</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Safety is the floor, not the ceiling. Above that floor, we build rich, joyful, developmentally engaging spaces where curiosity thrives. A sterile, quiet room is not a learning environment — it is a waiting room.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Genuine partnership with families</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Parents are not drop-off customers. They are the primary educators of their children, and we are their partners. We communicate proactively, we share observations honestly, and we build trust through consistency.</p>
</div>

<div style="margin: 12px 0; padding: 16px 20px; border-left: 3px solid #3B82F6; background: #F8FAFC;">
  <strong>Preparing young minds for a lifetime of learning</strong>
  <p style="margin-top: 6px; color: #475569; font-size: 14px;">Our work is not about kindergarten readiness alone. It is about helping children develop the dispositions — curiosity, persistence, confidence, empathy — that will serve them for 80 years.</p>
</div>',
  5,
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000004',
  'b1000000-0000-0000-0000-000000000003',
  'Vision Statement & TRS',
  '<h3>Vision Statement</h3>

<blockquote style="margin: 20px 0; padding: 20px 24px; background: #F5F3FF; border-left: 4px solid #7C3AED; border-radius: 8px; font-style: italic; font-size: 16px; line-height: 1.6;">
  "To be the most trusted name in early childhood education in our community — the school families seek out, staff are proud to grow within, and children remember as where they first discovered what they could do."
  <br/><span style="font-style: normal; font-size: 13px; color: #6B7280; margin-top: 8px; display: block;">NexGen School for Early Life Foundations — Vision</span>
</blockquote>

<p>The vision has three distinct audiences — and you serve all three:</p>

<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <tr style="border-bottom: 1px solid #E2E8F0;">
    <td style="padding: 12px; font-weight: 700; width: 100px;">Families</td>
    <td style="padding: 12px; color: #7C3AED; font-style: italic; width: 80px;">seek out</td>
    <td style="padding: 12px; color: #475569; font-size: 14px;">Families choose us intentionally. They research, they tour, they compare. We earn their trust through reputation.</td>
  </tr>
  <tr style="border-bottom: 1px solid #E2E8F0;">
    <td style="padding: 12px; font-weight: 700;">Staff</td>
    <td style="padding: 12px; color: #7C3AED; font-style: italic;">proud to grow</td>
    <td style="padding: 12px; color: #475569; font-size: 14px;">This is a place that develops people. You should leave NexGen more skilled, more credentialed, and more capable than when you started.</td>
  </tr>
  <tr>
    <td style="padding: 12px; font-weight: 700;">Children</td>
    <td style="padding: 12px; color: #7C3AED; font-style: italic;">first discovery</td>
    <td style="padding: 12px; color: #475569; font-size: 14px;">The most important audience. Children do not remember policies or lesson plans — they remember how they felt. They should remember NexGen as the place where they first discovered what they could do.</td>
  </tr>
</table>

<div style="margin-top: 24px; padding: 16px 20px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 8px;">
  <strong style="color: #92400E;">WHAT IS TEXAS RISING STAR (TRS)?</strong>
  <p style="margin-top: 8px; color: #78350F; font-size: 14px;">TRS is Texas''s voluntary quality rating and improvement system for childcare providers. A 4-star rating — the highest achievable — means NexGen has been independently assessed against rigorous standards across four domains: Staff Qualifications & Training, Caregiver-Child Interactions, Curriculum & Learning Environment, and Family Engagement. Most licensed centers never pursue it. We pursue it because families deserve to know their child is somewhere exceptional — and because the standards themselves make us better at our work.</p>
</div>',
  5,
  true,
  2
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 4: Core Values
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000005',
  'b1000000-0000-0000-0000-000000000004',
  'The Five Core Values',
  '<p>These are not decorations on a wall. They are the lens through which every decision at NexGen is made — from how we set up a classroom to how we handle a difficult conversation with a parent. Know them. Live them.</p>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #2563EB; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #2563EB; margin: 0 0 8px 0;">01 &nbsp; GROWTH ABOVE ALL</h4>
  <p style="margin: 0 0 12px 0;">Every child, every family, every team member is capable of more. We create the conditions for that growth — and we never stop growing ourselves.</p>
  <p style="margin: 0; font-size: 13px; color: #059669;"><strong>In practice:</strong> You complete your professional development hours not because HR requires it, but because you believe growth is the job. You look for what a struggling child CAN do, not what they can''t.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #D97706; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #D97706; margin: 0 0 8px 0;">02 &nbsp; INTENTIONALITY</h4>
  <p style="margin: 0 0 12px 0;">We don''t do things ''just because.'' Every routine, every room setup, every interaction has a developmental purpose behind it. We are deliberate, always.</p>
  <p style="margin: 0; font-size: 13px; color: #059669;"><strong>In practice:</strong> When you arrange the dramatic play center, you can explain why each item is there. When you transition children, you know what skill is being practiced in the process.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #059669; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #059669; margin: 0 0 8px 0;">03 &nbsp; GENUINE PARTNERSHIP</h4>
  <p style="margin: 0 0 12px 0;">With families, with colleagues, with the community. We do not operate in silos. We build relationships that make the work sustainable and the outcomes extraordinary.</p>
  <p style="margin: 0; font-size: 13px; color: #059669;"><strong>In practice:</strong> You share a specific observation with a parent at pickup — not ''she had a good day'' but ''she built a block tower four stories high and tried again when it fell.'' That specificity is partnership.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #DC2626; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #DC2626; margin: 0 0 8px 0;">04 &nbsp; EXCELLENCE AS A STANDARD</h4>
  <p style="margin: 0 0 12px 0;">Good enough is never the goal. Not in how we set up a reading center, not in how we document an observation, not in how we greet a family at 7am.</p>
  <p style="margin: 0; font-size: 13px; color: #059669;"><strong>In practice:</strong> You notice the reading corner books are spine-in and you rotate them face-out before your shift starts. Nobody asked. You did it because the standard is clear and you own it.</p>
</div>

<div style="margin: 20px 0; padding: 20px; border-left: 4px solid #7C3AED; background: #F8FAFC; border-radius: 0 12px 12px 0;">
  <h4 style="color: #7C3AED; margin: 0 0 8px 0;">05 &nbsp; HEART-CENTERED CARE</h4>
  <p style="margin: 0 0 12px 0;">At the end of every procedure, every policy, and every standard is a child who needs to feel safe, seen, and loved. That is the job. Everything else is in service of that.</p>
  <p style="margin: 0; font-size: 13px; color: #059669;"><strong>In practice:</strong> A child arrives crying after a hard drop-off. Before anything else, you get to their level, make eye contact, and give them time. The activity plan waits. The child comes first.</p>
</div>

<div style="margin-top: 24px; padding: 16px 20px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 8px;">
  <strong style="color: #92400E;">VALUES IN PRACTICE — WHAT THIS LOOKS LIKE ON DAY ONE</strong>
  <p style="margin-top: 8px; color: #78350F; font-size: 14px;">You arrive on time. You greet every child at their level — literally, physically, eye to eye. You ask a family one genuine question about their child before they leave. You leave your classroom cleaner than you found it. You write one observation before the end of your shift. These are not rules. These are your values made visible. Starting today.</p>
</div>',
  10,
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;


-- ═══════════════════════════════════════════════════════════════════════════
-- TOPIC 5: Knowledge Check
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO training_steps (id, topic_id, title, content_html, estimated_minutes, is_required, order_index) VALUES (
  'c1000000-0000-0000-0000-000000000006',
  'b1000000-0000-0000-0000-000000000005',
  'Knowledge Check — 5 Questions',
  '<p>This knowledge check is a reflection tool, not a test. Answer each question before looking at the answer key below. If you are unsure, return to the relevant section and review before continuing.</p>

<div style="margin: 24px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>1. What does NexGen''s mission specifically call out as the purpose of our work with families?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Providing affordable childcare options<br/>B. Genuine partnership with families<br/>C. Meeting state licensing minimums<br/>D. Offering extended care hours</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>2. Texas Rising Star 4-star certification is best described as:</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. A state licensing requirement all centers must meet<br/>B. A marketing title centers give themselves<br/>C. The highest voluntary quality recognition in Texas<br/>D. A federal Head Start program requirement</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>3. Which NexGen core value is most directly reflected by: "We don''t do things just because — everything has a developmental purpose"?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Heart-Centered Care<br/>B. Genuine Partnership<br/>C. Intentionality<br/>D. Excellence as a Standard</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>4. According to NexGen''s vision, which is named as a goal for the children in our care?</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. Achieving all kindergarten readiness benchmarks<br/>B. Children remembering where they first discovered what they could do<br/>C. Maximizing enrollment and program revenue<br/>D. Ensuring full compliance with DFPS regulations</p>
</div>

<div style="margin: 16px 0; padding: 20px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
  <p><strong>5. A new hire asks: "What actually makes NexGen different?" The best answer is:</strong></p>
  <p style="color: #64748B; font-size: 14px; margin: 4px 0 0 16px;">A. We have a bigger facility and better toys<br/>B. We charge more because we offer more amenities<br/>C. We operate with intentional teaching, rigorous systems, and a 4-star standard most centers never pursue<br/>D. We have stricter rules and higher expectations for children</p>
</div>

<hr style="margin: 32px 0; border: none; border-top: 2px solid #E2E8F0;"/>

<h3>Answer Key</h3>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">Q1 → B</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">"Genuine partnership with families" is explicitly named in our mission statement. Parents are collaborators, not drop-off customers.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">Q2 → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">TRS is a voluntary quality rating system — 4-star is the highest level and is independently assessed. Most centers never pursue it.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">Q3 → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">Intentionality means every routine, room setup, and interaction has a deliberate developmental purpose. This is the value that separates a teacher from a caretaker.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">Q4 → B</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">The vision names something deeper than benchmarks — children should remember NexGen as the place where they first discovered what they were capable of.</p>
</div>

<div style="margin: 12px 0; padding: 14px 20px; background: #F0FDF4; border-radius: 8px;">
  <strong style="color: #059669;">Q5 → C</strong>
  <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534; font-style: italic;">The difference is intentional teaching, structured systems, and a voluntary commitment to 4-star standards — not facility size, price point, or rules.</p>
</div>',
  10,
  true,
  1
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content_html = EXCLUDED.content_html;
