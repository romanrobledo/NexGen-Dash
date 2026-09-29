/**
 * Registry of offer-section types.
 *
 * Every section stored in offers.sections is a jsonb object with a
 * discriminator `type` field plus type-specific properties. The DB does
 * not enforce shape — this file is the source of truth for what the app
 * accepts. Renderer and editor components look up the type here.
 *
 * To add a new section type:
 *   1. Add an entry to SECTION_TYPES (key, label, description, default())
 *   2. Add a renderer branch in OfferSectionRenderer.jsx
 *   3. Add an editor branch in OfferSectionEditor.jsx
 *
 * Unknown types render as a small "Unknown section: <type>" fallback so
 * an old jsonb blob never crashes the page.
 */

export const SECTION_TYPES = [
  {
    key: 'stance',
    label: 'Stance',
    description: 'Long-form narrative + optional key/value facts sidebar.',
    default: () => ({
      type: 'stance',
      heading: 'The stance',
      paragraphs: [''],
      facts: [{ label: '', value: '' }],
    }),
  },
  {
    key: 'bullets',
    label: 'Bullet list',
    description: 'Heading, optional intro line, bullet list of deliverables.',
    default: () => ({
      type: 'bullets',
      heading: 'What is included',
      intro: '',
      items: [''],
    }),
  },
  {
    key: 'chapters',
    label: 'Numbered chapters',
    description: 'Ordered chapters with a number, title, and bullets.',
    default: () => ({
      type: 'chapters',
      heading: 'The Operating Book',
      intro: '',
      items: [
        { number: '01', title: '', poweredBy: '', tagline: '', bullets: [''] },
      ],
    }),
  },
  {
    key: 'streams',
    label: 'Parallel streams',
    description: 'Two or more work streams running in parallel (like a pilot).',
    default: () => ({
      type: 'streams',
      heading: 'The pilot',
      intro: '',
      items: [{ name: '', style: '', bullets: [''] }],
    }),
  },
  {
    key: 'terms',
    label: 'Terms blocks',
    description: 'Priced terms with a headline, amount, unit note, and bullets.',
    default: () => ({
      type: 'terms',
      heading: 'Terms',
      intro: '',
      blocks: [{ headline: '', amount: '', unitNote: '', bullets: [''] }],
    }),
  },
  {
    key: 'table',
    label: 'Comparison table',
    description: 'Rows and columns for price / value / feature comparisons.',
    default: () => ({
      type: 'table',
      heading: '',
      intro: '',
      columns: ['', '', ''],
      rows: [['', '', '']],
      footer: '',
    }),
  },
  {
    key: 'playbook',
    label: 'Playbook (moment / say)',
    description: 'Left column: the moment. Right column: what to say.',
    default: () => ({
      type: 'playbook',
      heading: 'How to use this in the room',
      intro: '',
      rows: [{ moment: '', say: '' }],
    }),
  },
  {
    key: 'notes',
    label: 'Notes / open items',
    description: 'Bullet list of guardrails, open items, or fix-first notes.',
    default: () => ({
      type: 'notes',
      heading: 'Notes',
      items: [''],
    }),
  },
  {
    key: 'provenance',
    label: 'Provenance footer',
    description: 'Small footer explaining source, date, or caveats.',
    default: () => ({
      type: 'provenance',
      text: '',
    }),
  },
]

export const SECTION_TYPES_BY_KEY = Object.fromEntries(
  SECTION_TYPES.map(t => [t.key, t])
)

export function defaultSectionOfType(key) {
  return SECTION_TYPES_BY_KEY[key]?.default() || { type: key }
}

export function labelForType(key) {
  return SECTION_TYPES_BY_KEY[key]?.label || key
}

/**
 * Normalize a raw jsonb section from DB into what the renderers expect.
 * Fills in missing arrays with [] so components can iterate without
 * defensive checks.
 */
export function normalizeSection(raw) {
  if (!raw || typeof raw !== 'object') return null
  const type = String(raw.type || '').trim()
  const base = { ...raw, type }
  switch (type) {
    case 'stance':
      return {
        ...base,
        heading: str(raw.heading),
        paragraphs: strList(raw.paragraphs),
        facts: kvList(raw.facts),
      }
    case 'bullets':
      return {
        ...base,
        heading: str(raw.heading),
        intro: str(raw.intro),
        items: strList(raw.items),
      }
    case 'chapters':
      return {
        ...base,
        heading: str(raw.heading),
        intro: str(raw.intro),
        items: (Array.isArray(raw.items) ? raw.items : []).map(it => ({
          number:    str(it?.number),
          title:     str(it?.title),
          poweredBy: str(it?.poweredBy),
          tagline:   str(it?.tagline),
          bullets:   strList(it?.bullets),
          footer:    str(it?.footer),
        })),
      }
    case 'streams':
      return {
        ...base,
        heading: str(raw.heading),
        intro:   str(raw.intro),
        items: (Array.isArray(raw.items) ? raw.items : []).map(it => ({
          name:    str(it?.name),
          style:   str(it?.style),
          bullets: strList(it?.bullets),
        })),
      }
    case 'terms':
      return {
        ...base,
        heading: str(raw.heading),
        intro:   str(raw.intro),
        blocks: (Array.isArray(raw.blocks) ? raw.blocks : []).map(b => ({
          headline: str(b?.headline),
          amount:   str(b?.amount),
          unitNote: str(b?.unitNote),
          bullets:  strList(b?.bullets),
        })),
      }
    case 'table': {
      const columns = strList(raw.columns)
      const rows = Array.isArray(raw.rows)
        ? raw.rows.map(r => (Array.isArray(r) ? r.map(str) : []))
        : []
      return { ...base, heading: str(raw.heading), intro: str(raw.intro), columns, rows, footer: str(raw.footer) }
    }
    case 'playbook':
      return {
        ...base,
        heading: str(raw.heading),
        intro:   str(raw.intro),
        rows: (Array.isArray(raw.rows) ? raw.rows : []).map(r => ({
          moment: str(r?.moment),
          say:    str(r?.say),
        })),
      }
    case 'notes':
      return {
        ...base,
        heading: str(raw.heading),
        items: strList(raw.items),
      }
    case 'provenance':
      return { ...base, text: str(raw.text) }
    default:
      return base   // unknown — renderer falls back gracefully
  }
}

// ── tiny helpers ────────────────────────────────────────────────────────────
function str(v) { return v == null ? '' : String(v) }
function strList(v) {
  return Array.isArray(v) ? v.map(str).filter(s => s.length > 0) : []
}
function kvList(v) {
  if (!Array.isArray(v)) return []
  return v
    .map(row => ({ label: str(row?.label), value: str(row?.value) }))
    .filter(row => row.label || row.value)
}
