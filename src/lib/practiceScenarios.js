/**
 * Practice-bot scenarios shown on the "SalesAI Voice Trainer"-style pages.
 *
 * Two consumers today:
 *   - /trainings/practice           (HELP → Training) — full library
 *   - /trainings/onboarding/exercise (ONBOARD → Exercise) — first-week subset
 *
 * The `category` field decides which page a scenario appears on:
 *   'library'                 → the full HELP → Training bot library
 *   'onboarding_first_week'   → the ONBOARD → Exercise subset
 *   both                      → appears on both pages
 *
 * All routes/bots are placeholder for Phase 1 (UI shell only). Phase 2
 * wires `status: 'ready'` scenarios to Roman's n8n webhook and adds a
 * real `practice_sessions` table for the Recent Sessions list.
 *
 * @typedef {'easy'|'medium'|'hard'} Difficulty
 * @typedef {'ready'|'coming_soon'} ScenarioStatus
 * @typedef {'library'|'onboarding_first_week'|'both'} ScenarioCategory
 *
 * @typedef {Object} Scenario
 * @property {string}          key           — stable slug (URL-safe)
 * @property {string}          title         — human-readable name
 * @property {Difficulty}      difficulty    — pill color driver
 * @property {string}          description   — 1-2 sentence card copy
 * @property {ScenarioStatus}  status        — gates the CTA button
 * @property {ScenarioCategory} category     — which page(s) show this scenario
 * @property {number|null}     bestScore     — null until Phase 2 wires sessions
 */

/** @type {Scenario[]} */
export const PRACTICE_SCENARIOS = [
  // ── First-week onboarding drills ────────────────────────────────────────
  {
    key: 'first-day-drop-off',
    title: 'First-Day Parent Drop-Off',
    difficulty: 'easy',
    description:
      'A parent hesitates at your classroom door on their child\'s first morning. Practice the greeting, the reassurance, and the clean handoff.',
    status: 'ready',
    category: 'onboarding_first_week',
    bestScore: null,
  },
  {
    key: 'intro-to-class',
    title: 'Introducing Yourself to the Class',
    difficulty: 'easy',
    description:
      'Practice your first-day introduction to the room — tone, pacing, and what to say when a child interrupts.',
    status: 'ready',
    category: 'onboarding_first_week',
    bestScore: null,
  },
  {
    key: 'ask-lead-teacher',
    title: 'Asking Your Lead Teacher a Question',
    difficulty: 'easy',
    description:
      'Practice raising a question during a busy classroom moment without interrupting the flow — timing, phrasing, and follow-through.',
    status: 'ready',
    category: 'onboarding_first_week',
    bestScore: null,
  },

  // ── Library — parent conversations ──────────────────────────────────────
  {
    key: 'nervous-parent-tour',
    title: 'The Nervous Parent',
    difficulty: 'easy',
    description:
      'A first-time parent on a tour, worried about safety and separation. Practice building trust in under three minutes.',
    status: 'ready',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'behavior-concern',
    title: 'The Behavior Concern',
    difficulty: 'medium',
    description:
      'You need to tell a parent their child is struggling with hitting. Practice delivering hard news without triggering defensiveness.',
    status: 'ready',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'rate-increase',
    title: 'The Rate Increase',
    difficulty: 'medium',
    description:
      'Announcing a tuition raise to a long-standing family. Practice framing value, not just cost.',
    status: 'coming_soon',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'difficult-withdrawal',
    title: 'The Difficult Withdrawal',
    difficulty: 'hard',
    description:
      'A parent pulling their child mid-week and demanding a full refund. Practice holding policy while keeping the relationship intact.',
    status: 'coming_soon',
    category: 'library',
    bestScore: null,
  },

  // ── Library — peer + leadership conversations ───────────────────────────
  {
    key: 'peer-coaching',
    title: 'Peer Support Talk',
    difficulty: 'easy',
    description:
      'A teammate seems overwhelmed but hasn\'t asked for help. Practice offering support without stepping on their autonomy.',
    status: 'ready',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'founder-one-on-one',
    title: 'Monthly One-on-One with the Founder',
    difficulty: 'medium',
    description:
      'Prepping for your monthly review. Practice reporting wins, naming blockers, and asking for what you need.',
    status: 'ready',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'trs-assessor',
    title: 'The TRS Assessor',
    difficulty: 'hard',
    description:
      'A Texas Rising Star assessor asking about a marginal room ratio. Practice answering with facts and without over-explaining.',
    status: 'coming_soon',
    category: 'library',
    bestScore: null,
  },

  // ── Library — child conversations ───────────────────────────────────────
  {
    key: 'redirect-toddler',
    title: 'Redirecting a Toddler',
    difficulty: 'easy',
    description:
      'A two-year-old fixated on a toy another child is using. Practice the redirect without a power struggle.',
    status: 'ready',
    category: 'library',
    bestScore: null,
  },
  {
    key: 'child-big-feelings',
    title: 'A Child with Big Feelings',
    difficulty: 'medium',
    description:
      'A four-year-old in tears about a lost stuffed animal. Practice co-regulation without dismissing or fixing.',
    status: 'coming_soon',
    category: 'library',
    bestScore: null,
  },
]

/**
 * Filter scenarios by which page consumes them. Scenarios tagged 'both'
 * appear everywhere — reserved for cross-cutting drills (there are none
 * today, but keeping the enum wide avoids a shim later).
 *
 * @param {ScenarioCategory} category
 * @returns {Scenario[]}
 */
export function scenariosFor(category) {
  return PRACTICE_SCENARIOS.filter(
    (s) => s.category === category || s.category === 'both'
  )
}
