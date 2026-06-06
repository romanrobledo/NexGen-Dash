import { useNavigate } from 'react-router-dom'
import { Wrench, BookOpen, UserCircle, ArrowRight } from 'lucide-react'
import { useSelectedRoleId } from '../hooks/useSelectedRole'
import { useViewMode } from '../contexts/ViewModeContext'

// ─── ROLE DATA ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'visionary',
    label: 'Visionary',
    emoji: '👑',
    color: '#0F172A',
    tagline: 'Vision, culture, brand, big bets. Hand execution to the Integrator.',
    sections: [
      { title: 'Annual Vision Building (1 day, January)', description: 'Alone or with Integrator. Write/refresh the 3-Year Picture, 10-Year Target, Core Values, and Core Focus (Purpose + Niche). This is the Rocket Fuel Vision/Traction Organizer (V/TO) work. Output: a one-page document the whole leadership team will rally around.' },
      { title: 'Quarterly Pulse with Integrator (half day)', description: 'Review the V/TO against reality. Adjust the 3-Year Picture only if the world changed. Set 3–7 quarterly Rocks for the company. Hand the Rocks to the Integrator — do not assign them yourself.' },
      { title: 'Weekly Same Page Meeting (60–90 min, 1:1 with Integrator)', description: 'Per Rocket Fuel: the two of you meet with no one else in the room. Walk through the top 3 issues on your mind and the top 3 on theirs. Use IDS (Identify, Discuss, Solve). Leave aligned — no surprises in the leadership meeting.' },
      { title: 'Idea Capture Routine', description: 'Generate 10–20 ideas a week — that is the Visionary job. Drop them in one place (Slack thread, Notion inbox, voice memo). Do NOT hand-deliver every idea to the team. Review the list with the Integrator weekly. They filter; you let go.' },
      { title: 'Culture & Brand Walks', description: 'Walk the building 2–3 times per week. Don\'t solve problems on the floor — observe. Note: how does the team talk to kids? Is the energy right? Are Core Values visible? Report what you saw to the Integrator in the Same Page meeting.' },
      { title: 'Major Relationships (Ongoing)', description: 'You own the top 20 relationships: major community partners, referral sources, press, top 5 hero families, licensing leadership, potential investors, second-location landlords. Don\'t delegate these — maintain them.' },
      { title: 'R&D + New Bets', description: 'Explore ONE new bet at a time — new program, new pricing model, new location, new offer. Prototype on paper, pressure-test with the Integrator. If they say "we don\'t have capacity," it\'s not yes — it\'s not yet.' },
      { title: 'Hold the Integrator Accountable', description: 'In the Same Page meeting, review the Scorecard and Rocks the Integrator owns. If numbers are red for 3+ weeks, it\'s a conversation. Your job is to hold them to the vision — not to take the wheel yourself.' },
      { title: 'Quarterly State of NexGen (30 min to full team)', description: 'You — not the Integrator — deliver the big-picture update to the whole team each quarter. Cover: where we are, where we\'re going, what we stand for, what the team should be proud of. This is culture work, not operations.' },
      { title: 'Annual Personal Reset', description: 'Once a year, step out of the building for 2–3 days. Read, think, walk. Come back with a short list of what you believe the next year should be about. Bring it to the Integrator first — not the leadership team.' },
    ],
    toolStack: {
      note: 'Visionary tooling should be minimal. Don\'t live inside dashboards — that\'s the Integrator\'s job. Your tools exist to capture ideas and see the big picture.',
      functions: [
        { name: 'Vision / V-TO', emoji: '🎯', tools: ['Notion (V-TO page)', 'Google Docs'], owner: 'You' },
        { name: 'Idea Capture', emoji: '💡', tools: ['Slack #visionary-ideas', 'Voice memos'], owner: 'You' },
        { name: 'Culture & Brand', emoji: '🎨', tools: ['Canva', 'Instagram', 'Community events'], owner: 'You + Robyn for execution' },
        { name: 'Relationships', emoji: '🤝', tools: ['Gmail', 'Phone', 'In-person'], owner: 'You' },
        { name: 'Scorecard (read-only)', emoji: '📊', tools: ['NexGen OS Scorecard view'], owner: 'Integrator runs it; you read it' },
      ],
    },
  },
  {
    id: 'integrator',
    label: 'Integrator',
    emoji: '⚙️',
    color: '#1E3A8A',
    tagline: 'LMA the leadership team. Run the Scorecard. Make the vision real.',
    sections: [
      { title: 'Weekly Level 10 Meeting (90 min, leadership team)', description: 'Rocket Fuel / EOS cornerstone. Same day, same time, every week. Agenda: Segue (5), Scorecard (5), Rock review (5), Customer/Employee headlines (5), To-Do list (5), IDS — Identify, Discuss, Solve (60), Conclude (5). Non-negotiable. You own the facilitation.' },
      { title: 'Scorecard Ownership (10–12 numbers, weekly)', description: 'Build and maintain a single Scorecard with 10–12 weekly numbers covering Enrollment, Experience, and Cash. Every number has an owner and a weekly goal. Red 3 weeks in a row becomes an Issue in the L10. You chase red — not the Visionary.' },
      { title: 'Weekly Same Page Meeting with Visionary (60–90 min)', description: 'Your one recurring meeting with the founder. Come prepared: top 3 issues, Scorecard summary, the ideas you are filtering, decisions you need. Leave with alignment and a short list of what only the Visionary can decide.' },
      { title: 'Daily Huddle Routine', description: 'Lead a 10–15 min stand-up with Director and Front Desk. Three questions only: What did we win yesterday? What could break today? What do you need from me? No problem-solving in the huddle — capture for later.' },
      { title: 'Quarterly Rocks Process', description: 'After Visionary + Integrator set the 3–7 company Rocks, break them down with the leadership team. Each leader owns 1–3 Rocks per quarter. Reviewed weekly in the L10 as On-Track / Off-Track. Off-Track two weeks in a row = issue.' },
      { title: 'Monthly Finance Review (90 min, with Visionary)', description: 'You own the deck. Walk the P&L, 3 key ratios (Payroll %, Avg Revenue per Child, Net Profit %), and Aged Receivables. Bring a recommendation for the ONE finance decision of the month. The Visionary decides; you execute.' },
      { title: 'LMA Your Direct Reports', description: 'Leadership, Management, Accountability for: Director, Front Desk Manager, Marketing lead, Bookkeeper. Weekly 1:1, quarterly conversations, annual review. Use the People Analyzer: right person (Core Values) + right seat (GWC — Gets it, Wants it, Capacity to do it).' },
      { title: 'Idea Filter Protocol', description: 'When the Visionary drops an idea, your default answer is "interesting — let\'s park it and bring it to next Same Page." Only 1–2 out of 10 ideas should become Rocks. Protect the team from whiplash. If it\'s a no, say why using the Scorecard as evidence.' },
      { title: 'Cross-Functional Issue Resolution (IDS)', description: 'When Director and Front Desk clash, when Marketing and Operations disagree — you mediate using IDS. Identify the real issue (not the symptom), Discuss (everyone talks once), Solve (one owner, one next action, one date). No issue stays open more than 2 L10s.' },
      { title: 'Remove Obstacles for the Director', description: 'The Director runs the floor. Your job is to make that easy. Weekly ask: "What\'s in your way this week that only I can unblock?" Then go unblock it — tools, budget, permissions, people. Never let the Director hit the same wall twice.' },
    ],
    toolStack: {
      note: 'Integrator tooling is where the real operating system lives. This is where the Scorecard, Rocks, and L10 run from.',
      functions: [
        { name: 'Scorecard & Rocks', emoji: '📊', tools: ['NexGen OS', 'Google Sheets (backup)'], owner: 'You (Integrator)' },
        { name: 'L10 Meeting', emoji: '🗓️', tools: ['Google Meet', 'Notion agenda', 'Issues list'], owner: 'You' },
        { name: 'LMA / 1:1s', emoji: '👥', tools: ['Notion 1:1 template', 'Gusto', 'People Analyzer'], owner: 'You' },
        { name: 'Enrollment Funnel', emoji: '📈', tools: ['Bitsync', 'Slack #enrollment', 'Google Ads dashboards'], owner: 'You + Marketing lead' },
        { name: 'Finance', emoji: '💰', tools: ['QuickBooks', 'Gusto', 'Bookkeeper reports'], owner: 'You + bookkeeper' },
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
      { title: 'Running the Operating System — Scorecard', description: 'How to own the weekly Scorecard: assign KPI owners, set targets, and chase red numbers before they become issues.' },
      { title: 'Running the Operating System — Meeting Cadence', description: 'How to run the Level 10 leadership meeting, Same Page with the Visionary, quarterly Rocks reviews, and annual planning.' },
      { title: 'Running the Operating System — Org Hierarchy', description: 'How to maintain the accountability chart — one seat, one owner, five roles, clearly defined.' },
      { title: 'Running the Operating System — Performance Standards', description: 'How to set and enforce the non-negotiables for safety, TRS, parent comms, curriculum, and financial health.' },
      { title: 'Running the Operating System — Risk & Continuity', description: 'How to maintain crisis protocols, business continuity plans, and emergency procedures so nothing surprises you.' },
    ],
    operatingSystem: true,
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
  const [selectedId] = useSelectedRoleId()
  const activeRole = ROLES.find((r) => r.id === selectedId) || ROLES[0]
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-6">
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

      {/* Choose a different Role button */}
      <button
        onClick={() => navigate('/dashboard/who-am-i')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0.5rem 0.95rem',
          borderRadius: 10,
          border: '1.5px solid #E2E8F0',
          background: '#fff',
          color: '#475569',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginBottom: '1rem',
          transition: 'all .15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#CBD5E1'
          e.currentTarget.style.background = '#F8FAFC'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E2E8F0'
          e.currentTarget.style.background = '#fff'
        }}
      >
        <UserCircle size={14} /> Choose a different Role
      </button>

      {/* Main Content */}
      <div>
        {/* Role Detail */}
        <div style={{ minWidth: 0 }}>
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

          {/* Operating System CTA — Operator only */}
          {activeRole.operatingSystem && (
            <button
              onClick={() => navigate('/operating-system')}
              style={{
                background: '#0F172A',
                border: '1px solid #0F172A',
                borderRadius: '14px',
                padding: '1.5rem 1.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.75rem' }}>⚙️</span>
                <div>
                  <p
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#60A5FA',
                      margin: 0,
                    }}
                  >
                    Run The System
                  </p>
                  <p
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: '#F8FAFC',
                      margin: '0.15rem 0 0.25rem',
                    }}
                  >
                    Open the NexGen Operating System
                  </p>
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: '#94A3B8',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    The full operating playbook you own — scorecard, meetings, hierarchy, standards, and continuity plans.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: '#60A5FA', flexShrink: 0 }} />
            </button>
          )}

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
              <div style={{ display: 'grid', gridTemplateColumns: mobileMode ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
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
