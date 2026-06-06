import { getSopStatusInfo } from '../lib/sopStatus'

/**
 * Compact pill showing an SOP's lifecycle status.
 *
 * Pill design borrowed from the same chip pattern used elsewhere in the
 * app (gray border, soft tinted bg, dot indicator). All styling derives
 * from `sopStatus.js`, so palette changes happen in one place.
 *
 * Sizes:
 *   - sm (default) — used inline next to a list-item title
 *   - md          — used on the detail page header so it reads at a glance
 *
 * @param {{ status: string | null | undefined, size?: 'sm' | 'md', className?: string }} props
 */
export default function SopStatusChip({ status, size = 'sm', className = '' }) {
  const info = getSopStatusInfo(status)
  const sizeClass =
    size === 'md'
      ? 'text-xs px-2.5 py-1'
      : 'text-[11px] px-2 py-0.5'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${sizeClass} ${info.chipClass} ${className}`}
      title={info.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`} aria-hidden="true" />
      {info.label}
    </span>
  )
}
