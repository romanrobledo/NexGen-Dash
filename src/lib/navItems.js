import {
  Map,
  Baby,
  Users,
  DollarSign,
  BotMessageSquare,
  Zap,
  GraduationCap,
  CalendarDays,
  Network,
  BookOpen,
  ClipboardCheck,
  FolderOpen,
  UserPlus,
  UserSearch,
  Megaphone,
  Target,
  ShieldCheck,
  Settings,
  Briefcase,
  Landmark,
  Rocket,
  Dumbbell,
  UserCircle,
  Tag,
  Award,
  Magnet,
  LayoutTemplate,
  Mail,
  MessageSquare,
  LayoutDashboard,
  Camera,
  Upload,
  PartyPopper,
  Calendar,
  CalendarClock,
  FileText,
  CreditCard,
  Stethoscope,
  Siren,
  School,
  HeartHandshake,
  Sunrise,
  RefreshCw,
  Hash,
  Inbox,
  Sprout,
  Handshake,
  Package,
  Star,
  Sparkles,
  Gift,
  Building2,
  Database,
  TrendingUp,
  TrendingDown,
  Repeat,
  PhoneCall,
  MessageCircle,
  Radio,
  Monitor,
  Heart,
  Share2,
  UserCog,
  Send,
  Newspaper,
  Bot,
  BookMarked,
  Headset,
  Reply,
  Smile,
  LifeBuoy,
  PlayCircle,
  Eye,
  Flag,
  Gem,
  Trophy,
  ClipboardList,
  Globe,
} from 'lucide-react'

/**
 * Single source of truth for the app's top-level navigation.
 *
 * Consumed by:
 *   - src/components/Sidebar.jsx        (desktop sidebar)
 *   - src/components/MobileBottomNav.jsx (mobile bottom tab bar, subset)
 *
 * Every top-level item that gates on a role has a `permissionKey`
 * matching a row in `public.role_permissions`. Items with NO
 * permissionKey are universally visible — the Sidebar's filter
 * short-circuits before touching hasPermission, so the CLOSED default
 * doesn't hide them.
 *
 * Key naming: every gated item uses a `nav_*` prefix. The prefix is
 * intentional — it makes it obvious in the DB which rows drive
 * sidebar visibility vs which drive other UI (e.g., training_* keys
 * that gate Trainings dashboard tiles).
 *
 * The 22 seeded keys (18 nav_* + 4 training_*) are documented in the
 * DO block Roman runs when this rolls out. If you add a new top-level
 * item here, add a row to that seed for every role that should see
 * it — otherwise the item is invisible to that role under the
 * CLOSED default.
 *
 * Section order (top → bottom): DAILY, ONBOARD, BUILD, SELL, LEAD,
 * STRUCTURE, HELP, ADMIN, FOUNDER. Reordering follows Roman's mental
 * model — plan/build/sell/lead (offensive work) before structure/help
 * (reference), before admin/founder (oversight).
 */
export const navItems = [
  // ── DAILY ───────────────────────────────────────────────────────────────
  // Facility / Students / Staff / Families / Billing — daily-operations
  // anchors. Students + Staff are shortcuts to pages that ALSO exist inside
  // deeper menus (Families → Students). Two entry points to one page is
  // fine; two different pages both called Students is not.
  { sectionHeader: 'DAILY' },
  {
    icon: Map,
    label: 'Facility',
    // Universal — every role sees the floor plan. Intentionally unkeyed.
    path: '/facility-map',
  },
  {
    icon: Baby,
    label: 'Students',
    permissionKey: 'nav_students',
    path: '/roster',
  },
  {
    icon: Users,
    label: 'Staff',
    permissionKey: 'nav_staff',
    path: '/staff/profile-database',
  },
  {
    icon: Users,
    label: 'Families',
    permissionKey: 'nav_families',
    children: [
      { label: 'Guardians' },
      { label: 'Paperwork' },
    ],
  },
  // Billing — top-level; invoices/payments/plans are family-facing money
  // ops. Finance → Books stays inside FOUNDER for internal bookkeeping.
  {
    icon: DollarSign,
    label: 'Billing',
    permissionKey: 'nav_billing',
    children: [
      { label: 'Dashboard', path: '/billing' },
      { label: 'Invoices' },
      { label: 'Payments' },
      { label: 'Plans' },
    ],
  },

  // ── ONBOARD ─────────────────────────────────────────────────────────────
  // Training here is the CURRICULUM TILE DASHBOARD at /trainings — the
  // page with Onboarding/TRS/Teachers tiles. HELP → Training points at
  // /trainings/practice (the bot library), so the two Training items no
  // longer collide on route or active state. Exercise sits below at
  // /trainings/onboarding/exercise (first-week bot drills).
  { sectionHeader: 'ONBOARD' },
  {
    icon: Rocket,
    label: 'Training',
    permissionKey: 'training_onboarding',
    path: '/trainings',
  },
  {
    icon: Dumbbell,
    label: 'Exercise',
    // Matches Training's key so both items in ONBOARD have the same
    // visibility. Path lands on the first-week practice-bot picker.
    permissionKey: 'training_onboarding',
    path: '/trainings/onboarding/exercise',
  },

  // ── REVENUE FRAMEWORK ───────────────────────────────────────────────────
  // Table of contents for the whole revenue system, modeled on Roman's
  // reference-app FRAMEWORK section. Upstream concepts (Avatar / Offer /
  // Guarantee / Lead Magnets / Core 7) plus funnel stages (Capture /
  // Nurture / Close / Fulfill / Customer Success). Each item is a
  // concept anchor — the working surfaces live in ADVERTISING, CORE 7,
  // FULFILL, etc. below. Intentional name overlap with ADVERTISING /
  // FULFILL / CORE 7 items: this is the strategic index, those are the
  // execution surfaces. Leaves for now (no paths) — wire when each
  // concept gets its own strategy doc or dashboard.
  { sectionHeader: 'REVENUE FRAMEWORK' },
  { icon: UserCircle,     label: 'Avatar',           permissionKey: 'nav_admin' },
  { icon: Tag,            label: 'Offer',            permissionKey: 'nav_admin' },
  { icon: Award,          label: 'Guarantee',        permissionKey: 'nav_admin' },
  { icon: Magnet,         label: 'Lead Magnets',     permissionKey: 'nav_admin', path: '/framework/lead-magnets' },
  { icon: Hash,           label: 'Core 7',           permissionKey: 'nav_admin' },
  { icon: Inbox,          label: 'Capture',          permissionKey: 'nav_admin' },
  { icon: Sprout,         label: 'Nurture',          permissionKey: 'nav_admin' },
  { icon: Handshake,      label: 'Close',            permissionKey: 'nav_admin' },
  { icon: Package,        label: 'Fulfill',          permissionKey: 'nav_admin' },
  { icon: Star,           label: 'Customer Success', permissionKey: 'nav_admin' },

  // ── AVATARS ─────────────────────────────────────────────────────────────
  // Concrete avatar personas — one item per persona. CCMS Cassandra is
  // the first: a subsidized-enrollment parent qualifying through CCMS.
  // More personas land here as siblings when they're scoped.
  { sectionHeader: 'AVATARS' },
  {
    icon: UserCircle,
    label: 'CCMS Cassandra',
    permissionKey: 'nav_admin',
  },

  // ── OFFERS ──────────────────────────────────────────────────────────────
  // Old ADVERTISING → Offers dropdown dissolved. Its two children
  // (Attraction Offers + Free Goodwill Offer) are now top-level items
  // under this section header, matching the "each concept gets its own
  // section" pattern Roman is applying across the sidebar. Attraction
  // Offers keeps its Giveaways/Decoy/Buy-X/Pay-Later tree; Free Goodwill
  // Offer keeps its 3 Month Scholarship child. Routes under
  // /marketing/offers/* are unchanged so deep links still resolve.
  { sectionHeader: 'OFFERS' },
  {
    icon: Sparkles,
    label: 'Attraction Offers',
    permissionKey: 'nav_admin',
    children: [
      {
        label: 'Giveaways',
        path: '/marketing/offers/giveaways',
        children: [
          { label: 'Bags', path: '/marketing/offers/giveaways/bags' },
          { label: 'Kits', path: '/marketing/offers/giveaways/kits' },
          { label: 'Baskets', path: '/marketing/offers/giveaways/baskets' },
        ],
      },
      { label: 'Decoy', path: '/marketing/offers/decoy' },
      { label: 'Buy X, Get Y', path: '/marketing/offers/buy-x-get-y' },
      { label: 'Pay Less Now or Pay More Later', path: '/marketing/offers/pay-less-now' },
    ],
  },
  {
    icon: Gift,
    label: 'Free Goodwill Offer',
    permissionKey: 'nav_admin',
    path: '/marketing/offers/free-goodwill',
    children: [
      { label: '3 Month Scholarship', path: '/marketing/offers/free-goodwill/3-month-scholarship' },
    ],
  },
  // Upsell / Downsell / Continuity Offers — the three offer categories
  // that sit downstream of Attraction Offers in the funnel (upsell after
  // yes, downsell after no, continuity for recurring value). All leaves
  // for now; no routes until the offer pages get built.
  {
    icon: TrendingUp,
    label: 'Upsell Offers',
    permissionKey: 'nav_admin',
    children: [
      { label: 'The Classic Upsell' },
      { label: 'Menu Upsells' },
      { label: 'Inker Upsells' },
      { label: 'Rollover Upsells' },
    ],
  },
  {
    icon: TrendingDown,
    label: 'Downsell Offers',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Payment Plan Downsells' },
      { label: 'Trial with Penalty' },
      { label: 'Feature Downsells' },
    ],
  },
  {
    icon: Repeat,
    label: 'Continuity Offers',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Continuity Bonus Offers' },
      { label: 'Continuity Discount Offers' },
      { label: 'Waive Fee Offers' },
    ],
  },

  // ── GUARANTEES ──────────────────────────────────────────────────────────
  // 30-Day Parent Confidence — the conditional results-based guarantee
  // Roman is rolling out on Meta lead responses / VSL / tour scripts /
  // enrollment forms. Content lives at /framework/30-day-parent-confidence
  // and shares the same content system as REVENUE FRAMEWORK → Lead
  // Magnets. Sits above LEAD MAGNETS in the offer stack — the guarantee
  // is what reverses risk BEFORE the magnet does the capturing.
  { sectionHeader: 'GUARANTEES' },
  {
    icon: Award,
    // Shorter label so the row doesn't wrap in the 240px sidebar. The
    // page's own H1 keeps the full "30-Day Parent Confidence Guarantee"
    // name — this is just the nav label.
    label: '30-Day Guarantee',
    permissionKey: 'nav_admin',
    path: '/framework/30-day-parent-confidence',
  },

  // ── LEAD MAGNETS ────────────────────────────────────────────────────────
  // Four concrete magnet types Roman is planning to run: postcards
  // (direct mail), tri-folds (in-facility handouts), a CCMS eligibility
  // bot (qualifies subsidized enrollment leads automatically), and a
  // magazine (long-form content marketing). Leaves for now — no routes
  // until each surface is built. Old "Lead Magnets" placeholder leaf
  // removed; the strategic concept still lives in REVENUE FRAMEWORK →
  // Lead Magnets which now points at /framework/lead-magnets.
  { sectionHeader: 'LEAD MAGNETS' },
  { icon: Send,       label: 'Post Cards',              permissionKey: 'nav_admin' },
  { icon: Newspaper,  label: 'Tri-Folds',               permissionKey: 'nav_admin' },
  { icon: Bot,        label: 'CCMS Qualification Bot',  permissionKey: 'nav_admin' },
  { icon: BookMarked, label: 'Magazines',               permissionKey: 'nav_admin' },

  // ── CORE 7 ──────────────────────────────────────────────────────────────
  // The seven traffic channels expanded into their own top-level items.
  // The container "Core 7" leaf was removed — the section header alone
  // groups them now. All gated on `nav_admin`; leaves for now (no path,
  // no children) until each channel gets its own surface wired.
  { sectionHeader: 'CORE 7' },
  {
    icon: PhoneCall,
    label: 'Cold Outreach',
    permissionKey: 'nav_admin',
  },
  {
    icon: MessageCircle,
    label: 'Warm Outreach',
    permissionKey: 'nav_admin',
  },
  {
    icon: Radio,
    label: 'Organic',
    permissionKey: 'nav_admin',
  },
  {
    icon: Monitor,
    label: 'Ads',
    permissionKey: 'nav_admin',
  },
  {
    icon: Heart,
    label: 'Customers',
    permissionKey: 'nav_admin',
  },
  {
    icon: Share2,
    label: 'Affiliates',
    permissionKey: 'nav_admin',
  },
  {
    icon: UserCog,
    label: 'Employees',
    permissionKey: 'nav_admin',
  },

  // ── CAPTURE ─────────────────────────────────────────────────────────────
  // Lead-capture surfaces: landing pages that convert, forms that collect
  // the contact detail, and calendars that schedule the follow-up. The
  // reactivation surfaces (Newsletters, SMS Blasts) moved to BUILD since
  // those are lifecycle nurture, not top-of-funnel capture.
  { sectionHeader: 'CAPTURE' },
  {
    icon: Globe,
    label: 'Website',
    permissionKey: 'nav_admin',
  },
  {
    icon: LayoutTemplate,
    label: 'Landing Pages',
    permissionKey: 'nav_admin',
  },
  {
    icon: ClipboardList,
    label: 'Forms',
    permissionKey: 'nav_admin',
  },
  {
    icon: CalendarDays,
    label: 'Calendars',
    permissionKey: 'nav_admin',
  },

  // ── CONTENT ─────────────────────────────────────────────────────────────
  // Flattened out of the old "Content" dropdown — six sibling items, one
  // per surface (Dashboard / Shot Lists / Upload / Campaigns / Events /
  // Calendar). Every item still gates on `nav_advertising` so effective
  // visibility matches what the dropdown used to gate. Routes untouched
  // (/marketing/* + /calendars/content).
  { sectionHeader: 'CONTENT' },
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    permissionKey: 'nav_advertising',
    path: '/marketing',
  },
  {
    icon: Calendar,
    label: 'Calendar',
    permissionKey: 'nav_advertising',
    path: '/marketing/calendar',
  },
  {
    icon: Megaphone,
    label: 'Campaigns',
    permissionKey: 'nav_advertising',
    path: '/calendars/content',
  },
  {
    icon: PartyPopper,
    label: 'Events',
    permissionKey: 'nav_advertising',
    path: '/marketing/events',
  },
  {
    icon: Camera,
    label: 'Shot Lists',
    permissionKey: 'nav_advertising',
    path: '/marketing/shot-lists',
  },
  {
    icon: Upload,
    label: 'Upload',
    permissionKey: 'nav_advertising',
    path: '/marketing/upload',
  },

  // ── NURTURE ─────────────────────────────────────────────────────────────
  // Placeholder section between CONTENT and SELL — where a warm lead
  // gets follow-up sequences, tour reminders, and reactivation touches
  // before they're ready to enroll. Empty for now; drip flows and
  // reactivation campaigns land here.
  { sectionHeader: 'NURTURE' },

  // ── SELL ────────────────────────────────────────────────────────────────
  // Leads / Candidates — everyone touching the front of the enrollment
  // or hiring funnel. Advertising moved out to BUILD above. Families
  // moved out to DAILY (they're already enrolled). Fulfillment is the
  // downstream: what happens after a lead says yes.
  { sectionHeader: 'SELL' },
  {
    icon: UserPlus,
    label: 'Leads',
    permissionKey: 'nav_leads',
    children: [
      { label: 'Dashboard', path: '/leads' },
      { label: 'Tours', path: '/leads/tours' },
      { label: 'Procedures', path: '/leads/procedures' },
    ],
  },
  {
    icon: UserSearch,
    label: 'Candidates',
    permissionKey: 'nav_candidates',
    children: [
      { label: 'Dashboard', path: '/candidates' },
      { label: 'Interviews', path: '/candidates/interviews' },
      { label: 'Procedures', path: '/candidates/procedures' },
    ],
  },
  // Calendar — unified schedule for both Leads (tours) and Candidates
  // (interviews). Children reuse the existing routes so nothing needs
  // duplicating; this is a single place to see both sides of the
  // top-of-funnel calendar. `nav_admin` because it spans both funnels.
  {
    icon: Calendar,
    label: 'Calendar',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Tours', path: '/leads/tours' },
      { label: 'Interviews', path: '/candidates/interviews' },
    ],
  },
  // ── CLOSE ───────────────────────────────────────────────────────────────
  // Placeholder section between SELL and FULFILL — where the tour or
  // interview turns into an actual enrollment (or hire). Empty for now;
  // scripts, follow-ups, and close-rate tracking land here.
  { sectionHeader: 'CLOSE' },

  // ── FULFILL ─────────────────────────────────────────────────────────────
  // Fulfillment steps for a new NexGen family, ordered by when they
  // happen in the intake arc — from the moment a family says yes on tour
  // to ongoing care and TRS-tracked development. Each step is a
  // top-level item (flattened out of the old ClubSync "Fulfillment"
  // dropdown, which held SaaS/franchise concepts that don't map to
  // childcare). Leaves for now: no path, no children until each surface
  // is built. All gated on `nav_admin` — enrollment/fulfillment is an
  // admin/director workflow, not a teacher-facing one.
  { sectionHeader: 'FULFILL' },
  {
    icon: FileText,
    label: 'Enrollment Contract',
    permissionKey: 'nav_admin',
  },
  {
    icon: CreditCard,
    label: 'Tuition Setup',
    permissionKey: 'nav_admin',
  },
  {
    icon: Stethoscope,
    label: 'Health & Immunization',
    permissionKey: 'nav_admin',
  },
  {
    icon: Siren,
    label: 'Emergency Info',
    permissionKey: 'nav_admin',
  },
  {
    icon: School,
    label: 'Room Assignment',
    permissionKey: 'nav_admin',
  },
  {
    icon: HeartHandshake,
    label: 'Family Orientation',
    permissionKey: 'nav_admin',
  },
  {
    icon: Sunrise,
    label: 'Transition Support',
    permissionKey: 'nav_admin',
  },
  {
    icon: RefreshCw,
    label: 'Ongoing Care Plan',
    permissionKey: 'nav_admin',
  },

  // ── CUSTOMER SUCCESS ────────────────────────────────────────────────────
  // Retention arc — the surfaces that keep enrolled families satisfied
  // after intake but before they graduate out. Activation lands first
  // (turning a new family into an engaged one), then service/response/
  // support/satisfaction. All gated on `nav_admin`; no routes wired
  // until pages are built.
  { sectionHeader: 'CUSTOMER SUCCESS' },
  { icon: PlayCircle, label: 'Customer Activation',   permissionKey: 'nav_admin' },
  { icon: Headset,    label: 'Customer Service',      permissionKey: 'nav_admin' },
  // Response — how the team replies. Two axes: tone (how you say it)
  // and speed (how fast you say it). Both are trainable.
  {
    icon: Reply,
    label: 'Response',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Tonality' },
      { label: 'Speed to Response' },
    ],
  },
  { icon: Smile,      label: 'Customer Satisfaction', permissionKey: 'nav_admin' },
  { icon: LifeBuoy,   label: 'Customer Support',      permissionKey: 'nav_admin' },

  // ── BUILD ───────────────────────────────────────────────────────────────
  // Reactivation surfaces moved out of CAPTURE — these are lifecycle
  // nurture tools (talk to existing families / prospects), not
  // top-of-funnel capture tools. Both leaves for now until real
  // composer/scheduler pages land.
  { sectionHeader: 'BUILD' },
  {
    icon: Mail,
    label: 'Newsletters',
    permissionKey: 'nav_admin',
  },
  {
    icon: MessageSquare,
    label: 'SMS Blasts',
    permissionKey: 'nav_admin',
  },

  // ── LEAD (leadership) ───────────────────────────────────────────────────
  // Playbook + Projects + Meetings + Schedule. Playbook holds the
  // operating rhythm content (three meeting cadences + Leila-Hormozi
  // people-framework layers). Projects/Meetings/Schedule are the
  // day-to-day leadership tools.
  { sectionHeader: 'LEAD' },
  // Playbook — leadership operating manual (renamed from "Structure" so
  // it didn't collide with the STRUCTURE section header below). Two arcs
  // today: Activities (the three meeting rhythms — Quarterly reset,
  // Monday morning kickoff, Friday debrief) and People Framework
  // (Culture, Founder capacity, People flywheel, Talent engine, Scaling
  // systems). Leaves have no paths yet — pages come next; the nav shape
  // is here so we can wire them one at a time.
  {
    icon: Building2,
    label: 'Playbook',
    permissionKey: 'nav_admin',
    children: [
      {
        label: 'Activities',
        children: [
          { label: 'Quarterly Reset',       path: '/lead/playbook/activities/quarterly-reset' },
          { label: 'Monday Morning Meeting', path: '/lead/playbook/activities/monday-morning-meeting' },
          { label: 'Friday Debrief',        path: '/lead/playbook/activities/friday-debrief' },
        ],
      },
      {
        label: 'People Framework',
        children: [
          { label: 'Culture as a System',          path: '/lead/playbook/people/culture' },
          { label: 'Founder as Capacity Ceiling',  path: '/lead/playbook/people/founder-ceiling' },
          { label: 'People Flywheel',              path: '/lead/playbook/people/people-flywheel' },
          { label: 'Talent Engine',                path: '/lead/playbook/people/talent-engine' },
          { label: 'Systems to Scale',             path: '/lead/playbook/people/systems-to-scale' },
        ],
      },
    ],
  },
  // Projects — routes (/targets, /targets/progress, /targets/tasks)
  // unchanged so deep links + page filenames still work.
  {
    icon: Target,
    label: 'Projects',
    permissionKey: 'nav_projects',
    children: [
      { label: 'Dashboard', path: '/targets' },
      { label: 'Targets', path: '/targets/progress' },
      { label: 'Tasks', path: '/targets/tasks' },
    ],
  },
  {
    icon: Users,
    label: 'Meetings',
    permissionKey: 'nav_meetings',
    children: [
      { label: 'Structure', path: '/admin/meetings' },
      { label: 'Calendar' },
    ],
  },
  // Schedule — where an admin/director builds employee shift schedules.
  // Leaf for now; no path, no children until the scheduling surface lands.
  // `nav_admin` gates it since scheduling is admin/director work.
  {
    icon: CalendarClock,
    label: 'Schedule',
    permissionKey: 'nav_admin',
  },

  // ── STRUCTURE ───────────────────────────────────────────────────────────
  // Org Chart — structural layer of how the org runs. Calendars was here
  // briefly but got removed: Google Calendar Sync is deferred, School
  // Calendar is unused, Staff Calendar is covered by LEAD → Schedule,
  // and Events lives in CONTENT. The /calendar route stays wired so any
  // deep link still resolves — just no sidebar entry point.
  { sectionHeader: 'STRUCTURE' },
  {
    icon: Network,
    label: 'Org Chart',
    permissionKey: 'nav_org_chart',
    path: '/org-chart',
  },
  // Vision / Mission / Core Values — the identity docs that anchor the
  // Org Chart above. Same permission key so they inherit Org Chart's
  // visibility. Leaves for now; no routes until each page is built.
  { icon: Eye,  label: 'Vision',      permissionKey: 'nav_org_chart' },
  { icon: Flag, label: 'Mission',     permissionKey: 'nav_org_chart' },
  { icon: Gem,  label: 'Core Values', permissionKey: 'nav_org_chart' },

  // ── HELP ────────────────────────────────────────────────────────────────
  // AI Chat / Pulse / Training (practice bots) / SOP Library / Resources.
  // Everything a teacher reaches for while working — refresher tools,
  // reference material, quick answers.
  //
  // Tasks menu — historical note: removed from the sidebar in an earlier
  // session. Legacy artifacts left intact:
  //   - Route /tasks still resolves (in src/App.jsx)
  //   - Page src/pages/PulsePage.jsx (project tile board)
  //   - Component src/components/ProjectStatusBoard.jsx
  //   - Data src/lib/projects.js
  { sectionHeader: 'HELP' },
  {
    icon: BotMessageSquare,
    label: 'AI Chat',
    permissionKey: 'nav_ai_chat',
    path: '/ai-chat',
  },
  {
    icon: Zap,
    label: 'Pulse',
    permissionKey: 'nav_pulse',
    path: '/quick-focus',
  },
  // Training in HELP is the PRACTICE-BOT LIBRARY at /trainings/practice
  // (refresher conversations with an AI). The ONBOARD → Training leaf
  // owns the curriculum tile dashboard at /trainings. Two items labeled
  // "Training" pointing at DIFFERENT paths — Sidebar.jsx distinguishes
  // active state by path, not label, so they no longer light up together.
  {
    icon: GraduationCap,
    label: 'Training',
    permissionKey: 'nav_training',
    path: '/trainings/practice',
  },
  {
    icon: BookOpen,
    label: 'SOP Library',
    permissionKey: 'nav_sop_library',
    path: '/sop-library',
  },
  {
    icon: FolderOpen,
    label: 'Resources',
    permissionKey: 'nav_resources',
    children: [
      { label: 'Handbooks', path: '/handbooks' },
      { label: 'Applications', path: '/applications' },
      // TRS entry removed — moved to ADMIN → Texas Rising Star →
      // Resources so all TRS-adjacent surfaces live together. The
      // /trs/documents route + page stay wired.
    ],
  },

  // ── ADMIN ───────────────────────────────────────────────────────────────
  // Staff Management, Compliance, Platform Settings — ongoing oversight
  // of an already-running operation (people, checks, config).
  { sectionHeader: 'ADMIN' },
  {
    icon: Users,
    label: 'Staff Management',
    permissionKey: 'nav_staff_management',
    children: [
      // Accounts sits at /admin, which is a prefix of every other ADMIN
      // route (/admin/data-integrity, /admin/performance-compliance, ...).
      // `exact: true` tells hasActiveDescendant to skip prefix matching
      // so Staff Management doesn't light up on sibling routes.
      { label: 'Accounts', path: '/admin', exact: true },
      { label: 'Submissions', path: '/staff/responses' },
      { label: 'Permissions', path: '/admin/permissions' },
    ],
  },
  // Training Compliance — renamed from "Compliance" and flattened to a
  // leaf (Overview was its only surviving child). Data Integrity split
  // out to its own top-level item below so the two live independently.
  {
    icon: ClipboardCheck,
    label: 'Training Compliance',
    permissionKey: 'nav_compliance',
    path: '/admin/performance-compliance',
  },
  // Data Integrity — promoted out of Compliance's children into its own
  // top-level item. Keeps `nav_compliance` so effective visibility is
  // unchanged (whoever saw the old Data Integrity child still sees this).
  {
    icon: Database,
    label: 'Data Integrity',
    permissionKey: 'nav_compliance',
    path: '/admin/data-integrity',
  },
  // Texas Rising Star — the 4-category TRS 4-Star compliance surface,
  // promoted out of the ONBOARD → Training tile dashboard. Uses the
  // existing `training_trs` permission key so anyone who saw the old
  // TRS tile still sees this dropdown. Children are label-only for now
  // — wire the TRS category pages when they land.
  {
    icon: Trophy,
    label: 'Texas Rising Star',
    permissionKey: 'training_trs',
    children: [
      { label: 'Cat 1: Staff Qualifications' },
      { label: 'Cat 2: Interactions' },
      { label: 'Cat 3: Program Admin' },
      { label: 'Cat 4: Environments' },
      // Resources — the CARF / FARF / TSR Certification Guidelines
      // library. Moved out of HELP → Resources → TRS so all TRS-adjacent
      // things live under one roof. Same path (/trs/documents) so no
      // page change needed — clicking opens the same document card view.
      { label: 'Resources', path: '/trs/documents' },
    ],
  },

  // ── FOUNDER ─────────────────────────────────────────────────────────────
  // S.A.N.D., Officers, and Finance were promoted out of the deleted
  // Founder container so each stands as its own top-level item under
  // this header. All three keep permissionKey `nav_admin` — matches the
  // effective visibility of the old container (only roles with nav_admin
  // saw its children). If any one of them needs its own access scope in
  // the future, wire ChildItem to check permission keys AND add a
  // corresponding seed row in role_permissions.
  { sectionHeader: 'FOUNDER' },
  {
    icon: ShieldCheck,
    label: 'S.A.N.D.',
    permissionKey: 'nav_admin',
    path: '/',
  },
  {
    icon: Briefcase,
    label: 'Officers',
    permissionKey: 'nav_admin',
    children: [
      { label: 'CEO',                 path: '/officers/ceo' },
      { label: 'Junior COO',          path: '/officers/junior-coo' },
      { label: 'Detail Officer',      path: '/officers/detail' },
      { label: 'Fulfillment Officer', path: '/officers/fulfillment' },
      { label: 'Improvement Officer', path: '/officers/improvement' },
      { label: 'Legal Officer',       path: '/officers/legal' },
      { label: 'Response Officer',    path: '/officers/response' },
      { label: 'Revenue Officer',     path: '/officers/revenue' },
      { label: 'Teams Officer',       path: '/officers/teams' },
      { label: 'Tech Officer',        path: '/officers/tech' },
    ],
  },
  {
    icon: Landmark,
    label: 'Finance',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Dashboard', path: '/finance' },
      {
        label: 'Books',
        children: [
          { label: 'Accounts',     path: '/finance/books/accounts' },
          { label: 'Transactions', path: '/finance/books/transactions' },
          { label: 'Reports',      path: '/finance/books/reports' },
          { label: 'Rules',        path: '/finance/books/rules' },
        ],
      },
    ],
  },
  // Platform Settings — moved from ADMIN to sit at the bottom of FOUNDER.
  // Theme / Integrations / Webhooks are founder-only levers, not
  // day-to-day admin oversight, so they belong here. Permission key
  // stays `nav_admin` — same effective visibility as before.
  {
    icon: Settings,
    label: 'Platform Settings',
    permissionKey: 'nav_admin',
    children: [
      { label: 'Theme & Appearance', path: '/admin/settings/theme' },
      { label: 'Integrations', path: '/admin/settings/integrations' },
      { label: 'Webhooks', path: '/admin/settings/webhooks' },
    ],
  },
]
