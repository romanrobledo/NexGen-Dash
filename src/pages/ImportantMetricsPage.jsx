import { useState } from "react"
import { BarChart3 } from "lucide-react"

// ─── METRIC STATUS DEFINITIONS ────────────────────────────────────────────────
const STATUS = {
  green:  { label: "On Target",    bg: "#DCFCE7", text: "#166534", border: "#86EFAC", bar: "#22C55E" },
  yellow: { label: "Watch",        bg: "#FEF9C3", text: "#854D0E", border: "#FDE047", bar: "#EAB308" },
  red:    { label: "Off Track",    bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", bar: "#EF4444" },
}

// ─── SCHOOL-WIDE METRICS ──────────────────────────────────────────────────────
const SCHOOL_METRICS = [
  { label: "Enrollment Capacity",   target: "85%+",   green: "85\u2013100%",  yellow: "70\u201384%",  red: "Below 70%" },
  { label: "TRS Star Rating",       target: "4-Star",  green: "4\u20135 Star", yellow: "3 Star",  red: "2 Star or below" },
  { label: "Family Retention Rate", target: "85%+",   green: "85%+",     yellow: "70\u201384%",  red: "Below 70%" },
  { label: "Staff Turnover (Annual)",target: "Under 20%", green: "Under 20%", yellow: "20\u201335%", red: "Above 35%" },
  { label: "Incident Reports (Monthly)", target: "0 critical", green: "0 critical", yellow: "1\u20132 minor", red: "Any critical or pattern of minor" },
]

// ─── ROLE METRICS ─────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "founder",
    label: "Founder",
    emoji: "\ud83d\udc51",
    color: "#0F172A",
    tagline: "You track the health of the whole machine across 3 core functions.",
    north_star: "Are we filling seats profitably \u2014 and is every function owner hitting their 3\u20134 numbers?",
    cadence: "Weekly scoreboard with Robyn. Monthly finance review. Quarterly deep dive.",
    bigTargets: [
      { label: "20 New Students", detail: "Shared target — Robyn + Robyne + Ed", icon: "🎯", color: "#2563EB" },
      { label: "100 Customer Reviews", detail: "Google/Facebook — social proof for enrollment growth", icon: "⭐", color: "#EAB308" },
    ],
    metrics: [
      {
        category: "Enrollment KPIs (Robyn \u2014 Weekly)",
        icon: "\ud83d\udcc8",
        items: [
          { label: "New Leads / Week", target: "Set baseline", green: "Above baseline", yellow: "At baseline", red: "Below baseline" },
          { label: "Tours Held / Week", target: "Set baseline", green: "Above baseline", yellow: "At baseline", red: "Below baseline" },
          { label: "New Enrollments / Week", target: "Set baseline", green: "Above baseline", yellow: "At baseline", red: "Below baseline" },
          { label: "Occupancy %", target: "Enrolled \u00f7 175", green: "85%+", yellow: "70\u201384%", red: "Below 70%" },
        ],
      },
      {
        category: "Experience & Retention KPIs (Rachel \u2014 Weekly/Monthly)",
        icon: "\u2764\ufe0f",
        items: [
          { label: "% Classrooms Green on TRS Checklist", target: "100%", green: "All green", yellow: "1\u20132 flagged", red: "3+ flagged" },
          { label: "Staff Attendance / Call-Outs", target: "95%+ attendance", green: "95%+", yellow: "85\u201394%", red: "Below 85%" },
          { label: "Family Churn %", target: "Below 5% monthly", green: "Below 5%", yellow: "5\u201310%", red: "Above 10%" },
          { label: "Parent Complaints / Serious Issues", target: "Zero critical", green: "Zero", yellow: "1\u20132 minor", red: "Any critical or pattern" },
        ],
      },
      {
        category: "Cash & Admin KPIs (You \u2014 Monthly)",
        icon: "\ud83d\udcb0",
        items: [
          { label: "Total Revenue & Net Profit", target: "Monthly P&L review", green: "At or above plan", yellow: "Within 10% below", red: "More than 10% below" },
          { label: "Average Revenue per Child", target: "Revenue \u00f7 enrolled kids", green: "At or above target", yellow: "Slightly below", red: "Significantly below" },
          { label: "Payroll % of Revenue", target: "~50\u201355%", green: "50\u201355%", yellow: "55\u201365%", red: "Above 65%" },
          { label: "On-Time Collection Rate", target: "95%+", green: "95%+", yellow: "85\u201394%", red: "Below 85%" },
        ],
      },
      {
        category: "Weekly Scoreboard (Quick Check)",
        icon: "\ud83d\udcca",
        items: [
          { label: "Occupancy %", target: "Are seats filled?", green: "85%+", yellow: "70\u201384%", red: "Below 70%" },
          { label: "New Enrollments / Withdrawals", target: "Net positive", green: "Net positive", yellow: "Flat", red: "Net negative" },
          { label: "Total Payroll Dollars (that week)", target: "In budget", green: "In budget", yellow: "Slightly over", red: "Significantly over" },
          { label: "Cash in Bank", target: "Above 1 month expenses", green: "Yes", yellow: "Tight", red: "Below 1 month" },
        ],
      },
    ],
  },
  {
    id: "operator",
    label: "Operator",
    emoji: "\ud83c\udfe2",
    color: "#2563EB",
    tagline: "You measure the health of the whole business.",
    north_star: "Is NexGen growing, financially healthy, and operationally excellent \u2014 simultaneously?",
    cadence: "Weekly financial review. Monthly business review. Quarterly deep dive.",
    metrics: [
      {
        category: "Financial",
        icon: "\ud83d\udcb0",
        items: [
          { label: "Monthly Revenue vs. Target",       target: "At or above plan",    green: "At or above",       yellow: "Within 10% below",   red: "More than 10% below plan" },
          { label: "Operating Expense Ratio",          target: "Under 75% of revenue",green: "Under 75%",         yellow: "75\u201385%",             red: "Above 85%" },
          { label: "Net Profit Margin",                target: "15%+",               green: "15%+",              yellow: "5\u201314%",              red: "Below 5% or negative" },
        ],
      },
      {
        category: "Enrollment",
        icon: "\ud83d\udcc8",
        items: [
          { label: "Current Enrollment vs. Capacity",  target: "85%+",               green: "85\u2013100%",           yellow: "70\u201384%",             red: "Below 70%" },
          { label: "Month-over-Month Enrollment Growth",target: "Flat or positive",   green: "Growing or stable", yellow: "Down 1\u20135%",          red: "Down more than 5%" },
          { label: "Waitlist Length",                  target: "Active waitlist",     green: "5+ on waitlist",    yellow: "1\u20134",                red: "Empty waitlist" },
        ],
      },
      {
        category: "Operations",
        icon: "\u2699\ufe0f",
        items: [
          { label: "TRS Compliance Status",            target: "4-Star maintained",   green: "4\u20135 Star",          yellow: "Under review",       red: "Cited or flagged" },
          { label: "Staff Turnover Rate",              target: "Under 20% annually",  green: "Under 20%",         yellow: "20\u201335%",             red: "Above 35%" },
          { label: "Outstanding Compliance Items",     target: "Zero",               green: "None",              yellow: "1\u20132 minor open",     red: "Any critical open item" },
        ],
      },
    ],
  },
  {
    id: "director",
    label: "Director",
    emoji: "\ud83d\udccb",
    color: "#7C3AED",
    tagline: "You measure the health of the building you run.",
    north_star: "Is every classroom safe, every family retained, and every staff member accountable?",
    cadence: "Daily awareness. Weekly report to Operator. Monthly full review.",
    metrics: [
      {
        category: "Compliance & Quality",
        icon: "\u2b50",
        items: [
          { label: "TRS Classroom Compliance Rate",    target: "100% of classrooms",  green: "All rooms compliant",yellow: "1 room flagged",    red: "2+ rooms flagged" },
          { label: "Staff Training Hours Current",     target: "100% of staff",       green: "100%",              yellow: "85\u201399%",             red: "Below 85%" },
          { label: "Incident Reports Filed Same Day",  target: "100%",               green: "100%",              yellow: "Occasional delay",   red: "Frequently late" },
        ],
      },
      {
        category: "People",
        icon: "\ud83d\udc65",
        items: [
          { label: "Open Performance Issues Unresolved",target: "Zero unaddressed",   green: "All addressed",     yellow: "1\u20132 in process",     red: "Any ignored or stalled" },
          { label: "Staff Attendance Rate",            target: "95%+",               green: "95%+",              yellow: "85\u201394%",             red: "Below 85%" },
          { label: "Teacher Observation Completed Weekly",target: "All classrooms",  green: "All rooms weekly",  yellow: "Most rooms",         red: "Sporadic or skipped" },
        ],
      },
      {
        category: "Families",
        icon: "\u2764\ufe0f",
        items: [
          { label: "Parent Satisfaction Score",        target: "4.5+ out of 5",      green: "4.5\u20135.0",           yellow: "3.5\u20134.4",            red: "Below 3.5" },
          { label: "Complaint Resolution Time",        target: "Within 24 hours",    green: "Within 24 hrs",     yellow: "24\u201372 hrs",          red: "Over 72 hrs or unresolved" },
          { label: "Family Retention Rate",            target: "85%+",               green: "85%+",              yellow: "70\u201384%",             red: "Below 70%" },
        ],
      },
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    emoji: "\ud83d\udcda",
    color: "#059669",
    tagline: "You measure what happens inside your classroom every single day.",
    north_star: "Is every child in my classroom safe, engaged, and developing on track?",
    cadence: "Daily self-check. Weekly lesson plan review. Monthly developmental documentation.",
    metrics: [
      {
        category: "Classroom Quality",
        icon: "\ud83c\udfeb",
        items: [
          { label: "TRS Observation Score (Director)",  target: "8+ out of 10",       green: "8\u201310",              yellow: "6\u20137",                red: "Below 6" },
          { label: "Positive Language Rate (Observed)", target: "No negative framing", green: "Always positive",   yellow: "Occasional slip",    red: "Threats or negative framing observed" },
          { label: "Daily Schedule Adherence",          target: "Consistent",         green: "Followed daily",    yellow: "Occasional deviation",red: "Frequently off-schedule" },
        ],
      },
      {
        category: "Curriculum",
        icon: "\ud83d\udcdd",
        items: [
          { label: "Lesson Plan On-Time Submission",    target: "Every Thursday",     green: "Every week",        yellow: "1\u20132 late in a month",red: "Frequently late or missing" },
          { label: "Lesson Plan Implementation Rate",   target: "Fully executed",     green: "Fully executed",    yellow: "Partially executed", red: "Skipped or improvised" },
          { label: "Developmental Domains Covered",     target: "All 4 weekly",       green: "All 4 weekly",      yellow: "3 domains",          red: "2 or fewer" },
        ],
      },
      {
        category: "Documentation",
        icon: "\ud83d\udcd2",
        items: [
          { label: "Daily Check-In Completion",         target: "Every day",          green: "Every day",         yellow: "Mostly",             red: "Frequently missed" },
          { label: "Incident Reports Same-Day",         target: "100%",              green: "Always same-day",   yellow: "Occasional delay",   red: "Frequently late" },
          { label: "Monthly Developmental Observations",target: "All children",      green: "All children documented", yellow: "Most documented", red: "Incomplete or missing" },
        ],
      },
    ],
  },
  {
    id: "teacher-assistant",
    label: "Teacher Assistant",
    emoji: "\ud83e\udd1d",
    color: "#0891B2",
    tagline: "Your metrics are simple \u2014 presence, attentiveness, and reliability.",
    north_star: "Is every child in this room supervised and supported at all times?",
    cadence: "Evaluated through daily Director observations and weekly check-in with lead teacher.",
    metrics: [
      {
        category: "Supervision",
        icon: "\ud83d\udc40",
        items: [
          { label: "Active Supervision Score (Observed)", target: "No lapses",        green: "Consistently engaged", yellow: "Minor distractions", red: "Phone use or checked out" },
          { label: "Correct Room Positioning",           target: "Always",           green: "Always correct",    yellow: "Sometimes",          red: "Frequently incorrect" },
        ],
      },
      {
        category: "Reliability",
        icon: "\ud83d\udcc5",
        items: [
          { label: "On-Time Attendance",                 target: "Every shift",      green: "Always on time",    yellow: "Occasional tardiness", red: "Frequent or no-call" },
          { label: "Daily Check-In Completion",          target: "Every day",        green: "Every day",         yellow: "Most days",          red: "Frequently missed" },
        ],
      },
      {
        category: "Classroom Contribution",
        icon: "\ud83c\udfa8",
        items: [
          { label: "Materials Prepped Without Prompting",target: "Proactive",        green: "Consistently proactive", yellow: "When reminded",  red: "Rarely or never" },
          { label: "Observation Score (Director)",       target: "7+ out of 10",     green: "7\u201310",              yellow: "5\u20136",                red: "Below 5" },
        ],
      },
    ],
  },
  {
    id: "front-desk",
    label: "Front Desk Manager",
    emoji: "\ud83d\udda5\ufe0f",
    color: "#D97706",
    tagline: "You measure every point of contact a family has with NexGen.",
    north_star: "Does every family leave every interaction feeling informed, welcomed, and confident in this school?",
    cadence: "Daily attendance accuracy. Weekly inquiry log. Monthly family experience review.",
    metrics: [
      {
        category: "Family Experience",
        icon: "\u2764\ufe0f",
        items: [
          { label: "Families Greeted by Name",           target: "100%",             green: "Always",            yellow: "Usually",            red: "Rarely" },
          { label: "Parent Satisfaction (Front Desk)",   target: "4.5+ out of 5",    green: "4.5\u20135.0",           yellow: "3.5\u20134.4",            red: "Below 3.5" },
          { label: "Complaint Escalation Same Day",      target: "100%",             green: "Always same day",   yellow: "Usually",            red: "Delayed or skipped" },
        ],
      },
      {
        category: "Operational Accuracy",
        icon: "\ud83d\udccb",
        items: [
          { label: "Attendance Logged in Real Time",     target: "100%",             green: "Always real-time",  yellow: "Minor delays",       red: "Batched or inaccurate" },
          { label: "Visitor Log Completion Rate",        target: "100%",             green: "100% complete",     yellow: "Minor gaps",         red: "Frequently incomplete" },
          { label: "Inquiry Response Time",              target: "Within 3 rings",   green: "Consistently",      yellow: "Usually",            red: "Frequently missed" },
        ],
      },
      {
        category: "Enrollment Support",
        icon: "\ud83d\udcc8",
        items: [
          { label: "Tour Inquiries Logged Same Day",     target: "100%",             green: "Always",            yellow: "Usually",            red: "Frequently late or missing" },
        ],
      },
    ],
  },
  {
    id: "hiring-manager",
    label: "Hiring Manager",
    emoji: "\ud83d\udd0d",
    color: "#DC2626",
    tagline: "You measure the pipeline that keeps this school staffed and safe.",
    north_star: "Are we always one step ahead of a staffing gap \u2014 never scrambling?",
    cadence: "Weekly pipeline report. Monthly quality review with Director.",
    metrics: [
      {
        category: "Pipeline Health",
        icon: "\ud83d\udce1",
        items: [
          { label: "Active Candidates in Pipeline",     target: "Always warm",       green: "3+ qualified per open role", yellow: "1\u20132",         red: "Empty pipeline" },
          { label: "Average Time to Fill (Days)",       target: "Under 14 days",     green: "Under 14",          yellow: "14\u201321 days",         red: "21+ days" },
          { label: "Job Postings Current and Active",   target: "At all times",      green: "Always live",       yellow: "Occasionally stale", red: "Outdated or down" },
        ],
      },
      {
        category: "Hire Quality",
        icon: "\u2b50",
        items: [
          { label: "90-Day New Hire Retention",          target: "85%+",             green: "85%+",              yellow: "70\u201384%",             red: "Below 70%" },
          { label: "Director-Rated New Hire Performance",target: "Meeting expectations", green: "Meeting or exceeding", yellow: "Needs improvement", red: "Terminated or problematic" },
        ],
      },
      {
        category: "Compliance",
        icon: "\ud83d\udd10",
        items: [
          { label: "Background Checks Pre-Start",        target: "100%",             green: "100%",              yellow: "Rare exception with Director", red: "Any miss" },
          { label: "Onboarding Docs Complete Day One",   target: "100%",             green: "Always",            yellow: "Usually",            red: "Frequently incomplete" },
        ],
      },
    ],
  },
  {
    id: "tour-manager",
    label: "Tour Manager",
    emoji: "\ud83d\uddfa\ufe0f",
    color: "#7C3AED",
    tagline: "You have one primary number. Everything else supports it.",
    north_star: "Are enough families touring \u2014 and are they enrolling?",
    cadence: "Weekly tour report every Friday. Monthly conversion analysis.",
    metrics: [
      {
        category: "Conversion",
        icon: "\ud83d\udcc8",
        items: [
          { label: "Tour-to-Enrollment Conversion Rate", target: "40%+",             green: "40%+",              yellow: "25\u201339%",             red: "Below 25%" },
          { label: "Follow-Up Completed Within 24 Hrs",  target: "100% of tours",    green: "Every tour",        yellow: "Most tours",         red: "Inconsistent" },
          { label: "Families Still Active in Pipeline",  target: "Tracked weekly",   green: "All logged with next step", yellow: "Most", red: "Not tracked" },
        ],
      },
      {
        category: "Volume",
        icon: "\ud83d\udcc5",
        items: [
          { label: "Tours Scheduled Per Week",           target: "6+",               green: "6+",                yellow: "3\u20135",                red: "Below 3" },
          { label: "Tour No-Show Rate",                  target: "Under 15%",        green: "Under 15%",         yellow: "15\u201330%",             red: "Above 30%" },
        ],
      },
      {
        category: "Experience Quality",
        icon: "\u2b50",
        items: [
          { label: "Structured Route Followed",          target: "Every tour",       green: "Always",            yellow: "Mostly",             red: "Improvised" },
          { label: "CRM Notes Logged Same Day",          target: "Every tour",       green: "Always",            yellow: "Usually",            red: "Frequently late or missing" },
        ],
      },
    ],
  },
  {
    id: "lesson-plans",
    label: "Lesson Plans Manager",
    emoji: "\ud83d\udcdd",
    color: "#059669",
    tagline: "You measure whether every classroom starts the week ready to teach.",
    north_star: "Did every classroom receive a complete, compliant lesson plan before the week began?",
    cadence: "Weekly delivery tracking. Monthly implementation audit with Director.",
    metrics: [
      {
        category: "Delivery",
        icon: "\ud83d\udce4",
        items: [
          { label: "Plans Delivered by Thursday Deadline", target: "100% of classrooms", green: "All rooms, every week", yellow: "Occasional miss", red: "Frequently late" },
          { label: "Receipt Confirmed by All Teachers",    target: "Every week",       green: "Confirmed weekly",  yellow: "Usually",            red: "Not tracked" },
        ],
      },
      {
        category: "Quality",
        icon: "\u2b50",
        items: [
          { label: "All 4 Developmental Domains Covered",  target: "Every plan",      green: "Always",            yellow: "Usually",            red: "Frequently missing" },
          { label: "TRS Benchmark Alignment",              target: "Fully aligned",   green: "Fully aligned",     yellow: "Mostly",             red: "Gaps present" },
          { label: "Teacher-Rated Usability",              target: "Clear and ready", green: "Consistently useful", yellow: "Some adjustment needed", red: "Frequently rewritten" },
        ],
      },
      {
        category: "Implementation",
        icon: "\ud83d\udc41\ufe0f",
        items: [
          { label: "Mid-Week Implementation Check Done",   target: "Every week",      green: "Every week",        yellow: "Sometimes",          red: "Never" },
          { label: "Non-Implementation Flags to Director", target: "All reported",    green: "Consistently reported", yellow: "Occasionally", red: "Not tracked" },
        ],
      },
    ],
  },
  {
    id: "kitchen-manager",
    label: "Kitchen Manager",
    emoji: "\ud83c\udf7d\ufe0f",
    color: "#D97706",
    tagline: "You measure safety, compliance, and whether every child eats on time.",
    north_star: "Zero food safety incidents. Zero CACFP violations. Zero missed meals.",
    cadence: "Daily temperature and meal logs. Weekly inventory. Monthly CACFP submission.",
    metrics: [
      {
        category: "Food Safety",
        icon: "\ud83c\udf21\ufe0f",
        items: [
          { label: "Daily Temperature Logs Completed",   target: "Every day",        green: "Every day",         yellow: "Occasional gap",     red: "Gaps present" },
          { label: "Food Safety Violations (Inspections)",target: "Zero",            green: "Zero",              yellow: "Minor \u2014 corrected",  red: "Any critical violation" },
          { label: "Allergy Protocol Errors",            target: "Zero",             green: "Zero",              yellow: "Near-miss \u2014 caught", red: "Any incident" },
        ],
      },
      {
        category: "CACFP Compliance",
        icon: "\ud83d\udccb",
        items: [
          { label: "Meal Records Completed Daily",       target: "100%",             green: "Every day",         yellow: "Occasional gap",     red: "Multiple gaps" },
          { label: "Monthly Submission On Time",         target: "Always",           green: "Always on time",    yellow: "Occasionally late",  red: "Late or incomplete" },
        ],
      },
      {
        category: "Service",
        icon: "\u23f1\ufe0f",
        items: [
          { label: "Meals Served Within Schedule Window",target: "Always on time",   green: "Always on time",    yellow: "Occasional delay",   red: "Frequent delays" },
          { label: "Weekly Food Order Submitted Friday", target: "Every Friday",     green: "Every week",        yellow: "Usually",            red: "Late or missed" },
        ],
      },
    ],
  },
  {
    id: "bus-driver",
    label: "Bus Driver",
    emoji: "\ud83d\ude8c",
    color: "#DC2626",
    tagline: "Your most important metric has always been zero \u2014 zero incidents, zero misses.",
    north_star: "Every child who boards this bus arrives safely and is accounted for at all times.",
    cadence: "Every route logged. Weekly submission to Director. Monthly safety review.",
    metrics: [
      {
        category: "Safety",
        icon: "\ud83d\udee1\ufe0f",
        items: [
          { label: "Pre/Post-Trip Inspection Completion", target: "Every route",     green: "Every route, documented", yellow: "Usually",       red: "Any missed inspection" },
          { label: "Headcount Verified at Every Stop",    target: "Every stop",      green: "Always",            yellow: "Usually",            red: "Any miss" },
          { label: "Safety Incidents or Violations",      target: "Zero",            green: "Zero",              yellow: "Minor \u2014 reported immediately", red: "Any unreported or recurring" },
        ],
      },
      {
        category: "Punctuality",
        icon: "\u23f1\ufe0f",
        items: [
          { label: "On-Time Route Performance",           target: "95%+",            green: "95%+",              yellow: "85\u201394%",             red: "Below 85%" },
          { label: "Delays Communicated Proactively",     target: "Always",          green: "Always called in",  yellow: "Usually",            red: "Families caught off guard" },
        ],
      },
      {
        category: "Documentation",
        icon: "\ud83d\udccb",
        items: [
          { label: "Daily Transport Log Completed",       target: "Every route",     green: "Every route",       yellow: "Usually",            red: "Frequently missing" },
          { label: "Vehicle Maintenance Issues Reported Same Day", target: "Always", green: "Always",            yellow: "Usually",            red: "Delayed or unreported" },
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

const MetricRow = ({ item, color }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.9fr 0.9fr 0.9fr",
    gap: "0.5rem", padding: "0.7rem 1.1rem", alignItems: "center",
    borderBottom: "1px solid #F8FAFC",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", lineHeight: 1.45 }}>{item.label}</span>
    </div>
    <span style={{
      fontSize: "0.75rem", fontWeight: 700, color: color,
      background: color + "12", padding: "2px 8px", borderRadius: "6px",
      textAlign: "center", lineHeight: 1.5,
    }}>
      {item.target}
    </span>
    <span style={{ fontSize: "0.72rem", background: STATUS.green.bg, color: STATUS.green.text, padding: "3px 7px", borderRadius: "6px", textAlign: "center", lineHeight: 1.5 }}>
      {"\u2713"} {item.green}
    </span>
    <span style={{ fontSize: "0.72rem", background: STATUS.yellow.bg, color: STATUS.yellow.text, padding: "3px 7px", borderRadius: "6px", textAlign: "center", lineHeight: 1.5 }}>
      ~ {item.yellow}
    </span>
    <span style={{ fontSize: "0.72rem", background: STATUS.red.bg, color: STATUS.red.text, padding: "3px 7px", borderRadius: "6px", textAlign: "center", lineHeight: 1.5 }}>
      {"\u2717"} {item.red}
    </span>
  </div>
)

const CategoryBlock = ({ cat, color }) => {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", overflow: "hidden", marginBottom: "0.75rem" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 1.1rem", background: "#F8FAFC", border: "none", cursor: "pointer", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.05rem" }}>{cat.icon}</span>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A" }}>{cat.category}</span>
          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{cat.items.length} metrics</span>
        </div>
        <span style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700 }}>{open ? "\u25b2" : "\u25bc"}</span>
      </button>

      {open && (
        <div>
          {/* Column Headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.9fr 0.9fr 0.9fr",
            gap: "0.5rem", padding: "0.45rem 1.1rem",
            borderBottom: "2px solid #E2E8F0", background: "#FAFBFC",
          }}>
            {["Metric", "Target", "\ud83d\udfe2 On Track", "\ud83d\udfe1 Watch", "\ud83d\udd34 Off Track"].map((h, i) => (
              <span key={i} style={{
                fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#94A3B8",
                textAlign: i === 0 ? "left" : "center",
              }}>{h}</span>
            ))}
          </div>
          {cat.items.map((item, i) => <MetricRow key={i} item={item} color={color} />)}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ImportantMetricsPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [showSchool, setShowSchool] = useState(true)

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">What Are The Most Important Metrics</h1>
          <p className="text-sm text-gray-500 mt-1">
            The numbers that matter most for your role — with clear targets and thresholds.
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
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
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
              <div style={{
                background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px",
                padding: "0.65rem 1rem", maxWidth: 320,
              }}>
                <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 0.2rem" }}>
                  Cadence
                </p>
                <p style={{ fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.5 }}>
                  {activeRole.cadence}
                </p>
              </div>
            </div>
            {/* North Star */}
            <div style={{
              marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #F1F5F9",
              display: "flex", alignItems: "flex-start", gap: "0.6rem",
            }}>
              <span style={{ fontSize: "1rem", marginTop: "1px" }}>{"\u2b50"}</span>
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8" }}>
                  North Star Question
                </span>
                <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", margin: "0.15rem 0 0", lineHeight: 1.5 }}>
                  {activeRole.north_star}
                </p>
              </div>
            </div>
          </div>

          {/* Big Targets (Founder only) */}
          {activeRole.bigTargets && (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeRole.bigTargets.length}, 1fr)`, gap: "0.75rem" }}>
              {activeRole.bigTargets.map((t) => (
                <div key={t.label} style={{
                  background: "#fff", border: `2px solid ${t.color}30`, borderRadius: "14px",
                  padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem",
                }}>
                  <span style={{
                    fontSize: "1.75rem", width: 48, height: 48, borderRadius: "12px",
                    background: t.color + "12", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{t.icon}</span>
                  <div>
                    <p style={{ fontSize: "1.1rem", fontWeight: 800, color: t.color, margin: 0, letterSpacing: "-0.02em" }}>
                      {t.label}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "#64748B", margin: "0.15rem 0 0", lineHeight: 1.4 }}>
                      {t.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* School-Wide Metrics Toggle */}
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", overflow: "hidden" }}>
            <button onClick={() => setShowSchool(!showSchool)} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.9rem 1.25rem", background: "#0F172A", border: "none", cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1rem" }}>{"\ud83c\udfeb"}</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#fff" }}>School-Wide Metrics</span>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 500 }}>Every role is responsible for knowing these</span>
              </div>
              <span style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700 }}>{showSchool ? "\u25b2" : "\u25bc"}</span>
            </button>

            {showSchool && (
              <div>
                <div style={{
                  display: "grid", gridTemplateColumns: "1.4fr 0.8fr 0.9fr 0.9fr 0.9fr",
                  gap: "0.5rem", padding: "0.45rem 1.1rem",
                  borderBottom: "2px solid #E2E8F0", background: "#FAFBFC",
                }}>
                  {["Metric", "Target", "\ud83d\udfe2 On Track", "\ud83d\udfe1 Watch", "\ud83d\udd34 Off Track"].map((h, i) => (
                    <span key={i} style={{
                      fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "#94A3B8",
                      textAlign: i === 0 ? "left" : "center",
                    }}>{h}</span>
                  ))}
                </div>
                {SCHOOL_METRICS.map((item, i) => (
                  <MetricRow key={i} item={item} color="#0F172A" />
                ))}
              </div>
            )}
          </div>

          {/* Role Metrics */}
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0.1rem 0.25rem 0" }}>
            Your Role Metrics — tap to expand
          </p>
          {activeRole.metrics.map((cat, i) => (
            <CategoryBlock key={i} cat={cat} color={activeRole.color} />
          ))}

          {/* Closing Statement */}
          <div style={{
            background: "#0F172A", borderRadius: "14px",
            padding: "1.75rem 2rem", textAlign: "center",
          }}>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#fff", margin: "0 0 0.6rem", letterSpacing: "-0.02em" }}>
              Numbers don't lie. They just show you the truth before it becomes a crisis.
            </p>
            <p style={{ fontSize: "0.85rem", color: "#94A3B8", margin: 0, lineHeight: 1.7 }}>
              Every metric in this Compass exists because something depends on it — a child's safety, a family's trust, a staff member's livelihood. Know your numbers. Own your numbers. Improve your numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
