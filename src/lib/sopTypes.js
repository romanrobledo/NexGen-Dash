/**
 * JSDoc @typedef definitions mirroring the Supabase schema for `sops`,
 * `sop_versions`, and `sop_submissions`.
 *
 * No runtime output — consumers get IntelliSense via JSDoc imports:
 *   /** @type {import('../lib/sopTypes').Sop} *\/
 *
 * If the DB schema changes, update this file in the same PR so the code-level
 * contract follows reality.
 */

/**
 * @typedef {
 *   'not_started'
 *   | 'draft'
 *   | 'in_review'
 *   | 'approved'
 *   | 'live'
 *   | 'needs_update'
 *   | 'archived'
 * } SopStatus
 */

/**
 * @typedef {
 *   'info' | 'low' | 'medium' | 'high' | 'critical' | 'emergency'
 * } SopSeverity
 */

/**
 * @typedef {Object} Sop
 * @property {string} id                        Internal UUID
 * @property {string} sop_id                    Dotted identifier, e.g. "2.6"
 * @property {string} title
 * @property {number} chapter_num               1..21
 * @property {string} chapter_name
 * @property {string} body_markdown             Raw markdown; may be empty string
 * @property {SopStatus} status
 * @property {string} version                   Semver-ish, e.g. "0.1", "1.4"
 * @property {string | null} [owner_role]
 * @property {string | null} [priority_phase]   phase_1_must_have etc.
 * @property {SopSeverity | null} [severity]
 * @property {number | null} [sla_minutes]      0 = immediate
 * @property {string[]} triggers                Keywords for agent routing
 * @property {number[]} trs_categories          Subset of [1,2,3,4]
 * @property {string[]} hhsc_rule_refs
 * @property {string[]} accreditations
 * @property {boolean} ccs_impacted
 * @property {string[]} related_sop_ids
 * @property {string[]} required_forms
 * @property {string | null} [last_reviewed]
 * @property {string | null} [next_review_due]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string | null} [created_by]
 * @property {string | null} [updated_by]
 */

/**
 * @typedef {Object} SopVersion
 * @property {string} id
 * @property {string} sop_id
 * @property {string} version
 * @property {string} body_markdown
 * @property {string | null} [changed_by]
 * @property {string | null} [change_summary]
 * @property {'manual' | 'ai_chat' | 'submission' | 'seed' | null} [change_source]
 * @property {string} created_at
 */

/**
 * @typedef {
 *   'pending' | 'approved' | 'rejected' | 'needs_info'
 * } SopSubmissionStatus
 */

/**
 * @typedef {Object} SopSubmission
 * @property {string} id
 * @property {string} sop_id
 * @property {string | null} [submitted_by]
 * @property {string} proposed_change
 * @property {string | null} [proposed_body_markdown]
 * @property {SopSubmissionStatus} status
 * @property {string | null} [reviewer_notes]
 * @property {string | null} [reviewed_by]
 * @property {string | null} [reviewed_at]
 * @property {string} created_at
 */

// Pure types module — no runtime exports. ESM requires at least one statement
// for the module to be importable; this comment alone is fine since JSDoc
// imports (`import('./sopTypes').Sop`) resolve against the file path, not
// against named exports.
export {}
