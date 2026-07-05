// Single source of truth for the project status board.
//
// Both the Roadmap page (the "Where are we right now?" section) and the new
// dedicated /pulse page read PROJECTS + PROJECT_STATUSES from here, so any
// edit lands on both surfaces at the same time.
//
// To add a new project tile:
//   - Append to PROJECTS.
//   - `status` must be a key in PROJECT_STATUSES.
//   - `link` is optional — when set, the tile becomes a clickable button
//     that navigates to that path. Omit it for a static informational tile.
//
// When this list outgrows ~12 entries we'll want a Supabase-backed
// `projects` table so updates don't require a code deploy. Until then the
// inline array is fine and keeps the surface area small.

export const PROJECT_STATUSES = {
  on_track:    { label: 'On Track',    color: '#059669' },
  in_progress: { label: 'In Progress', color: '#2563EB' },
  planning:    { label: 'Planning',    color: '#64748B' },
  at_risk:     { label: 'At Risk',     color: '#D97706' },
  blocked:     { label: 'Blocked',     color: '#DC2626' },
  done:        { label: 'Done',        color: '#059669' },
}

/**
 * @typedef {Object} Project
 * @property {string} name
 * @property {string} owner
 * @property {keyof typeof PROJECT_STATUSES} status
 * @property {number} [progress]    0-100; renders a progress bar when present
 * @property {string} [update]      Short context blurb shown under the bar
 * @property {string} [link]        Optional in-app route — makes the tile clickable
 */

/** @type {Project[]} */
export const PROJECTS = [
  {
    name: 'NexGen Dashboard Platform',
    owner: 'Roman',
    status: 'in_progress',
    progress: 70,
    update: 'Data Integrity, AI Chat, and SOP Library shipped. Sidebar reorganized this week.',
    link: '/',
  },
  {
    name: 'Data Integrity Review Cycle',
    owner: 'Ed',
    status: 'planning',
    progress: 20,
    update: 'Tables + page live. Waiting on Ed\'s invite + first Wed/Fri review.',
    link: '/admin/data-integrity',
  },
  {
    name: 'AI Chat Agent (n8n)',
    owner: 'Roman',
    status: 'on_track',
    progress: 85,
    update: 'Live on /ai-chat. Claude replies persist. Field webhook still pending.',
    link: '/ai-chat',
  },
  {
    name: 'Paperclip Agent Reports',
    owner: 'Roman',
    status: 'planning',
    progress: 10,
    update: 'Blocked on Phase 3 n8n workflow build-out.',
    link: '/admin/data-integrity',
  },
  {
    name: 'Staff Onboarding & Invites',
    owner: 'Roman',
    status: 'at_risk',
    progress: 5,
    update: 'Ed + Robyn haven\'t been invited yet — blocks RLS tests and Data Integrity.',
    link: '/admin',
  },
]
