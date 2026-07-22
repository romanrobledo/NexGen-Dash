// Classroom color palette used by the Facility Map + Community tiles.
//
// The room roster itself used to live in this file as a hardcoded array.
// It now lives in Supabase (`public.classrooms` + `public.classroom_enrollment`
// view) and is fetched by `useClassrooms()` — see src/hooks/useClassrooms.js.
// Editing the roster now happens in Supabase / via the Google Sheet → n8n
// sync, not in code.
//
// This file kept for one thing only: the shared color-theme lookup used by
// tile components. Each classroom row from Supabase carries an `accent`
// string (e.g. "pink", "indigo") — components look that up here to get the
// matching border / icon / progress-bar classes.
//
// Add a new accent → add a new key here AND make sure the value is
// present in `classrooms.accent` for at least one row (otherwise no tile
// will use it).

/** @type {Record<string, { border: string, icon: string, bar: string }>} */
export const COLOR_THEMES = {
  pink:     { border: 'border-l-pink-400',     icon: 'bg-pink-100 text-pink-600',       bar: 'bg-pink-500'    },
  rose:     { border: 'border-l-rose-400',     icon: 'bg-rose-100 text-rose-600',       bar: 'bg-rose-500'    },
  fuchsia:  { border: 'border-l-fuchsia-400',  icon: 'bg-fuchsia-100 text-fuchsia-600', bar: 'bg-fuchsia-500' },
  purple:   { border: 'border-l-purple-400',   icon: 'bg-purple-100 text-purple-600',   bar: 'bg-purple-500'  },
  amber:    { border: 'border-l-amber-400',    icon: 'bg-amber-100 text-amber-600',     bar: 'bg-amber-500'   },
  yellow:   { border: 'border-l-yellow-400',   icon: 'bg-yellow-100 text-yellow-700',   bar: 'bg-yellow-500'  },
  lime:     { border: 'border-l-lime-400',     icon: 'bg-lime-100 text-lime-700',       bar: 'bg-lime-500'    },
  emerald:  { border: 'border-l-emerald-400',  icon: 'bg-emerald-100 text-emerald-600', bar: 'bg-emerald-500' },
  teal:     { border: 'border-l-teal-400',     icon: 'bg-teal-100 text-teal-600',       bar: 'bg-teal-500'    },
  cyan:     { border: 'border-l-cyan-400',     icon: 'bg-cyan-100 text-cyan-600',       bar: 'bg-cyan-500'    },
  sky:      { border: 'border-l-sky-400',      icon: 'bg-sky-100 text-sky-600',         bar: 'bg-sky-500'     },
  indigo:   { border: 'border-l-indigo-400',   icon: 'bg-indigo-100 text-indigo-600',   bar: 'bg-indigo-500'  },
  orange:   { border: 'border-l-orange-400',   icon: 'bg-orange-100 text-orange-600',   bar: 'bg-orange-500'  },
}
