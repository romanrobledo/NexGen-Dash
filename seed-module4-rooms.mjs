/**
 * Seed script — adds "Module 4 - Room Training" to the Onboarding
 * course outline with one placeholder subject per classroom.
 *
 * Roman asked for the 7 rooms (Infant → Afterschool) to appear in the
 * outline underneath Modules 1, 2, and 3. Placeholder content only —
 * no topics or steps yet. Each subject renders as a collapsed row in
 * the outline that says "0 steps" until content is added.
 *
 * How to run:
 *   node seed-module4-rooms.mjs
 *
 * Safe to re-run: uses upsert on the subject id, so a second run
 * updates the same rows instead of duplicating them.
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mipooolgbzigfuchfhrg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcG9vb2xnYnppZ2Z1Y2hmaHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NzIzMDgsImV4cCI6MjA4ODI0ODMwOH0.IkdawabLGKy1JeAR1y0FcxR9aWWMpL-5EQwLcq8on9g'
)

const MODULE_TITLE = 'Module 4 - Room Training'

// order_index kept above 100 so these subjects render after every
// existing Module 1/2/3 subject (whose indexes sit in the low
// single digits). Adjust the base if there are already subjects >100.
const rooms = [
  {
    id: 'a4000000-0000-0000-0000-000000000001',
    title: 'Infant Room',
    description:
      'Room 1 training — 0 to 11 months. Feeding schedules, safe sleep, tummy time, responsive caregiving, and diapering procedures.',
    order_index: 101,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000002',
    title: 'Older Infant Room',
    description:
      'Room 2 training — 12 to 17 months. Mobility support, first-foods transitions, early communication, and object-permanence play.',
    order_index: 102,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000003',
    title: 'Young Toddler Room',
    description:
      'Room 3 training — 18 to 23 months. Language explosion, parallel play, transition signals, and early self-help skills.',
    order_index: 103,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000004',
    title: 'Toddler Room',
    description:
      'Room 4 training — 2 years. Potty training, social skills, structured play, and beginning cooperative routines.',
    order_index: 104,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000005',
    title: 'Pre-Kinder Room',
    description:
      'Room 5 training — 3 to 4 years. School-readiness curriculum, letter and number recognition, and pre-literacy play.',
    order_index: 105,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000006',
    title: 'Kinder Room',
    description:
      'Room 6 training — 4 to 5 years. Advanced curriculum, writing readiness, and kindergarten-transition prep.',
    order_index: 106,
  },
  {
    id: 'a4000000-0000-0000-0000-000000000007',
    title: 'Afterschool Room',
    description:
      'Room 7 training — 5+ years. Homework support, enrichment activities, and dismissal/pickup routines.',
    order_index: 107,
  },
]

async function seed() {
  console.log(`Seeding "${MODULE_TITLE}" with ${rooms.length} room subjects…\n`)

  for (const room of rooms) {
    const { error } = await supabase.from('training_subjects').upsert(
      {
        id: room.id,
        title: room.title,
        description: room.description,
        icon: 'home',
        section: 'onboarding',
        trs_category: null,
        order_index: room.order_index,
        module_title: MODULE_TITLE,
      },
      { onConflict: 'id' }
    )
    if (error) {
      console.error(`❌ ${room.title}:`, error.message)
      return
    }
    console.log(`✅ ${room.title}`)
  }

  console.log(
    `\n✅ Done. All ${rooms.length} rooms now live under "${MODULE_TITLE}" in the Onboarding outline.`
  )
  console.log(
    '   Open /trainings/onboarding — Module 4 should appear below Modules 1-3.'
  )
}

seed()
