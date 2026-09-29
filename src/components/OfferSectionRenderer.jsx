/**
 * Read-only renderers for every offer-section type.
 *
 * One switch, one component per type. Kept in a single file so a future
 * new section type touches this file, the editor file, and the type
 * registry — nowhere else. Unknown types render a small placeholder so
 * an old jsonb blob never crashes the detail page.
 */

export default function OfferSectionRenderer({ section }) {
  if (!section || !section.type) return null
  switch (section.type) {
    case 'stance':     return <StanceSection     s={section} />
    case 'bullets':    return <BulletsSection    s={section} />
    case 'chapters':   return <ChaptersSection   s={section} />
    case 'streams':    return <StreamsSection    s={section} />
    case 'terms':      return <TermsSection      s={section} />
    case 'table':      return <TableSection      s={section} />
    case 'playbook':   return <PlaybookSection   s={section} />
    case 'notes':      return <NotesSection      s={section} />
    case 'provenance': return <ProvenanceSection s={section} />
    default: return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-500 text-xs p-3">
        Unknown section type: <code className="text-gray-800">{section.type}</code>
      </div>
    )
  }
}

// ── stance ────────────────────────────────────────────────────────────────
function StanceSection({ s }) {
  const hasFacts = (s.facts || []).length > 0
  return (
    <section className="bg-white rounded-2xl border-l-4 border-l-indigo-600 border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900 mb-3">{s.heading}</h2>}
      <div className={`grid grid-cols-1 ${hasFacts ? 'md:grid-cols-[1fr_320px]' : ''} gap-6`}>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          {(s.paragraphs || []).map((p, i) => (
            <p key={i} className="whitespace-pre-wrap">{p}</p>
          ))}
        </div>
        {hasFacts && (
          <dl className="space-y-0.5 self-start">
            {s.facts.map((f, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                <dt className="text-sm text-gray-700">{f.label}</dt>
                <dd className="text-sm font-semibold text-gray-900 text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  )
}

// ── bullets ───────────────────────────────────────────────────────────────
function BulletsSection({ s }) {
  return (
    <section className="bg-white rounded-2xl border-l-4 border-l-blue-500 border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900 mb-1.5">{s.heading}</h2>}
      {s.intro && <p className="text-sm text-gray-600 mb-3">{s.intro}</p>}
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-800">
        {(s.items || []).map((line, i) => (
          <li key={i} className="whitespace-pre-wrap">{line}</li>
        ))}
      </ul>
    </section>
  )
}

// ── chapters ──────────────────────────────────────────────────────────────
function ChaptersSection({ s }) {
  return (
    <section className="space-y-4">
      <header>
        {s.heading && <h2 className="text-2xl font-bold text-gray-900">{s.heading}</h2>}
        {s.intro && <p className="text-sm text-gray-600 mt-1">{s.intro}</p>}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(s.items || []).map((c, i) => (
          <article key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {c.number && (
                  <span className="text-xs font-mono font-bold text-indigo-600 shrink-0">{c.number}</span>
                )}
                {c.title && <h3 className="text-lg font-bold text-gray-900 truncate">{c.title}</h3>}
              </div>
              {c.poweredBy && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 shrink-0">
                  Powered by {c.poweredBy}
                </span>
              )}
            </div>
            {c.tagline && <p className="text-sm text-gray-700 mt-1.5">{c.tagline}</p>}
            {(c.bullets || []).length > 0 && (
              <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-gray-700">
                {c.bullets.map((line, k) => <li key={k} className="whitespace-pre-wrap">{line}</li>)}
              </ul>
            )}
            {c.footer && <p className="text-xs text-gray-500 mt-3 italic">{c.footer}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}

// ── streams ───────────────────────────────────────────────────────────────
function StreamsSection({ s }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900">{s.heading}</h2>}
      {s.intro && <p className="text-sm text-gray-600 mt-1">{s.intro}</p>}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(s.items || []).map((it, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            {it.name && <div className="font-bold text-gray-900">{it.name}</div>}
            {it.style && <div className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{it.style}</div>}
            {(it.bullets || []).length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
                {it.bullets.map((b, k) => <li key={k} className="whitespace-pre-wrap">{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── terms ─────────────────────────────────────────────────────────────────
function TermsSection({ s }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900">{s.heading}</h2>}
      {s.intro && <p className="text-sm text-gray-600 mt-1">{s.intro}</p>}
      <div className="mt-4 space-y-4">
        {(s.blocks || []).map((b, i) => (
          <div key={i} className="border-t border-gray-100 pt-4 first:border-0 first:pt-0">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="text-base font-bold text-gray-900">{b.headline}</h3>
              {b.amount && (
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{b.amount}</div>
                  {b.unitNote && <div className="text-xs text-gray-500">{b.unitNote}</div>}
                </div>
              )}
            </div>
            {(b.bullets || []).length > 0 && (
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-700">
                {b.bullets.map((line, k) => <li key={k} className="whitespace-pre-wrap">{line}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

// ── table ─────────────────────────────────────────────────────────────────
function TableSection({ s }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900">{s.heading}</h2>}
      {s.intro && <p className="text-sm text-gray-600 mt-1">{s.intro}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm border-t border-gray-100">
          {(s.columns || []).length > 0 && (
            <thead>
              <tr>
                {s.columns.map((col, i) => (
                  <th key={i}
                      className={`px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-100 ${
                        i === s.columns.length - 1 ? 'text-right' : ''
                      }`}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {(s.rows || []).map((row, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                {row.map((cell, j) => (
                  <td key={j}
                      className={`px-3 py-2 align-top ${j === 0 ? 'font-medium text-gray-900' : 'text-gray-700'} ${
                        j === row.length - 1 ? 'text-right' : ''
                      }`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {s.footer && <p className="text-xs text-gray-500 mt-3">{s.footer}</p>}
    </section>
  )
}

// ── playbook ──────────────────────────────────────────────────────────────
function PlaybookSection({ s }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {s.heading && <h2 className="text-xl font-bold text-gray-900">{s.heading}</h2>}
      {s.intro && <p className="text-sm text-gray-600 mt-1">{s.intro}</p>}
      <div className="mt-4 divide-y divide-gray-100">
        {(s.rows || []).map((r, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 md:gap-6 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{r.moment}</div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap">{r.say}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── notes ─────────────────────────────────────────────────────────────────
function NotesSection({ s }) {
  return (
    <section className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
      {s.heading && <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-2">{s.heading}</h2>}
      <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
        {(s.items || []).map((line, i) => (
          <li key={i} className="whitespace-pre-wrap">{line}</li>
        ))}
      </ul>
    </section>
  )
}

// ── provenance ────────────────────────────────────────────────────────────
function ProvenanceSection({ s }) {
  return (
    <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4 whitespace-pre-wrap">
      {s.text}
    </p>
  )
}
