import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'

/**
 * Renders an SOP's `body_markdown` with GitHub-Flavored Markdown support
 * (tables, strikethrough, task lists, autolinks).
 *
 * Styling choices:
 *   - We deliberately don't install the `@tailwindcss/typography` plugin just
 *     for this component. Instead we hand-tune the markdown element classes
 *     via react-markdown's `components` prop. Keeps the bundle slim and
 *     keeps the prose looking native to the rest of the app (Inter font,
 *     gray-900 body text, purple links matching `--color-primary` = #7c3aed).
 *   - Tables scroll horizontally on mobile via a wrapping div so a wide
 *     compliance matrix doesn't force the whole page to scroll.
 *   - External links open in a new tab with `noopener noreferrer`. Internal
 *     anchors (starting with `#` or `/`) stay in-tab.
 *
 * Empty state:
 *   When `body_markdown` is empty/whitespace, we render the "not drafted
 *   yet" message from the brief instead of a silent blank section. That's
 *   important during the content-authoring push — 438 SOPs won't all be
 *   drafted day one.
 *
 * @param {{ markdown: string | null | undefined }} props
 */
export default function SopRenderer({ markdown }) {
  const hasContent = typeof markdown === 'string' && markdown.trim().length > 0

  if (!hasContent) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">
          This SOP hasn't been drafted yet
        </p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Once a curator adds the procedure content, it'll show up here with full
          Markdown formatting.
        </p>
      </div>
    )
  }

  return (
    <div className="text-[15px] text-gray-800 leading-relaxed">
      {/* rehype-raw lets the curator use raw HTML in an SOP body — needed for
          things like <details><summary> collapsible blocks that plain GFM
          doesn't express. Safe here because `body_markdown` is only writable
          by founder/operator/director roles (RLS on `sops` enforces it),
          there's no user-generated content flowing into this renderer, and
          the whole point is giving curators a richer toolkit. If we later
          want belt-and-suspenders sanitation, layer rehype-sanitize in front
          of rehype-raw and whitelist the tags we use (details, summary,
          tables, etc.). */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={MARKDOWN_COMPONENTS}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

// ─── Component overrides ────────────────────────────────────────────────────
// Tailwind-classes-only, no external CSS. These live here (not in
// index.css) so the SOP styling can't accidentally leak into other
// Markdown rendering we add elsewhere.

/** @type {import('react-markdown').Components} */
const MARKDOWN_COMPONENTS = {
  h1: (props) => (
    <h1
      className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-xl font-bold text-gray-900 mt-7 mb-3 first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-lg font-semibold text-gray-900 mt-6 mb-2 first:mt-0"
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="text-base font-semibold text-gray-900 mt-5 mb-2 first:mt-0"
      {...props}
    />
  ),
  p: (props) => <p className="my-3 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-3 pl-6 list-disc space-y-1" {...props} />,
  ol: (props) => <ol className="my-3 pl-6 list-decimal space-y-1" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="my-4 border-l-4 border-[#7c3aed]/40 bg-[#7c3aed]/5 px-4 py-2 text-gray-700 italic rounded-r"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...rest }) => {
    if (inline) {
      return (
        <code
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[0.9em] font-mono"
          {...rest}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className={`block font-mono text-[13px] leading-relaxed ${className || ''}`}
        {...rest}
      >
        {children}
      </code>
    )
  },
  pre: (props) => (
    <pre
      className="my-4 bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto"
      {...props}
    />
  ),
  // Link routing strategy:
  //   - href starts with "/" and NOT "//"       → React Router <Link>, no page reload
  //   - href starts with "#"                    → plain <a> (in-page anchor)
  //   - anything else (https://…, mailto:, etc.) → plain <a target="_blank" rel="noopener">
  //
  // "//example.com" is protocol-relative = external, so we specifically exclude
  // the "//" prefix from the internal-link branch. Falsy/non-string hrefs fall
  // through as plain anchors so react-markdown's default markup still shows.
  a: ({ href, children, ...rest }) => {
    const LINK_CLASS =
      'text-[#7c3aed] hover:text-[#5b21b6] underline underline-offset-2 decoration-[#7c3aed]/30 hover:decoration-[#5b21b6]/50'

    const isInternalRoute =
      typeof href === 'string' &&
      href.startsWith('/') &&
      !href.startsWith('//')

    if (isInternalRoute) {
      return (
        <Link to={href} className={LINK_CLASS} {...rest}>
          {children}
        </Link>
      )
    }

    const isAnchor = typeof href === 'string' && href.startsWith('#')
    const isExternal = !isAnchor && typeof href === 'string'
    const externalProps = isExternal
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {}

    return (
      <a
        href={href}
        className={LINK_CLASS}
        {...externalProps}
        {...rest}
      >
        {children}
      </a>
    )
  },
  hr: () => <hr className="my-6 border-gray-200" />,
  // Wrap tables in a scroll container so wide tables don't overflow the
  // page on phones. Also round the corners and ensure a visible border.
  table: (props) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-gray-50" {...props} />,
  tbody: (props) => <tbody className="divide-y divide-gray-100" {...props} />,
  tr: (props) => <tr {...props} />,
  th: (props) => (
    <th
      className="text-left font-semibold text-gray-700 px-3 py-2 border-b border-gray-200"
      {...props}
    />
  ),
  td: (props) => <td className="px-3 py-2 align-top" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-gray-900" {...props} />
  ),
  em: (props) => <em className="italic" {...props} />,
  img: ({ alt, ...rest }) => (
    <img
      alt={alt || ''}
      className="my-4 rounded-xl border border-gray-200 max-w-full"
      {...rest}
    />
  ),
  // <details> + <summary> — used by curators for collapsible sections like
  // agent payloads, long JSON examples, or optional appendices. Browser
  // defaults are ugly, so we give them a gray card treatment. The default
  // triangle marker stays (it's the most accessible open/closed indicator);
  // we just add a subtle hover state on the summary so it reads as clickable.
  details: (props) => (
    <details
      className="my-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
      {...props}
    />
  ),
  summary: (props) => (
    <summary
      className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/40 rounded"
      {...props}
    />
  ),
}
