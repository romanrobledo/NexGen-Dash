import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/**
 * Shared renderer for structured content pages (Playbook, Revenue
 * Framework, and whatever new content sections come next). Consumers
 * pass a single `entry` object — see the schema below — and the view
 * lays out the intro banner + a stack of sections, each with optional
 * label chip, heading, body, cards grid, steps list, or table.
 *
 * If `entry` is null, renders a friendly not-found panel so the router
 * still matches the route rather than showing a blank screen.
 *
 * @typedef {Object} Card
 * @property {string} title
 * @property {string} body
 * @property {string} [example]   Italic "Example:" line under body
 *
 * @typedef {Object} TableBlock
 * @property {string[]}   columns
 * @property {string[][]} rows
 *
 * @typedef {Object} Section
 * @property {string}      [label]     Small caps chip (FRAMEWORK, SYSTEM, ...)
 * @property {string}      [heading]
 * @property {string}      [body]
 * @property {Card[]}      [cards]
 * @property {string[]}    [steps]     Numbered list (renders 1-N in circles)
 * @property {TableBlock}  [table]
 *
 * @typedef {Object} Entry
 * @property {string}    title
 * @property {string}    [tagline]
 * @property {Section[]} sections
 *
 * @param {{ entry: Entry | null, notFoundUrl?: string }} props
 */
export default function RichContentView({ entry, notFoundUrl }) {
  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">
          No content is wired at{' '}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
            {notFoundUrl || 'this URL'}
          </code>
          .
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <Header title={entry.title} tagline={entry.tagline} />
      {entry.sections.map((section, i) => (
        <Section key={i} section={section} />
      ))}
    </div>
  )
}

function Header({ title, tagline }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
      {tagline && (
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">{tagline}</p>
      )}
    </div>
  )
}

/**
 * A single Section may carry any subset of label / heading / body / cards
 * / steps / table. Render only what's present so pages that skip a piece
 * don't leak empty markup.
 */
function Section({ section }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
      {section.label && <LabelChip label={section.label} />}
      {section.heading && (
        <h2 className="text-lg font-bold text-gray-900">{section.heading}</h2>
      )}
      {section.body && (
        <p className="text-sm text-gray-600 leading-relaxed">{section.body}</p>
      )}
      {section.cards && <Cards cards={section.cards} />}
      {section.steps && <Steps steps={section.steps} />}
      {section.table && <TableBlock table={section.table} />}
    </section>
  )
}

function LabelChip({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wider uppercase">
      {label}
    </span>
  )
}

function Cards({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-white hover:border-gray-300 transition"
        >
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">{card.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed">{card.body}</p>
          {card.example && (
            <p className="text-xs text-gray-500 italic leading-relaxed mt-2 pt-2 border-t border-gray-200">
              <span className="not-italic font-semibold text-gray-600">Example:</span>{' '}
              {card.example}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Numbered vertical list. Renders each step with a circled number on the
 * left, so a "7 steps to..." block reads as a checklist rather than a
 * bulleted mush.
 */
function Steps({ steps }) {
  return (
    <ol className="space-y-2">
      {steps.map((text, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-sm text-gray-700 leading-relaxed pt-0.5">
            {text}
          </span>
        </li>
      ))}
    </ol>
  )
}

function TableBlock({ table }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {table.columns.map((col, i) => (
              <th
                key={i}
                className="text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-xs text-gray-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
