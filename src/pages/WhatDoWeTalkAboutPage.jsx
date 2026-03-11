import { useState } from "react"
import { MessageSquare } from "lucide-react"

// ─── ROLE DATA ────────────────────────────────────────────────────────────────
const ROLES = [
  {
    id: "founder",
    label: "Founder",
    emoji: "👑",
    color: "#0F172A",
    tagline: "You talk about numbers, strategy, and what needs to change at the system level.",
    channels: [
      {
        id: "down",
        label: "You Talk To: Operator + Director",
        icon: "🔗",
        direction: "down",
        dirLabel: "Founder → Leadership Team",
        color: "#0F172A",
        topics: [
          { topic: "Weekly Scoreboard — 4 key numbers", context: "Every Monday with Robyn — Occupancy %, Enrollments, Payroll, Cash in Bank" },
          { topic: "KPI review and accountability", context: "Weekly Leadership Memos — circle anything red, assign owners" },
          { topic: "Finance decisions and pricing strategy", context: "Monthly Finance Review — one decision per meeting, no exceptions" },
          { topic: "Quarterly goals and strategic direction", context: "Quarterly — cascade across all 3 core functions" },
          { topic: "Vision, culture, and what we're building toward", context: "Full staff meetings — you close with the big picture" },
        ],
      },
      {
        id: "external",
        label: "You Talk To: External",
        icon: "🌐",
        direction: "out",
        dirLabel: "Founder → Community / Partners",
        color: "#0891B2",
        topics: [
          { topic: "NexGen's vision and positioning", context: "Community events, partner conversations" },
          { topic: "Growth plans and expansion", context: "When evaluating second location readiness" },
          { topic: "Strategic partnerships", context: "Technology, community organizations, referral sources" },
        ],
      },
    ],
    never: [
      "Bypass the Operator or Director to manage individual staff — route it through them",
      "Handle billing, collections, or payroll directly — delegate to bookkeeper/admin",
      "Get pulled into daily fires that the Operator should be solving",
      "Skip the monthly finance review — no meeting ends without a specific finance decision",
    ],
    systems: {
      hub: "Slack",
      hubNote: "Slack is the central communication platform for NexGen. Every team, every function, every department routes through it. If it's not in Slack, it didn't happen.",
      focal: "NexGen Operating System",
      focalNote: "This software is the single source of truth for role clarity, procedures, KPIs, escalation paths, and meeting cadences. Slack is where you communicate. The NexGen OS is where you operate.",
    },
  },
  {
    id: "operator",
    label: "Operator",
    emoji: "\ud83c\udfe2",
    color: "#2563EB",
    tagline: "You talk about direction, performance, and what needs to change.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\ud83d\udd17",
        direction: "down",
        dirLabel: "Operator \u2192 Director",
        color: "#2563EB",
        topics: [
          { topic: "Weekly priorities and focus areas", context: "Every Tuesday check-in \u2014 what matters most this week" },
          { topic: "Performance expectations and standards", context: "When standards are slipping or need to be raised" },
          { topic: "Strategic decisions that affect operations", context: "New programs, policy changes, expansion plans" },
          { topic: "Financial targets and enrollment goals", context: "Monthly \u2014 are we on track or do we need to adjust?" },
          { topic: "Culture and values reinforcement", context: "Ongoing \u2014 lead by example, name what you see" },
          { topic: "Recognition and accountability", context: "Both directions \u2014 call out excellence and address gaps" },
        ],
      },
      {
        id: "external",
        label: "You Talk To: External",
        icon: "\ud83c\udf10",
        direction: "out",
        dirLabel: "Operator \u2192 Community / Partners",
        color: "#0891B2",
        topics: [
          { topic: "NexGen\u2019s vision and positioning", context: "Community events, partner conversations, licensing bodies" },
          { topic: "TRS certification and quality standards", context: "When representing NexGen externally" },
          { topic: "Growth plans and expansion", context: "Investor or partner conversations" },
          { topic: "Strategic partnerships", context: "Golf industry, community organizations, referral sources" },
        ],
      },
    ],
    never: [
      "Bypass the Director to manage individual staff \u2014 route it through her",
      "Discuss financial details or salary information with anyone other than the Director",
      "Make promises to families about enrollment, programming, or pricing without Director alignment",
      "Air internal conflicts or performance issues with anyone outside leadership",
    ],
  },
  {
    id: "director",
    label: "Director",
    emoji: "\ud83d\udccb",
    color: "#7C3AED",
    tagline: "You are the communication hub. Everything flows through you.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Operator",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Director \u2192 Operator",
        color: "#2563EB",
        topics: [
          { topic: "Weekly KPI summary \u2014 enrollment, incidents, compliance", context: "Every Tuesday. No surprises \u2014 Roman should never hear about a problem from someone other than you" },
          { topic: "Staff performance issues", context: "As soon as they\u2019re identified \u2014 don\u2019t let them fester" },
          { topic: "Budget or resource needs", context: "When you need something to do your job \u2014 ask directly" },
          { topic: "Operational risks or compliance gaps", context: "Immediately \u2014 TRS and licensing issues do not wait" },
          { topic: "Team wins and milestones", context: "Proactively \u2014 good news travels upward too" },
        ],
      },
      {
        id: "staff",
        label: "You Talk To: Staff",
        icon: "\u2b07\ufe0f",
        direction: "down",
        dirLabel: "Director \u2192 All Staff",
        color: "#059669",
        topics: [
          { topic: "Daily priorities and classroom expectations", context: "Morning \u2014 before the day starts, set the tone" },
          { topic: "Observation feedback", context: "Same day, specific, direct. What was excellent. What to fix." },
          { topic: "Policy or procedure updates", context: "In writing, then verbally in the next staff meeting" },
          { topic: "Performance conversations", context: "Privately, documented, with clear expectations and timeline" },
          { topic: "Recognition", context: "Publicly when possible \u2014 name the behavior, name the person" },
          { topic: "Scheduling and coverage changes", context: "As far in advance as possible. Last-minute only when unavoidable." },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Director \u2192 Families",
        color: "#DC2626",
        topics: [
          { topic: "Incident escalations and resolutions", context: "Any incident involving injury, behavioral crisis, or a serious concern \u2014 you call, not a teacher" },
          { topic: "Enrollment decisions and waitlist updates", context: "When a family is accepted, placed on waitlist, or has a change in status" },
          { topic: "Policy changes affecting families", context: "Written notice first, then available for questions" },
          { topic: "Complaints and concerns", context: "Acknowledge within 24 hours, resolve or update within 72 hours" },
          { topic: "TRS certification and school quality", context: "When families ask about standards \u2014 you should be able to speak to it confidently" },
        ],
      },
    ],
    never: [
      "Discuss another staff member\u2019s performance, salary, or personal situation with other staff",
      "Make a verbal promise to a family that isn\u2019t backed by policy",
      "Handle a serious family complaint without documenting it in writing",
      "Discuss any child\u2019s behavioral or developmental concerns in a common area where others can hear",
      "Skip escalating a safety or compliance issue to the Operator \u2014 even if you think you can handle it",
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    emoji: "\ud83d\udcda",
    color: "#059669",
    tagline: "You talk about children \u2014 their progress, their needs, and their day.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Teacher \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Developmental or behavioral concerns about a child", context: "As soon as you notice a pattern \u2014 don\u2019t wait for it to escalate" },
          { topic: "Classroom resource or supply needs", context: "Proactively before you run out \u2014 not the day you need it" },
          { topic: "Parent tension or escalating communication", context: "Before it becomes a complaint \u2014 give the Director a heads up" },
          { topic: "Safety concerns in the classroom or environment", context: "Immediately \u2014 no delay on safety" },
          { topic: "Lesson plan questions or curriculum gaps", context: "Through the Lesson Plans Manager first, then Director if unresolved" },
          { topic: "Staffing coverage needs", context: "As soon as you know \u2014 give as much notice as possible" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Teacher \u2192 Families",
        color: "#D97706",
        topics: [
          { topic: "Daily highlights \u2014 what your child did, said, learned", context: "At pickup, every day. Families crave specifics." },
          { topic: "Positive behavioral moments", context: "Call these out \u2014 parents need to hear the good" },
          { topic: "Minor concerns \u2014 appetite, mood, energy", context: "Mention casually at pickup \u2014 no drama, just information" },
          { topic: "Upcoming themes or activities", context: "When families ask \u2014 brief and warm" },
        ],
      },
      {
        id: "assistant",
        label: "You Talk To: Your Assistant",
        icon: "\ud83e\udd1d",
        direction: "down",
        dirLabel: "Teacher \u2192 Teacher Assistant",
        color: "#0891B2",
        topics: [
          { topic: "The plan for the day \u2014 what\u2019s happening and when", context: "Before the children arrive \u2014 your assistant should never be guessing" },
          { topic: "Which children need extra attention today", context: "Brief, specific, no labels \u2014 just what your assistant needs to know" },
          { topic: "Feedback on how they\u2019re supporting the classroom", context: "Directly and kindly \u2014 your assistant deserves to know how they\u2019re doing" },
          { topic: "What you need from them during a specific activity", context: "In the moment \u2014 communicate your needs clearly" },
        ],
      },
    ],
    never: [
      "Share a child\u2019s behavioral, medical, or developmental information with anyone other than the Director or the child\u2019s own parent",
      "Discuss another family\u2019s situation, billing, or children with a parent",
      "Make commitments to families about enrollment, scheduling, or policy \u2014 redirect to the Director",
      "Handle a formal complaint from a parent \u2014 acknowledge it and immediately get the Director",
      "Discuss a serious incident verbally with a parent without also filing written documentation",
      "Use negative language about a child in front of other children, staff, or parents",
    ],
  },
  {
    id: "teacher-assistant",
    label: "Teacher Assistant",
    emoji: "\ud83e\udd1d",
    color: "#0891B2",
    tagline: "You talk about what\u2019s happening in the room \u2014 and you escalate everything else.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Lead Teacher",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Assistant \u2192 Lead Teacher",
        color: "#059669",
        topics: [
          { topic: "Anything you observe in the room that concerns you", context: "Tell your lead teacher immediately \u2014 you are not the decision-maker, but you are the eyes" },
          { topic: "When you need to step away from the classroom", context: "Always communicate before leaving \u2014 never just go" },
          { topic: "Questions about how to handle a situation", context: "Ask \u2014 don\u2019t guess with children in the room" },
          { topic: "Supply or material needs", context: "Before the activity starts \u2014 not mid-lesson" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Assistant \u2192 Families",
        color: "#D97706",
        topics: [
          { topic: "Warm greetings at drop-off and pickup", context: "Always \u2014 you are part of the face of NexGen" },
          { topic: "Simple daily updates if asked", context: "Brief and positive \u2014 \u2018He had a great morning at centers\u2019" },
        ],
      },
    ],
    never: [
      "Give a parent any information about an incident, injury, or behavioral concern \u2014 always defer to the lead teacher",
      "Discuss children\u2019s developmental information, diagnoses, or family situations",
      "Make any commitments or promises to families about anything",
      "Escalate anything directly to the Director without going through the lead teacher first (except an emergency)",
      "Speak negatively about any child, family, or staff member to anyone",
    ],
  },
  {
    id: "front-desk",
    label: "Front Desk Manager",
    emoji: "\ud83d\udda5\ufe0f",
    color: "#D97706",
    tagline: "You talk to everyone \u2014 but you know exactly what belongs in your lane.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Front Desk \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Family complaints or escalating tension", context: "Same day \u2014 never let a family leave frustrated without the Director knowing" },
          { topic: "Unusual arrival/pickup situations", context: "Immediately \u2014 unauthorized pickup attempts, custody concerns, unusual behavior" },
          { topic: "Inbound tour inquiries and new leads", context: "Daily log shared at end of day or via CRM" },
          { topic: "Lobby or front-of-house issues", context: "Equipment, cleanliness, anything that affects the family experience" },
          { topic: "Billing or payment questions you can\u2019t answer", context: "Escalate rather than guess \u2014 accuracy matters" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Front Desk \u2192 Families",
        color: "#DC2626",
        topics: [
          { topic: "Warm greetings \u2014 every single person, every single day", context: "This is not optional. Names when you know them." },
          { topic: "Check-in and check-out confirmation", context: "Simple, accurate, professional" },
          { topic: "Announcements, schedule changes, and closures", context: "Proactively \u2014 never let a family be surprised by something you already knew" },
          { topic: "General enrollment questions", context: "What we offer, how to schedule a tour \u2014 then route to Tour Manager" },
          { topic: "Billing questions you can answer accurately", context: "Only what you know for certain \u2014 escalate anything complex" },
        ],
      },
      {
        id: "inquiries",
        label: "You Talk To: Prospective Families",
        icon: "\ud83d\udcde",
        direction: "out",
        dirLabel: "Front Desk \u2192 Inquiries",
        color: "#059669",
        topics: [
          { topic: "Warm, confident first impression", context: "They\u2019re evaluating NexGen from the first hello" },
          { topic: "What we offer \u2014 programs, ages, hours", context: "Know this cold. No hesitation." },
          { topic: "Tour scheduling", context: "Collect name, child\u2019s age, best contact, and how they heard about us \u2014 then route to Tour Manager" },
        ],
      },
    ],
    never: [
      "Discuss another child\u2019s behavior, incident, or personal information with any parent",
      "Share staff performance issues, schedules, or internal conflicts with families",
      "Confirm or deny enrollment availability without checking with the Director first",
      "Discuss pricing without current, approved rate information",
      "Handle a serious complaint \u2014 acknowledge it, get the Director",
      "Release a child to anyone not on the authorized pickup list, regardless of what they tell you",
    ],
  },
  {
    id: "hiring-manager",
    label: "Hiring Manager",
    emoji: "\ud83d\udd0d",
    color: "#DC2626",
    tagline: "You talk about talent \u2014 who\u2019s coming in, who\u2019s in the pipeline, and what we need.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Hiring Manager \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Pipeline status \u2014 who\u2019s in process and for which roles", context: "Every Tuesday. Director should never be caught off guard by a staffing gap." },
          { topic: "Candidate red flags", context: "Before advancing anyone to the Director interview \u2014 let her know what you found" },
          { topic: "Background check or credential concerns", context: "Immediately \u2014 this is never a judgment call you make alone" },
          { topic: "Time-to-fill concerns", context: "If a role is taking too long to fill, flag it early \u2014 not when it becomes a crisis" },
          { topic: "Retention patterns you\u2019re noticing", context: "If multiple people leave a specific role or classroom, that\u2019s data" },
        ],
      },
      {
        id: "candidates",
        label: "You Talk To: Candidates",
        icon: "\ud83d\udd0e",
        direction: "out",
        dirLabel: "Hiring Manager \u2192 Candidates",
        color: "#059669",
        topics: [
          { topic: "Role expectations and responsibilities", context: "Be accurate \u2014 don\u2019t oversell and underdeliver" },
          { topic: "NexGen\u2019s culture and standards", context: "Be honest about what we expect. Let the wrong candidates self-select out." },
          { topic: "Interview process and next steps", context: "Clear timeline, clear expectations \u2014 respect their time" },
          { topic: "Offer or rejection", context: "Direct and respectful \u2014 every candidate represents NexGen\u2019s reputation in the community" },
        ],
      },
    ],
    never: [
      "Share candidate information, salary discussions, or interview outcomes with any staff member not involved in the decision",
      "Make an offer without Director approval",
      "Advance a candidate with a background or credential concern without flagging it first",
      "Discuss why someone was not hired with anyone other than the Director",
      "Make promises to candidates about advancement, scheduling, or compensation that aren\u2019t confirmed policy",
    ],
  },
  {
    id: "tour-manager",
    label: "Tour Manager",
    emoji: "\ud83d\uddfa\ufe0f",
    color: "#7C3AED",
    tagline: "You talk to families who are deciding. Every word either builds trust or loses the enrollment.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Tour Manager \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Weekly tour and conversion numbers", context: "Every Friday. No guessing \u2014 pull from CRM." },
          { topic: "Families close to a decision", context: "Flag them \u2014 the Director may want to make a personal call" },
          { topic: "Recurring objections you\u2019re hearing", context: "If the same objection keeps coming up, there\u2019s something to address" },
          { topic: "Tour experience issues", context: "If a classroom wasn\u2019t ready, a staff member was unprofessional, or the facility wasn\u2019t at its best" },
          { topic: "Capacity questions", context: "Never confirm an open spot without checking current enrollment with the Director" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Prospective Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Tour Manager \u2192 Families",
        color: "#D97706",
        topics: [
          { topic: "NexGen\u2019s programs, philosophy, and differentiators", context: "Know these cold. Confidence sells." },
          { topic: "What a typical day looks like for their child\u2019s age group", context: "Specific, warm, paint a picture" },
          { topic: "TRS certification and what it means", context: "Explain it simply \u2014 \u2018It means we\u2019ve been independently verified to meet high quality standards\u2019" },
          { topic: "Self-defense program", context: "Frame it as confidence and safety \u2014 not fighting" },
          { topic: "Enrollment process and next steps", context: "Close the tour with clarity \u2014 what happens if they want to enroll?" },
          { topic: "Objection responses", context: "Price, location, timing \u2014 have a prepared, honest answer for each" },
        ],
      },
    ],
    never: [
      "Quote pricing that hasn\u2019t been approved or updated by the Director",
      "Make promises about availability, start dates, or specific classroom placement",
      "Discuss current enrolled children, incidents, or staff by name with prospective families",
      "Pressure a family \u2014 ask, offer, and let them decide on their timeline",
      "Discuss competitor schools negatively",
    ],
  },
  {
    id: "lesson-plans",
    label: "Lesson Plans Manager",
    emoji: "\ud83d\udcdd",
    color: "#059669",
    tagline: "You talk about curriculum \u2014 what\u2019s being taught, how well it\u2019s working, and what needs to improve.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Lesson Plans Mgr \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Classrooms that are consistently not implementing plans", context: "This is a Director conversation \u2014 your job is to flag it, not fix it" },
          { topic: "Curriculum gaps or TRS alignment concerns", context: "Before assessment season \u2014 not during" },
          { topic: "Resource or material needs for upcoming themes", context: "With enough lead time to order or approve" },
          { topic: "Teacher feedback on plan usability", context: "If teachers are consistently rewriting plans, something needs to change" },
        ],
      },
      {
        id: "teachers",
        label: "You Talk To: Teachers",
        icon: "\ud83d\udcda",
        direction: "down",
        dirLabel: "Lesson Plans Mgr \u2192 Teachers",
        color: "#059669",
        topics: [
          { topic: "Weekly plan delivery and confirmation", context: "Thursday \u2014 confirm receipt, answer questions same day" },
          { topic: "Feedback on submitted plans", context: "Specific and constructive \u2014 \u2018This activity doesn\u2019t address language development for this age group. Here\u2019s an alternative.\u2019" },
          { topic: "Implementation check-in", context: "Mid-week \u2014 is the plan being used? Any issues?" },
          { topic: "Upcoming themes and what to expect", context: "Give teachers a heads up on the following week when distributing current week\u2019s plans" },
        ],
      },
    ],
    never: [
      "Override a teacher\u2019s classroom decision without consulting the Director",
      "Communicate curriculum concerns about a specific teacher to other teachers",
      "Distribute a plan that hasn\u2019t been reviewed against TRS standards",
      "Accept \u2018I didn\u2019t have time\u2019 as a reason for non-implementation \u2014 flag it to the Director",
    ],
  },
  {
    id: "kitchen-manager",
    label: "Kitchen Manager",
    emoji: "\ud83c\udf7d\ufe0f",
    color: "#D97706",
    tagline: "You talk about food \u2014 what\u2019s being served, what\u2019s compliant, and what families need to know.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Kitchen Manager \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Menu approval for the following month", context: "Last Friday of the month \u2014 nothing gets posted without sign-off" },
          { topic: "New dietary restrictions or allergy updates", context: "Immediately when reported \u2014 confirm the information before adjusting" },
          { topic: "CACFP compliance concerns", context: "As soon as identified \u2014 do not wait until audit time" },
          { topic: "Equipment issues", context: "Same day \u2014 a broken refrigerator or oven is an operational emergency" },
          { topic: "Food safety incidents or near-misses", context: "Immediately \u2014 no delay, no exceptions" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families (via Director)",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Kitchen Manager \u2192 Families",
        color: "#DC2626",
        topics: [
          { topic: "Menu questions", context: "Route to the Director \u2014 families should receive menu communication through official channels" },
          { topic: "Allergy or dietary accommodation confirmation", context: "Always confirm with Director before communicating to a family" },
        ],
      },
    ],
    never: [
      "Make changes to a child\u2019s dietary accommodation without written confirmation from the Director",
      "Serve a menu substitution without documenting it in CACFP records",
      "Discuss a child\u2019s allergy or medical dietary need with anyone other than the Director",
      "Make food safety or equipment decisions that affect the whole facility without Director awareness",
    ],
  },
  {
    id: "bus-driver",
    label: "Bus Driver",
    emoji: "\ud83d\ude8c",
    color: "#DC2626",
    tagline: "You talk about the route \u2014 what happened, what you need, and what families should know.",
    channels: [
      {
        id: "up",
        label: "You Talk To: Director",
        icon: "\u2b06\ufe0f",
        direction: "up",
        dirLabel: "Bus Driver \u2192 Director",
        color: "#7C3AED",
        topics: [
          { topic: "Any incident, near-miss, or safety concern on the route", context: "Immediately upon arrival \u2014 before you do anything else" },
          { topic: "Delays or route changes", context: "In real time \u2014 call or text the facility the moment you know" },
          { topic: "Vehicle maintenance needs", context: "Same day \u2014 no unsafe vehicle stays in service" },
          { topic: "Child behavior concerns on the bus", context: "After the route \u2014 documented and verbal both" },
          { topic: "Unfamiliar pickup or dropoff requests", context: "Do not deviate from the manifest without Director authorization \u2014 ever" },
        ],
      },
      {
        id: "families",
        label: "You Talk To: Families",
        icon: "\u2764\ufe0f",
        direction: "out",
        dirLabel: "Bus Driver \u2192 Families",
        color: "#D97706",
        topics: [
          { topic: "Warm greeting at pickup and dropoff", context: "You are the face of NexGen for families who don\u2019t come to the building" },
          { topic: "Estimated delay if running behind", context: "Proactive communication \u2014 never let a family wonder where their child is" },
        ],
      },
    ],
    never: [
      "Release a child to anyone not on the authorized manifest \u2014 regardless of what they say",
      "Discuss any child\u2019s behavior, incident, or personal information with a parent on the route",
      "Make route changes without Director authorization",
      "Use a personal phone to communicate with families directly \u2014 route everything through the facility",
      "Drive with any unresolved safety concern about the vehicle",
    ],
  },
]

// ─── MEETING AGENDA FRAMEWORK ────────────────────────────────────────────────
const TIMELINE_STAGES = [
  { label: 'Rebranding', icon: '🎨', status: 'current' },
  { label: 'Systems Built', icon: '⚙️', status: 'upcoming' },
  { label: 'Team Scaled', icon: '👥', status: 'upcoming' },
  { label: 'Multi-Location', icon: '🏢', status: 'upcoming' },
  { label: 'Replication Ready', icon: '🚀', status: 'upcoming' },
]

function MeetingAgendaFramework() {
  const agendaItems = [
    {
      id: 'where-are-we',
      title: 'Where Are We',
      color: '#2563EB',
      icon: '📍',
      description: 'The pulse of where we currently stand. Every meeting starts with awareness — where are we on the journey?',
      hasTimeline: true,
    },
    {
      id: 'where-are-we-going',
      title: 'Where Are We Going',
      color: '#7C3AED',
      icon: '🧭',
      description: 'The destination. We don\'t just work — we build toward something. Every person in this building should be able to answer this question without hesitation.',
      highlight: 'We are building NexGen into the most respected early childhood education brand in South Texas — and eventually, a model that can be replicated anywhere.',
    },
    {
      id: 'why-are-we-going-there',
      title: 'Why Are We Going There',
      color: '#059669',
      icon: '💡',
      description: 'Our why. This is the fuel behind everything we build.',
      reasons: [
        { label: 'Impact for Future Generations', detail: 'Every child we serve today becomes the adult of tomorrow. The foundation we lay now echoes for decades.' },
        { label: 'Changing the Future of Education', detail: 'We\'re proving that affordable and excellent are not opposites. We\'re setting a new standard — not following one.' },
      ],
    },
    {
      id: 'scorecard-review',
      title: 'Scorecard & Dashboard Review',
      color: '#D97706',
      icon: '📊',
      description: 'Numbers tell the truth. Every meeting includes a review of the metrics that matter — enrollment, retention, compliance, classroom quality, and financial health. The dashboard doesn\'t lie. We read it, we discuss it, we act on it.',
      checkpoints: [
        'Are we on track with enrollment targets?',
        'Are classrooms meeting quality and compliance standards?',
        'Are there any staffing gaps or retention concerns?',
        'What does the financial picture look like this month?',
        'What needs attention before it becomes a problem?',
      ],
    },
    {
      id: 'memos',
      title: 'Memo\'s',
      color: '#DC2626',
      icon: '📝',
      questions: [
        {
          q: 'What are memos?',
          a: 'A memo is a written communication that captures a decision, directive, or important update. It\'s how we turn conversations into action — documented, clear, and accountable.',
        },
        {
          q: 'What is in a memo?',
          a: 'The situation or context, the decision or directive, who it affects, what needs to happen, and by when. No fluff — just clarity.',
        },
        {
          q: 'Why are they important?',
          a: 'Because verbal agreements get forgotten. Memos create a paper trail that protects everyone — leadership, staff, and families. If it\'s not written down, it didn\'t happen.',
        },
        {
          q: 'When do we use them?',
          a: 'Anytime a decision is made that affects operations, staffing, policy, or families. After every leadership meeting. After every performance conversation. After every policy change.',
        },
        {
          q: 'What do we leave with?',
          a: 'Every person who reads a memo should be able to answer three questions:',
          takeaways: [
            'What am I supposed to do?',
            'How do I do it?',
            'Where do I go if I have any questions?',
          ],
        },
      ],
    },
  ]

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem',
      }}>
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#94A3B8', whiteSpace: 'nowrap',
        }}>
          Meeting Agenda Framework
        </span>
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
      </div>

      <p style={{
        fontSize: '0.85rem', color: '#64748B', lineHeight: 1.7,
        margin: '0 0 1.25rem', textAlign: 'center', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto',
      }}>
        These are the five pillars we cover in every meeting. They keep us aligned, accountable, and moving forward.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {agendaItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              overflow: 'hidden',
              borderLeft: `4px solid ${item.color}`,
            }}
          >
            {/* Card Header */}
            <div style={{
              padding: '1rem 1.5rem 0.75rem',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: '8px',
                background: item.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {item.icon}
              </span>
              <span style={{
                fontSize: '0.95rem', fontWeight: 700, color: '#0F172A',
                letterSpacing: '-0.01em',
              }}>
                {item.title}
              </span>
            </div>

            {/* Card Body */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              {/* Description */}
              {item.description && (
                <p style={{
                  fontSize: '0.85rem', color: '#475569',
                  lineHeight: 1.75, margin: item.hasTimeline || item.highlight || item.reasons || item.checkpoints ? '0 0 1rem' : 0,
                }}>
                  {item.description}
                </p>
              )}

              {/* WHERE ARE WE — Timeline */}
              {item.hasTimeline && (
                <div style={{
                  background: '#F8FAFC', border: '1px solid #F1F5F9',
                  borderRadius: '12px', padding: '1.25rem 1.5rem',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative',
                  }}>
                    {/* Progress line */}
                    <div style={{
                      position: 'absolute', top: 16, left: 20, right: 20,
                      height: 3, background: '#E2E8F0', borderRadius: 2, zIndex: 0,
                    }} />
                    <div style={{
                      position: 'absolute', top: 16, left: 20,
                      width: '8%', height: 3, background: item.color,
                      borderRadius: 2, zIndex: 1,
                    }} />

                    {TIMELINE_STAGES.map((stage, i) => (
                      <div key={i} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '0.4rem', zIndex: 2, flex: 1,
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: stage.status === 'current' ? item.color : '#fff',
                          border: stage.status === 'current' ? 'none' : '2px solid #E2E8F0',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem',
                          boxShadow: stage.status === 'current' ? `0 0 0 3px ${item.color}30` : 'none',
                        }}>
                          {stage.icon}
                        </div>
                        <span style={{
                          fontSize: '0.68rem', fontWeight: stage.status === 'current' ? 700 : 500,
                          color: stage.status === 'current' ? item.color : '#94A3B8',
                          textAlign: 'center', lineHeight: 1.3,
                        }}>
                          {stage.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WHERE ARE WE GOING — Highlight */}
              {item.highlight && (
                <div style={{
                  background: `linear-gradient(135deg, ${item.color}08, ${item.color}12)`,
                  border: `1px solid ${item.color}25`,
                  borderRadius: '12px', padding: '1rem 1.25rem',
                }}>
                  <p style={{
                    fontSize: '0.9rem', fontWeight: 700, color: '#0F172A',
                    margin: 0, lineHeight: 1.6, fontStyle: 'italic',
                  }}>
                    "{item.highlight}"
                  </p>
                </div>
              )}

              {/* WHY — Reasons */}
              {item.reasons && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {item.reasons.map((r, i) => (
                    <div key={i} style={{
                      background: '#F8FAFC', border: '1px solid #F1F5F9',
                      borderRadius: '10px', padding: '0.85rem 1rem',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        marginBottom: '0.3rem',
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: item.color, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                          {r.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.8rem', color: '#64748B', lineHeight: 1.6,
                        paddingLeft: '0.85rem', display: 'block',
                      }}>
                        {r.detail}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SCORECARD — Checkpoints */}
              {item.checkpoints && (
                <div style={{
                  background: item.color + '08', border: `1px solid ${item.color}20`,
                  borderRadius: '10px', padding: '0.85rem 1.1rem',
                }}>
                  <p style={{
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: item.color, margin: '0 0 0.65rem',
                  }}>
                    Questions We Ask Every Time
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {item.checkpoints.map((cp, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ color: item.color, fontSize: '0.75rem', fontWeight: 800, flexShrink: 0, marginTop: '1px' }}>▸</span>
                        <span style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.55 }}>{cp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MEMOS — Q&A */}
              {item.questions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {item.questions.map((mq, i) => (
                    <div key={i} style={{
                      background: i === item.questions.length - 1 ? '#0F172A' : '#F8FAFC',
                      border: i === item.questions.length - 1 ? 'none' : '1px solid #F1F5F9',
                      borderRadius: '10px', padding: '0.85rem 1.1rem',
                    }}>
                      <p style={{
                        fontSize: '0.78rem', fontWeight: 700,
                        color: i === item.questions.length - 1 ? item.color : item.color,
                        margin: '0 0 0.35rem', letterSpacing: '-0.01em',
                      }}>
                        {mq.q}
                      </p>
                      <p style={{
                        fontSize: '0.82rem',
                        color: i === item.questions.length - 1 ? '#CBD5E1' : '#475569',
                        lineHeight: 1.65, margin: 0,
                      }}>
                        {mq.a}
                      </p>
                      {mq.takeaways && (
                        <div style={{ marginTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {mq.takeaways.map((tw, j) => (
                            <div key={j} style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                              background: '#1E293B', borderRadius: '8px',
                              padding: '0.5rem 0.75rem',
                            }}>
                              <span style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: item.color, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 800, flexShrink: 0,
                              }}>
                                {j + 1}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#F1F5F9' }}>
                                {tw}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

const DirectionBadge = ({ direction }) => {
  const map = {
    up:   { label: "Upward",   bg: "#EFF6FF", text: "#1D4ED8", icon: "\u2b06\ufe0f" },
    down: { label: "Downward", bg: "#F0FDF4", text: "#166534", icon: "\u2b07\ufe0f" },
    out:  { label: "Outward",  bg: "#FFF7ED", text: "#9A3412", icon: "\u2197\ufe0f" },
  }
  const d = map[direction] || map.out
  return (
    <span style={{
      padding: "2px 9px", borderRadius: "99px", fontSize: "0.68rem", fontWeight: 700,
      background: d.bg, color: d.text, border: `1px solid ${d.text}30`,
    }}>
      {d.icon} {d.label}
    </span>
  )
}

const ChannelCard = ({ channel, roleColor }) => {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 1.25rem", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
            background: channel.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
          }}>
            {channel.icon}
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0F172A" }}>{channel.label}</span>
              <DirectionBadge direction={channel.direction} />
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "2px" }}>{channel.dirLabel}</div>
          </div>
        </div>
        <span style={{ color: "#94A3B8", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>{open ? "\u25b2" : "\u25bc"}</span>
      </button>

      {open && (
        <div style={{ borderTop: `1px solid ${channel.color}20` }}>
          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1.2fr",
            padding: "0.5rem 1.25rem",
            background: "#F8FAFC",
            borderBottom: "1px solid #F1F5F9",
          }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8" }}>What You Talk About</span>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8" }}>Context / When</span>
          </div>
          {channel.topics.map((t, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1rem",
              padding: "0.75rem 1.25rem",
              borderBottom: i < channel.topics.length - 1 ? "1px solid #F8FAFC" : "none",
              background: i % 2 === 0 ? "#fff" : "#FAFBFC",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", background: channel.color,
                  flexShrink: 0, marginTop: "6px",
                }} />
                <span style={{ fontSize: "0.83rem", fontWeight: 600, color: "#0F172A", lineHeight: 1.55 }}>{t.topic}</span>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.6 }}>{t.context}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WhatDoWeTalkAboutPage() {
  const [activeRole, setActiveRole] = useState(ROLES[0])

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">What Do We Talk About</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every role has communication channels — who you talk to, what you discuss, and what you never say.
          </p>
        </div>
      </div>

      {/* Meeting Agenda Framework */}
      <MeetingAgendaFramework />

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

          {/* Channel Cards */}
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", margin: "0.1rem 0.25rem 0" }}>
            Communication Channels
          </p>
          {activeRole.channels.map((ch, i) => (
            <ChannelCard key={i} channel={ch} roleColor={activeRole.color} />
          ))}

          {/* Systems Hub (Founder only) */}
          {activeRole.systems && (
            <div style={{
              background: "#fff", border: "1px solid #E2E8F0", borderRadius: "14px",
              padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
            }}>
              <div style={{
                background: "#4A154B08", border: "1.5px solid #4A154B25", borderRadius: "12px",
                padding: "1.15rem 1.3rem", display: "flex", alignItems: "flex-start", gap: "0.85rem",
              }}>
                <span style={{
                  fontSize: "1.5rem", width: 44, height: 44, borderRadius: "10px",
                  background: "#4A154B15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>💬</span>
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "#4A154B", margin: "0 0 0.3rem" }}>
                    {activeRole.systems.hub}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                    {activeRole.systems.hubNote}
                  </p>
                </div>
              </div>
              <div style={{
                background: "#0F172A08", border: "1.5px solid #0F172A20", borderRadius: "12px",
                padding: "1.15rem 1.3rem", display: "flex", alignItems: "flex-start", gap: "0.85rem",
              }}>
                <span style={{
                  fontSize: "1.5rem", width: 44, height: 44, borderRadius: "10px",
                  background: "#0F172A12", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>🖥️</span>
                <div>
                  <p style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0F172A", margin: "0 0 0.3rem" }}>
                    {activeRole.systems.focal}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                    {activeRole.systems.focalNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Never Say / Never Do */}
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderLeft: "4px solid #DC2626", borderRadius: "14px", padding: "1.25rem 1.5rem",
          }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#DC2626", margin: "0 0 0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {"\ud83d\udeab"} Never In This Role
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {activeRole.never.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                  <span style={{ color: "#DC2626", fontSize: "0.8rem", fontWeight: 800, flexShrink: 0, marginTop: "2px" }}>{"\u2717"}</span>
                  <span style={{ fontSize: "0.83rem", color: "#7F1D1D", lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* The Standard */}
          <div style={{
            background: activeRole.color + "08", border: `1px solid ${activeRole.color}25`,
            borderLeft: `4px solid ${activeRole.color}`, borderRadius: "12px",
            padding: "1.1rem 1.4rem", display: "flex", gap: "0.75rem", alignItems: "flex-start",
          }}>
            <span style={{ fontSize: "1.1rem", marginTop: "1px" }}>{"\ud83d\udccc"}</span>
            <div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: activeRole.color, margin: "0 0 0.3rem" }}>
                The Standard
              </p>
              <p style={{ fontSize: "0.86rem", color: "#374151", lineHeight: 1.65, margin: 0, fontStyle: "italic", fontWeight: 500 }}>
                Say the right thing, to the right person, at the right time. If you\u2019re not sure whether something should be said \u2014 ask your direct supervisor before saying it. Communication either builds trust or erodes it. There is no neutral.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
