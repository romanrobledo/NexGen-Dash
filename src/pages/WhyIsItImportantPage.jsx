import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

// ─── ROLE DATA ────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: 'founder',
    label: 'Founder',
    emoji: '👑',
    color: '#0F172A',
    headline: 'Because if the business isn\'t healthy, nothing else survives.',
    body: "Every classroom, every teacher, every meal served, every child who walks through these doors — it all depends on the financial health and strategic clarity of this business. Without revenue, there is no payroll. Without systems, there is no consistency. Without someone watching the numbers and having the courage to make hard decisions, the whole operation drifts. You are not running the daily operation — that is the Operator and Director. But you are running the machine that makes the daily operation possible. The families who trust NexGen are trusting that someone at the top is building something that will last. That someone is you. The real constraint is filling seats profitably. Everything else is noise. When you collapse to 3 core functions, track only 10–12 numbers, and make one clear decision every month — you are protecting every child, every family, and every team member in this building.",
    weight: "Pricing changes are usually the highest-ROI lever by far. Your job is to stare at a few key numbers every month and have the courage to pull the obvious lever.",
    stats: [
      { label: 'Core functions you oversee', value: '3' },
      { label: 'KPIs across the entire operation', value: '10–12' },
      { label: 'Finance decisions per monthly review', value: '1 minimum' },
    ],
  },
  {
    id: 'operator',
    label: 'Operator',
    emoji: '🏢',
    color: '#2563EB',
    headline: 'Because without strong leadership, nothing else holds.',
    body: "Every system, every standard, every staff member's ability to show up and do their job well — it all traces back to the decisions made at the top. When the Operator is clear, the Director is confident. When the Director is confident, teachers are focused. When teachers are focused, children thrive. It flows in one direction. That means your decisions, your standards, and your attention to the health of this business have a direct impact on every child we serve — even if you never step foot in a classroom. The families who trust NexGen are trusting the infrastructure you build. That is not a small thing.",
    weight: "If the business isn't healthy, the classrooms aren't safe. Your role protects everything downstream.",
    stats: [
      { label: "Children depending on this school's stability", value: 'Every enrolled child' },
      { label: 'Staff depending on your leadership clarity', value: 'Every employee' },
      { label: 'Families trusting your systems', value: 'Every family' },
    ],
  },
  {
    id: 'director',
    label: 'Director',
    emoji: '📋',
    color: '#7C3AED',
    headline: 'Because someone has to hold the standard when no one is watching.',
    body: "The Director is the reason NexGen either rises or falls on any given day. You are the connection between what NexGen promises and what NexGen delivers. Parents drop their children off every morning and trust that the person running this building knows what they're doing. They trust that the teachers have been trained, the classrooms are supervised, the ratios are correct, and the environment is safe. That trust is entirely dependent on you enforcing it — not sometimes, not when it's convenient, but every single day. The moment standards slip at your level, they collapse at every level below you.",
    weight: "You don't get to have a bad day that shows. The staff takes their cues from you. So do the children.",
    stats: [
      { label: 'TRS compliance ultimately rests on', value: 'Your oversight' },
      { label: 'Parent trust is built or broken by', value: 'Your consistency' },
      { label: 'Staff culture is set by', value: 'What you tolerate' },
    ],
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '📚',
    color: '#059669',
    headline: 'Because the first five years determine more than most people realize.',
    body: "Research is unambiguous: the experiences children have between birth and age five shape the architecture of their developing brain. The words used around them, the consistency of their routines, the way adults respond to their emotions, the safety they feel in their environment — all of it is being wired in. You are not babysitting. You are participating in neurodevelopment. The child who feels safe in your classroom learns to trust. The child who is spoken to with warmth develops language faster. The child whose curiosity is encouraged becomes a learner for life. And the child who is threatened, belittled, or ignored carries that too. Every interaction you have in that classroom is either building something or breaking something. There is no neutral.",
    weight: 'You may be the most consistent, caring adult in some of these children\'s lives. Act accordingly.',
    stats: [
      { label: 'Brain development that occurs before age 5', value: '90%' },
      { label: 'Impact of a caring teacher on long-term outcomes', value: 'Lifelong' },
      { label: 'Children who need this environment most', value: 'All of them' },
    ],
  },
  {
    id: 'teacher-assistant',
    label: 'Teacher Assistant',
    emoji: '🤝',
    color: '#0891B2',
    headline: 'Because a teacher without backup is a classroom at risk.',
    body: "Your role exists because one adult cannot do this alone — not safely, not well. When you are fully present, engaged, and reliable, the lead teacher can focus on delivering a great lesson instead of managing the room alone. When you're distracted, checked out, or treating your role as secondary, the quality of every child's experience drops. Children notice everything. They notice when the adult in the room isn't paying attention. They notice when something feels off. Your attentiveness is a direct layer of safety and stability that these children rely on, even if they can't articulate it. You are not a backup plan. You are half of the equation.",
    weight: 'One lapse in supervision is all it takes for something to go wrong. Your presence is protection.',
    stats: [
      { label: 'Supervision gaps that start with inattention', value: 'Most of them' },
      { label: 'Incidents that could be prevented with active assistance', value: 'The majority' },
      { label: 'Children watching both adults in the room', value: 'All of them' },
    ],
  },
  {
    id: 'front-desk',
    label: 'Front Desk Manager',
    emoji: '🖥️',
    color: '#D97706',
    headline: 'Because trust is built in the first 30 seconds — and lost just as fast.',
    body: "Families make a decision about NexGen before they ever see a classroom. They make it the moment they walk through the door and interact with you. A warm, competent, organized front desk communicates that this is a well-run school. A cold, distracted, or disorganized one communicates the opposite — and no tour, no brochure, and no curriculum will overcome that first impression. Beyond enrollment, you are the daily emotional temperature gauge for every family. Parents who feel heard and informed stay. Parents who feel ignored or confused leave — and they tell other people why. Your role directly protects NexGen's reputation and retention.",
    weight: "Enrollment revenue keeps this school open. Your front desk is the first reason families stay or go.",
    stats: [
      { label: 'First impression formed before a tour even starts', value: 'At the front desk' },
      { label: 'Retention influenced by daily communication quality', value: 'Significant' },
      { label: 'Referrals driven by family experience', value: 'The #1 lead source' },
    ],
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    emoji: '🔍',
    color: '#DC2626',
    headline: 'Because who we hire determines who our children are cared for by.',
    body: "Every person who walks into a NexGen classroom was cleared by this process. Every teacher who speaks to a child, disciplines a child, holds a child — they got here because someone vetted them. That someone is you. The weight of this role is not in the paperwork. It is in the filter. One wrong hire in a classroom is a safety risk. One wrong hire in a leadership role can damage the culture it took years to build. Conversely, one great hire can elevate an entire team. Your ability to identify people who align with NexGen's values — not just people who can fill a slot — determines the quality of this school more than almost any other single function.",
    weight: 'You are the gatekeeper of who enters the lives of the children in our care. That is a serious responsibility.',
    stats: [
      { label: 'Cost of a bad hire in time, retraining, and risk', value: 'Enormous' },
      { label: 'Culture impact of one wrong leadership hire', value: 'Far-reaching' },
      { label: 'Safety determined by who passes your filter', value: "Every child's" },
    ],
  },
  {
    id: 'tour-manager',
    label: 'Tour Manager',
    emoji: '🗺️',
    color: '#7C3AED',
    headline: "Because every empty spot is a family that hasn't found us yet.",
    body: "NexGen's ability to fulfill its mission depends on enrollment. Without it, there is no payroll, no facility, no programs, no staff — and no children served. Your role sits at the exact point where a family is deciding whether to trust us with their child. They have walked in with fear, hope, and a hundred questions they may not even know how to ask. What you say, how you carry yourself, and whether you make them feel seen in that 45-minute tour will determine whether they enroll. This is not a numbers game. Every tour is a real family with a real child. But the numbers matter — because they're what keep the doors open for every other family we serve.",
    weight: 'Conversion is not a sales metric. It is the mechanism by which children access the quality care this school provides.',
    stats: [
      { label: 'Revenue generated per enrolled family annually', value: 'Significant' },
      { label: 'Decision made within hours of a tour', value: 'Most families' },
      { label: 'Families lost to a competitor after a weak tour', value: 'Preventable' },
    ],
  },
  {
    id: 'lesson-plans',
    label: 'Lesson Plans Manager',
    emoji: '📝',
    color: '#059669',
    headline: 'Because a classroom without a plan is a classroom without direction.',
    body: "Children develop best when their environment is intentional. A lesson plan is not bureaucratic busywork — it is the difference between a classroom where children are meaningfully engaged and one where teachers are improvising and children are drifting. Without your work, teachers walk into Monday without a roadmap. Without a roadmap, the day becomes reactive. When days become reactive, learning suffers, behavior escalates, and TRS standards go unmet. You are the invisible architecture behind every productive classroom moment. The families who enroll at NexGen because of our curriculum quality — they're trusting the work that happens at your desk before the week even begins.",
    weight: 'Every unplanned classroom day is a developmental opportunity that a child will never get back.',
    stats: [
      { label: 'Classrooms dependent on your weekly output', value: 'All of them' },
      { label: 'TRS compliance tied to documented curriculum', value: 'Directly' },
      { label: 'Behavioral incidents reduced by structured planning', value: 'Measurably' },
    ],
  },
  {
    id: 'kitchen-manager',
    label: 'Kitchen Manager',
    emoji: '🍽️',
    color: '#D97706',
    headline: "Because nutrition at this age is not optional — it's developmental.",
    body: "The meals you prepare are not a side function of this school. For many children who walk through our doors, the food they receive at NexGen may be the most nutritionally complete meal they get all day. Early childhood nutrition directly impacts cognitive development, energy, behavior, and health. A child who is fed well can focus. A child who is hungry cannot. A child who is served food that doesn't meet safety standards can become seriously ill. The stakes of your role are high — not because of paperwork or inspections, but because the children on the other side of your kitchen window are counting on you to get it right every single time.",
    weight: "One allergy error, one food safety lapse — the consequences are immediate and serious. Your standards are a child's protection.",
    stats: [
      { label: 'Children relying on NexGen meals as a primary nutrition source', value: 'Many' },
      { label: 'CACFP compliance tied to your documentation', value: 'Directly' },
      { label: 'Health incidents prevented by your safety standards', value: 'Every day' },
    ],
  },
  {
    id: 'asst-kitchen',
    label: 'Asst. Kitchen Manager',
    emoji: '🥄',
    color: '#0891B2',
    headline: "Because the kitchen cannot stop — even when the lead isn't there.",
    body: "The children don't stop needing to eat because the Kitchen Manager called out. The schedule doesn't shift because it's a hard morning in the kitchen. Your role exists to ensure that food service at NexGen is resilient — that no matter what happens, the standard is maintained and the meals go out. That requires you to not just assist, but to truly understand and own the operation. When you treat your role as secondary, the kitchen becomes fragile. When you treat it as equally important, the kitchen becomes unbreakable. The children in this building deserve an unbreakable kitchen.",
    weight: "If you're not ready to run it alone, the operation has a single point of failure. That's not acceptable here.",
    stats: [
      { label: 'Kitchen continuity dependent on your readiness', value: 'Complete' },
      { label: 'Children impacted by a kitchen failure', value: 'All of them' },
      { label: 'Standard expected when the lead is absent', value: 'Identical' },
    ],
  },
  {
    id: 'bus-driver',
    label: 'Bus Driver',
    emoji: '🚌',
    color: '#DC2626',
    headline: "Because a parent's worst fear lives in your hands every single route.",
    body: "When a parent watches their child board your bus, they are placing an extraordinary amount of trust in a person they may barely know. They are trusting that you will pay attention, that you will drive carefully, that you will not move the vehicle until every child is accounted for, and that you will get their child where they need to be safely. There is no partial credit in transportation. You cannot almost check the headcount. You cannot almost secure a seatbelt. Every lapse in this role has consequences that cannot be undone. The bus is not a transition between the important parts of the day. For the children on it, it is part of their day — and they deserve the same standard of care they receive inside our building.",
    weight: 'A vehicle with children in it is one of the highest-responsibility environments in this entire operation. Drive like it.',
    stats: [
      { label: 'Parent trust extended the moment a child boards', value: 'Total' },
      { label: 'Margin for error in child transportation', value: 'Zero' },
      { label: 'Consequences of an unverified headcount', value: 'Irreversible' },
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

export default function WhyIsItImportantPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
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
              Why Is It Important
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Understand the real weight your role carries — and why it matters to every child we
              serve.
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
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Headline Card */}
          <div
            style={{
              background: '#0F172A',
              borderRadius: '14px',
              padding: '2rem',
              borderTop: `4px solid ${activeRole.color}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>{activeRole.emoji}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: activeRole.color,
                }}
              >
                {activeRole.label}
              </span>
            </div>
            <h2
              style={{
                fontSize: '1.3rem',
                fontWeight: 800,
                color: '#F8FAFC',
                margin: 0,
                lineHeight: 1.4,
                letterSpacing: '-0.02em',
              }}
            >
              {activeRole.headline}
            </h2>
          </div>

          {/* Body */}
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
                fontSize: '0.9rem',
                color: '#374151',
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              {activeRole.body}
            </p>
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.85rem',
            }}
          >
            {activeRole.stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  borderTop: `3px solid ${activeRole.color}`,
                }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: activeRole.color,
                    marginBottom: '0.35rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    lineHeight: 1.5,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Weight / The Gravity */}
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
            <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>⚖️</span>
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
                The Weight of This Role
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
                {activeRole.weight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
