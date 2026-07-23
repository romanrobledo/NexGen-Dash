// Unified role-content module.
//
// This file is the single source of truth for the Org Chart drawer. It
// reaches back into the five Compass pages (Start Here → What Do I Do →
// How Do I Do It → When → Why → How Do I Know) so we don't duplicate the
// role-clarity content in two places.
//
// If you add a new role, add it to:
//   1. ROLE_CONTACTS below (name / email / phone shown at top of the drawer)
//   2. ROLE_META below (emoji, tagline, tone)
//   3. Optionally the ROLES arrays in each Compass page (fills the 5 sections)
// If a role has no Compass content, the drawer shows a "Content coming"
// placeholder for those sections instead of crashing.
//
// If you add a new tile position on the tree, update ORG_TREE_LAYOUT in
// src/pages/WhoAmIPage.jsx.

import { ROLES as WHAT_ROLES } from '../pages/WhatDoIDoPage'
import { ROLES as HOW_ROLES } from '../pages/HowDoIDoItPage'
import { ROLES as WHEN_ROLES } from '../pages/WhenDoIDoItPage'
import { ROLES as WHY_ROLES } from '../pages/WhyIsItImportantPage'
import { ROLES as KNOW_ROLES } from '../pages/HowDoIKnowPage'

// ─── Compass content maps (role id → that page's role entry) ────────────────

const asMap = (roles) =>
  Object.fromEntries((roles || []).map((r) => [r.id, r]))

const WHAT = asMap(WHAT_ROLES)
const HOW = asMap(HOW_ROLES)
const WHEN = asMap(WHEN_ROLES)
const WHY = asMap(WHY_ROLES)
const KNOW = asMap(KNOW_ROLES)

/**
 * Returns the merged Compass content for a role id. Any missing section
 * comes back as `null` — the drawer renders a "coming soon" placeholder.
 * @param {string} roleId
 * @returns {{
 *   whatDoIDo: any | null,
 *   howDoIDoIt: any | null,
 *   whenDoIDoIt: any | null,
 *   whyIsItImportant: any | null,
 *   howDoIKnow: any | null,
 * }}
 */
export function getRoleContent(roleId) {
  return {
    whatDoIDo: WHAT[roleId] || null,
    howDoIDoIt: HOW[roleId] || null,
    whenDoIDoIt: WHEN[roleId] || null,
    whyIsItImportant: WHY[roleId] || null,
    howDoIKnow: KNOW[roleId] || null,
  }
}

/** Rough check for whether a role has ANY Compass content on file. */
export function hasAnyContent(roleId) {
  return !!(
    WHAT[roleId] ||
    HOW[roleId] ||
    WHEN[roleId] ||
    WHY[roleId] ||
    KNOW[roleId]
  )
}

// ─── Contacts: who fills each role today ────────────────────────────────────
//
// Names / emails / phones are hardcoded until we add a Supabase `staff`
// table. Empty strings render as a "not set" placeholder in the drawer.
// Positions marked "Open Position" show the vacancy visually.

export const ROLE_CONTACTS = {
  visionary: {
    name: 'Roman Robledo',
    title: 'Visionary',
    email: 'office@romanrobledo.com',
    phone: '',
  },
  integrator: {
    name: 'Ryan',
    title: 'Integrator',
    email: '',
    phone: '',
  },
  operator: {
    name: 'Robyn',
    title: 'Operator',
    email: '',
    phone: '',
  },
  'executive-assistant': {
    name: 'Ed',
    title: 'Executive Assistant',
    email: '',
    phone: '',
  },
  'sales-manager': {
    name: 'Open Position',
    title: 'Sales Manager',
    email: '',
    phone: '',
    vacant: true,
  },
  director: {
    name: 'Rachel',
    title: 'Director',
    email: '',
    phone: '',
  },
  'facility-manager': {
    name: 'Abby',
    title: 'Facility Manager',
    email: '',
    phone: '',
  },
  // Roles that describe a class of people rather than one named person
  teacher: {
    name: 'Teachers',
    title: 'Classroom Teacher',
    email: '',
    phone: '',
    class: true,
  },
  'teacher-assistant': {
    name: 'Teacher Assistants',
    title: 'Teacher Assistant',
    email: '',
    phone: '',
    class: true,
  },
  // Category / focus-area tiles (no single person)
  scheduling: {
    name: 'Scheduling',
    title: 'Focus Area · Executive Assistant',
    email: '',
    phone: '',
    focusArea: true,
  },
  documentation: {
    name: 'Documentation',
    title: 'Focus Area · Executive Assistant',
    email: '',
    phone: '',
    focusArea: true,
  },
  'internal-communication': {
    name: 'Internal Communication',
    title: 'Focus Area · Executive Assistant',
    email: '',
    phone: '',
    focusArea: true,
  },
  tours: {
    name: 'Tours',
    title: 'Focus Area · Sales Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  'follow-up': {
    name: 'Follow-Up',
    title: 'Focus Area · Sales Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  enrollment: {
    name: 'Enrollment',
    title: 'Focus Area · Sales Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  'community-outreach': {
    name: 'Community Outreach',
    title: 'Focus Area · Sales Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  'classroom-operations': {
    name: 'Classroom Operations',
    title: 'Focus Area · Facility Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  'student-experience': {
    name: 'Student Experience',
    title: 'Focus Area · Facility Manager',
    email: '',
    phone: '',
    focusArea: true,
  },
  // Legacy roles from WhoAmIPage ROLES that aren't on the visual tree —
  // kept so the "Other Roles" strip at the bottom can still surface them.
  'front-desk': {
    name: 'Front Desk Manager',
    title: 'Front Desk Manager',
    email: '',
    phone: '',
  },
  'hiring-manager': {
    name: 'Hiring Manager',
    title: 'Hiring Manager',
    email: '',
    phone: '',
  },
  'tour-manager': {
    name: 'Tour Manager',
    title: 'Tour Manager',
    email: '',
    phone: '',
  },
  'lesson-plans': {
    name: 'Lesson Plans Manager',
    title: 'Lesson Plans Manager',
    email: '',
    phone: '',
  },
  'kitchen-manager': {
    name: 'Kitchen Manager',
    title: 'Kitchen Manager',
    email: '',
    phone: '',
  },
  'asst-kitchen': {
    name: 'Asst. Kitchen Manager',
    title: 'Asst. Kitchen Manager',
    email: '',
    phone: '',
  },
  'bus-driver': {
    name: 'Bus Driver',
    title: 'Bus Driver',
    email: '',
    phone: '',
  },
}

// ─── Meta: tile visuals (emoji, tagline, color tone) ────────────────────────

export const ROLE_META = {
  visionary: { emoji: '👑', tagline: 'Direction, Vision, Growth', tone: 'indigo' },
  integrator: { emoji: '⚙️', tagline: 'Systems, Automation, Scalability', tone: 'emerald' },
  operator: { emoji: '🏢', tagline: 'Daily Operations & Team Management', tone: 'blue' },
  'executive-assistant': { emoji: '💬', tagline: 'Communication & Coordination', tone: 'emerald' },
  'sales-manager': { emoji: '📈', tagline: 'Enrollment Growth & Parent Acquisition', tone: 'blue' },
  director: { emoji: '📋', tagline: 'Bridge between vision and classroom', tone: 'purple' },
  'facility-manager': { emoji: '🏫', tagline: 'Facility operations & upkeep', tone: 'blue' },
  teacher: { emoji: '📚', tagline: "Most important person in a child's day", tone: 'emerald' },
  'teacher-assistant': { emoji: '🤝', tagline: "Makes the teacher's job possible", tone: 'cyan' },
  scheduling: { emoji: '📅', tagline: 'Calendar, shifts, coverage', tone: 'emerald' },
  documentation: { emoji: '📄', tagline: 'Records, paperwork, filing', tone: 'emerald' },
  'internal-communication': { emoji: '👥', tagline: 'Team communication rhythms', tone: 'emerald' },
  tours: { emoji: '📍', tagline: 'Family tours & first impressions', tone: 'blue' },
  'follow-up': { emoji: '📧', tagline: 'Lead nurture & follow-up', tone: 'blue' },
  enrollment: { emoji: '📋', tagline: 'Enrollment paperwork & handoff', tone: 'blue' },
  'community-outreach': { emoji: '👥', tagline: 'Community presence & partners', tone: 'blue' },
  'classroom-operations': { emoji: '🏠', tagline: 'Room-level daily operations', tone: 'blue' },
  'student-experience': { emoji: '❤️', tagline: 'Student experience & environment', tone: 'blue' },
  'front-desk': { emoji: '🖥️', tagline: 'First impression families leave with', tone: 'amber' },
  'hiring-manager': { emoji: '🔍', tagline: 'Builds the team that builds the school', tone: 'red' },
  'tour-manager': { emoji: '🗺️', tagline: 'Turns curious families into enrolled', tone: 'purple' },
  'lesson-plans': { emoji: '📝', tagline: 'Gives teachers the roadmap', tone: 'emerald' },
  'kitchen-manager': { emoji: '🍽️', tagline: "Fuels every child's day", tone: 'amber' },
  'asst-kitchen': { emoji: '🥄', tagline: 'Keeps the kitchen running', tone: 'cyan' },
  'bus-driver': { emoji: '🚌', tagline: "Every child is someone's whole world", tone: 'red' },
}

// ─── Tone → Tailwind class map (used by tiles + drawer header) ──────────────

export const TONE_CLASSES = {
  indigo: {
    border: 'border-l-indigo-500',
    ring: 'hover:border-indigo-300',
    iconBg: 'bg-indigo-100 text-indigo-700',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  emerald: {
    border: 'border-l-emerald-500',
    ring: 'hover:border-emerald-300',
    iconBg: 'bg-emerald-100 text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  blue: {
    border: 'border-l-blue-500',
    ring: 'hover:border-blue-300',
    iconBg: 'bg-blue-100 text-blue-700',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  purple: {
    border: 'border-l-purple-500',
    ring: 'hover:border-purple-300',
    iconBg: 'bg-purple-100 text-purple-700',
    chip: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  cyan: {
    border: 'border-l-cyan-500',
    ring: 'hover:border-cyan-300',
    iconBg: 'bg-cyan-100 text-cyan-700',
    chip: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  amber: {
    border: 'border-l-amber-500',
    ring: 'hover:border-amber-300',
    iconBg: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  red: {
    border: 'border-l-red-500',
    ring: 'hover:border-red-300',
    iconBg: 'bg-red-100 text-red-700',
    chip: 'bg-red-50 text-red-700 border-red-200',
  },
}
