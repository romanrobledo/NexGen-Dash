// Single source of truth for the rooms shown on the Capacity dashboard.
//
// Edit this list to change the tile grid at /capacity. The room `id` is what
// appears in the URL (/capacity/:roomId) and what the future
// `daily_room_assignments` Supabase rows will reference — so once data
// starts flowing, renaming an id has migration cost. Pick slugs you'll
// stick with.
//
// `targetRatio` follows Texas childcare regulation conventions:
//   1 teacher per N children. So an infant room with `targetRatio: 4`
//   means a teacher can supervise at most 4 infants at once.
//   `maxCapacity` is the licensed max headcount, regardless of teacher count.
//
// Placeholder names + ratios are my best guess based on a typical TRS-rated
// Texas childcare center. Tell me the real list and I'll swap them in.
//
// `accent` keys map to the COLOR_THEMES object below — tiles get a
// left-border + icon color from this so the grid stays visually scannable
// by age group.

/**
 * @typedef {Object} Room
 * @property {string}  id              URL-safe slug
 * @property {string}  name            Display name
 * @property {string}  ageRange        Human-readable age band, e.g. "0–11 mo"
 * @property {number|null} targetRatio Max children per teacher (null = N/A)
 * @property {number|null} maxCapacity Licensed max headcount (null = N/A)
 * @property {string}  iconName        Key into ICONS map below
 * @property {string}  accent          Key into COLOR_THEMES map below
 * @property {string}  [note]          Optional one-liner shown under the title
 */

/** @type {Room[]} */
export const ROOMS = [
  {
    id: 'infant',
    name: 'Infant Room',
    ageRange: '0–11 mo',
    targetRatio: 4,
    maxCapacity: 8,
    iconName: 'Baby',
    accent: 'pink',
  },
  {
    id: 'older-infant',
    name: 'Older Infant Room',
    ageRange: '12–17 mo',
    targetRatio: 5,
    maxCapacity: 10,
    iconName: 'Baby',
    accent: 'rose',
  },
  {
    id: 'young-toddler-a',
    name: 'Young Toddler Room A',
    ageRange: '18–23 mo',
    targetRatio: 9,
    maxCapacity: 18,
    iconName: 'Smile',
    accent: 'fuchsia',
  },
  {
    id: 'young-toddler-b',
    name: 'Young Toddler Room B',
    ageRange: '18–23 mo',
    targetRatio: 9,
    maxCapacity: 18,
    iconName: 'Smile',
    accent: 'purple',
  },
  {
    id: 'toddler-a',
    name: 'Toddler Room A',
    ageRange: '24–35 mo',
    targetRatio: 11,
    maxCapacity: 22,
    iconName: 'Smile',
    accent: 'amber',
  },
  {
    id: 'toddler-b',
    name: 'Toddler Room B',
    ageRange: '24–35 mo',
    targetRatio: 11,
    maxCapacity: 22,
    iconName: 'Smile',
    accent: 'yellow',
  },
  {
    id: 'pre-k-3',
    name: 'Pre-K 3 Room',
    ageRange: '3 yr',
    targetRatio: 15,
    maxCapacity: 30,
    iconName: 'BookOpen',
    accent: 'lime',
  },
  {
    id: 'pre-k-4-a',
    name: 'Pre-K 4 Room A',
    ageRange: '4 yr',
    targetRatio: 18,
    maxCapacity: 36,
    iconName: 'BookOpen',
    accent: 'emerald',
  },
  {
    id: 'pre-k-4-b',
    name: 'Pre-K 4 Room B',
    ageRange: '4 yr',
    targetRatio: 18,
    maxCapacity: 36,
    iconName: 'BookOpen',
    accent: 'teal',
  },
  {
    id: 'kindergarten',
    name: 'Kindergarten Room',
    ageRange: '5 yr',
    targetRatio: 22,
    maxCapacity: 26,
    iconName: 'GraduationCap',
    accent: 'cyan',
  },
  {
    id: 'pre-school',
    name: 'Pre-School Room',
    ageRange: '3–5 yr',
    targetRatio: 18,
    maxCapacity: 36,
    iconName: 'GraduationCap',
    accent: 'sky',
  },
  {
    id: 'after-school',
    name: 'After School',
    ageRange: '5–12 yr',
    targetRatio: 26,
    maxCapacity: 30,
    iconName: 'Sun',
    accent: 'indigo',
    note: 'Extended-day program for school-aged children.',
  },
  {
    id: 'gym',
    name: 'Gym',
    ageRange: 'All ages',
    targetRatio: null,
    maxCapacity: null,
    iconName: 'Dumbbell',
    accent: 'orange',
    note: 'Shared facility — structured play and movement.',
  },
]

// Color themes per accent key. Two classes per theme:
//   border — used for the tile's colored left border
//   icon   — bg + text combo for the icon chip in the tile header
// Adding a new accent → add a new key here and use it in a room entry above.
export const COLOR_THEMES = {
  pink:     { border: 'border-l-pink-400',     icon: 'bg-pink-100 text-pink-600' },
  rose:     { border: 'border-l-rose-400',     icon: 'bg-rose-100 text-rose-600' },
  fuchsia:  { border: 'border-l-fuchsia-400',  icon: 'bg-fuchsia-100 text-fuchsia-600' },
  purple:   { border: 'border-l-purple-400',   icon: 'bg-purple-100 text-purple-600' },
  amber:    { border: 'border-l-amber-400',    icon: 'bg-amber-100 text-amber-600' },
  yellow:   { border: 'border-l-yellow-400',   icon: 'bg-yellow-100 text-yellow-700' },
  lime:     { border: 'border-l-lime-400',     icon: 'bg-lime-100 text-lime-700' },
  emerald:  { border: 'border-l-emerald-400',  icon: 'bg-emerald-100 text-emerald-600' },
  teal:     { border: 'border-l-teal-400',     icon: 'bg-teal-100 text-teal-600' },
  cyan:     { border: 'border-l-cyan-400',     icon: 'bg-cyan-100 text-cyan-600' },
  sky:      { border: 'border-l-sky-400',      icon: 'bg-sky-100 text-sky-600' },
  indigo:   { border: 'border-l-indigo-400',   icon: 'bg-indigo-100 text-indigo-600' },
  orange:   { border: 'border-l-orange-400',   icon: 'bg-orange-100 text-orange-600' },
}

/**
 * Look up a single room by its id. Returns null if the id doesn't exist —
 * the detail page renders an empty state in that case rather than crashing.
 * @param {string} id
 * @returns {Room | null}
 */
export function getRoomById(id) {
  return ROOMS.find((r) => r.id === id) || null
}
