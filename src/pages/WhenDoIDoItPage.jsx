import { useState } from 'react'
import { Clock } from 'lucide-react'

// ─── ROLE DATA ────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'founder',
    label: 'Founder',
    emoji: '👑',
    color: '#0F172A',
    rhythm: 'Daily + Weekly + Monthly',
    note: "Weekly is about staying out of trouble. Monthly is about making more money. Your job is to stare at a few key numbers and have the courage to pull the obvious lever.",
    daily: [
      { time: 'Morning', task: 'Daily Huddle (10–15 min) with Robyn + Rachel + Andrea — staffing/ratios, tours scheduled today, any fires (parent issues, staff issues). Goal: Does today break anywhere?' },
    ],
    weekly: [
      { day: 'Monday', tasks: ['Weekly Scoreboard with Robyn — 4 numbers: Occupancy %, New Enrollments/Withdrawals, Total Payroll Dollars, Cash in Bank'] },
      { day: 'Tuesday', tasks: ['Weekly Leadership Memos (45–60 min) — You + Robyn + Rachel: Scorecard Review (10–15 min), Wins/Losses (5 min), Top 3 Priorities (15–20 min), Who/What/When (15 min)'] },
      { day: 'Wednesday', tasks: ['Deep work — systems building, strategy, content, growth planning'] },
      { day: 'Thursday', tasks: ['Follow up on action items from Tuesday memos', 'Review any operational flags'] },
      { day: 'Friday', tasks: ['Weekly close — what got done, what moves to next week'] },
    ],
    monthly: [
      'Monthly Finance Review (60–90 min) with Robyn — Review last 3 months P&L, check 3 key ratios (Payroll % of Revenue, Avg Revenue per Child, Net Profit %), ask 3 diagnostic questions, pick ONE finance decision',
      'Bookkeeper reports due by the 15th: P&L, Balance Sheet, Aged Receivables',
      'Review all 10–12 KPIs across 3 functions — Enrollment, Experience & Retention, Cash & Admin',
      'Progress check on quarterly goals',
      'Full staff meeting close — vision, direction, what we are building toward',
    ],
  },
  {
    id: 'operator',
    label: 'Operator',
    emoji: '🏢',
    color: '#2563EB',
    rhythm: 'Daily + Weekly + Monthly',
    note: "Your job is not to run the daily operation — it's to make sure the daily operation runs itself. Your time is best spent on strategy, people, and systems. If you're solving daily fires, something upstream needs to be fixed.",
    daily: [
      { time: 'Arrival', task: 'Check In — Review priorities, align mindset, confirm the day is set up for success' },
      { time: 'First 30 min', task: 'View any Tours scheduled for the day — ensure Tour Manager is prepped and the building is tour-ready' },
      { time: 'Morning Block', task: 'Delivery Focus (Retention) — This is the heartbeat of the operation. Four lenses, every day:' },
      { time: '→ CS', task: "Customer Satisfaction — How are our parents' experience? How can we improve? What do they need?" },
      { time: '→ Product', task: 'Product — Are we hitting a 4-star TRS Rating and beyond? Is the classroom experience excellent?' },
      { time: '→ Service', task: 'Service — Response Rate, Tonality, Quality of Response to families and inquiries' },
      { time: '→ Fulfillment', task: 'Fulfillment — Ease & Speed of everything families interact with' },
      { time: 'Midday Block', task: 'Revenue Focus (Enrollment) — This is what grows the business. Three levers:' },
      { time: '→ Sales', task: 'Sales — Speed and Sequencing of lead follow-up and enrollment conversions' },
      { time: '→ Marketing', task: 'Marketing — Structure, Thinking, Data, & AI driving visibility and lead generation' },
      { time: '→ Tours', task: 'Tours — Conversion rates, tour quality, follow-up execution' },
    ],
    weekly: [
      { day: 'Monday', tasks: ["Review previous week's KPIs and enrollment numbers", 'Set weekly priorities and communicate to Director'] },
      { day: 'Tuesday', tasks: ['All meetings stacked here — Director check-in, department leads, any external calls'] },
      { day: 'Wednesday', tasks: ['Deep work — strategy, systems building, content, growth planning'] },
      { day: 'Thursday', tasks: ['Follow up on action items from Tuesday meetings', 'Review any operational flags or issues'] },
      { day: 'Friday', tasks: ["Weekly close — what got done, what didn't, what moves to next week", 'Financial snapshot review'] },
    ],
    monthly: [
      'Full financial review — revenue, expenses, enrollment vs. target',
      'Director performance review and alignment meeting',
      'Progress check on quarterly goals',
      'Hiring pipeline and staffing health review',
      'Identify one system to build, improve, or eliminate',
    ],
  },
  {
    id: 'director',
    label: 'Director',
    emoji: '📋',
    color: '#7C3AED',
    rhythm: 'Daily',
    note: "Your schedule is the heartbeat of this facility. When you're consistent, the building is consistent. Deviate from this without a reason, and the floor feels it.",
    daily: [
      { time: '6:45 AM', task: 'Arrive before first staff — building walk, safety check, temperature of the floor' },
      { time: '7:00 AM', task: 'Opening procedures — confirm ratios, sign-ins, classrooms ready for arrival' },
      { time: '7:00–9:00 AM', task: 'Morning drop-off window — visible, available, greeting families' },
      { time: '9:00–11:00 AM', task: 'Classroom walkthroughs — observe teachers, check lesson plan execution, document' },
      { time: '11:00 AM–12:00 PM', task: 'Administrative block — documentation, emails, compliance items' },
      { time: '12:00–1:00 PM', task: 'Lunch coverage and supervision check across classrooms' },
      { time: '1:00–3:00 PM', task: 'Nap/rest block — staff check-ins, individual coaching if needed' },
      { time: '3:00–5:30 PM', task: 'Afternoon pickup window — family communication, incident follow-up' },
      { time: '5:30 PM', task: 'Closing procedures — ratios confirmed, classrooms closed down, building secured' },
    ],
    weekly: [
      { day: 'Monday', tasks: ['Week kickoff — communicate priorities to staff', 'Confirm all lesson plans are submitted and approved'] },
      { day: 'Tuesday', tasks: ['Director check-in with Operator', 'Review any pending compliance or documentation items'] },
      { day: 'Wednesday', tasks: ['Mid-week classroom observation focus day'] },
      { day: 'Thursday', tasks: ['Staff pulse check — any issues surfacing before Friday?', "Confirm following week's staffing schedule"] },
      { day: 'Friday', tasks: ['End-of-week staff debrief', 'Submit weekly report to Operator'] },
    ],
    monthly: [
      'Full staff meeting — culture, performance, updates',
      'Individual check-ins with lead teachers',
      'Enrollment and retention review with Operator',
      'TRS documentation audit',
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '📚',
    color: '#059669',
    rhythm: 'Daily',
    note: 'Your classroom runs on routine. The children know what to do because you do it the same way every day. Consistency is not rigidity — it is safety.',
    daily: [
      { time: '7:00 AM', task: 'Classroom setup — materials ready, environment prepared before children arrive' },
      { time: '7:00–9:00 AM', task: 'Morning arrival — greet each child by name, connect with parents briefly' },
      { time: '9:00–9:30 AM', task: 'Morning meeting / circle time — calendar, weather, daily theme introduction' },
      { time: '9:30–11:00 AM', task: 'Structured learning block — lesson plan activities, small groups, centers' },
      { time: '11:00–11:30 AM', task: 'Handwashing, transition to lunch' },
      { time: '11:30 AM–12:15 PM', task: 'Lunch — seat children, assist as needed, model conversation' },
      { time: '12:15–2:15 PM', task: 'Rest / nap time — supervise, document observations, prep afternoon' },
      { time: '2:15–3:00 PM', task: 'Afternoon activity — movement, outdoor time, enrichment' },
      { time: '3:00–3:30 PM', task: 'Snack' },
      { time: '3:30–5:30 PM', task: 'Afternoon centers, pickup window — communicate with families at door' },
      { time: '5:30 PM', task: 'Classroom close-down — clean, restock, complete daily documentation' },
    ],
    weekly: [
      { day: 'Thursday', tasks: ["Submit next week's lesson plan to Lesson Plans Manager for review"] },
      { day: 'Friday', tasks: ["Reflect on the week — what worked, what didn't, what to adjust"] },
    ],
    monthly: [
      'Developmental observation documentation for each child due',
      'Attend full staff meeting',
      'Review any updated classroom standards or curriculum guidance',
    ],
  },
  {
    id: 'teacher-assistant',
    label: 'Teacher Assistant',
    emoji: '🤝',
    color: '#0891B2',
    rhythm: 'Daily',
    note: "Follow the classroom schedule alongside your lead teacher. When in doubt, ask. When the teacher steps out, step up — the standard doesn't change.",
    daily: [
      { time: '7:00 AM', task: 'Arrive and support classroom setup' },
      { time: '7:00–9:00 AM', task: 'Morning arrival support — active supervision, help settle children' },
      { time: '9:00 AM–12:00 PM', task: 'Morning learning block — support activities, assist small groups, maintain supervision' },
      { time: '12:00–12:15 PM', task: 'Lunch prep — handwashing, seating, serving assistance' },
      { time: '12:15 PM–2:15 PM', task: 'Rest time supervision — active presence, quiet engagement with awake children' },
      { time: '2:15–5:30 PM', task: 'Afternoon block — activity support, pickup window assistance' },
      { time: '5:30 PM', task: 'Support classroom close-down and cleaning' },
    ],
    weekly: [],
    monthly: [
      'Attend full staff meeting',
      'Complete any required training hours',
    ],
  },
  {
    id: 'front-desk',
    label: 'Front Desk Manager',
    emoji: '🖥️',
    color: '#D97706',
    rhythm: 'Daily',
    note: 'The front desk never goes unattended during operating hours. If you need to step away, arrange coverage first.',
    daily: [
      { time: '6:45 AM', task: 'Arrive before doors open — systems on, lobby clean, ready to receive families' },
      { time: '7:00–9:00 AM', task: 'Morning check-in window — greet every family, log attendance, answer questions' },
      { time: '9:00–11:00 AM', task: 'Inbound calls, emails, inquiry responses, tour scheduling' },
      { time: '11:00 AM–1:00 PM', task: 'Administrative block — billing questions, announcements, family communication' },
      { time: '1:00–3:00 PM', task: 'Quiet desk period — follow-up calls, filing, CRM updates' },
      { time: '3:00–5:30 PM', task: 'Afternoon pickup window — check-out logging, family communication, end-of-day notes' },
      { time: '5:30 PM', task: 'Close front desk — log any outstanding items, secure entrance' },
    ],
    weekly: [
      { day: 'Monday', tasks: ['Send weekly family communication / newsletter if applicable'] },
      { day: 'Friday', tasks: ["Review next week's tour schedule", 'Log weekly inquiry and call volume for Director'] },
    ],
    monthly: [
      'Audit family contact information for accuracy',
      'Review and update front desk SOPs as needed',
      'Attend full staff meeting',
    ],
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    emoji: '🔍',
    color: '#DC2626',
    rhythm: 'Ongoing + Weekly',
    note: "You are always recruiting — not just when there's an open position. The pipeline you build today fills tomorrow's urgent need.",
    daily: [],
    weekly: [
      { day: 'Monday', tasks: ['Review new applications received over the weekend', 'Post or refresh any active job listings'] },
      { day: 'Tuesday', tasks: ['Conduct scheduled first-round interviews', 'Update Operator on pipeline status'] },
      { day: 'Wednesday', tasks: ['Reference and background check follow-ups', 'Coordinate Director interviews for advancing candidates'] },
      { day: 'Thursday', tasks: ['Send offer letters or rejections as applicable', 'Update candidate tracker'] },
      { day: 'Friday', tasks: ['Weekly hiring report — applicants, interviews, pipeline health', 'Plan outreach for following week'] },
    ],
    monthly: [
      'Audit all open and anticipated positions with Director and Operator',
      'Review time-to-hire metrics and identify bottlenecks',
      'Refresh job postings and sourcing strategy if pipeline is thin',
      'Attend full staff meeting',
    ],
  },
  {
    id: 'tour-manager',
    label: 'Tour Manager',
    emoji: '🗺️',
    color: '#7C3AED',
    rhythm: 'Daily + Weekly',
    note: 'Tours should never be improvised. Every family gets the same structured, warm, confident experience — regardless of how busy the day is.',
    daily: [
      { time: 'Morning', task: 'Confirm all scheduled tours for the day — time, name, how they heard about us' },
      { time: '30 min before each tour', task: 'Prep tour route, materials, and talking points. Confirm lobby is clean.' },
      { time: 'During tour', task: 'Structured walkthrough — lobby, classrooms, outdoor, program overview, Q&A' },
      { time: 'Within 2 hours post-tour', task: 'Log tour notes in CRM — family name, children\'s ages, questions, objections, interest level' },
      { time: 'Same day or next morning', task: 'Send follow-up text or call to tour family' },
    ],
    weekly: [
      { day: 'Monday', tasks: ['Review all tours scheduled for the week', "Confirm follow-ups from previous week's tours are complete"] },
      { day: 'Friday', tasks: ['Submit weekly tour report — number of tours, conversions, pipeline', 'Flag any families close to decision for Director awareness'] },
    ],
    monthly: [
      'Review tour-to-enrollment conversion rate with Director',
      'Identify top objections and refine responses',
      'Attend full staff meeting',
    ],
  },
  {
    id: 'lesson-plans',
    label: 'Lesson Plans Manager',
    emoji: '📝',
    color: '#059669',
    rhythm: 'Weekly',
    note: 'Thursday is your hard deadline. Plans delivered late mean teachers start the week unprepared. That is not acceptable.',
    daily: [],
    weekly: [
      { day: 'Monday', tasks: ["Review the upcoming week's theme and learning objectives across all age groups", 'Begin drafting or compiling activities for each classroom'] },
      { day: 'Tuesday', tasks: ['Complete draft lesson plans for Infant through Toddler classrooms'] },
      { day: 'Wednesday', tasks: ['Complete draft lesson plans for Pre-K through Afterschool', 'Review all plans against TRS developmental benchmarks'] },
      { day: 'Thursday', tasks: ['Finalize and distribute all lesson plans to lead teachers — no exceptions', 'Address any teacher questions or adjustment requests'] },
      { day: 'Friday', tasks: ['Follow up with teachers — confirm plans received and understood', 'Begin gathering materials or notes for the week after next'] },
    ],
    monthly: [
      'Review curriculum themes for the following month',
      'Audit lesson plan completion and implementation quality with Director',
      'Attend full staff meeting',
      'Update lesson plan library with new activities and resources',
    ],
  },
  {
    id: 'kitchen-manager',
    label: 'Kitchen Manager',
    emoji: '🍽️',
    color: '#D97706',
    rhythm: 'Daily',
    note: 'Meals do not wait. Your schedule is non-negotiable — every classroom is counting on you hitting your windows.',
    daily: [
      { time: '6:45 AM', task: 'Kitchen open — temperature checks, equipment on, breakfast prep begins' },
      { time: '7:30–8:30 AM', task: 'Breakfast service window — meals out to classrooms on schedule' },
      { time: '8:30–9:30 AM', task: 'Breakfast cleanup, begin lunch prep' },
      { time: '9:30–11:00 AM', task: 'Full lunch preparation — all age groups, portion standards, allergy checks' },
      { time: '11:30 AM–12:30 PM', task: 'Lunch service window — meals delivered to classrooms' },
      { time: '12:30–1:30 PM', task: 'Lunch cleanup, kitchen sanitation, CACFP documentation' },
      { time: '1:30–2:30 PM', task: 'Snack prep' },
      { time: '3:00–3:30 PM', task: 'Snack service window' },
      { time: '3:30–4:30 PM', task: 'Final cleanup, inventory check, next-day prep notes' },
    ],
    weekly: [
      { day: 'Monday', tasks: ["Post the week's approved menu in all classrooms", 'Confirm food inventory for the full week'] },
      { day: 'Friday', tasks: ['Inventory audit — log what needs to be ordered', 'Submit food order for following week'] },
    ],
    monthly: [
      'Full kitchen equipment inspection',
      'CACFP records review and submission',
      'Menu planning for the following month',
      'Attend full staff meeting',
    ],
  },
  {
    id: 'asst-kitchen',
    label: 'Asst. Kitchen Manager',
    emoji: '🥄',
    color: '#0891B2',
    rhythm: 'Daily',
    note: "Your schedule mirrors the Kitchen Manager's exactly. When they're here, you support. When they're not, you lead — same times, same standards.",
    daily: [
      { time: '6:45 AM', task: 'Arrive with Kitchen Manager — support breakfast prep' },
      { time: '7:30–8:30 AM', task: 'Assist with breakfast service and delivery' },
      { time: '8:30–11:00 AM', task: 'Breakfast cleanup and lunch prep support' },
      { time: '11:30 AM–12:30 PM', task: 'Lunch service support' },
      { time: '12:30–2:30 PM', task: 'Cleanup, snack prep assistance' },
      { time: '3:00–4:30 PM', task: 'Snack service and final kitchen cleanup' },
    ],
    weekly: [],
    monthly: [
      'Attend full staff meeting',
      'Complete any required food handler certification renewals',
    ],
  },
  {
    id: 'bus-driver',
    label: 'Bus Driver',
    emoji: '🚌',
    color: '#DC2626',
    rhythm: 'Daily — Route-Based',
    note: 'Your schedule is fixed to the route. Early is on time. On time is late. Late is unacceptable when children are waiting.',
    daily: [
      { time: '45 min before first pickup', task: 'Pre-trip inspection — vehicle, safety equipment, seatbelts, first aid kit' },
      { time: 'Morning route window', task: 'Execute pickup route — confirmed stops, headcount at every door, no movement until all secured' },
      { time: 'Upon arrival at NexGen', task: 'Final headcount before any child exits — confirm against manifest, hand off to staff' },
      { time: 'Mid-day (if applicable)', task: 'Any mid-day transport runs — same pre-trip and headcount standards apply' },
      { time: 'Afternoon route window', task: 'Afterschool pickup — confirmed manifest, headcount, secured dropoffs' },
      { time: 'After last drop', task: 'Post-trip inspection — sweep vehicle for children or belongings, complete daily transport log' },
    ],
    weekly: [
      { day: 'Monday', tasks: ['Review route manifest for the week — any changes in pickup/dropoff?'] },
      { day: 'Friday', tasks: ['Submit weekly transport logs to Director', 'Report any vehicle maintenance needs immediately'] },
    ],
    monthly: [
      'Full vehicle inspection submitted to Director',
      'CDL and certification renewal check',
      'Attend full staff meeting',
      'Review and confirm emergency transport procedures',
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

const TimeBlock = ({ time, task, color }) => (
  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
    <div
      style={{
        minWidth: 90,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: color,
        paddingTop: '0.15rem',
        textAlign: 'right',
        flexShrink: 0,
      }}
    >
      {time}
    </div>
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flex: 1 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          marginTop: '0.25rem',
        }}
      />
      <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{task}</div>
    </div>
  </div>
)

const WeekRow = ({ day, tasks, color }) => (
  <div
    style={{
      display: 'flex',
      gap: '1rem',
      padding: '0.85rem 1rem',
      background: '#F8FAFC',
      borderRadius: '10px',
      border: '1px solid #F1F5F9',
      alignItems: 'flex-start',
    }}
  >
    <div
      style={{
        minWidth: 80,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        paddingTop: '0.1rem',
        flexShrink: 0,
      }}
    >
      {day}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
      {tasks.map((t, i) => (
        <div key={i} style={{ fontSize: '0.83rem', color: '#374151', lineHeight: 1.55 }}>
          • {t}
        </div>
      ))}
    </div>
  </div>
)

export default function WhenDoIDoItPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [tab, setTab] = useState('daily')

  const hasDailySchedule = activeRole.daily && activeRole.daily.length > 0
  const hasWeeklySchedule = activeRole.weekly && activeRole.weekly.length > 0
  const tabs = [
    ...(hasDailySchedule ? [{ id: 'daily', label: 'Daily Schedule' }] : []),
    ...(hasWeeklySchedule ? [{ id: 'weekly', label: 'Weekly Rhythm' }] : []),
    { id: 'monthly', label: 'Monthly' },
  ]
  const safeTab = tabs.find((t) => t.id === tab) ? tab : tabs[0]?.id

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
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
              When Do I Do It
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Your daily schedule, weekly rhythm, and monthly responsibilities — mapped to your
              role.
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
                onClick={() => {
                  setActiveRole(role)
                  setTab(role.daily?.length > 0 ? 'daily' : 'weekly')
                }}
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
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.2rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: activeRole.color,
                    background: activeRole.color + '12',
                    padding: '2px 8px',
                    borderRadius: '99px',
                  }}
                >
                  {activeRole.rhythm}
                </span>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '8px',
                    border: '1.5px solid',
                    borderColor: safeTab === t.id ? activeRole.color : '#E2E8F0',
                    background: safeTab === t.id ? activeRole.color + '12' : '#fff',
                    color: safeTab === t.id ? activeRole.color : '#64748B',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Timeline */}
          {safeTab === 'daily' && hasDailySchedule && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.75rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#94A3B8',
                  margin: '0 0 1.25rem',
                }}
              >
                Daily Schedule
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeRole.daily.map((item, i) => (
                  <TimeBlock key={i} time={item.time} task={item.task} color={activeRole.color} />
                ))}
              </div>
            </div>
          )}

          {/* Weekly Rhythm */}
          {safeTab === 'weekly' && hasWeeklySchedule && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.75rem',
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
                Weekly Rhythm
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activeRole.weekly.map((item, i) => (
                  <WeekRow key={i} day={item.day} tasks={item.tasks} color={activeRole.color} />
                ))}
              </div>
            </div>
          )}

          {/* Monthly */}
          {safeTab === 'monthly' && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '1.75rem',
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
                Monthly Responsibilities
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {activeRole.monthly.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #F1F5F9',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: activeRole.color + '18',
                        color: activeRole.color,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>
                      {item}
                    </span>
                  </div>
                ))}
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
            <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>⏱️</span>
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
                {activeRole.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
