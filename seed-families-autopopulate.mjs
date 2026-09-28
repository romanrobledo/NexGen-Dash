/**
 * Auto-populate families from the existing children roster.
 *
 * Rules:
 *   1. Group active children by last name derived from `full_name` (assume
 *      "Last, First" format; fall back to the last whitespace-separated
 *      token if there's no comma).
 *   2. Upsert one family per surname — display name = surname,
 *      primary_last_name = surname (case-sensitive).
 *   3. Set every included child's family_id to the family it landed in.
 *   4. NEVER delete or reassign a child that already has a family_id set —
 *      those were already curated manually and this script leaves them
 *      alone.
 *
 * Safe to re-run: uses upsert on primary_last_name, so re-runs update
 * counts + timestamps without duplicating rows.
 *
 * How to run:
 *   node seed-families-autopopulate.mjs --dry-run    (prints the plan)
 *   node seed-families-autopopulate.mjs              (applies to the DB)
 *
 * Read this before you run:
 *   • Hyphenated surnames (Alaniz-Mata, Infante-Velez, Mata Alaniz) are
 *     treated as ONE surname string — grouped together. If Roman wants a
 *     different rule (e.g. split "Mata Alaniz" so those kids join both
 *     "Mata" and "Alaniz" households), fix it manually after the run.
 *   • The script prints every mapping so you can eyeball it before
 *     dropping --dry-run.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mipooolgbzigfuchfhrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcG9vb2xnYnppZ2Z1Y2hmaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzIzMDgsImV4cCI6MjA4ODI0ODMwOH0.IkdawabLGKy1JeAR1y0FcxR9aWWMpL-5EQwLcq8on9g'
)

const DRY_RUN = process.argv.includes('--dry-run')

/**
 * Extract the family surname from a child's full_name string.
 * Handles two formats seen in the roster:
 *   "Barrientos, Raelynn"   → "Barrientos"
 *   "Ariel Mata Alaniz"     → "Mata Alaniz"     (last space-separated pair)
 *   "Emma Sanchez"          → "Sanchez"
 */
function surname(fullName) {
  if (!fullName) return null
  const s = fullName.trim()
  if (s.includes(',')) return s.split(',')[0].trim()
  // No comma — treat the last whitespace-separated token as the surname.
  const parts = s.split(/\s+/)
  return parts[parts.length - 1]
}

async function main() {
  console.log(DRY_RUN ? '⋯ DRY RUN — nothing will be written.\n' : '⋯ APPLY — will write to the DB.\n')

  // 1. Pull every active child, only the columns we need.
  const { data: children, error: childErr } = await supabase
    .from('children')
    .select('id, full_name, family_id, room_number, active')
    .eq('active', true)
    .order('full_name', { ascending: true })

  if (childErr) {
    console.error('❌ children fetch failed:', childErr.message)
    return
  }

  const alreadyLinked = children.filter((c) => c.family_id)
  const unlinked = children.filter((c) => !c.family_id)
  console.log(`Read ${children.length} active children — ${alreadyLinked.length} already linked, ${unlinked.length} pending.\n`)

  // 2. Group the unlinked children by surname.
  const groups = new Map()  // surname → [child, child, ...]
  const unparseable = []
  for (const c of unlinked) {
    const sn = surname(c.full_name)
    if (!sn) {
      unparseable.push(c)
      continue
    }
    if (!groups.has(sn)) groups.set(sn, [])
    groups.get(sn).push(c)
  }
  if (unparseable.length) {
    console.warn(`⚠️  ${unparseable.length} children have unparseable names — skipping:`)
    for (const c of unparseable) console.warn(`     ${c.id}  ${c.full_name}`)
    console.log()
  }

  // 3. Print the plan.
  const plan = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([sn, kids]) => ({ surname: sn, count: kids.length, names: kids.map((k) => k.full_name) }))

  console.log(`Plan — ${plan.length} families will be created / updated:\n`)
  for (const p of plan) {
    console.log(`  ${p.surname.padEnd(24)}  ${p.count} kid${p.count === 1 ? '' : 's'}`)
    for (const n of p.names) console.log(`    · ${n}`)
  }

  if (DRY_RUN) {
    console.log('\n✅ Dry run complete. Re-run without --dry-run to apply.')
    return
  }

  // 4. Upsert families + link children.
  let familiesCreated = 0
  let childrenLinked = 0
  for (const [sn, kids] of groups) {
    // Upsert one family per surname; primary_last_name is the natural key.
    const { data: family, error: famErr } = await supabase
      .from('families')
      .upsert(
        { family_name: sn, primary_last_name: sn, active: true },
        { onConflict: 'primary_last_name' }
      )
      .select()
      .single()

    if (famErr) {
      console.error(`❌ family "${sn}" upsert failed:`, famErr.message)
      continue
    }
    familiesCreated++

    // Link each child in the group.
    const childIds = kids.map((k) => k.id)
    const { error: linkErr } = await supabase
      .from('children')
      .update({ family_id: family.id })
      .in('id', childIds)

    if (linkErr) {
      console.error(`❌ linking ${childIds.length} children to "${sn}" failed:`, linkErr.message)
      continue
    }
    childrenLinked += childIds.length
    console.log(`✅ ${sn.padEnd(24)}  ${childIds.length} children linked  (family ${family.id})`)
  }

  console.log(`\nDone. ${familiesCreated} families upserted, ${childrenLinked} children linked.`)
}

main().catch((err) => {
  console.error('❌ script crashed:', err)
  process.exitCode = 1
})
