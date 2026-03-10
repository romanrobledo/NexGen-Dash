import { useState } from 'react'
import { Award } from 'lucide-react'

// ─── SCORING HELPERS ──────────────────────────────────────────────────────────
const SCORE_COLORS = {
  excellent: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  good: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047' },
  needs: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
}
const scoreColor = (score, max = 10) => {
  const pct = score / max
  if (pct >= 0.85) return SCORE_COLORS.excellent
  if (pct >= 0.65) return SCORE_COLORS.good
  return SCORE_COLORS.needs
}

// ─── ROLE DATA ────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'director',
    label: 'Director',
    emoji: '📋',
    color: '#7C3AED',
    tagline: 'You are measured by the health of the building you run.',
    categories: [
      {
        id: 'trs',
        label: 'TRS Compliance',
        icon: '⭐',
        weight: 25,
        description: 'Are all classrooms meeting Texas Rising Star standards during formal and informal assessments?',
        indicators: [
          { label: 'All staff credentials and training hours current', green: '100% current', yellow: '1–2 gaps', red: '3+ gaps or lapsed' },
          { label: 'Classroom environments meet TRS criteria', green: 'All rooms pass', yellow: '1 room needs work', red: 'Multiple rooms flagged' },
          { label: 'Documentation complete and accessible', green: 'Fully documented', yellow: 'Minor gaps', red: 'Missing critical docs' },
        ],
      },
      {
        id: 'observations',
        label: 'Internal Observations',
        icon: '👁️',
        weight: 25,
        description: 'Weekly classroom walkthrough scores completed by the Operator.',
        indicators: [
          { label: 'Classrooms observed weekly', green: 'All rooms, every week', yellow: 'Most rooms', red: 'Sporadic or skipped' },
          { label: 'Feedback given to teachers after observations', green: 'Same day', yellow: 'Within 3 days', red: 'Delayed or skipped' },
          { label: 'Improvement tracked over time', green: 'Clear upward trend', yellow: 'Flat', red: 'Declining' },
        ],
      },
      {
        id: 'staff',
        label: 'Staff Performance & Retention',
        icon: '👥',
        weight: 20,
        description: 'Is the team improving, stable, and engaged?',
        indicators: [
          { label: 'Staff turnover rate', green: 'Below 20% annually', yellow: '20–40%', red: 'Above 40%' },
          { label: 'Outstanding performance issues', green: 'None unaddressed', yellow: '1–2 being managed', red: 'Unresolved issues' },
          { label: 'Training completion rate', green: '100%', yellow: '85–99%', red: 'Below 85%' },
        ],
      },
      {
        id: 'families',
        label: 'Parent Satisfaction',
        icon: '❤️',
        weight: 20,
        description: 'How families experience NexGen daily.',
        indicators: [
          { label: 'Formal parent reviews / surveys', green: '4.5+ avg', yellow: '3.5–4.4', red: 'Below 3.5' },
          { label: 'Complaint resolution time', green: 'Within 24 hrs', yellow: '24–72 hrs', red: 'Unresolved or delayed' },
          { label: 'Family retention rate', green: 'Above 85%', yellow: '70–85%', red: 'Below 70%' },
        ],
      },
      {
        id: 'ops',
        label: 'Operational Consistency',
        icon: '⚙️',
        weight: 10,
        description: 'Does the building run the same way every day without escalations?',
        indicators: [
          { label: 'Daily schedule followed across classrooms', green: 'Consistent', yellow: 'Occasional deviations', red: 'Frequent breakdowns' },
          { label: 'Incident reports completed same day', green: '100%', yellow: 'Most', red: 'Frequently late or missing' },
        ],
      },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '📚',
    color: '#059669',
    tagline: 'You are measured by what happens inside your classroom every day.',
    categories: [
      {
        id: 'trs',
        label: 'TRS Classroom Assessment',
        icon: '⭐',
        weight: 30,
        description: 'Formal and informal TRS observations of your classroom environment and interactions.',
        indicators: [
          { label: 'Environment setup meets TRS criteria', green: 'Fully compliant', yellow: 'Minor gaps noted', red: 'Multiple deficiencies' },
          { label: 'Positive language used consistently', green: 'Always observed', yellow: 'Mostly — some slips', red: 'Threats or negative framing observed' },
          { label: 'Daily schedule posted and followed', green: 'Yes, consistently', yellow: 'Posted but not followed', red: 'Neither' },
        ],
      },
      {
        id: 'lesson',
        label: 'Lesson Plan Execution',
        icon: '📝',
        weight: 25,
        description: 'Are you submitting plans on time and actually implementing them in the classroom?',
        indicators: [
          { label: 'Lesson plan submitted by Thursday deadline', green: 'Every week', yellow: 'Usually — occasional late', red: 'Frequently late or missing' },
          { label: 'Plan implemented as written', green: 'Fully executed', yellow: 'Partially executed', red: 'Skipped or improvised' },
          { label: 'All developmental domains covered weekly', green: 'All 4 domains', yellow: '3 domains', red: '2 or fewer' },
        ],
      },
      {
        id: 'observations',
        label: 'Internal Observations',
        icon: '👁️',
        weight: 20,
        description: 'Director walkthrough scores from weekly classroom visits.',
        indicators: [
          { label: 'Children engaged and on-task', green: 'Consistently', yellow: 'Most of the time', red: 'Frequently off-task' },
          { label: 'Teacher-child interactions are warm and responsive', green: 'Always', yellow: 'Usually', red: 'Cold, reactive, or punitive' },
          { label: 'Ratios and supervision maintained', green: 'Always', yellow: 'Minor lapses', red: 'Supervision gaps observed' },
        ],
      },
      {
        id: 'parents',
        label: 'Parent Feedback',
        icon: '❤️',
        weight: 15,
        description: 'How families experience your classroom and communication.',
        indicators: [
          { label: 'Parent review score', green: '4.5+ avg', yellow: '3.5–4.4', red: 'Below 3.5' },
          { label: 'Daily communication at pickup', green: 'Consistent and specific', yellow: 'Inconsistent', red: 'Absent or reactive only' },
        ],
      },
      {
        id: 'checkin',
        label: 'Daily Self Check-In',
        icon: '📋',
        weight: 10,
        description: 'Your daily check-in completion and quality — submitted each day in your staff profile.',
        indicators: [
          { label: 'Check-in submitted daily', green: 'Every day', yellow: 'Most days', red: 'Frequently missed' },
          { label: 'Responses are specific and honest', green: 'Detailed, actionable', yellow: 'Generic', red: 'Blank or copy-paste' },
        ],
      },
    ],
  },
  {
    id: 'teacher-assistant',
    label: 'Teacher Assistant',
    emoji: '🤝',
    color: '#0891B2',
    tagline: 'You are measured by how reliably you show up and support the classroom.',
    categories: [
      {
        id: 'supervision',
        label: 'Active Supervision',
        icon: '👀',
        weight: 35,
        description: 'Are you visibly engaged and actively watching children at all times?',
        indicators: [
          { label: 'Eyes on room at all times', green: 'Always observed', yellow: 'Occasional distraction', red: 'Phone use, checked out, or turned away' },
          { label: 'Positioned to see all children', green: 'Consistently correct positioning', yellow: 'Sometimes', red: 'Frequently incorrect' },
        ],
      },
      {
        id: 'support',
        label: 'Activity Support',
        icon: '🎨',
        weight: 25,
        description: 'Are you actively contributing to lesson delivery and transitions?',
        indicators: [
          { label: 'Materials prepped without being asked', green: 'Consistently proactive', yellow: 'When reminded', red: 'Rarely or never' },
          { label: 'Transitions managed smoothly', green: 'Leads transitions confidently', yellow: 'Assists when directed', red: 'Disengaged during transitions' },
        ],
      },
      {
        id: 'observations',
        label: 'Internal Observations',
        icon: '👁️',
        weight: 25,
        description: 'Director and lead teacher feedback from classroom visits.',
        indicators: [
          { label: 'Uses positive language and guidance', green: 'Consistently', yellow: 'Usually', red: 'Negative language or threats observed' },
          { label: 'Supports lead teacher without conflict', green: 'Seamless partnership', yellow: 'Occasional friction', red: 'Undermines or contradicts lead' },
        ],
      },
      {
        id: 'checkin',
        label: 'Daily Self Check-In',
        icon: '📋',
        weight: 15,
        description: 'Daily check-in quality and completion.',
        indicators: [
          { label: 'Check-in submitted daily', green: 'Every day', yellow: 'Most days', red: 'Frequently missed' },
        ],
      },
    ],
  },
  {
    id: 'front-desk',
    label: 'Front Desk Manager',
    emoji: '🖥️',
    color: '#D97706',
    tagline: 'You are measured by family experience and operational accuracy.',
    categories: [
      {
        id: 'family',
        label: 'Family Experience',
        icon: '❤️',
        weight: 35,
        description: 'How families feel when they interact with the front desk.',
        indicators: [
          { label: 'Parent review mentions of front desk', green: 'Consistently positive', yellow: 'Neutral', red: 'Negative mentions' },
          { label: 'Every family greeted by name', green: 'Always', yellow: 'Usually', red: 'Rarely' },
        ],
      },
      {
        id: 'accuracy',
        label: 'Attendance & Records Accuracy',
        icon: '📋',
        weight: 30,
        description: 'Is attendance logged accurately and on time?',
        indicators: [
          { label: 'Check-in/out logged at time of arrival', green: 'Always real-time', yellow: 'Minor delays', red: 'Batched or inaccurate' },
          { label: 'Visitor log maintained', green: '100% complete', yellow: 'Minor gaps', red: 'Frequently incomplete' },
        ],
      },
      {
        id: 'inquiries',
        label: 'Inquiry Response Time',
        icon: '📞',
        weight: 20,
        description: 'How quickly and professionally inbound inquiries are handled.',
        indicators: [
          { label: 'Calls answered within 3 rings', green: 'Consistently', yellow: 'Usually', red: 'Frequently missed or voicemail' },
          { label: 'Tour inquiries logged same day', green: 'Always', yellow: 'Usually', red: 'Frequently late or missing' },
        ],
      },
      {
        id: 'checkin',
        label: 'Daily Self Check-In',
        icon: '📋',
        weight: 15,
        description: 'Daily check-in completion and quality.',
        indicators: [
          { label: 'Check-in submitted daily', green: 'Every day', yellow: 'Most days', red: 'Frequently missed' },
        ],
      },
    ],
  },
  {
    id: 'tour-manager',
    label: 'Tour Manager',
    emoji: '🗺️',
    color: '#7C3AED',
    tagline: 'You are measured by one thing above all else — families who enroll.',
    categories: [
      {
        id: 'conversion',
        label: 'Tour-to-Enrollment Conversion',
        icon: '📈',
        weight: 40,
        description: 'The primary metric. What percentage of tours become enrolled families?',
        indicators: [
          { label: 'Conversion rate', green: '40%+', yellow: '25–39%', red: 'Below 25%' },
          { label: 'Follow-up completed within 24 hrs', green: '100% of tours', yellow: 'Most tours', red: 'Inconsistent' },
        ],
      },
      {
        id: 'volume',
        label: 'Tour Volume',
        icon: '📅',
        weight: 25,
        description: 'Are enough tours being scheduled and showing up?',
        indicators: [
          { label: 'Tours scheduled per week', green: '6+ tours/week', yellow: '3–5', red: 'Below 3' },
          { label: 'No-show rate', green: 'Below 15%', yellow: '15–30%', red: 'Above 30%' },
        ],
      },
      {
        id: 'experience',
        label: 'Tour Experience Quality',
        icon: '⭐',
        weight: 20,
        description: 'Observation scores from Director or Operator mystery tours.',
        indicators: [
          { label: 'Structured route followed', green: 'Consistently', yellow: 'Mostly', red: 'Improvised' },
          { label: 'Differentiators mentioned naturally', green: 'All key points covered', yellow: 'Some missed', red: 'Generic walk-through only' },
        ],
      },
      {
        id: 'crm',
        label: 'CRM Accuracy',
        icon: '📋',
        weight: 15,
        description: 'Is every family, tour, and follow-up logged accurately?',
        indicators: [
          { label: 'All tour notes logged same day', green: 'Always', yellow: 'Usually', red: 'Frequently late or missing' },
        ],
      },
    ],
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    emoji: '🔍',
    color: '#DC2626',
    tagline: 'You are measured by the quality and speed of who you bring through the door.',
    categories: [
      {
        id: 'quality',
        label: 'Hire Quality',
        icon: '⭐',
        weight: 40,
        description: 'Are the people you hire succeeding in their roles at NexGen?',
        indicators: [
          { label: '90-day retention of new hires', green: 'Above 85%', yellow: '70–85%', red: 'Below 70%' },
          { label: 'New hire performance (Director-rated)', green: 'Meeting or exceeding expectations', yellow: 'Needs improvement', red: 'Terminated or problematic' },
        ],
      },
      {
        id: 'speed',
        label: 'Time to Fill',
        icon: '⏱️',
        weight: 25,
        description: 'How quickly are open roles filled without compromising quality?',
        indicators: [
          { label: 'Average time to fill a role', green: 'Under 14 days', yellow: '14–21 days', red: '21+ days or position left open' },
          { label: 'Pipeline maintained proactively', green: 'Always warm candidates available', yellow: 'Occasionally thin', red: 'Scrambling when roles open' },
        ],
      },
      {
        id: 'compliance',
        label: 'Onboarding Compliance',
        icon: '📋',
        weight: 20,
        description: 'Is all documentation complete before day one?',
        indicators: [
          { label: 'Background checks completed pre-start', green: '100%', yellow: 'Rare exception', red: 'Any miss' },
          { label: 'All paperwork collected before day one', green: 'Always', yellow: 'Usually', red: 'Frequently incomplete' },
        ],
      },
      {
        id: 'reporting',
        label: 'Weekly Reporting',
        icon: '📊',
        weight: 15,
        description: 'Pipeline visibility and communication to the Operator.',
        indicators: [
          { label: 'Weekly hiring report submitted', green: 'Every week', yellow: 'Usually', red: 'Frequently missed' },
        ],
      },
    ],
  },
  {
    id: 'lesson-plans',
    label: 'Lesson Plans Manager',
    emoji: '📝',
    color: '#059669',
    tagline: 'You are measured by whether every classroom starts the week prepared.',
    categories: [
      {
        id: 'delivery',
        label: 'On-Time Plan Delivery',
        icon: '📤',
        weight: 35,
        description: "Are lesson plans in every teacher's hands by Thursday without exception?",
        indicators: [
          { label: 'Plans delivered by Thursday deadline', green: 'Every week, all rooms', yellow: 'Usually — occasional miss', red: 'Frequently late or incomplete' },
          { label: 'Receipt confirmed from all teachers', green: 'Confirmed weekly', yellow: 'Usually', red: 'Not tracked' },
        ],
      },
      {
        id: 'quality',
        label: 'Plan Quality',
        icon: '⭐',
        weight: 35,
        description: 'Are plans developmentally appropriate, TRS-aligned, and practically executable?',
        indicators: [
          { label: 'All 4 developmental domains covered', green: 'Every plan, every week', yellow: 'Usually', red: 'Frequently missing domains' },
          { label: 'TRS benchmark alignment', green: 'Fully aligned', yellow: 'Mostly aligned', red: 'Gaps present' },
          { label: 'Teacher feedback on usability', green: 'Plans are clear and ready to execute', yellow: 'Some adjustments needed', red: 'Frequently rewritten by teachers' },
        ],
      },
      {
        id: 'implementation',
        label: 'Implementation Tracking',
        icon: '👁️',
        weight: 20,
        description: 'Are you tracking whether plans are actually being used in classrooms?',
        indicators: [
          { label: 'Mid-week implementation check', green: 'Done every week', yellow: 'Sometimes', red: 'Never done' },
          { label: 'Deviations flagged to Director', green: 'Consistently reported', yellow: 'Occasionally', red: 'Not tracked' },
        ],
      },
      {
        id: 'library',
        label: 'Resource Library',
        icon: '📚',
        weight: 10,
        description: 'Is the activity library being maintained and grown over time?',
        indicators: [
          { label: 'New activities added monthly', green: 'Yes, consistently', yellow: 'Occasionally', red: 'Static — never updated' },
        ],
      },
    ],
  },
  {
    id: 'kitchen-manager',
    label: 'Kitchen Manager',
    emoji: '🍽️',
    color: '#D97706',
    tagline: 'You are measured by safety, compliance, and whether every child eats on time.',
    categories: [
      {
        id: 'safety',
        label: 'Food Safety',
        icon: '🌡️',
        weight: 35,
        description: 'Is the kitchen operating to full safety standards every day?',
        indicators: [
          { label: 'Temperature logs completed daily', green: 'Every day', yellow: 'Usually', red: 'Gaps present' },
          { label: 'Food safety violations in inspections', green: 'Zero', yellow: 'Minor — corrected', red: 'Any critical violation' },
          { label: 'Allergy protocols followed without error', green: 'Always', yellow: 'Minor slip — caught', red: 'Any allergy incident' },
        ],
      },
      {
        id: 'cacfp',
        label: 'CACFP Compliance',
        icon: '📋',
        weight: 30,
        description: 'Are meal records complete, accurate, and submitted on time?',
        indicators: [
          { label: 'Meal records completed daily', green: 'Every day', yellow: 'Usually', red: 'Gaps present' },
          { label: 'Monthly CACFP submission on time', green: 'Always', yellow: 'Occasionally late', red: 'Late or incomplete' },
        ],
      },
      {
        id: 'service',
        label: 'Meal Service Consistency',
        icon: '⏱️',
        weight: 20,
        description: 'Do meals go out on time, to every classroom, every day?',
        indicators: [
          { label: 'Meals served within scheduled window', green: 'Always on time', yellow: 'Occasional delays', red: 'Frequent delays' },
          { label: 'Portion standards met', green: 'CACFP standards met consistently', yellow: 'Minor deviations', red: 'Regularly short or non-compliant' },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory Management',
        icon: '📦',
        weight: 15,
        description: 'Is the kitchen ever running short or scrambling?',
        indicators: [
          { label: 'Weekly order submitted on time', green: 'Every Friday', yellow: 'Usually', red: 'Frequently late or missed' },
          { label: 'Kitchen ever run out of a menu item', green: 'Never', yellow: 'Rarely — substitution managed', red: 'Frequently' },
        ],
      },
    ],
  },
  {
    id: 'bus-driver',
    label: 'Bus Driver',
    emoji: '🚌',
    color: '#DC2626',
    tagline: 'You are measured by zero incidents, zero misses, and complete documentation.',
    categories: [
      {
        id: 'safety',
        label: 'Transportation Safety',
        icon: '🛡️',
        weight: 50,
        description: 'The non-negotiable. No child is ever at risk on your route.',
        indicators: [
          { label: 'Pre/post-trip inspection completed', green: 'Every route, documented', yellow: 'Usually', red: 'Any missed inspection' },
          { label: 'Headcount verified at every stop', green: 'Always', yellow: 'Usually', red: 'Any miss' },
          { label: 'Safety incidents or violations', green: 'Zero', yellow: 'Minor — reported promptly', red: 'Any unreported or recurring incident' },
        ],
      },
      {
        id: 'punctuality',
        label: 'Punctuality',
        icon: '⏱️',
        weight: 25,
        description: 'Are pickups and drop-offs consistently on schedule?',
        indicators: [
          { label: 'On-time performance', green: '95%+ on time', yellow: '85–94%', red: 'Below 85%' },
          { label: 'Delays communicated proactively', green: 'Always called in immediately', yellow: 'Usually', red: 'Families or staff caught off guard' },
        ],
      },
      {
        id: 'documentation',
        label: 'Transport Documentation',
        icon: '📋',
        weight: 15,
        description: 'Are daily logs complete and submitted?',
        indicators: [
          { label: 'Daily transport log completed', green: 'Every route', yellow: 'Usually', red: 'Frequently missing' },
        ],
      },
      {
        id: 'vehicle',
        label: 'Vehicle Condition',
        icon: '🔧',
        weight: 10,
        description: 'Is the vehicle always clean, maintained, and road-ready?',
        indicators: [
          { label: 'Maintenance issues reported same day', green: 'Always', yellow: 'Usually', red: 'Delayed or unreported' },
        ],
      },
    ],
  },
]

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const RoleButton = ({ role, isActive, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.55rem 0.9rem',
      borderRadius: '10px',
      border: isActive ? `1.5px solid ${role.color}` : '1.5px solid transparent',
      background: isActive ? role.color + '12' : 'transparent',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
    }}
  >
    <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{role.emoji}</span>
    <span
      style={{
        fontSize: '0.82rem',
        fontWeight: isActive ? 700 : 500,
        color: isActive ? role.color : '#374151',
        lineHeight: 1.3,
      }}
    >
      {role.label}
    </span>
  </button>
)

const IndicatorRow = ({ indicator }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1fr 1fr 1fr',
      gap: '0.5rem',
      alignItems: 'start',
      padding: '0.65rem 0',
      borderBottom: '1px solid #F1F5F9',
    }}
  >
    <span style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5 }}>
      {indicator.label}
    </span>
    <div style={{ textAlign: 'center' }}>
      <span
        style={{
          fontSize: '0.72rem',
          background: '#DCFCE7',
          color: '#166534',
          padding: '2px 7px',
          borderRadius: '6px',
          display: 'inline-block',
          lineHeight: 1.5,
        }}
      >
        ✓ {indicator.green}
      </span>
    </div>
    <div style={{ textAlign: 'center' }}>
      <span
        style={{
          fontSize: '0.72rem',
          background: '#FEF9C3',
          color: '#854D0E',
          padding: '2px 7px',
          borderRadius: '6px',
          display: 'inline-block',
          lineHeight: 1.5,
        }}
      >
        ~ {indicator.yellow}
      </span>
    </div>
    <div style={{ textAlign: 'center' }}>
      <span
        style={{
          fontSize: '0.72rem',
          background: '#FEE2E2',
          color: '#991B1B',
          padding: '2px 7px',
          borderRadius: '6px',
          display: 'inline-block',
          lineHeight: 1.5,
        }}
      >
        ✗ {indicator.red}
      </span>
    </div>
  </div>
)

const CategoryCard = ({ cat, color }) => {
  const [open, setOpen] = useState(false)
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: color + '15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0,
            }}
          >
            {cat.icon}
          </span>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
              {cat.label}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#94A3B8', marginTop: '1px' }}>
              Weight: {cat.weight}% of overall score
            </div>
          </div>
        </div>
        <span style={{ color: color, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem', borderTop: `1px solid ${color}20` }}>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#64748B',
              lineHeight: 1.6,
              margin: '0.85rem 0 0.75rem',
            }}
          >
            {cat.description}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '0.5rem',
              padding: '0.4rem 0',
              borderBottom: '2px solid #E2E8F0',
              marginBottom: '0.25rem',
            }}
          >
            {["What You're Scored On", 'Excellent', 'Acceptable', 'Needs Work'].map(
              (h, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    textAlign: i > 0 ? 'center' : 'left',
                  }}
                >
                  {h}
                </div>
              )
            )}
          </div>
          {cat.indicators.map((ind, i) => (
            <IndicatorRow key={i} indicator={ind} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function HowDoIKnowPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [view, setView] = useState('rubric')

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.03em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              How Do I Know I Am Doing A Good Job
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Your performance rubric — exactly how you're scored, what's weighted, and what
              excellent looks like.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* Role Selector */}
        <div
          style={{
            width: 200,
            flexShrink: 0,
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '1rem 0.75rem',
            position: 'sticky',
            top: '1rem',
          }}
        >
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#94A3B8',
              margin: '0 0.5rem 0.75rem',
            }}
          >
            Select Your Role
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {ROLES.map((role) => (
              <RoleButton
                key={role.id}
                role={role}
                isActive={activeRole.id === role.id}
                onClick={() => setActiveRole(role)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* Header */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '1.5rem 1.75rem',
              borderTop: `4px solid ${activeRole.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{activeRole.emoji}</span>
              <div>
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {activeRole.label}
                </h2>
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: activeRole.color,
                    fontWeight: 600,
                    fontStyle: 'italic',
                    margin: '0.15rem 0 0',
                  }}
                >
                  {activeRole.tagline}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { id: 'rubric', label: 'Scoring Rubric' },
                { id: 'profile', label: 'Profile Preview' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: view === v.id ? activeRole.color : '#E2E8F0',
                    background: view === v.id ? activeRole.color + '12' : '#fff',
                    color: view === v.id ? activeRole.color : '#64748B',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rubric View */}
          {view === 'rubric' && (
            <>
              {/* Weight Summary Bar */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                }}
              >
                <p
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#94A3B8',
                    margin: '0 0 0.85rem',
                  }}
                >
                  How Your Score Is Weighted
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {activeRole.categories.map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '5px 12px',
                        borderRadius: '99px',
                        background: activeRole.color + '10',
                        border: `1px solid ${activeRole.color}25`,
                      }}
                    >
                      <span style={{ fontSize: '0.85rem' }}>{cat.icon}</span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: activeRole.color,
                        }}
                      >
                        {cat.weight}%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#374151' }}>{cat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Category Cards */}
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  margin: '0.25rem 0.25rem 0',
                }}
              >
                Scoring Criteria — tap to expand
              </p>
              {activeRole.categories.map((cat, i) => (
                <CategoryCard key={i} cat={cat} color={activeRole.color} />
              ))}
            </>
          )}

          {/* Profile Widget Preview */}
          {view === 'profile' && (
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#64748B',
                  margin: '0 0 0.5rem',
                  fontWeight: 500,
                }}
              >
                This widget lives inside every staff member's profile. Visible to both staff and
                management at any time.
              </p>
              {/* Mock Profile Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: activeRole.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    color: '#fff',
                  }}
                >
                  {activeRole.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                    Staff Member Name
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    {activeRole.label}
                  </div>
                </div>
              </div>
              {/* Widget */}
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  marginTop: '0.75rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#94A3B8',
                        margin: '0 0 0.2rem',
                      }}
                    >
                      Performance Score
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                      Updated based on assessments, observations & check-ins
                    </p>
                  </div>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: '#DCFCE7',
                      border: '2px solid #86EFAC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#166534',
                        lineHeight: 1,
                      }}
                    >
                      87
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#166534', fontWeight: 600 }}>
                      / 100
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {activeRole.categories.map((cat, i) => {
                    const mockScore = [9, 8, 9, 7, 8][i % 5]
                    const c = scoreColor(mockScore)
                    return (
                      <div key={cat.id}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#374151',
                            }}
                          >
                            {cat.icon} {cat.label}
                          </span>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '99px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: c.bg,
                              color: c.text,
                              border: `1px solid ${c.border}`,
                            }}
                          >
                            {mockScore}/10
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: '#F1F5F9',
                            borderRadius: '99px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${mockScore * 10}%`,
                              height: '100%',
                              background: c.text,
                              borderRadius: '99px',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.73rem', color: '#94A3B8' }}>
                    View full rubric in Compass → How Do I Know I Am Doing A Good Job
                  </span>
                  <span
                    style={{
                      fontSize: '0.73rem',
                      color: activeRole.color,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    See history →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* The Standard */}
          <div
            style={{
              background: activeRole.color + '08',
              border: `1px solid ${activeRole.color}25`,
              borderLeft: `4px solid ${activeRole.color}`,
              borderRadius: '12px',
              padding: '1.1rem 1.4rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>📌</span>
            <div>
              <p
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: activeRole.color,
                  margin: '0 0 0.3rem',
                }}
              >
                The Standard
              </p>
              <p
                style={{
                  fontSize: '0.86rem',
                  color: '#374151',
                  lineHeight: 1.65,
                  margin: 0,
                  fontStyle: 'italic',
                  fontWeight: 500,
                }}
              >
                Your score is not meant to pressure you. It is meant to show you exactly where you
                stand and exactly where to improve. There are no surprises here — only clarity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
