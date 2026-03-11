import { useState } from "react"
import { HelpCircle } from "lucide-react"

// ─── ESCALATION PATHS ─────────────────────────────────────────────────────────
const URGENCY = {
  immediate: { label: "Immediately",    bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", icon: "\ud83d\udea8" },
  sameday:   { label: "Same Day",       bg: "#FEF9C3", text: "#854D0E", border: "#FDE047", icon: "\u26a1" },
  routine:   { label: "Next Check-In",  bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", icon: "\ud83d\udccb" },
  async:     { label: "As Needed",      bg: "#F0FDF4", text: "#166534", border: "#86EFAC", icon: "\ud83d\udcac" },
}

const CONTACTS = {
  founder:       { label: "Founder",                   emoji: "👑", color: "#0F172A" },
  operator:      { label: "Roman (Operator)",          emoji: "\ud83c\udfe2", color: "#2563EB" },
  director:      { label: "Director",                  emoji: "\ud83d\udccb", color: "#7C3AED" },
  lead_teacher:  { label: "Your Lead Teacher",         emoji: "\ud83d\udcda", color: "#059669" },
  lesson_plans:  { label: "Lesson Plans Manager",      emoji: "\ud83d\udcdd", color: "#059669" },
  hiring:        { label: "Hiring Manager",            emoji: "\ud83d\udd0d", color: "#DC2626" },
  tour:          { label: "Tour Manager",              emoji: "\ud83d\uddfa\ufe0f", color: "#7C3AED" },
  kitchen:       { label: "Kitchen Manager",           emoji: "\ud83c\udf7d\ufe0f", color: "#D97706" },
  front_desk:    { label: "Front Desk Manager",        emoji: "\ud83d\udda5\ufe0f", color: "#D97706" },
  licensing:     { label: "DFPS / Licensing (State)",   emoji: "\ud83c\udfdb\ufe0f", color: "#64748B" },
  trs:           { label: "TRS Assessor",              emoji: "\u2b50", color: "#64748B" },
  cacfp:         { label: "CACFP Sponsor",             emoji: "\ud83c\udf7d\ufe0f", color: "#64748B" },
  emergency:     { label: "911",                       emoji: "\ud83d\ude91", color: "#DC2626" },
}

const ROLES = [
  {
    id: "founder",
    label: "Founder",
    emoji: "👑",
    color: "#0F172A",
    tagline: "Most of your answers live in your data or a conversation with the Operator.",
    rule: "If you're solving a problem that should be solved by the Operator or Director, that's a systems gap — fix the system, not the symptom.",
    categories: [
      {
        title: "Financial & Strategy",
        icon: "💰",
        items: [
          { q: "Revenue is trending down — what do I do?", who: ["operator"], urgency: "sameday", note: "Pull the Monthly Finance Review forward. Ask the 3 diagnostic questions. Pick ONE decision." },
          { q: "Should I raise prices?", who: ["operator"], urgency: "routine", note: "Monthly Finance Review question. Check Avg Revenue per Child and Net Profit %. Pricing changes are the highest-ROI lever." },
          { q: "Payroll is too high as a % of revenue", who: ["operator"], urgency: "sameday", note: "Target is 50–55%. If above, review staffing vs. enrollment ratios with Director." },
          { q: "Should I expand to a second location?", who: ["operator"], urgency: "routine", note: "You don't need a finance department until: Multiple locations OR $3M+ revenue with complex debt/grants." },
        ],
      },
      {
        title: "Enrollment & Growth",
        icon: "📈",
        items: [
          { q: "Occupancy is below target", who: ["operator"], urgency: "sameday", note: "Check weekly enrollment KPIs with Robyn — leads, tours, conversions. Identify which lever is broken." },
          { q: "Marketing isn't generating enough leads", who: ["operator"], urgency: "routine", note: "Review Marketing function with Robyn — Structure, Thinking, Data, & AI." },
        ],
      },
      {
        title: "People & Operations",
        icon: "👥",
        items: [
          { q: "The Operator isn't performing", who: ["founder"], urgency: "routine", note: "Address in your weekly memos. Document patterns. Don't let it accumulate." },
          { q: "Director performance is declining", who: ["operator"], urgency: "routine", note: "Operator should be managing this. If they're not, that's a systems gap." },
          { q: "A critical compliance issue surfaces", who: ["operator", "director"], urgency: "immediate", note: "Operator and Director handle together. You stay informed but don't run the response." },
        ],
      },
    ],
  },
  {
    id: "operator",
    label: "Operator",
    emoji: "\ud83c\udfe2",
    color: "#2563EB",
    tagline: "When you have a question, the answer is usually in your own data \u2014 or a conversation with the Director.",
    rule: "If it\u2019s happening in the building, the Director should know before you do. If she doesn\u2019t, that\u2019s the first question to ask.",
    categories: [
      {
        title: "Business & Financial",
        icon: "\ud83d\udcca",
        items: [
          { q: "Are we on track for enrollment targets?", who: ["director"], urgency: "routine", note: "Pull from weekly KPI review or Tuesday check-in." },
          { q: "We have a financial shortfall this month", who: ["director"], urgency: "sameday", note: "Address together \u2014 Director owns operational context, you own the financial response." },
          { q: "Should I expand to a second location?", who: ["director"], urgency: "routine", note: "Quarterly review conversation. Not a Tuesday check-in question." },
        ],
      },
      {
        title: "Compliance & Licensing",
        icon: "\ud83d\udccb",
        items: [
          { q: "We received a licensing notice or complaint", who: ["director", "licensing"], urgency: "immediate", note: "You and the Director address it together. Loop in DFPS if required." },
          { q: "TRS assessment is coming up \u2014 are we ready?", who: ["director"], urgency: "sameday", note: "Director should be running ongoing TRS prep. This is a check-in." },
        ],
      },
      {
        title: "Staff & People",
        icon: "\ud83d\udc65",
        items: [
          { q: "A staff member needs to be terminated", who: ["director"], urgency: "sameday", note: "Director and Operator align before any action. Document everything." },
          { q: "Director performance is declining", who: ["operator"], urgency: "routine", note: "Address in your weekly check-in. Don\u2019t let it accumulate." },
        ],
      },
    ],
  },
  {
    id: "director",
    label: "Director",
    emoji: "\ud83d\udccb",
    color: "#7C3AED",
    tagline: "Most answers live on the floor. For the rest \u2014 know exactly when to go up.",
    rule: "If it could end up in a licensing report, an incident form, or a family complaint \u2014 Roman needs to know. Don\u2019t make that call alone.",
    categories: [
      {
        title: "Safety & Emergencies",
        icon: "\ud83d\udea8",
        items: [
          { q: "A child is injured or has a medical emergency", who: ["emergency", "operator"], urgency: "immediate", note: "911 first. Roman second. Document everything. Notify parent immediately after emergency is stabilized." },
          { q: "A staff member acted unsafely with a child", who: ["operator", "licensing"], urgency: "immediate", note: "Remove from classroom immediately. Do not investigate alone. Mandatory reporting may apply." },
          { q: "A child is missing or unaccounted for", who: ["emergency", "operator"], urgency: "immediate", note: "Initiate lockdown protocol. Call 911. Call Roman. Do not wait." },
        ],
      },
      {
        title: "Compliance & TRS",
        icon: "\u2b50",
        items: [
          { q: "We have a TRS compliance gap I can\u2019t fix alone", who: ["operator", "trs"], urgency: "sameday", note: "Don\u2019t let it sit. Flag to Roman and reach out to TRS coordinator if needed." },
          { q: "A licensing inspector arrives unannounced", who: ["operator"], urgency: "immediate", note: "Notify Roman immediately. Be professional and cooperative. Document the visit." },
          { q: "Staff training hours are falling behind", who: ["operator"], urgency: "routine", note: "Bring to Tuesday check-in with a plan to resolve." },
        ],
      },
      {
        title: "Staff Management",
        icon: "\ud83d\udc65",
        items: [
          { q: "A teacher is struggling \u2014 I\u2019ve addressed it twice already", who: ["operator"], urgency: "sameday", note: "Third-instance conversations require Roman\u2019s awareness before formal action." },
          { q: "I need to fill a classroom urgently", who: ["hiring"], urgency: "sameday", note: "Call the Hiring Manager directly. Communicate urgency clearly." },
          { q: "A staff member filed a complaint about another staff member", who: ["operator"], urgency: "sameday", note: "Do not handle HR conflicts alone at this level. Loop in Roman." },
        ],
      },
      {
        title: "Family Escalations",
        icon: "\u2764\ufe0f",
        items: [
          { q: "A family is threatening legal action or filing a formal complaint", who: ["operator"], urgency: "immediate", note: "Roman handles anything with legal exposure. Stop responding directly." },
          { q: "A parent is making an unauthorized pickup attempt", who: ["emergency", "operator"], urgency: "immediate", note: "Do not release the child. Call 911 if necessary. Notify Roman." },
          { q: "A family concern I\u2019ve addressed but they\u2019re still unsatisfied", who: ["operator"], urgency: "sameday", note: "Roman may want to make a personal call. Don\u2019t leave it unresolved." },
        ],
      },
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    emoji: "\ud83d\udcda",
    color: "#059669",
    tagline: "Your first answer is almost always your Director. Know the few times it isn\u2019t.",
    rule: "If a child is in danger \u2014 act first, ask questions second. For everything else, your Director is your resource.",
    categories: [
      {
        title: "Safety & Emergencies",
        icon: "\ud83d\udea8",
        items: [
          { q: "A child is seriously injured in my classroom", who: ["emergency", "director"], urgency: "immediate", note: "Call for help immediately. Do not leave children unattended. Your assistant holds the room while you respond." },
          { q: "I suspect a child is being abused or neglected", who: ["director"], urgency: "immediate", note: "Report to Director immediately. Mandatory reporting laws apply. Do not question the child extensively." },
          { q: "A child has a medical episode (seizure, allergic reaction)", who: ["director", "emergency"], urgency: "immediate", note: "Follow your classroom emergency protocol. Get help into the room. Call 911 if indicated." },
        ],
      },
      {
        title: "Classroom & Curriculum",
        icon: "\ud83d\udcda",
        items: [
          { q: "I don\u2019t understand or can\u2019t execute the lesson plan this week", who: ["lesson_plans"], urgency: "routine", note: "Contact the Lesson Plans Manager directly, same day you receive the plan." },
          { q: "I\u2019m running low on classroom supplies", who: ["director"], urgency: "routine", note: "Flag at least a week before you run out. Not the day you need it." },
          { q: "A child in my class needs more support than I can give", who: ["director"], urgency: "sameday", note: "Director coordinates developmental referrals and family communication. Don\u2019t hold this alone." },
          { q: "My assistant isn\u2019t showing up or isn\u2019t engaged", who: ["director"], urgency: "sameday", note: "Don\u2019t manage your assistant\u2019s performance \u2014 that belongs to the Director." },
        ],
      },
      {
        title: "Family Communication",
        icon: "\u2764\ufe0f",
        items: [
          { q: "A parent is upset with me or my classroom", who: ["director"], urgency: "sameday", note: "Acknowledge the concern warmly, then bring the Director in. Don\u2019t try to resolve conflict alone." },
          { q: "A parent is asking about something I can\u2019t answer (enrollment, billing, policy)", who: ["front_desk", "director"], urgency: "async", note: "Route to Front Desk for operational questions, Director for anything involving policy or sensitive information." },
          { q: "A parent shared something concerning about their child\u2019s home situation", who: ["director"], urgency: "sameday", note: "Don\u2019t hold this information. Share it with the Director the same day." },
        ],
      },
      {
        title: "My Own Performance",
        icon: "\ud83d\udcc8",
        items: [
          { q: "I don\u2019t feel like I\u2019m doing well and I\u2019m not sure what to improve", who: ["director"], urgency: "routine", note: "Ask for a check-in. Directors want to help \u2014 don\u2019t wait for a formal review." },
          { q: "I disagree with feedback I received", who: ["director"], urgency: "routine", note: "Ask for a private conversation. Come prepared with your perspective, not defensiveness." },
          { q: "I want to grow into a bigger role", who: ["director"], urgency: "async", note: "Bring this up in your next one-on-one. Come with examples of your work." },
        ],
      },
    ],
  },
  {
    id: "teacher-assistant",
    label: "Teacher Assistant",
    emoji: "\ud83e\udd1d",
    color: "#0891B2",
    tagline: "Your lead teacher is your first resource. Always.",
    rule: "The only time you skip your lead teacher is when a child\u2019s safety is at immediate risk and she is not present. Otherwise \u2014 go through her first.",
    categories: [
      {
        title: "Safety & Emergencies",
        icon: "\ud83d\udea8",
        items: [
          { q: "A child is hurt and the lead teacher isn\u2019t in the room", who: ["director", "emergency"], urgency: "immediate", note: "Secure the child, get help, hold the room. Don\u2019t leave children unattended." },
          { q: "I see something that doesn\u2019t feel right with a child", who: ["lead_teacher"], urgency: "immediate", note: "Tell your lead teacher immediately, even if you\u2019re not sure. You are not expected to diagnose \u2014 just report." },
        ],
      },
      {
        title: "Classroom Questions",
        icon: "\ud83d\udcda",
        items: [
          { q: "I\u2019m not sure what I\u2019m supposed to be doing right now", who: ["lead_teacher"], urgency: "immediate", note: "Ask your lead teacher. There should never be a moment you\u2019re guessing in a classroom." },
          { q: "I need to step out of the classroom", who: ["lead_teacher"], urgency: "immediate", note: "Always communicate before leaving. Never just go." },
          { q: "I disagree with how the lead teacher handled something", who: ["lead_teacher"], urgency: "routine", note: "Private conversation after the children are gone. Never in front of the class." },
        ],
      },
      {
        title: "My Own Role",
        icon: "\ud83d\udcc8",
        items: [
          { q: "I\u2019m not sure if I\u2019m performing well", who: ["lead_teacher", "director"], urgency: "async", note: "Ask your lead teacher first. If the concern is bigger, ask the Director for a check-in." },
          { q: "I want to become a lead teacher eventually", who: ["director"], urgency: "async", note: "Tell the Director. Show that intention through your daily performance first." },
        ],
      },
    ],
  },
  {
    id: "front-desk",
    label: "Front Desk Manager",
    emoji: "\ud83d\udda5\ufe0f",
    color: "#D97706",
    tagline: "When in doubt \u2014 get the Director. You are the first contact, not the last decision.",
    rule: "The moment a situation feels above your authority, it is. Escalate early rather than late.",
    categories: [
      {
        title: "Safety & Access",
        icon: "\ud83d\udea8",
        items: [
          { q: "Someone is attempting an unauthorized pickup", who: ["director", "emergency"], urgency: "immediate", note: "Do not release the child under any circumstances. Get the Director to the front immediately." },
          { q: "Someone at the door is acting aggressively or erratically", who: ["director", "emergency"], urgency: "immediate", note: "Do not engage alone. Alert the Director. Call 911 if there is any physical threat." },
        ],
      },
      {
        title: "Family Questions",
        icon: "\u2764\ufe0f",
        items: [
          { q: "A parent has a billing dispute I can\u2019t resolve", who: ["director"], urgency: "sameday", note: "Don\u2019t guess at billing. Get the Director involved same day." },
          { q: "A parent is asking about an incident involving their child", who: ["director"], urgency: "immediate", note: "Acknowledge and immediately get the Director. Do not relay incident details yourself." },
          { q: "A family wants to schedule a tour", who: ["tour"], urgency: "async", note: "Collect their info, log it, and route directly to the Tour Manager." },
          { q: "A parent is asking about enrollment availability", who: ["director"], urgency: "routine", note: "Never confirm or deny spots without checking with the Director first." },
        ],
      },
      {
        title: "Operational",
        icon: "\u2699\ufe0f",
        items: [
          { q: "The attendance system isn\u2019t working", who: ["director"], urgency: "sameday", note: "Switch to paper backup log immediately. Notify the Director so it can be resolved." },
          { q: "I\u2019m going to be late or need to leave early", who: ["director"], urgency: "immediate", note: "The front desk cannot be unattended. Give as much notice as possible \u2014 ideally the day before." },
        ],
      },
    ],
  },
  {
    id: "hiring-manager",
    label: "Hiring Manager",
    emoji: "\ud83d\udd0d",
    color: "#DC2626",
    tagline: "Most decisions go through the Director. Nothing binding happens without her.",
    rule: "You filter. You don\u2019t decide. Every offer, every rejection that isn\u2019t routine, every background concern \u2014 the Director is the final checkpoint.",
    categories: [
      {
        title: "Candidate Concerns",
        icon: "\ud83d\udd0e",
        items: [
          { q: "A background check came back with something concerning", who: ["director"], urgency: "immediate", note: "Do not advance or reject alone. Bring the results directly to the Director." },
          { q: "A candidate\u2019s credentials don\u2019t match what they submitted", who: ["director"], urgency: "immediate", note: "Flag before any further steps. This is a trust issue." },
          { q: "I\u2019m unsure whether a candidate is right for a role", who: ["director"], urgency: "routine", note: "Bring your notes. Ask the Director to do a second interview if needed." },
        ],
      },
      {
        title: "Pipeline & Process",
        icon: "\ud83d\udcca",
        items: [
          { q: "We can\u2019t find qualified candidates for a role", who: ["director"], urgency: "sameday", note: "Flag early. Discuss alternative sourcing, compensation, or role requirements." },
          { q: "A new hire no-showed on day one", who: ["director"], urgency: "immediate", note: "Notify the Director immediately so coverage can be arranged." },
          { q: "I need to extend an offer \u2014 what\u2019s the compensation?", who: ["director"], urgency: "routine", note: "Always confirm comp with the Director before quoting a number to a candidate." },
        ],
      },
    ],
  },
  {
    id: "tour-manager",
    label: "Tour Manager",
    emoji: "\ud83d\uddfa\ufe0f",
    color: "#7C3AED",
    tagline: "Enrollment questions go up. Conversation questions stay with you.",
    rule: "If a family asks something you don\u2019t know \u2014 say \u2018Great question, let me confirm that for you\u2019 and get the Director. Never guess on pricing, availability, or policy.",
    categories: [
      {
        title: "During a Tour",
        icon: "\ud83d\uddfa\ufe0f",
        items: [
          { q: "A family asks about a specific classroom incident or complaint they heard about", who: ["director"], urgency: "immediate", note: "Do not address this. Say \u2018I\u2019d like our Director to speak with you about that directly\u2019 and get her." },
          { q: "A family asks about pricing I\u2019m not sure about", who: ["director"], urgency: "immediate", note: "Stop and confirm. Never quote an outdated or incorrect rate." },
          { q: "A family wants to enroll on the spot \u2014 is there availability?", who: ["director"], urgency: "immediate", note: "Confirm availability with the Director before getting the family\u2019s hopes up." },
        ],
      },
      {
        title: "Follow-Up & Pipeline",
        icon: "\ud83d\udcc8",
        items: [
          { q: "A family went cold after a tour \u2014 should I keep following up?", who: ["director"], urgency: "routine", note: "Discuss follow-up cadence in your Friday debrief. 3 touchpoints is typically the limit." },
          { q: "My conversion rate is dropping and I don\u2019t know why", who: ["director"], urgency: "sameday", note: "Bring your data. Ask for a tour observation or mystery tour feedback." },
        ],
      },
    ],
  },
  {
    id: "lesson-plans",
    label: "Lesson Plans Manager",
    emoji: "\ud83d\udcdd",
    color: "#059669",
    tagline: "Curriculum questions stop here. Classroom behavior questions go up.",
    rule: "Your authority is the plan. What happens in the classroom with the plan is the Director\u2019s domain \u2014 not yours.",
    categories: [
      {
        title: "Curriculum & TRS",
        icon: "\ud83d\udcdd",
        items: [
          { q: "I\u2019m not sure if a lesson plan meets TRS requirements", who: ["director", "trs"], urgency: "sameday", note: "Resolve before the plan is distributed. A non-compliant plan should never reach a classroom." },
          { q: "I need resources or materials not currently in the library", who: ["director"], urgency: "routine", note: "Bring a specific request with a cost estimate. The Director approves purchases." },
        ],
      },
      {
        title: "Teacher Accountability",
        icon: "\ud83d\udc41\ufe0f",
        items: [
          { q: "A teacher hasn\u2019t submitted their plan and it\u2019s past the deadline", who: ["director"], urgency: "sameday", note: "Notify the Director same day. It is not your role to enforce deadlines \u2014 only to report them." },
          { q: "A classroom isn\u2019t implementing the plan I created", who: ["director"], urgency: "sameday", note: "Flag with specifics \u2014 what classroom, what week, what you observed. Then hand it off." },
        ],
      },
    ],
  },
  {
    id: "kitchen-manager",
    label: "Kitchen Manager",
    emoji: "\ud83c\udf7d\ufe0f",
    color: "#D97706",
    tagline: "Food safety questions don\u2019t wait. Everything else has a process.",
    rule: "When in doubt about a food safety call \u2014 throw it out. When in doubt about a compliance call \u2014 call the Director.",
    categories: [
      {
        title: "Safety & Emergencies",
        icon: "\ud83d\udea8",
        items: [
          { q: "A child is having a possible allergic reaction", who: ["director", "emergency"], urgency: "immediate", note: "Get help to the child immediately. Director calls parents. You document everything." },
          { q: "I think food may have been contaminated or is unsafe", who: ["director"], urgency: "immediate", note: "Pull the food. Do not serve it. Notify the Director immediately with specifics." },
          { q: "Kitchen equipment failed mid-service", who: ["director"], urgency: "immediate", note: "Notify immediately so the Director can manage classroom expectations and find a backup." },
        ],
      },
      {
        title: "Compliance",
        icon: "\ud83d\udccb",
        items: [
          { q: "I\u2019m unsure how to document a CACFP substitution", who: ["director", "cacfp"], urgency: "sameday", note: "Contact the CACFP sponsor directly if the Director can\u2019t answer. Document before the day ends." },
          { q: "A CACFP auditor is coming or has arrived", who: ["director"], urgency: "immediate", note: "Notify the Director immediately. Have all records accessible and organized." },
        ],
      },
      {
        title: "Menu & Inventory",
        icon: "\ud83c\udf7d\ufe0f",
        items: [
          { q: "We\u2019re out of a menu item mid-week", who: ["director"], urgency: "sameday", note: "Notify the Director before making any substitution. Get approval, then document it." },
          { q: "A new child has a dietary restriction I haven\u2019t seen before", who: ["director"], urgency: "sameday", note: "Do not adjust without written confirmation from the Director and the family." },
        ],
      },
    ],
  },
  {
    id: "bus-driver",
    label: "Bus Driver",
    emoji: "\ud83d\ude8c",
    color: "#DC2626",
    tagline: "On the route, you are the decision-maker for safety. For everything else \u2014 communicate immediately.",
    rule: "If something happens on the bus, the Director needs to know before you finish the route. No exceptions.",
    categories: [
      {
        title: "On-Route Emergencies",
        icon: "\ud83d\udea8",
        items: [
          { q: "A child is injured on the bus", who: ["emergency", "director"], urgency: "immediate", note: "Pull over safely. Call 911 if needed. Call the Director. Do not continue the route until the situation is resolved." },
          { q: "The vehicle has a mechanical failure mid-route", who: ["director"], urgency: "immediate", note: "Pull over safely. Do not continue on an unsafe vehicle. The Director coordinates pickup." },
          { q: "Someone is trying to stop the bus or access a child", who: ["emergency", "director"], urgency: "immediate", note: "Do not stop or open the door. Drive to a safe, public location. Call 911. Call the Director." },
        ],
      },
      {
        title: "Route Management",
        icon: "\ud83d\ude8c",
        items: [
          { q: "A parent at a stop isn\u2019t there for pickup \u2014 what do I do?", who: ["director"], urgency: "immediate", note: "Do not leave the child. Call the Director immediately. The child returns to the facility." },
          { q: "An unauthorized person is at a stop claiming the child", who: ["director", "emergency"], urgency: "immediate", note: "Do not release the child. Call the Director. Call 911 if the situation escalates." },
          { q: "I\u2019m running significantly behind schedule", who: ["director"], urgency: "sameday", note: "Call in as soon as you know. Families should not be waiting without communication." },
        ],
      },
      {
        title: "Vehicle & Documentation",
        icon: "\ud83d\udd27",
        items: [
          { q: "My vehicle needs maintenance", who: ["director"], urgency: "sameday", note: "Report same day. Never drive a vehicle with a known safety issue." },
          { q: "I\u2019m not sure how to document an incident that happened on the route", who: ["director"], urgency: "sameday", note: "Ask before you write \u2014 the Director can guide the documentation for any incident with liability implications." },
        ],
      },
    ],
  },
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
    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{role.emoji}</span>
    <span style={{ fontSize: "0.82rem", fontWeight: isActive ? 700 : 500, color: isActive ? role.color : "#374151", lineHeight: 1.3 }}>
      {role.label}
    </span>
  </button>
)

const UrgencyBadge = ({ urgency }) => {
  const u = URGENCY[urgency]
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "2px 8px", borderRadius: "99px", fontSize: "0.68rem", fontWeight: 700,
      background: u.bg, color: u.text, border: `1px solid ${u.border}`, whiteSpace: "nowrap",
    }}>
      {u.icon} {u.label}
    </span>
  )
}

const ContactChip = ({ contactId }) => {
  const c = CONTACTS[contactId]
  if (!c) return null
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "3px 10px", borderRadius: "99px", fontSize: "0.73rem", fontWeight: 600,
      background: c.color + "12", color: c.color, border: `1px solid ${c.color}25`,
      whiteSpace: "nowrap",
    }}>
      {c.emoji} {c.label}
    </span>
  )
}

const CategoryBlock = ({ category, roleColor }) => {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", overflow: "hidden", marginBottom: "0.75rem" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.9rem 1.25rem", background: "#F8FAFC", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.1rem" }}>{category.icon}</span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>{category.title}</span>
          <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>{category.items.length} scenarios</span>
        </div>
        <span style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700 }}>{open ? "\u25b2" : "\u25bc"}</span>
      </button>

      {open && (
        <div>
          {category.items.map((item, i) => (
            <div key={i} style={{
              padding: "1rem 1.25rem",
              borderTop: "1px solid #F1F5F9",
              background: i % 2 === 0 ? "#fff" : "#FAFBFC",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", flex: 1 }}>
                  <span style={{ color: roleColor, fontWeight: 800, fontSize: "0.85rem", flexShrink: 0, marginTop: "2px" }}>Q</span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0F172A", lineHeight: 1.55 }}>{item.q}</span>
                </div>
                <UrgencyBadge urgency={item.urgency} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: "3px", flexShrink: 0 }}>Go to</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {item.who.map(w => <ContactChip key={w} contactId={w} />)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.35rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", paddingTop: "3px", flexShrink: 0 }}>Note</span>
                <span style={{ fontSize: "0.78rem", color: "#64748B", lineHeight: 1.6 }}>{item.note}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WhereDoWeGoPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])

  const immediateItems = activeRole.categories
    .flatMap(c => c.items)
    .filter(i => i.urgency === "immediate")

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <HelpCircle size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Where Do We Go If You Have Questions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your escalation guide — who to contact, how fast, and what to say for every scenario.
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
            Select Your Role
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {ROLES.map(role => (
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
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "1.75rem" }}>{activeRole.emoji}</span>
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                  {activeRole.label}
                </h2>
                <p style={{ fontSize: "0.84rem", color: activeRole.color, fontWeight: 600, fontStyle: "italic", margin: "0.15rem 0 0" }}>
                  {activeRole.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Golden Rule */}
          <div style={{
            background: activeRole.color + "08", border: `1px solid ${activeRole.color}25`,
            borderLeft: `4px solid ${activeRole.color}`, borderRadius: "12px",
            padding: "1rem 1.4rem", display: "flex", gap: "0.75rem", alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "1.1rem", marginTop: "1px" }}>{"\ud83e\udded"}</span>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: activeRole.color, margin: "0 0 0.25rem" }}>
                Your Golden Rule
              </p>
              <p style={{ fontSize: "0.86rem", color: "#374151", lineHeight: 1.65, margin: 0, fontWeight: 600 }}>
                {activeRole.rule}
              </p>
            </div>
          </div>

          {/* Immediate Escalations Callout */}
          {immediateItems.length > 0 && (
            <div style={{
              background: "#FEF2F2", border: "1px solid #FECACA",
              borderLeft: "4px solid #DC2626", borderRadius: "14px", padding: "1.1rem 1.4rem",
            }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#DC2626", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                {"\ud83d\udea8"} Requires Immediate Action
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {immediateItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                    <span style={{ color: "#DC2626", fontWeight: 800, fontSize: "0.8rem", flexShrink: 0, marginTop: "2px" }}>{"\u2192"}</span>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7F1D1D" }}>{item.q}</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.3rem" }}>
                        {item.who.map(w => <ContactChip key={w} contactId={w} />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Blocks */}
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0.1rem 0.25rem 0" }}>
            All Scenarios — tap category to expand
          </p>
          {activeRole.categories.map((cat, i) => (
            <CategoryBlock key={i} category={cat} roleColor={activeRole.color} />
          ))}

          {/* Urgency Legend */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 0.6rem" }}>
              Urgency Guide
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {Object.entries(URGENCY).map(([key, val]) => (
                <span key={key} style={{
                  padding: "3px 10px", borderRadius: "99px", fontSize: "0.72rem", fontWeight: 700,
                  background: val.bg, color: val.text, border: `1px solid ${val.border}`,
                }}>
                  {val.icon} {val.label}
                </span>
              ))}
            </div>
          </div>

          {/* The Standard */}
          <div style={{
            background: "#0F172A", borderRadius: "12px",
            padding: "1.1rem 1.4rem", display: "flex", gap: "0.75rem", alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "1.1rem", marginTop: "1px" }}>{"\ud83d\udccc"}</span>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 0.3rem" }}>
                The Standard
              </p>
              <p style={{ fontSize: "0.86rem", color: "#E2E8F0", lineHeight: 1.65, margin: 0, fontStyle: "italic", fontWeight: 500 }}>
                The wrong time to figure out who to call is when something is already going wrong. Know your escalation path before you need it. Read this. Remember it. Use it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
