import PracticeBotsView from '../components/PracticeBotsView'
import { scenariosFor } from '../lib/practiceScenarios'

/**
 * HELP → Training bot library. Full scenario set for refresher practice.
 *
 * Mounted at /trainings/practice. Phase 1: onStart just logs — Phase 2
 * wires it to Roman's n8n conversation webhook.
 */
export default function PracticeBotsPage() {
  const scenarios = scenariosFor('library')

  return (
    <PracticeBotsView
      title="Practice Bots"
      subtitle="Pick a scenario, press Start Call, and run through a live conversation with an AI. You'll get a scored report card when you hang up."
      badge={null}
      scenarios={scenarios}
      onStart={(scenario) => {
        // Phase 2 hook — POST to n8n conversation webhook, open call UI.
        console.info('[PracticeBotsPage] start requested:', scenario.key)
      }}
    />
  )
}
