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
 */
export const navItems = [
  // ── Top block ────────────────────────────────────────────────────────────
  // Facility / Students / Staff / Families / Billing — daily-operations
  // anchors. Students + Staff are shortcuts to pages that ALSO exist inside
  // deeper menus (Families → Students). Two entry points to one page is
  // fine; two different pages both called Students is not.
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
  // ops. Finance → Books stays inside Admin for internal bookkeeping.
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
  // ── Visual break #1: top block → learning + focus cluster.
  { separator: true },

  // ── Learning + focus cluster ─────────────────────────────────────────────
  // AI Chat / Pulse / Training / Calendars / Org Chart / SOP Library /
  // Compliance / Resources.
  //
  // Tasks menu — historical note: removed from the sidebar in an earlier
  // session. Legacy artifacts left intact:
  //   - Route /tasks still resolves (in src/App.jsx)
  //   - Page src/pages/PulsePage.jsx (project tile board)
  //   - Component src/components/ProjectStatusBoard.jsx
  //   - Data src/lib/projects.js
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
  // Training is a LEAF — /trainings dashboard shows every training
  // category as its own tile (each tile gates on its own training_* key).
  {
    icon: GraduationCap,
    label: 'Training',
    permissionKey: 'nav_training',
    path: '/trainings',
  },
  {
    icon: CalendarDays,
    label: 'Calendars',
    // Universal — school-wide schedule. Intentionally unkeyed.
    path: '/calendar',
  },
  {
    icon: Network,
    label: 'Org Chart',
    permissionKey: 'nav_org_chart',
    path: '/org-chart',
  },
  {
    icon: BookOpen,
    label: 'SOP Library',
    permissionKey: 'nav_sop_library',
    path: '/sop-library',
  },
  {
    icon: ClipboardCheck,
    label: 'Compliance',
    permissionKey: 'nav_compliance',
    children: [
      { label: 'Overview', path: '/admin/performance-compliance' },
      { label: 'Data Integrity', path: '/admin/data-integrity' },
    ],
  },
  {
    icon: FolderOpen,
    label: 'Resources',
    permissionKey: 'nav_resources',
    children: [
      { label: 'Handbooks', path: '/handbooks' },
      { label: 'Applications', path: '/applications' },
      { label: 'TRS', path: '/trs/documents' },
    ],
  },
  // ── Visual break #2: learning cluster → people-pipeline cluster.
  { separator: true },

  // ── People-pipeline cluster ──────────────────────────────────────────────
  // Leads / Candidates / Advertising — everyone touching the front of the
  // enrollment, hiring, or acquisition funnel. Families moved out to the
  // top block (they're already enrolled).
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
  // Advertising — renamed from Marketing (label only). Routes stay under
  // /marketing/* so bookmarks, deep links, and sub-page filenames are
  // unchanged.
  {
    icon: Megaphone,
    label: 'Advertising',
    permissionKey: 'nav_advertising',
    children: [
      { label: 'Dashboard', path: '/marketing' },
      { label: 'Shot Lists', path: '/marketing/shot-lists' },
      { label: 'Upload', path: '/marketing/upload' },
      { label: 'Campaigns', path: '/calendars/content' },
      { label: 'Events', path: '/marketing/events' },
      { label: 'Calendar', path: '/marketing/calendar' },
      {
        label: 'Offers',
        path: '/marketing/offers',
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
          {
            label: 'Free Goodwill Offer',
            path: '/marketing/offers/free-goodwill',
            children: [
              { label: '3 Month Scholarship', path: '/marketing/offers/free-goodwill/3-month-scholarship' },
            ],
          },
        ],
      },
    ],
  },
  // ── Visual break #3: pipeline → operations cluster.
  { separator: true },

  // ── Operations cluster ───────────────────────────────────────────────────
  // Projects / Meetings / Staff Management / Admin. Admin absorbs S.A.N.D.,
  // Platform Settings, Officers, and Finance as children.
  //
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
  {
    icon: Users,
    label: 'Staff Management',
    permissionKey: 'nav_staff_management',
    children: [
      { label: 'Accounts', path: '/admin' },
      { label: 'Submissions', path: '/staff/responses' },
      { label: 'Permissions', path: '/admin/permissions' },
    ],
  },
  // Admin — top-level container holding S.A.N.D., Platform Settings,
  // Officers, and Finance. Sub-items do NOT check permissions individually
  // today — parent visibility gates all children. If S.A.N.D. or Finance
  // needs its own access scope in the future, wire ChildItem to check
  // permission keys AND add nav_sand / nav_finance seed rows.
  {
    icon: ShieldCheck,
    label: 'Admin',
    permissionKey: 'nav_admin',
    children: [
      { label: 'S.A.N.D.', path: '/' },
      {
        label: 'Platform Settings',
        children: [
          { label: 'Theme & Appearance', path: '/admin/settings/theme' },
          { label: 'Integrations', path: '/admin/settings/integrations' },
          { label: 'Webhooks', path: '/admin/settings/webhooks' },
        ],
      },
      {
        label: 'Officers',
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
        label: 'Finance',
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
    ],
  },
]
