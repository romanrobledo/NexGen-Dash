import { useState } from "react"
import { Calendar } from "lucide-react"

// ─── MEETING DATA ─────────────────────────────────────────────────────────────
const CADENCE_COLORS = {
  daily:     { label: "Daily",     bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  weekly:    { label: "Weekly",    bg: "#F0FDF4", text: "#166534", border: "#86EFAC" },
  biweekly:  { label: "Bi-Weekly", bg: "#FEF9C3", text: "#854D0E", border: "#FDE047" },
  monthly:   { label: "Monthly",   bg: "#FAF5FF", text: "#6B21A8", border: "#D8B4FE" },
  quarterly: { label: "Quarterly", bg: "#FFF7ED", text: "#9A3412", border: "#FDBA74" },
}

const ROLE_COLORS = {
  founder:        "#0F172A",
  operator:       "#2563EB",
  director:       "#7C3AED",
  teacher:        "#059669",
  "teacher-assistant": "#0891B2",
  "front-desk":   "#D97706",
  "hiring-manager": "#DC2626",
  "tour-manager": "#7C3AED",
  "lesson-plans": "#059669",
  "kitchen-manager": "#D97706",
  "asst-kitchen": "#0891B2",
  "bus-driver":   "#DC2626",
}

const ALL_MEETINGS = [
  {
    id: "daily-huddle",
    title: "Daily Huddle",
    emoji: "☀️",
    cadence: "daily",
    day: "Every day",
    time: "Morning (first thing)",
    duration: "10–15 min",
    owner: "founder",
    description: "Quick alignment between Founder, Operator, Director, and Andrea. Not a strategy session — a pulse check. The only question: Does today break anywhere?",
    agenda: [
      "Today's staffing and ratios — any gaps?",
      "Tours scheduled for today — is Tour Manager prepped?",
      "Any fires — parent issues, staff issues, anything urgent",
    ],
    attendees: ["founder", "operator", "director"],
    owner_note: "Founder initiates. Keep it tight — 15 minutes max. If it needs a deeper conversation, schedule it separately.",
  },
  {
    id: "weekly-leadership-memos",
    title: "Weekly Leadership Memos",
    emoji: "📋",
    cadence: "weekly",
    day: "Tuesday",
    time: "After Operator ↔ Director check-in",
    duration: "45–60 min",
    owner: "founder",
    description: "The strategic operating meeting for the leadership team. Review all KPIs, identify what's red, set priorities for the week, and assign clear ownership with deadlines.",
    agenda: [
      "Scorecard Review (10–15 min) — Look at all KPIs. Circle anything red.",
      "Wins / Losses (5 min) — 1–2 big wins, 1–2 issues",
      "Top 3 Priorities (15–20 min) — What to fix next week",
      "Who / What / When (15 min) — Assign owners and due dates",
    ],
    attendees: ["founder", "operator", "director"],
    owner_note: "Founder runs the agenda. Operator and Director come prepared with their numbers.",
  },
  {
    id: "monthly-finance-review",
    title: "Monthly Finance Review",
    emoji: "💰",
    cadence: "monthly",
    day: "By the 20th of each month",
    time: "Scheduled",
    duration: "60–90 min",
    owner: "founder",
    description: "The Founder and Operator review the financial health of NexGen. Review last 3 months P&L, check 3 key ratios, ask 3 diagnostic questions, and make ONE specific finance decision. No meeting ends without a decision.",
    agenda: [
      "Review last 3 months P&L — revenue trend up, flat, or down?",
      "Check 3 key ratios: Payroll % of Revenue (~50–55%), Average Revenue per Child, Net Profit % (~20%+)",
      "Ask 3 diagnostic questions: Fill more seats? Raise prices? Control a cost bucket?",
      "Pick ONE finance decision — pricing change, expense cut, or enrollment push",
    ],
    attendees: ["founder", "operator"],
    owner_note: "Founder leads. Robyn brings the operational context. Bookkeeper optionally on Zoom. No meeting ends without a specific finance decision.",
  },
  {
    id: "operator-director",
    title: "Operator \u2194 Director Check-In",
    emoji: "\ud83c\udfe2",
    cadence: "weekly",
    day: "Tuesday",
    time: "9:00 AM",
    duration: "45 min",
    owner: "operator",
    description: "The most important meeting in the building. Roman and the Director align on weekly priorities, surface issues, review KPIs, and make operational decisions. This meeting drives everything downstream.",
    agenda: [
      "KPIs from last week \u2014 enrollment, incidents, compliance flags",
      "What\u2019s working / what broke down",
      "Staffing gaps or performance issues",
      "Upcoming compliance deadlines or TRS items",
      "Priorities for the coming week",
      "Anything the Director needs from the Operator to move forward",
    ],
    attendees: ["founder", "operator", "director"],
    owner_note: "Roman runs the agenda. Director comes prepared with updates.",
  },
  {
    id: "full-staff",
    title: "Full Staff Meeting",
    emoji: "\ud83d\udc65",
    cadence: "monthly",
    day: "First Monday of the month",
    time: "6:30 PM",
    duration: "60 min",
    owner: "director",
    description: "Every NexGen team member in one room. This is culture, alignment, and recognition. Not a gripe session \u2014 a momentum builder. The Director runs it. Roman attends and closes it.",
    agenda: [
      "Recognition \u2014 call out specific wins from the past month",
      "School-wide updates \u2014 enrollment, programs, TRS progress",
      "Policy or procedure changes \u2014 anything that affects all staff",
      "Training or development spotlight \u2014 one topic, taught briefly",
      "Open floor \u2014 questions and concerns (time-boxed to 10 min)",
      "Roman\u2019s close \u2014 vision, direction, what we\u2019re building toward",
    ],
    attendees: ["founder", "operator", "director", "teacher", "teacher-assistant", "front-desk", "hiring-manager", "tour-manager", "lesson-plans", "kitchen-manager", "asst-kitchen", "bus-driver"],
    owner_note: "Director prepares the agenda by the Friday before. Roman sees it Monday morning.",
  },
  {
    id: "director-teachers",
    title: "Director \u2194 Lead Teacher Check-In",
    emoji: "\ud83d\udccb",
    cadence: "biweekly",
    day: "Wednesday",
    time: "During nap time (1:00 PM)",
    duration: "20 min per teacher",
    owner: "director",
    description: "One-on-one between the Director and each lead teacher. Not a performance review \u2014 a support conversation. What do you need? What\u2019s challenging? What are you proud of?",
    agenda: [
      "How is your classroom feeling this week?",
      "Any children you\u2019re concerned about developmentally or behaviorally?",
      "Lesson plan feedback \u2014 what\u2019s working, what needs adjustment?",
      "Parent communication \u2014 any tensions or wins to flag?",
      "What do you need from me to do your job better?",
    ],
    attendees: ["director", "teacher"],
    owner_note: "Director schedules these during nap time to avoid pulling teachers from classrooms.",
  },
  {
    id: "classroom-observation-debrief",
    title: "Observation Debrief",
    emoji: "\ud83d\udc41\ufe0f",
    cadence: "weekly",
    day: "Following observation (same day)",
    time: "At the Director\u2019s discretion",
    duration: "10\u201315 min",
    owner: "director",
    description: "A brief, direct conversation after the Director observes a classroom. Not a scheduled sit-down \u2014 a real-time feedback loop. Praise what was excellent. Address what needs to change.",
    agenda: [
      "One specific thing you did well today",
      "One specific thing to adjust \u2014 with clear direction on how",
      "Any immediate safety or compliance concern",
    ],
    attendees: ["director", "teacher", "teacher-assistant"],
    owner_note: "Keep it under 15 minutes. Specific feedback only \u2014 no vague commentary.",
  },
  {
    id: "lesson-plan-review",
    title: "Lesson Plan Review",
    emoji: "\ud83d\udcdd",
    cadence: "weekly",
    day: "Thursday",
    time: "By 3:00 PM",
    duration: "Async \u2014 not a meeting",
    owner: "lesson-plans",
    description: "The Lesson Plans Manager distributes finalized plans to all teachers by Thursday. This is not a sit-down meeting \u2014 it\u2019s a structured exchange. Teachers confirm receipt. Questions go back to the Lesson Plans Manager same day.",
    agenda: [
      "All plans distributed to all classrooms",
      "Teachers confirm receipt and flag any questions",
      "Lesson Plans Manager addresses any gaps or adjustments by end of day",
    ],
    attendees: ["lesson-plans", "teacher"],
    owner_note: "If a teacher hasn\u2019t confirmed by 4 PM Thursday, Lesson Plans Manager follows up directly.",
  },
  {
    id: "hiring-pipeline",
    title: "Hiring Pipeline Review",
    emoji: "\ud83d\udd0d",
    cadence: "weekly",
    day: "Tuesday",
    time: "After Operator \u2194 Director check-in",
    duration: "15 min",
    owner: "hiring-manager",
    description: "A brief standing update between the Hiring Manager and Director on the current talent pipeline. Who\u2019s in process, what\u2019s open, what\u2019s urgent.",
    agenda: [
      "Open positions and current status",
      "Active candidates \u2014 where are they in the pipeline?",
      "Any urgent fills needed?",
      "Quality issues with recent applicants",
    ],
    attendees: ["director", "hiring-manager"],
    owner_note: "Keep it tight. This is a status update, not a strategy session.",
  },
  {
    id: "tour-debrief",
    title: "Weekly Tour Debrief",
    emoji: "\ud83d\uddfa\ufe0f",
    cadence: "weekly",
    day: "Friday",
    time: "4:00 PM",
    duration: "20 min",
    owner: "tour-manager",
    description: "Tour Manager and Director review the week\u2019s tour activity \u2014 how many tours, how many conversions, what objections came up, what families are still in the pipeline.",
    agenda: [
      "Tours run this week \u2014 number and show rate",
      "Enrollments from this week\u2019s tours",
      "Families still undecided \u2014 next step for each",
      "Top objections heard this week",
      "Any tour experience issues to address",
    ],
    attendees: ["director", "tour-manager"],
    owner_note: "Tour Manager comes with CRM data pulled \u2014 no guessing.",
  },
  {
    id: "kitchen-menu-planning",
    title: "Monthly Menu Planning",
    emoji: "\ud83c\udf7d\ufe0f",
    cadence: "monthly",
    day: "Last Friday of the month",
    time: "3:30 PM",
    duration: "30 min",
    owner: "kitchen-manager",
    description: "Kitchen Manager and Director confirm next month\u2019s menu, review any CACFP updates, address dietary changes for enrolled children, and flag supply needs.",
    agenda: [
      "Next month\u2019s menu \u2014 confirm and approve",
      "Any new dietary restrictions or allergy updates",
      "CACFP compliance notes",
      "Supply or vendor concerns",
    ],
    attendees: ["director", "kitchen-manager"],
    owner_note: "Director must approve the menu before it\u2019s posted. Nothing goes up without sign-off.",
  },
  {
    id: "bus-route-review",
    title: "Route and Safety Review",
    emoji: "\ud83d\ude8c",
    cadence: "monthly",
    day: "First Monday of the month (before Full Staff)",
    time: "5:30 PM",
    duration: "20 min",
    owner: "director",
    description: "Director and Bus Driver(s) review transport logs, confirm route accuracy, address any vehicle maintenance needs, and verify all certifications are current.",
    agenda: [
      "Any incidents or close calls from the past month?",
      "Vehicle maintenance \u2014 anything flagged or upcoming?",
      "CDL and certification status",
      "Route changes or family updates for the coming month",
    ],
    attendees: ["director", "bus-driver"],
    owner_note: "Transport logs from the past month should be reviewed before this meeting.",
  },
  {
    id: "quarterly-review",
    title: "Quarterly Business Review",
    emoji: "\ud83d\udcca",
    cadence: "quarterly",
    day: "First week of each quarter",
    time: "Roman sets the time",
    duration: "90 min",
    owner: "operator",
    description: "Roman and the Director step back from the daily operation and look at the business as a whole. Where are we vs. where we said we\u2019d be? What gets carried into next quarter? What gets cut?",
    agenda: [
      "Enrollment vs. target \u2014 how did we do?",
      "Financial review \u2014 revenue, expenses, profitability",
      "TRS and compliance status",
      "Staff performance and retention review",
      "Top 3 wins from the quarter",
      "Top 3 failures \u2014 what broke and why?",
      "Priorities for next quarter \u2014 3 max",
    ],
    attendees: ["operator", "director"],
    owner_note: "Roman prepares the financial and enrollment data. Director prepares the operational and staff summary. Both come ready.",
  },
]

// ─── ROLE VIEW ────────────────────────────────────────────────────────────────
const ROLES = [
  { id: "all",              label: "All Meetings",     emoji: "\ud83d\udcc5", color: "#0F172A" },
  { id: "founder",          label: "Founder",          emoji: "👑", color: "#0F172A" },
  { id: "operator",         label: "Operator",         emoji: "\ud83c\udfe2", color: "#2563EB" },
  { id: "director",         label: "Director",         emoji: "\ud83d\udccb", color: "#7C3AED" },
  { id: "teacher",          label: "Teacher",          emoji: "\ud83d\udcda", color: "#059669" },
  { id: "teacher-assistant",label: "Teacher Assistant", emoji: "\ud83e\udd1d", color: "#0891B2" },
  { id: "front-desk",       label: "Front Desk",       emoji: "\ud83d\udda5\ufe0f", color: "#D97706" },
  { id: "hiring-manager",   label: "Hiring Manager",   emoji: "\ud83d\udd0d", color: "#DC2626" },
  { id: "tour-manager",     label: "Tour Manager",     emoji: "\ud83d\uddfa\ufe0f", color: "#7C3AED" },
  { id: "lesson-plans",     label: "Lesson Plans Mgr", emoji: "\ud83d\udcdd", color: "#059669" },
  { id: "kitchen-manager",  label: "Kitchen Manager",  emoji: "\ud83c\udf7d\ufe0f", color: "#D97706" },
  { id: "asst-kitchen",     label: "Asst. Kitchen",    emoji: "\ud83e\udd44", color: "#0891B2" },
  { id: "bus-driver",       label: "Bus Driver",       emoji: "\ud83d\ude8c", color: "#DC2626" },
]

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const RoleButton = ({ role, isActive, onClick }) => (
  <button onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: "0.6rem",
    padding: "0.55rem 0.9rem", borderRadius: "10px",
    border: isActive ? `1.5px solid ${role.color}` : "1.5px solid transparent",
    background: isActive ? role.color + "12" : "transparent",
    cursor: "pointer", textAlign: "left", width: "100%",
  }}>
    <span style={{ fontSize: "1.05rem", lineHeight: 1 }}>{role.emoji}</span>
    <span style={{ fontSize: "0.8rem", fontWeight: isActive ? 700 : 500, color: isActive ? role.color : "#374151", lineHeight: 1.3 }}>
      {role.label}
    </span>
  </button>
)

const CadenceBadge = ({ cadence }) => {
  const c = CADENCE_COLORS[cadence]
  return (
    <span style={{
      padding: "2px 9px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {c.label}
    </span>
  )
}

const AttendeeChip = ({ roleId }) => {
  const role = ROLES.find(r => r.id === roleId)
  if (!role || role.id === "all") return null
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "2px 8px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 600,
      background: role.color + "12", color: role.color, border: `1px solid ${role.color}25`,
    }}>
      {role.emoji} {role.label}
    </span>
  )
}

const MeetingCard = ({ meeting, highlightRole }) => {
  const [open, setOpen] = useState(false)
  const isOwner = meeting.owner === highlightRole
  const accentColor = ROLE_COLORS[meeting.owner] || "#0F172A"

  return (
    <div style={{
      background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px",
      overflow: "hidden", borderLeft: isOwner ? `4px solid ${accentColor}` : "1px solid #E2E8F0",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        padding: "1.1rem 1.25rem", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem", flex: 1 }}>
          <span style={{
            width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
            background: accentColor + "15", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.1rem",
          }}>
            {meeting.emoji}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{meeting.title}</span>
              {isOwner && (
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                  background: accentColor, color: "#fff", padding: "1px 7px", borderRadius: "99px",
                }}>
                  You Own This
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <CadenceBadge cadence={meeting.cadence} />
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{"\ud83d\udcc5"} {meeting.day}</span>
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{"\ud83d\udd50"} {meeting.time}</span>
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{"\u23f1\ufe0f"} {meeting.duration}</span>
            </div>
          </div>
        </div>
        <span style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0, marginTop: "0.25rem" }}>
          {open ? "\u25b2" : "\u25bc"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 1.25rem 1.25rem", borderTop: "1px solid #F1F5F9" }}>
          <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.75, margin: "1rem 0 1rem" }}>
            {meeting.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 0.6rem" }}>
                Standing Agenda
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {meeting.agenda.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      background: accentColor + "18", color: accentColor,
                      fontSize: "0.65rem", fontWeight: 800, marginTop: "1px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.55 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 0.6rem" }}>
                  Who Attends
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {meeting.attendees.map(r => <AttendeeChip key={r} roleId={r} />)}
                </div>
              </div>
              <div style={{
                background: accentColor + "08", border: `1px solid ${accentColor}20`,
                borderRadius: "10px", padding: "0.75rem 0.9rem",
              }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accentColor, margin: "0 0 0.25rem" }}>
                  Owner Note
                </p>
                <p style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                  {meeting.owner_note}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CALENDAR OVERVIEW ────────────────────────────────────────────────────────
const WEEK_MEETINGS = [
  { day: "Mon", items: ["Daily Huddle", "Full Staff (monthly)", "Bus Route Review (monthly)"] },
  { day: "Tue", items: ["Daily Huddle", "Operator \u2194 Director", "Weekly Leadership Memos", "Hiring Pipeline Review"] },
  { day: "Wed", items: ["Daily Huddle", "Director \u2194 Teacher 1:1s (bi-weekly)"] },
  { day: "Thu", items: ["Daily Huddle", "Lesson Plans distributed (async)"] },
  { day: "Fri", items: ["Daily Huddle", "Tour Debrief", "Menu Planning (monthly)"] },
]

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WhenDoWeMeetPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [view, setView] = useState("meetings")

  const filteredMeetings = activeRole.id === "all"
    ? ALL_MEETINGS
    : ALL_MEETINGS.filter(m => m.attendees.includes(activeRole.id))

  const ownedMeetings = filteredMeetings.filter(m => m.owner === activeRole.id)
  const attendedMeetings = filteredMeetings.filter(m => m.owner !== activeRole.id)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">When Do We Meet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every meeting at NexGen — who owns it, who attends, and exactly what gets discussed.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>
        {/* Role Selector */}
        <div style={{
          width: 200, flexShrink: 0, background: "#fff",
          border: "1px solid #E2E8F0", borderRadius: "14px",
          padding: "1rem 0.75rem", position: "sticky", top: "1rem",
        }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0.5rem 0.75rem" }}>
            Filter by Role
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {ROLES.map((role) => (
              <RoleButton key={role.id} role={role} isActive={activeRole.id === role.id} onClick={() => setActiveRole(role)} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Header */}
          <div style={{
            background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px",
            padding: "1.5rem 1.75rem", borderTop: `4px solid ${activeRole.color}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.75rem" }}>{activeRole.emoji}</span>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                  {activeRole.id === "all" ? "All NexGen Meetings" : `${activeRole.label} — Meetings`}
                </h2>
                <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "0.15rem 0 0" }}>
                  {activeRole.id === "all"
                    ? `${ALL_MEETINGS.length} meetings across all cadences`
                    : `${filteredMeetings.length} meeting${filteredMeetings.length !== 1 ? "s" : ""} — ${ownedMeetings.length} you own, ${attendedMeetings.length} you attend`}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[{ id: "meetings", label: "\ud83d\udccb Meetings" }, { id: "calendar", label: "\ud83d\udcc5 Week View" }].map(v => (
                <button key={v.id} onClick={() => setView(v.id)} style={{
                  padding: "0.4rem 0.9rem", borderRadius: "8px", border: "1.5px solid",
                  borderColor: view === v.id ? activeRole.color : "#E2E8F0",
                  background: view === v.id ? activeRole.color + "12" : "#fff",
                  color: view === v.id ? activeRole.color : "#64748B",
                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                }}>{v.label}</button>
              ))}
            </div>
          </div>

          {/* Meetings View */}
          {view === "meetings" && (
            <>
              {/* Cadence Legend */}
              <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: "0.25rem" }}>Cadence:</span>
                  {Object.entries(CADENCE_COLORS).map(([key, val]) => (
                    <span key={key} style={{
                      padding: "2px 10px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700,
                      background: val.bg, color: val.text, border: `1px solid ${val.border}`,
                    }}>
                      {val.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meetings — owned first, then attended */}
              {activeRole.id !== "all" && ownedMeetings.length > 0 && (
                <>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0.25rem 0.25rem 0" }}>
                    Meetings You Own
                  </p>
                  {ownedMeetings.map(m => <MeetingCard key={m.id} meeting={m} highlightRole={activeRole.id} />)}
                  {attendedMeetings.length > 0 && (
                    <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0.5rem 0.25rem 0" }}>
                      Meetings You Attend
                    </p>
                  )}
                </>
              )}
              {(activeRole.id === "all" ? ALL_MEETINGS : attendedMeetings).map(m => (
                <MeetingCard key={m.id} meeting={m} highlightRole={activeRole.id} />
              ))}
              {filteredMeetings.length === 0 && (
                <div style={{
                  background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px",
                  padding: "2rem", textAlign: "center", color: "#94A3B8", fontSize: "0.85rem",
                }}>
                  No scheduled recurring meetings for this role. You may be called into meetings as needed by your Director.
                </div>
              )}
            </>
          )}

          {/* Week View */}
          {view === "calendar" && (
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "1.5rem" }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 1rem" }}>
                Typical Week at a Glance
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem" }}>
                {WEEK_MEETINGS.map((day) => (
                  <div key={day.day} style={{ background: "#F8FAFC", borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0" }}>
                    <div style={{
                      background: "#0F172A", padding: "0.5rem 0.75rem",
                      fontSize: "0.75rem", fontWeight: 800, color: "#fff", textAlign: "center", letterSpacing: "0.05em",
                    }}>
                      {day.day}
                    </div>
                    <div style={{ padding: "0.65rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {day.items.map((item, i) => (
                        <div key={i} style={{
                          fontSize: "0.72rem", color: "#374151", lineHeight: 1.45,
                          padding: "0.4rem 0.5rem", background: "#fff",
                          borderRadius: "6px", border: "1px solid #E2E8F0",
                        }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Monthly + Quarterly */}
              <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div style={{ background: "#FAF5FF", border: "1px solid #D8B4FE", borderRadius: "12px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B21A8", margin: "0 0 0.6rem" }}>Monthly</p>
                  {ALL_MEETINGS.filter(m => m.cadence === "monthly").map(m => (
                    <div key={m.id} style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.6 }}>
                      {m.emoji} {m.title}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#FFF7ED", border: "1px solid #FDBA74", borderRadius: "12px", padding: "1rem" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9A3412", margin: "0 0 0.6rem" }}>Quarterly</p>
                  {ALL_MEETINGS.filter(m => m.cadence === "quarterly").map(m => (
                    <div key={m.id} style={{ fontSize: "0.78rem", color: "#374151", lineHeight: 1.6 }}>
                      {m.emoji} {m.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* The Standard */}
          <div style={{
            background: "#0F172A08", border: "1px solid #0F172A20",
            borderLeft: "4px solid #0F172A", borderRadius: "12px",
            padding: "1.1rem 1.4rem", display: "flex", gap: "0.75rem", alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "1.1rem", marginTop: "1px" }}>{"\ud83d\udccc"}</span>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0F172A", margin: "0 0 0.3rem" }}>The Standard</p>
              <p style={{ fontSize: "0.86rem", color: "#374151", lineHeight: 1.65, margin: 0, fontStyle: "italic", fontWeight: 500 }}>
                Every meeting at NexGen has an owner, an agenda, and a purpose. If a meeting doesn't have all three, it shouldn't exist. Come prepared. Start on time. End with decisions — not just discussion.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
