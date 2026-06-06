/**
 * metricDefinitions — human-readable metadata for each Baseline Number KPI.
 *
 * Keyed by the `metric_name` stored in data_integrity_baseline_numbers.
 * This lives in code (not the DB) for Phase 2 because the copy is cheap to
 * iterate and Ed won't change it. If you ever want this editable from the
 * dashboard, promote to a `data_integrity_metric_definitions` table later.
 *
 * Fields:
 *   label         — human-readable name shown in UI
 *   description   — plain-language explanation of what the KPI tells you
 *   howToGet      — where Ed actually pulls the value from today
 *   formula       — optional: show if the metric is derived from others
 *   cadence       — 'weekly' | 'monthly' (must match period_type in DB)
 *   direction     — 'higher_better' | 'lower_better'
 *   unit          — suffix to append in the UI ('%', '$', 'leads', etc.)
 *   targetValue   — optional goal (null if no target set)
 *   icon          — name of a lucide icon component (resolved in UI)
 */

export const METRIC_DEFS = {
  new_leads_this_week: {
    label: 'New Leads This Week',
    description:
      'Brand-new inquiries that raised their hand for the first time this week. Meta ads, walk-ins, phone calls, referrals — anywhere a new family made first contact.',
    howToGet:
      'Your leads tracker (Meta Ads Manager, call log, walk-in sheet, or wherever new contacts land before they tour).',
    formula: null,
    cadence: 'weekly',
    direction: 'higher_better',
    unit: 'leads',
    targetValue: null,
    icon: 'Megaphone',
  },
  tours_held_this_week: {
    label: 'Tours Held This Week',
    description:
      'In-person center visits that actually happened. A no-show tour does not count.',
    howToGet:
      'Your tour booking calendar. Count the ones marked "completed" between Monday and Sunday.',
    formula: null,
    cadence: 'weekly',
    direction: 'higher_better',
    unit: 'tours',
    targetValue: null,
    icon: 'ClipboardList',
  },
  new_enrollments_this_week: {
    label: 'New Enrollments This Week',
    description:
      'Families who signed the enrollment paperwork AND paid the deposit this week. If they just promised to enroll next week — not counted until the money moves.',
    howToGet:
      'Your enrollment log or new-family onboarding sheet.',
    formula: null,
    cadence: 'weekly',
    direction: 'higher_better',
    unit: 'enrollments',
    targetValue: null,
    icon: 'UserPlus',
  },
  withdrawals_this_week: {
    label: 'Withdrawals This Week',
    description:
      "Families who gave notice or whose last day landed in this week. Low is good — every withdrawal is a family that didn't stick.",
    howToGet:
      'Your withdrawal log / notice emails from families.',
    formula: null,
    cadence: 'weekly',
    direction: 'lower_better',
    unit: 'withdrawals',
    targetValue: null,
    icon: 'UserMinus',
  },
  tour_to_enrollment_rate: {
    label: 'Tour → Enrollment Rate',
    description:
      'What percentage of tours this week turned into paying families. Tour 10 families, sign up 4 of them, that\'s 40%.',
    howToGet:
      'Calculated. Divide New Enrollments This Week by Tours Held This Week, multiply by 100.',
    formula: '(New Enrollments ÷ Tours Held) × 100',
    cadence: 'weekly',
    direction: 'higher_better',
    unit: '%',
    targetValue: 50,
    icon: 'Percent',
  },
  active_enrollment_count: {
    label: 'Active Enrollment Count',
    description:
      'Total number of children currently enrolled and attending. The headcount.',
    howToGet:
      'Your student roster — count everyone with "active" status as of today.',
    formula: null,
    cadence: 'weekly',
    direction: 'higher_better',
    unit: 'children',
    targetValue: null,
    icon: 'Users',
  },
  occupancy_rate: {
    label: 'Occupancy Rate',
    description:
      'How full the center is vs. licensed capacity. Licensed for 200 and 150 kids enrolled = 75%.',
    howToGet:
      'Calculated. Divide Active Enrollment by the Licensed Capacity number (found under Compliance).',
    formula: '(Active Enrollment ÷ Licensed Capacity) × 100',
    cadence: 'weekly',
    direction: 'higher_better',
    unit: '%',
    targetValue: 90,
    icon: 'Home',
  },
  arpc_per_week_per_child: {
    label: 'ARPC per Week per Child',
    description:
      'Average Revenue Per Child per week — what one kid brings in on an average week.',
    howToGet:
      'Calculated. Divide weekly revenue by Active Enrollment Count.',
    formula: 'Weekly Revenue ÷ Active Enrollment',
    cadence: 'weekly',
    direction: 'higher_better',
    unit: '$',
    targetValue: null,
    icon: 'DollarSign',
  },
  revenue_this_month: {
    label: 'Revenue This Month',
    description:
      "Total dollars collected (or billed — pick one convention and stick with it) this calendar month.",
    howToGet:
      'Your billing system — Procare, QuickBooks, Stripe, or wherever tuition payments land.',
    formula: null,
    cadence: 'monthly',
    direction: 'higher_better',
    unit: '$',
    targetValue: null,
    icon: 'Banknote',
  },
  net_profit_this_month: {
    label: 'Net Profit This Month',
    description:
      'Revenue minus every expense for the month. The actual dollars the center kept.',
    howToGet:
      'Your accounting system (QuickBooks / Xero). Run the Profit & Loss for this month and take the bottom line.',
    formula: 'Revenue − (Payroll + Rent + Supplies + Insurance + All other expenses)',
    cadence: 'monthly',
    direction: 'higher_better',
    unit: '$',
    targetValue: null,
    icon: 'TrendingUp',
  },
  churn_rate_this_month: {
    label: 'Churn Rate This Month',
    description:
      'What percentage of enrolled kids left this month. 5 out of 100 left = 5% churn. Lower is better.',
    howToGet:
      'Calculated. Divide Withdrawals This Month by the enrollment count at the start of the month.',
    formula: '(Withdrawals This Month ÷ Starting Enrollment) × 100',
    cadence: 'monthly',
    direction: 'lower_better',
    unit: '%',
    targetValue: 3,
    icon: 'TrendingDown',
  },
  average_trs_room_score: {
    label: 'Average TRS Room Score',
    description:
      'Average of every TRS room assessment score you ran this month. Tells you where your quality bar actually sits across rooms.',
    howToGet:
      'Averaged from Performance Baseline → Room Scores. Will auto-fill once those rows exist.',
    formula: 'AVG of all room_scores.score for the month',
    cadence: 'monthly',
    direction: 'higher_better',
    unit: '/10',
    targetValue: 8,
    icon: 'Award',
  },
}

/** Convenience — array form sorted by cadence then label. */
export const METRIC_DEFS_ARRAY = Object.entries(METRIC_DEFS).map(([key, def]) => ({
  key,
  ...def,
}))

/** Lookup a def, falling back to a friendly default if the metric_name is
 *  unknown (e.g., a future metric added before this file is updated). */
export function getMetricDef(metricName) {
  if (!metricName) return null
  return METRIC_DEFS[metricName] || {
    label: humanizeKey(metricName),
    description: 'No description yet — add one to metricDefinitions.js.',
    howToGet: 'Not documented yet.',
    formula: null,
    cadence: null,
    direction: null,
    unit: '',
    targetValue: null,
    icon: null,
  }
}

function humanizeKey(key) {
  return key
    .split('_')
    .map((w) => {
      const lower = w.toLowerCase()
      if (['arpc', 'trs', 'hhsc'].includes(lower)) return w.toUpperCase()
      return w[0].toUpperCase() + w.slice(1)
    })
    .join(' ')
}
