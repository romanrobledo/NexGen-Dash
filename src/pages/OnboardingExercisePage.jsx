import PracticeBotsView from '../components/PracticeBotsView'
import { scenariosFor } from '../lib/practiceScenarios'

/**
 * ONBOARD → Exercise. First-week drills a new hire runs BEFORE stepping
 * onto the floor. Subset of the practice-bot library, tagged with the
 * `onboarding_first_week` category in src/lib/practiceScenarios.js.
 *
 * Mounted at /trainings/onboarding/exercise. Same underlying view as
 * PracticeBotsPage — different scenario slice + a "FIRST WEEK" banner
 * badge so trainees see this is required-ish, not free-play.
 */
export default function OnboardingExercisePage() {
  const scenarios = scenariosFor('onboarding_first_week')

  return (
    <PracticeBotsView
      title="First-Week Exercise"
      subtitle="Rehearse the conversations you'll have on Day 1 — with parents, kids, and your lead teacher — before you step into the classroom."
      badge={{ label: 'First Week', tone: 'blue' }}
      scenarios={scenarios}
      onStart={(scenario) => {
        // Phase 2 hook — POST to n8n conversation webhook, open call UI.
        console.info('[OnboardingExercisePage] start requested:', scenario.key)
      }}
    />
  )
}
