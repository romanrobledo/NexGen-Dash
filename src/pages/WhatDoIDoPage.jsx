import { useNavigate } from 'react-router-dom'
import { ClipboardList, ArrowRight, UserCircle } from 'lucide-react'
import { useViewMode } from '../contexts/ViewModeContext'
import { useSelectedRoleId } from '../hooks/useSelectedRole'

// ─── ROLE DATA ───────────────────────────────────────────────────────────────
export const ROLES = [
  {
    id: 'visionary',
    label: 'Visionary',
    emoji: '👑',
    color: '#0F172A',
    tagline: 'You see the future. Your Integrator builds the road to it.',
    overview:
      "The Visionary is the founder seat described in Rocket Fuel. Your job is big ideas, culture, brand, and the biggest relationships — not daily operations. You generate 10–20 ideas a week and hand the best ones to your Integrator to filter and execute. You own the 3-Year Picture and the long-term why, while your Integrator owns the 90-day what and how. If you're deep in day-to-day problem solving, that's a sign your Integrator isn't fully activated — or you're stepping over them.",
    focusAreas: [
      {
        pillar: 'Vision & Strategy',
        subtitle: '3-Year Picture + Core Focus',
        color: '#0F172A',
        items: [
          { label: 'Owner', detail: 'You (Visionary)' },
          { label: 'Scope', detail: 'Where NexGen is going, what we stand for, what we will never be' },
          { label: 'Cadence', detail: 'Annual planning · Quarterly pulse with Integrator' },
          { label: 'Output', detail: 'Written 3-Year Picture, Core Values, Core Focus (purpose + niche)' },
        ],
      },
      {
        pillar: 'Culture, Brand & Relationships',
        subtitle: 'The voice of NexGen',
        color: '#7C3AED',
        items: [
          { label: 'Owner', detail: 'You + Robyn for execution' },
          { label: 'Scope', detail: 'Brand positioning, community, major partners, hero families, press' },
          { label: 'KPIs', detail: 'Reviews, community mentions, partner relationships, culture health' },
        ],
      },
      {
        pillar: 'R&D + New Bets',
        subtitle: 'Ideas → Experiments',
        color: '#059669',
        items: [
          { label: 'Owner', detail: 'You generate · Integrator filters + executes' },
          { label: 'Scope', detail: 'New programs, pricing experiments, second location, new offers' },
          { label: 'Rule', detail: "Don't chase more than one bet at a time without Integrator buy-in" },
        ],
      },
    ],
    responsibilities: [
      'Own the Vision — 3-Year Picture, Core Values, Core Focus, 10-Year Target',
      'Generate ideas and hand them to the Integrator — do not execute them yourself',
      'Lead culture and brand — you are the voice and the face of NexGen',
      'Manage the biggest relationships: major partners, top families, community, press',
      'Walk the building regularly — feel the culture, then report signals to the Integrator',
      'Meet weekly 1:1 with your Integrator (the Same Page Meeting) — resolve the top 3 issues',
      'Make the final call on the handful of decisions only the founder can make',
      'Hold the Integrator accountable to the Scorecard — do not run the Scorecard yourself',
      'Protect your time for vision work — if you are firefighting, the Integrator is missing something',
    ],
    note: "Rocket Fuel rule: The Visionary owns the 'who, why, and what.' The Integrator owns the 'how, when, and where.' If you're doing both, you don't have an Integrator yet — you have an assistant.",
  },
  {
    id: 'integrator',
    label: 'Integrator',
    emoji: '⚙️',
    color: '#1E3A8A',
    tagline: 'You run the machine. You make the vision real, day after day.',
    overview:
      "The Integrator is the Rocket Fuel counterpart to the Visionary. Your job is to harmoniously integrate the major functions of NexGen, run the leadership team through LMA (Leadership, Management, Accountability), and turn the Visionary's ideas into a predictable operating rhythm. You filter ideas, remove obstacles, run the Scorecard, and resolve the issues between departments that nobody else can. If the Visionary is the gas, you are the engine — without you, the rocket fuel just burns.",
    focusAreas: [
      {
        pillar: 'LMA — Leadership Team',
        subtitle: 'Leadership + Management + Accountability',
        color: '#1E3A8A',
        items: [
          { label: 'Owner', detail: 'You (Integrator)' },
          { label: 'Direct Reports', detail: 'Director, Front Desk Manager, Marketing lead, Bookkeeper' },
          { label: 'Rhythm', detail: 'Weekly L10 leadership meeting · Quarterly 1:1 conversations' },
          { label: 'Rule', detail: 'Right people in right seats. Address wrong seats within a quarter.' },
        ],
      },
      {
        pillar: 'Run the 3-Function Machine',
        subtitle: 'Enrollment · Experience · Cash',
        color: '#2563EB',
        items: [
          { label: 'Scope', detail: 'Enrollment funnel, Experience & Retention, Cash & Admin' },
          { label: 'KPIs owned', detail: 'All 10–12 weekly Scorecard numbers — you chase the red ones' },
          { label: 'Deliverable', detail: 'Weekly Scorecard review, monthly P&L review, quarterly Rocks' },
        ],
      },
      {
        pillar: 'Filter Ideas + Remove Obstacles',
        subtitle: 'Protect the team from noise',
        color: '#DC2626',
        items: [
          { label: 'Scope', detail: "Triage Visionary's ideas — say 'not now' more than 'yes'" },
          { label: 'Issue solving', detail: 'Use IDS (Identify · Discuss · Solve) on the top 3 issues weekly' },
          { label: 'Escalate', detail: 'Only the handful of calls that truly require the Visionary' },
        ],
      },
    ],
    responsibilities: [
      'Run the weekly Level 10 leadership meeting — the heartbeat of the business',
      'Own the Scorecard — 10–12 numbers, reviewed every week, red numbers become issues',
      'Turn the Visionary\'s 3-Year Picture into 90-day Rocks and weekly priorities',
      'Lead the leadership team through LMA — Leadership, Management, Accountability',
      'Resolve cross-functional issues between Director, Front Desk, Marketing, and Kitchen',
      'Filter incoming ideas from the Visionary — protect the team from whiplash',
      'Run the Monthly Finance Review with the Visionary — own the deck',
      'Make sure every direct report has clear quarterly Rocks and a weekly scorecard',
      'Remove obstacles for the Director so she can run the floor without friction',
      'Meet weekly 1:1 with the Visionary (Same Page Meeting) — stay on the same page',
    ],
    note: "Rocket Fuel rule: An Integrator is not a COO, not a chief of staff, and not an assistant. You have the authority to run the company day-to-day. If you're asking the Visionary to sign off on operational decisions, you don't have enough rope — fix that conversation first.",
  },
  {
    id: 'operator',
    label: 'Operator',
    emoji: '🏢',
    color: '#2563EB',
    tagline: 'You run the business. Everyone else runs their lane.',
    overview:
      'The Operator is responsible for the overall health of the business — financially, operationally, and strategically. Your job is to make sure all departments are functioning, all systems are built, and all leaders have what they need to succeed. You don\'t manage classrooms. You manage the people who manage classrooms.',
    focusAreas: [
      {
        pillar: 'Delivery Focus',
        subtitle: 'Retention',
        color: '#059669',
        items: [
          { label: 'Customer Satisfaction', detail: "How are our parents' experience? How can we improve? What do they need?" },
          { label: 'Product', detail: '4-star TRS Rating and beyond — is the classroom experience excellent?' },
          { label: 'Service', detail: 'Response Rate, Tonality, Quality of Response' },
          { label: 'Fulfillment', detail: 'Ease & Speed of everything families interact with' },
        ],
      },
      {
        pillar: 'Revenue Focus',
        subtitle: 'Enrollment',
        color: '#2563EB',
        items: [
          { label: 'Sales', detail: 'Speed and Sequencing of lead follow-up and enrollment conversions' },
          { label: 'Marketing', detail: 'Structure, Thinking, Data, & AI driving visibility and lead generation' },
          { label: 'Tours', detail: 'Conversion rates, tour quality, and follow-up execution' },
        ],
      },
      {
        pillar: 'Operating System Ownership',
        subtitle: 'The way NexGen runs',
        color: '#0F172A',
        items: [
          { label: 'Metric Ownership', detail: 'Own the Scorecard — every KPI has an owner, a target, and a weekly number. You set it and enforce it.' },
          { label: 'Meeting Cadence', detail: 'Level 10 leadership meeting weekly, Same Page with Visionary, quarterly Rocks review, annual planning.' },
          { label: 'Organizational Hierarchy', detail: 'Maintain the accountability chart — every seat has one owner, every owner knows their five roles.' },
          { label: 'Key Performance Standards', detail: 'Set the non-negotiables for safety, TRS, parent communication, curriculum delivery, and financial health.' },
          { label: 'Risk & Continuity', detail: 'Crisis protocols, business continuity, emergency procedures — nothing should surprise you.' },
        ],
      },
    ],
    responsibilities: [
      'Set the vision, goals, and quarterly priorities for NexGen',
      'Oversee all department leads and hold them accountable to their KPIs',
      'Own and maintain the NexGen Operating System — the scorecard, meeting cadence, org chart, and performance standards that keep every department aligned',
      'Ensure every department lead runs their lane inside the Operating System (updates their numbers, shows up to L10, executes their Rocks)',
      'Manage business finances, enrollment targets, and growth strategy',
      'Build and maintain the systems that make the business run without you in the room',
      'Make hiring decisions for leadership-level roles',
      'Represent NexGen externally — community, partners, licensing, TRS',
      'Identify problems before they become crises',
      'Ensure the Director has everything they need to execute daily operations',
    ],
    note: "Your job is to work ON the business, not IN it. The Operating System IS the business running without you — if something keeps breaking, the OS has a gap to fix.",
    operatingSystem: true,
  },
  {
    id: 'director',
    label: 'Director',
    emoji: '📋',
    color: '#7C3AED',
    tagline: 'You are the bridge between vision and classroom.',
    overview:
      "The Director translates the Operator's vision into daily reality. You are the highest on-site authority. You are responsible for staff performance, compliance, parent satisfaction, and operational excellence. When something goes wrong on the floor, it starts and ends with you.",
    responsibilities: [
      'Supervise all teachers, assistants, and support staff daily',
      'Conduct regular classroom observations and provide immediate feedback',
      'Manage TRS compliance, licensing requirements, and state documentation',
      'Handle parent escalations and build strong family relationships',
      'Lead weekly team check-ins and staff development meetings',
      'Approve lesson plans and ensure curriculum standards are being met',
      'Monitor enrollment, ratios, and daily attendance',
      'Identify staffing gaps and communicate hiring needs to the Operator',
      "Enforce NexGen's culture, standards, and non-negotiables every day",
    ],
    note: 'You are the culture carrier. What you tolerate becomes the standard. What you celebrate becomes the culture.',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    emoji: '📚',
    color: '#059669',
    tagline: "You are the most important person in a child's day.",
    overview:
      'Teachers are the core of NexGen. Your classroom is your domain. You are responsible for the safety, development, and daily experience of every child in your care. Everything else at NexGen exists to support you doing this job with excellence.',
    ageGroups: [
      { label: 'Infant (6 wks – 12 mo)', note: 'Focus: safety, sensory stimulation, responsive caregiving, attachment.' },
      { label: 'Older Infant (12–18 mo)', note: 'Focus: mobility support, language emergence, safe exploration.' },
      { label: 'Young Toddler (18–24 mo)', note: 'Focus: parallel play, vocabulary building, routine consistency.' },
      { label: 'Toddler (2–3 yrs)', note: 'Focus: emotional regulation, cooperative play, basic self-help skills.' },
      { label: 'Pre-Kinder (3–4 yrs)', note: 'Focus: school readiness, letter/number foundations, social skills.' },
      { label: 'Kinder (4–5 yrs)', note: 'Focus: literacy, numeracy, independence, group collaboration.' },
      { label: 'Afterschool (5+ yrs)', note: 'Focus: homework support, enrichment, self-defense, social development.' },
    ],
    responsibilities: [
      'Maintain a safe, clean, and engaging classroom environment at all times',
      'Follow the daily schedule consistently — children thrive on predictability',
      'Implement the approved lesson plan for your age group every week',
      'Use positive language and positive behavior guidance (never threats)',
      'Document daily observations, incidents, and developmental milestones',
      'Communicate with families at drop-off and pick-up with warmth and professionalism',
      'Participate in self-defense curriculum integration as trained',
      'Complete required training hours and apply learnings in the classroom',
      'Immediately report any safety concern, injury, or unusual behavior',
    ],
    note: "Your classroom should run the same whether the Director is watching or not. That's the standard.",
  },
  {
    id: 'teacher-assistant',
    label: 'Teacher Assistant',
    emoji: '🤝',
    color: '#0891B2',
    tagline: "You make the teacher's job possible.",
    overview:
      'Teacher Assistants support lead teachers in delivering a safe, structured, and nurturing classroom experience. You are not a substitute — you are a partner. Your attentiveness, consistency, and willingness to learn directly impacts the quality of every child\'s day.',
    responsibilities: [
      'Support the lead teacher in all classroom activities and transitions',
      'Maintain active supervision of all children at all times',
      'Help set up and clean up materials for lessons and activities',
      'Assist with diapering, feeding, and personal care routines as needed',
      'Use the same positive language and behavior guidance as your lead teacher',
      'Step up to lead the classroom if the teacher steps out — no gaps in coverage',
      'Document any incidents, injuries, or concerns immediately',
      'Follow the classroom schedule without needing to be reminded',
      'Ask questions and seek to grow into a lead teacher role',
    ],
    note: "Your goal is to be so reliable that the lead teacher never has to wonder if you've got it.",
  },
  {
    id: 'front-desk',
    label: 'Front Desk Manager',
    emoji: '🖥️',
    color: '#D97706',
    tagline: 'You are the first impression and the last feeling families leave with.',
    overview:
      "The Front Desk Manager owns the family-facing experience from the moment someone walks through the door. You manage daily check-ins, communication, inquiries, and the general pulse of the front of house. You are the operational nerve center of NexGen's day.",
    responsibilities: [
      'Greet every family and child by name — warmth is non-negotiable',
      'Manage daily check-in and check-out using the attendance system',
      'Answer all inbound calls, texts, and emails promptly and professionally',
      'Direct tour inquiries to the Tour Manager and log all leads',
      'Communicate daily updates, closures, and announcements to families',
      'Monitor and manage the lobby, entrance, and front-of-house environment',
      'Handle billing questions and escalate to the Director when needed',
      'Track and log visitor sign-ins for compliance',
      'Support the Director with administrative tasks as requested',
    ],
    note: 'Families form their opinion of NexGen in the first 30 seconds. Make it count every time.',
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    emoji: '🔍',
    color: '#DC2626',
    tagline: 'You build the team that builds the school.',
    overview:
      'The Hiring Manager owns the full recruitment lifecycle at NexGen — from job posting to first-day onboarding handoff. You are responsible for finding the right people, filtering out the wrong ones, and ensuring no classroom is ever left understaffed.',
    responsibilities: [
      'Post and manage job listings across all relevant platforms',
      "Screen applicants for alignment with NexGen's values and minimum qualifications",
      'Conduct first-round interviews and advance candidates to the Director',
      'Coordinate background checks, reference calls, and required documentation',
      'Maintain an active candidate pipeline — always be recruiting, not just when urgent',
      'Track open positions and communicate hiring status to the Director and Operator',
      'Support new hire onboarding paperwork and first-day logistics',
      'Flag retention risks and communicate patterns to leadership',
    ],
    note: 'A bad hire costs more than a slow hire. Your filter is one of the most important systems in the building.',
  },
  {
    id: 'tour-manager',
    label: 'Tour Manager',
    emoji: '🗺️',
    color: '#7C3AED',
    tagline: 'You turn curious families into enrolled families.',
    overview:
      'The Tour Manager owns the enrollment conversion experience. When a family walks in for a tour, you are responsible for making them feel seen, informed, and confident enough to say yes. This is a sales and relationship role — not a show-and-tell.',
    responsibilities: [
      'Schedule and confirm all tour appointments promptly',
      'Lead every tour with a structured, warm, and informative script',
      "Highlight NexGen's differentiators — TRS, self-defense, culture, curriculum",
      'Follow up with all tour families within 24 hours via phone or text',
      'Track tour-to-enrollment conversion and report weekly',
      'Identify objections and address them confidently without pressure',
      'Coordinate with Front Desk for smooth tour day logistics',
      'Log all tour activity and family notes into the enrollment CRM',
    ],
    note: 'Families are not just buying childcare. They\'re trusting you with their child. Sell with that in mind.',
  },
  {
    id: 'lesson-plans',
    label: 'Lesson Plans Manager',
    emoji: '📝',
    color: '#059669',
    tagline: 'You give teachers the roadmap. They drive the car.',
    overview:
      'The Lesson Plans Manager is responsible for building, distributing, and reviewing the weekly curriculum for every age group at NexGen. You ensure that every classroom has a structured, developmentally appropriate, and TRS-aligned plan ready before the week begins.',
    responsibilities: [
      'Build weekly lesson plans for all age groups: Infant through Afterschool',
      'Ensure all plans are developmentally appropriate and TRS compliant',
      'Distribute finalized plans to each lead teacher by Thursday for the following week',
      'Review submitted lesson plans from teachers and provide feedback',
      'Maintain a library of activities, themes, and learning objectives by age group',
      'Coordinate with the Director on seasonal themes, events, and special programming',
      'Track and document lesson plan completion and implementation quality',
      'Support teachers who need help adapting plans for their specific group',
    ],
    note: 'A week without a plan is a week of improvisation. Your consistency gives teachers confidence.',
  },
  {
    id: 'kitchen-manager',
    label: 'Kitchen Manager',
    emoji: '🍽️',
    color: '#D97706',
    tagline: "You fuel every child's day.",
    overview:
      'The Kitchen Manager is responsible for all food service operations at NexGen — from planning and purchasing to preparation, serving, and cleanup. You maintain full compliance with CACFP and state food service requirements while delivering nutritious, child-friendly meals every day.',
    responsibilities: [
      'Plan and prepare breakfast, lunch, and snacks for all enrolled children daily',
      'Ensure all meals meet CACFP nutritional requirements and portion standards',
      'Manage food inventory, ordering, and vendor relationships',
      'Maintain kitchen cleanliness and food safety standards at all times',
      'Post and follow the approved menu — no substitutions without Director approval',
      'Track and document all food service records for compliance audits',
      'Accommodate documented dietary restrictions and allergies without error',
      'Coordinate meal timing with classroom schedules',
      'Train and supervise the Assistant Kitchen Manager',
    ],
    note: "A hungry child can't learn. A sick child can't attend. Your standards protect both.",
  },
  {
    id: 'asst-kitchen',
    label: 'Asst. Kitchen Manager',
    emoji: '🥄',
    color: '#0891B2',
    tagline: 'You keep the kitchen running when it matters most.',
    overview:
      'The Assistant Kitchen Manager supports the Kitchen Manager in all food preparation, service, and compliance duties. You are trained to step in fully when needed, and you hold the same standards as your lead at all times.',
    responsibilities: [
      "Assist with all meal preparation and serving under the Kitchen Manager's direction",
      'Maintain kitchen cleanliness and sanitation throughout the day',
      'Support inventory tracking and help flag low stock to the Kitchen Manager',
      'Follow all food safety and CACFP protocols without exception',
      'Step in as acting Kitchen Manager during absences — same standards apply',
      'Help document meals served and any allergy or portion adjustments',
      'Complete required food handler certifications and keep them current',
    ],
    note: "When the Kitchen Manager isn't here, nothing changes. That's the standard.",
  },
  {
    id: 'bus-driver',
    label: 'Bus Driver',
    emoji: '🚌',
    color: '#DC2626',
    tagline: "Every child on your route is someone's whole world.",
    overview:
      "Bus Drivers are responsible for the safe, timely, and organized transportation of children to and from NexGen. Your vehicle is an extension of our classroom — the same standards of care, supervision, and professionalism apply the moment a child steps on board.",
    responsibilities: [
      'Conduct a full pre-trip vehicle inspection before every run',
      'Ensure every child is properly secured before moving the vehicle',
      'Follow approved routes and maintain punctual pickup/drop-off times',
      'Maintain a current headcount at every stop — no child is left unaccounted for',
      'Communicate any delays, route changes, or incidents to the Director immediately',
      'Maintain a clean, safe, and organized vehicle at all times',
      'Never use a phone while the vehicle is in motion',
      'Complete all required transportation logs and documentation daily',
      'Hold current CDL, CPR, and any state-required certifications',
    ],
    note: 'You are the last person responsible before a child leaves our care. And the first person responsible before they arrive. Take that seriously.',
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

export default function WhatDoIDoPage() {
  const [selectedId] = useSelectedRoleId()
  const activeRole = ROLES.find((r) => r.id === selectedId) || ROLES[0]
  const navigate = useNavigate()
  const { mobileMode } = useViewMode()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
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
              What Do I Do
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Understand your role, daily responsibilities, and what is expected of you as a team
              member.
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
                marginBottom: '0.75rem',
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
            <p
              style={{
                fontSize: '0.88rem',
                color: '#475569',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {activeRole.overview}
            </p>

            {/* Link to How Do I Do It */}
            <button
              onClick={() => navigate(`/dashboard/how-do-i-do-it?role=${activeRole.id}`)}
              style={{
                marginTop: '1rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: `1.5px solid ${activeRole.color}30`,
                background: activeRole.color + '08',
                color: activeRole.color,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = activeRole.color + '15'
                e.currentTarget.style.borderColor = activeRole.color + '50'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = activeRole.color + '08'
                e.currentTarget.style.borderColor = activeRole.color + '30'
              }}
            >
              How Do I Do It
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>

          {/* Focus Areas (Operator) */}
          {activeRole.focusAreas && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mobileMode ? '1fr' : `repeat(${activeRole.focusAreas.length > 2 ? 3 : 2}, 1fr)`,
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              {activeRole.focusAreas.map((area) => (
                <div
                  key={area.pillar}
                  style={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '1.5rem',
                    borderTop: `4px solid ${area.color}`,
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <p
                      style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: '#0F172A',
                        margin: 0,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {area.pillar}
                    </p>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.3rem',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: area.color,
                        background: area.color + '12',
                        padding: '2px 8px',
                        borderRadius: '99px',
                      }}
                    >
                      {area.subtitle}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {area.items.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '0.7rem 0.9rem',
                          background: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px solid #F1F5F9',
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: area.color,
                            marginBottom: '0.2rem',
                          }}
                        >
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                          {item.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Age Groups (Teacher only) */}
          {activeRole.ageGroups && (
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
                Age Groups
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: mobileMode ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '0.65rem',
                }}
              >
                {activeRole.ageGroups.map((ag) => (
                  <div
                    key={ag.label}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: '#0F172A',
                        marginBottom: '0.3rem',
                      }}
                    >
                      {ag.label}
                    </div>
                    <div style={{ fontSize: '0.77rem', color: '#64748B', lineHeight: 1.55 }}>
                      {ag.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responsibilities */}
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
              Your Core Responsibilities
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {activeRole.responsibilities.map((r, i) => (
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
                  <span
                    style={{
                      fontSize: '0.85rem',
                      color: '#374151',
                      lineHeight: 1.6,
                    }}
                  >
                    {r}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* The Standard / Note */}
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
                {activeRole.note}
              </p>
            </div>
          </div>

          {/* Operating System CTA — Operator only */}
          {activeRole.operatingSystem && (
            <button
              onClick={() => navigate('/operating-system')}
              style={{
                background: '#0F172A',
                border: '1px solid #0F172A',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif",
                color: '#F8FAFC',
                width: '100%',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ fontSize: '1.6rem' }}>⚙️</span>
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
                    Your Accountability
                  </p>
                  <p
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: '#F8FAFC',
                      margin: '0.1rem 0 0.2rem',
                    }}
                  >
                    Open the NexGen Operating System
                  </p>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#94A3B8',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Scorecard, meeting cadence, hierarchy, performance standards — the full system you own and enforce.
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: '#60A5FA', flexShrink: 0 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
