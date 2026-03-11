import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Wrench, BookOpen, ArrowLeft } from 'lucide-react'

// ─── ROLE DATA ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'founder',
    label: 'Founder',
    emoji: '👑',
    color: '#0F172A',
    tagline: 'Monitor + decide. Read the dials, pull the levers.',
    sections: [
      { title: 'Monthly Bookkeeper Request (By the 15th)', description: 'Request 3 reports: P&L (Profit & Loss) by month, Balance Sheet (cash position and debt), and Aged Receivables (subsidy vs. private pay breakdown). Group expenses into 5 buckets: Payroll, Facility, Food & Classroom, Admin/Software/Insurance, Other.' },
      { title: 'Monthly Owner Finance Routine (60 min)', description: 'With Robyn (optionally bookkeeper on Zoom). Step A: Review last 3 months P&L — revenue trend up, flat, or down? Step B: Check 3 key ratios. Step C: Ask 3 diagnostic questions. Step D: Pick ONE finance decision.' },
      { title: '3 Key Financial Ratios', description: 'Payroll % of Revenue (Target: ~50–55% — is labor cost under control?), Average Revenue per Child (are you charging enough?), Net Profit % (Target: ~20%+ — is the business healthy?).' },
      { title: '3 Diagnostic Questions', description: 'Do we need to fill more seats? (Occupancy low). Do we need to raise prices? (Revenue per child too low). Do we need to control a cost bucket? (Payroll or facility out of line).' },
      { title: 'Pick ONE Finance Decision', description: 'Every monthly meeting must end with a specific finance decision: "We are raising private-pay rates on [DATE]" or "We\'re cutting/renegotiating [EXPENSE]" or "We\'re going to push enrollment on [AGE GROUPS]." No meeting ends without a specific finance decision.' },
      { title: 'Weekly Scoreboard (Quick Check)', description: 'Track 4 numbers with Robyn: Occupancy % (are seats filled?), New Enrollments/Withdrawals (trend direction), Total Payroll Dollars that week (largest expense in check?), Cash in Bank (above 1 month of expenses? Yes/No).' },
      { title: 'Daily Huddle (10–15 min)', description: 'With Robyn + Rachel + Andrea. Cover: today\'s staffing/ratios, tours scheduled today, any fires (parent issues, staff issues). Goal: "Does today break anywhere?"' },
      { title: 'Weekly Leadership Memos (45–60 min)', description: 'With Robyn + Rachel. Agenda: Scorecard Review (10–15 min — look at all KPIs, circle anything red), Wins/Losses (5 min), Top 3 Priorities (15–20 min — what to fix next week), Who/What/When (15 min — assign owners and due dates).' },
      { title: '3 Core Functions Oversight', description: 'Enrollment (Robyn + Andrea): ads, inquiries, tours, enrollments. Experience & Retention (Rachel + Robyn): classroom quality, TRS, parent happiness, kid retention. Cash & Admin (You + bookkeeper): billing, collections, payroll, HR paperwork.' },
      { title: 'Quarterly Planning Process', description: 'Set and cascade quarterly goals across all 3 functions. Create clear breakdown for each focus area: clear targets, clear responsibilities, clear tasks, clear deadlines.' },
    ],
    toolStack: {
      note: 'Slack is the central hub. Everything routes through it. The NexGen Operating System (this software) is the focal point for role clarity, procedures, and KPIs.',
      functions: [
        { name: 'Acquisition', emoji: '📈', tools: ['Bitsync', 'Facebook', 'Google Ads', 'Slack'], owner: 'Robyn + Robyne + Ed' },
        { name: 'Delivery', emoji: '🏫', tools: ['Bitsync', 'Slack'], owner: 'Rachel + Teachers' },
        { name: 'Marketing & Content', emoji: '🎨', tools: ['Slack', 'Canva', 'SurveyMonkey'], owner: 'Robyne + Ed' },
        { name: 'Operations', emoji: '⚙️', tools: ['Slack', 'Google Workspace', 'Gusto'], owner: 'Robyn + Rachel' },
        { name: 'Management', emoji: '👑', tools: ['Google Workspace', 'Gusto', 'Bitsync', 'SurveyMonkey', 'ClickUp', 'Slack'], owner: 'You (Founder)' },
      ],
    },
  },
  {
    id: 'operator',
    label: 'Operator',
    emoji: '🏢',
    color: '#2563EB',
    tagline: 'Systems, strategy, and building the machine.',
    sections: [
      { title: 'Morning Check-In Routine', description: "How to start the day — review priorities, check today's tours, and set the building up for success." },
      { title: 'Delivery Focus: Customer Satisfaction', description: "How to evaluate and improve parents' experience — feedback loops, NPS, and proactive outreach." },
      { title: 'Delivery Focus: Product & TRS Quality', description: 'How to monitor and drive toward a 4-star TRS Rating and beyond — classroom observations, scoring, improvement plans.' },
      { title: 'Delivery Focus: Service & Fulfillment', description: 'How to measure Response Rate, Tonality, Quality of Response, and the Ease & Speed families experience.' },
      { title: 'Revenue Focus: Sales Pipeline', description: 'How to manage Speed and Sequencing of enrollment — lead follow-up, conversion tracking, and closing.' },
      { title: 'Revenue Focus: Marketing & AI', description: 'How to build Structure, Thinking, Data, & AI into your marketing engine for visibility and lead generation.' },
      { title: 'Revenue Focus: Tour Conversions', description: 'How to track and improve tour-to-enrollment conversion rates and ensure follow-up execution.' },
      { title: 'Quarterly Planning Process', description: 'How to set and cascade quarterly goals across all departments.' },
      { title: 'Financial Review & Budget Management', description: 'How to review P&L, manage cash flow, and approve expenditures.' },
      { title: 'Systems Audit Checklist', description: 'Monthly audit of all operational systems to identify gaps.' },
    ],
  },
  {
    id: 'director',
    label: 'Director',
    emoji: '📋',
    color: '#7C3AED',
    tagline: 'Running the floor, leading the team, holding the line.',
    sections: [
      { title: 'Daily Walkthrough Checklist', description: 'Morning, midday, and end-of-day classroom observation routine.' },
      { title: 'Staff Feedback & Coaching', description: 'How to deliver real-time feedback and monthly performance conversations.' },
      { title: 'TRS Compliance Documentation', description: 'Step-by-step guide to maintaining all TRS-required records.' },
      { title: 'Parent Escalation Protocol', description: 'How to handle complaints, concerns, and difficult conversations with families.' },
      { title: 'Weekly Team Meeting Structure', description: 'Agenda template, preparation, and follow-up process.' },
      { title: 'Ratio & Attendance Monitoring', description: 'Daily process for tracking ratios and flagging coverage gaps.' },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '📚',
    color: '#059669',
    tagline: 'Your classroom playbook — from open to close.',
    sections: [
      { title: 'Classroom Setup & Morning Routine', description: 'How to prepare your room before children arrive each day.' },
      { title: 'Lesson Plan Execution', description: 'How to implement the weekly lesson plan with fidelity and flexibility.' },
      { title: 'Positive Behavior Guidance', description: 'Language, techniques, and de-escalation strategies for every age group.' },
      { title: 'Incident & Observation Documentation', description: 'How and when to document injuries, behaviors, and developmental milestones.' },
      { title: 'Family Communication', description: 'Drop-off and pick-up protocols, daily reports, and parent conversations.' },
      { title: 'Transition Management', description: 'How to move children smoothly between activities, meals, and outdoor time.' },
      { title: 'Self-Defense Curriculum Integration', description: 'How to weave self-defense lessons into your daily schedule.' },
    ],
  },
  {
    id: 'teacher-assistant',
    label: 'Teacher Assistant',
    emoji: '🤝',
    color: '#0891B2',
    tagline: 'Supporting the lead, never dropping the ball.',
    sections: [
      { title: 'Active Supervision Protocols', description: 'Positioning, scanning, and engagement techniques during all activities.' },
      { title: 'Classroom Support Routines', description: 'Setup, cleanup, and material prep responsibilities throughout the day.' },
      { title: 'Stepping Up as Lead', description: 'What to do when the lead teacher steps out — your immediate checklist.' },
      { title: 'Personal Care Procedures', description: 'Diapering, feeding, and hygiene routines with proper documentation.' },
      { title: 'Incident Reporting', description: 'How to document and report any concern in real time.' },
    ],
  },
  {
    id: 'front-desk',
    label: 'Front Desk Manager',
    emoji: '🖥️',
    color: '#D97706',
    tagline: 'Owning the front of house, every interaction.',
    sections: [
      { title: 'Morning Open Procedure', description: 'Unlocking, system checks, and greeting protocol before families arrive.' },
      { title: 'Check-In & Check-Out Process', description: 'Step-by-step attendance tracking and verification.' },
      { title: 'Phone & Email Response Standards', description: 'Response time targets, tone guidelines, and escalation paths.' },
      { title: 'Visitor & Tour Intake', description: 'How to log visitors, direct tour inquiries, and manage the lobby.' },
      { title: 'End-of-Day Close Procedure', description: 'System shutdown, daily reporting, and handoff notes.' },
    ],
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    emoji: '🔍',
    color: '#DC2626',
    tagline: 'Finding, filtering, and onboarding the right people.',
    sections: [
      { title: 'Job Posting & Platform Management', description: 'Where to post, how to write listings, and refresh cadence.' },
      { title: 'Applicant Screening Process', description: 'Resume review criteria, phone screen questions, and advancement rules.' },
      { title: 'Interview Workflow', description: 'First-round structure, scoring rubric, and handoff to Director.' },
      { title: 'Background Check & Documentation', description: 'Required checks, timeline expectations, and compliance tracking.' },
      { title: 'Pipeline Management', description: 'How to maintain a bench of candidates and track open positions.' },
    ],
  },
  {
    id: 'tour-manager',
    label: 'Tour Manager',
    emoji: '🗺️',
    color: '#7C3AED',
    tagline: 'Converting tours into enrolled families.',
    sections: [
      { title: 'Tour Scheduling & Confirmation', description: 'Booking process, reminder cadence, and no-show follow-up.' },
      { title: 'Tour Script & Walkthrough', description: 'The structured tour flow — what to say, show, and emphasize.' },
      { title: 'Objection Handling Guide', description: 'Common concerns and confident, honest responses.' },
      { title: 'Follow-Up Sequence', description: '24-hour, 3-day, and 7-day follow-up process after every tour.' },
      { title: 'Conversion Tracking', description: 'How to log tours, track conversion rates, and report weekly.' },
    ],
  },
  {
    id: 'lesson-plans',
    label: 'Lesson Plans Manager',
    emoji: '📝',
    color: '#059669',
    tagline: 'Building the weekly roadmap for every classroom.',
    sections: [
      { title: 'Weekly Planning Process', description: 'Timeline, inputs, and approval workflow for lesson plan creation.' },
      { title: 'Age-Appropriate Activity Design', description: 'Frameworks and resources for each developmental stage.' },
      { title: 'TRS Alignment Checklist', description: 'How to verify every plan meets TRS curriculum requirements.' },
      { title: 'Teacher Feedback Loop', description: 'How to collect and incorporate classroom feedback into future plans.' },
      { title: 'Activity Library Management', description: 'Organizing and maintaining your bank of activities and themes.' },
    ],
  },
  {
    id: 'kitchen-manager',
    label: 'Kitchen Manager',
    emoji: '🍽️',
    color: '#D97706',
    tagline: 'Safe meals, on time, every single day.',
    sections: [
      { title: 'Daily Meal Prep Routine', description: 'Timeline from morning prep to final cleanup.' },
      { title: 'CACFP Compliance Documentation', description: 'What to log, when, and how to stay audit-ready.' },
      { title: 'Inventory & Ordering Process', description: 'Weekly inventory count, vendor ordering, and budget management.' },
      { title: 'Allergy & Dietary Accommodation', description: 'Tracking restrictions, labeling meals, and zero-error protocols.' },
      { title: 'Kitchen Safety & Sanitation', description: 'Daily, weekly, and monthly sanitation checklists.' },
    ],
  },
  {
    id: 'asst-kitchen',
    label: 'Asst. Kitchen Manager',
    emoji: '🥄',
    color: '#0891B2',
    tagline: 'Keeping the kitchen running at the same standard.',
    sections: [
      { title: 'Meal Prep Support Duties', description: 'Your prep, plating, and serving responsibilities each day.' },
      { title: 'Sanitation Routines', description: 'Ongoing cleaning tasks and end-of-day deep clean protocol.' },
      { title: 'Stepping In as Lead', description: 'Full Kitchen Manager duties during absences — the same standard applies.' },
      { title: 'Inventory Flagging', description: 'How to track stock levels and alert the Kitchen Manager.' },
    ],
  },
  {
    id: 'bus-driver',
    label: 'Bus Driver',
    emoji: '🚌',
    color: '#DC2626',
    tagline: 'Safe routes, accurate headcounts, zero compromises.',
    sections: [
      { title: 'Pre-Trip Vehicle Inspection', description: 'Full checklist before every single run — no exceptions.' },
      { title: 'Pickup & Drop-Off Procedures', description: 'Stop protocol, child verification, and parent handoff process.' },
      { title: 'Headcount Protocol', description: 'When and how to count — at every stop, before every move.' },
      { title: 'Incident & Delay Communication', description: 'How to immediately report any issue to the Director.' },
      { title: 'Vehicle Maintenance & Logs', description: 'Daily logs, mileage tracking, and maintenance request process.' },
    ],
  },
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const RoleCard = ({ role, isActive, onClick }) => (
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
      transition: 'all 0.15s ease',
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

export default function HowDoIDoItPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roleParam = searchParams.get('role')

  const [activeRole, setActiveRole] = useState(() => {
    if (roleParam) {
      const found = ROLES.find((r) => r.id === roleParam)
      if (found) return found
    }
    return ROLES[0]
  })

  // Update active role when URL param changes
  useEffect(() => {
    if (roleParam) {
      const found = ROLES.find((r) => r.id === roleParam)
      if (found) setActiveRole(found)
    }
  }, [roleParam])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
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
              How Do I Do It
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Step-by-step guides, procedures, and best practices for doing your job well.
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
              <RoleCard
                key={role.id}
                role={role}
                isActive={activeRole.id === role.id}
                onClick={() => setActiveRole(role)}
              />
            ))}
          </div>

          {/* Back link */}
          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
            <button
              onClick={() => navigate(`/dashboard/what-do-i-do`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: '#94A3B8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.3rem 0.5rem',
              }}
            >
              <ArrowLeft style={{ width: 12, height: 12 }} />
              Back to What Do I Do
            </button>
          </div>
        </div>

        {/* Role Detail */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Role Header */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '1.75rem',
              marginBottom: '1rem',
              borderTop: `4px solid ${activeRole.color}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{activeRole.emoji}</span>
              <div>
                <h2
                  style={{
                    fontSize: '1.25rem',
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
                    fontSize: '0.85rem',
                    fontStyle: 'italic',
                    color: activeRole.color,
                    fontWeight: 600,
                    margin: 0,
                    marginTop: '0.15rem',
                  }}
                >
                  {activeRole.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Procedure Sections */}
          <div
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}
          >
            <p
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                margin: '0 0 1rem',
              }}
            >
              Procedures & Guides
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {activeRole.sections.map((section, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #F1F5F9',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = activeRole.color + '40'
                    e.currentTarget.style.background = activeRole.color + '06'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#F1F5F9'
                    e.currentTarget.style.background = '#F8FAFC'
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      background: activeRole.color + '15',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <BookOpen
                      style={{ width: 16, height: 16, color: activeRole.color }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: '#0F172A',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {section.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748B',
                        lineHeight: 1.55,
                      }}
                    >
                      {section.description}
                    </div>
                    <div
                      style={{
                        marginTop: '0.6rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#94A3B8',
                        background: '#F1F5F9',
                        padding: '3px 10px',
                        borderRadius: '99px',
                      }}
                    >
                      📄 Content coming soon
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Stack (Founder only) */}
          {activeRole.toolStack && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.5rem',
                marginBottom: '1rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  margin: '0 0 0.5rem',
                }}
              >
                NexGen Tool Stack
              </p>
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 1.25rem',
                }}
              >
                {activeRole.toolStack.note}
              </p>

              {/* Slack Hub Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#4A154B12',
                  border: '2px solid #4A154B30',
                  borderRadius: '14px',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>💬</span>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: '#4A154B', margin: 0 }}>Slack</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.1rem 0 0', fontWeight: 500 }}>
                    Central hub — everything connects through Slack
                  </p>
                </div>
              </div>

              {/* Function Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {activeRole.toolStack.functions.map((fn) => (
                  <div
                    key={fn.name}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '1rem 1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{fn.emoji}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{fn.name}</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', margin: '0 0 0.4rem' }}>
                      Owner: {fn.owner}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {fn.tools.map((tool) => (
                        <span
                          key={tool}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: tool === 'Slack' ? '#4A154B' : '#374151',
                            background: tool === 'Slack' ? '#4A154B15' : '#E2E8F0',
                            border: tool === 'Slack' ? '1px solid #4A154B30' : '1px solid #CBD5E1',
                            padding: '2px 8px',
                            borderRadius: '99px',
                          }}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info callout */}
          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderLeft: '4px solid #2563EB',
              borderRadius: '12px',
              padding: '1.1rem 1.4rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>💡</span>
            <div>
              <p
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#2563EB',
                  margin: '0 0 0.3rem',
                }}
              >
                Building In Progress
              </p>
              <p
                style={{
                  fontSize: '0.84rem',
                  color: '#374151',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                Each procedure above will be expanded with detailed step-by-step instructions,
                checklists, and reference materials. Check back as content is added for your role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
