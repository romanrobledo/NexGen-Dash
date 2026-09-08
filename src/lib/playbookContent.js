/**
 * Content for the LEAD → Playbook pages.
 *
 * Keyed as PLAYBOOK[section][slug] so PlaybookPage.jsx can look up an
 * entry from URL params (/lead/playbook/:section/:slug). If a slug
 * isn't found, the page renders a "not found" state — the router still
 * matches the route so we don't 404.
 *
 * Schema (per page entry):
 *   {
 *     title:   string,        // big page heading
 *     tagline: string,        // one-liner under the heading
 *     sections: [
 *       {
 *         label?: string,     // small caps chip (FRAMEWORK, SYSTEM, ...)
 *         heading?: string,   // section heading
 *         body?: string,      // paragraph under the heading
 *         cards?: [           // 1-column mobile / 2-col desktop grid
 *           { title: string, body: string }
 *         ],
 *         table?: {           // simple striped table
 *           columns: string[],
 *           rows: string[][],
 *         },
 *       }
 *     ]
 *   }
 *
 * Adding a new page: add the entry here, then add a leaf under Playbook
 * in src/lib/navItems.js pointing at /lead/playbook/<section>/<slug>.
 */

export const PLAYBOOK = {
  activities: {
    'quarterly-reset': {
      title: 'The Quarterly Strategic Reset',
      tagline:
        'Every 90 days, step out of the daily grind and into a boardroom. Set the business up for an amazing quarter.',
      sections: [
        {
          heading: 'Offsite Meeting',
          body:
            'In a boardroom — not on Zoom, not at your desk. Set the business up for an amazing 90 days with full focus and zero distractions.',
          cards: [
            {
              title: 'Get clear on priorities',
              body:
                'What are the 3–5 things that matter most for the next 90 days? Everything else is noise. Decide what you\'re saying no to.',
            },
            {
              title: 'Delegate accountabilities',
              body:
                'Make sure the right person is doing the right things. Every priority has a single owner with a clear outcome and deadline.',
            },
          ],
        },
      ],
    },

    'monday-morning-meeting': {
      title: 'Monday Morning Meeting',
      tagline:
        'Every team member declares the week\'s commitments. Specific, measurable, locked in.',
      sections: [
        {
          cards: [
            {
              title: '3 to 6 things',
              body:
                'Every team member declares the 3 to 6 things they intend to get done this week. Not 20. Not "a bunch of stuff." Specific, measurable outcomes.',
            },
            {
              title: 'Accountability is set',
              body:
                'Once declared, those items are locked in. The team knows what they owe and what they\'ll be asked about on Friday. No surprises.',
            },
          ],
        },
      ],
    },

    'friday-debrief': {
      title: 'Friday Afternoon Debrief',
      tagline:
        'Binary review of the week\'s commitments. Done or not done — no stories.',
      sections: [
        {
          cards: [
            {
              title: 'Recap Monday\'s commitments',
              body:
                'Go over everything that was said would be done in the Monday Morning Meeting. No new agenda — just the list from Monday.',
            },
            {
              title: 'Done or Not Done',
              body:
                'Binary. No excuses, no stories. Either you shipped it or you didn\'t. Patterns show up fast when you track this weekly.',
            },
          ],
        },
      ],
    },
  },

  people: {
    culture: {
      title: 'Culture as a System',
      tagline: 'Culture isn\'t what you announce — it\'s what you enforce.',
      sections: [
        {
          label: 'FRAMEWORK',
          heading: 'Build from the bottom up',
          body:
            'Most leaders start with mission statements and wonder why nothing sticks. The culture stack builds from observable behaviors upward — fix the base and the top takes care of itself.',
          cards: [
            {
              title: 'Observable Behaviors',
              body:
                'What your team actually does daily — how they communicate, make decisions, treat each other. This is ground truth.',
            },
            {
              title: 'Rituals & Systems',
              body:
                'Recognition programs, meeting cadence, feedback loops — the structures that reinforce the right behavior and correct the wrong.',
            },
            {
              title: 'Declared Values',
              body:
                'The 3–5 principles you operate by. Must align with layers 1 and 2 or they\'re just wall art.',
            },
            {
              title: 'Purpose / Mission',
              body:
                'Why NexGen exists beyond revenue. A vision big enough that your team\'s personal ambitions fit inside it.',
            },
          ],
        },
        {
          label: 'FRAMEWORK',
          heading: 'Plot every person on this grid',
          cards: [
            {
              title: 'Stars — High Performance, High Values',
              body:
                'Promote, reward publicly, make examples of them. These are your culture carriers.',
            },
            {
              title: 'Developers — Low Performance, High Values',
              body:
                'Coach, train, give time and resources. These are future stars if you invest.',
            },
            {
              title: 'Toxic Talent — High Performance, Low Values',
              body:
                'Manage out immediately, regardless of numbers. They poison culture and make stars leave.',
            },
            {
              title: 'Move Out — Low Performance, Low Values',
              body:
                'Performance improvement plan or exit. Don\'t spend energy here.',
            },
          ],
        },
        {
          label: 'SYSTEM',
          heading: 'People repeat what gets reinforced',
          cards: [
            {
              title: 'Daily — Slack shout-outs',
              body:
                'Tie every shout-out to a specific value. "Great job" means nothing. "Sarah showed Competitive Greatness by staying late to rebuild the client\'s funnel" means everything.',
            },
            {
              title: 'Weekly — Team meeting highlights',
              body:
                'Start every Monday sync by naming one person who lived a core value last week.',
            },
            {
              title: 'Monthly — Value awards',
              body: 'One award per core value. Peer-nominated. Public ceremony.',
            },
            {
              title: 'Quarterly — Culture carriers',
              body:
                'Identify the top 10% who model values consistently. Give them mentoring roles and visibility.',
            },
          ],
        },
      ],
    },

    'founder-ceiling': {
      title: 'Founder as Capacity Ceiling',
      tagline:
        'Your business will never outgrow your personal operating system.',
      sections: [
        {
          label: 'SELF-ASSESSMENT',
          heading: 'Where are you the bottleneck?',
          body:
            'Every company plateaus at the exact level of the founder\'s emotional capacity, decision-making ability, leadership skill, and self-awareness. Fix you — watch everything else shift.',
          cards: [
            {
              title:
                'What decision do you make that your team should be making?',
              body:
                'If the answer is more than two, you\'re the ceiling. Every decision you hold is a decision your team can\'t learn from.',
            },
            {
              title: 'What skill do you lack that\'s slowing growth?',
              body:
                'At $1M you need sales skills. At $10M you need leadership skills. At $50M you need vision. What stage are you stuck at?',
            },
            {
              title:
                'What behavior do you model that you\'d fire someone else for?',
              body:
                'Your team mirrors you. If they lack urgency, you let deadlines slide. If they avoid hard conversations, you sugarcoat feedback.',
            },
          ],
        },
        {
          label: 'FRAMEWORK',
          heading: 'John Wooden\'s layers — applied to leadership',
          body:
            'You can\'t skip to poise without self-control. Build the character layers in order — each one unlocks the next.',
          cards: [
            {
              title: 'Foundation — Industriousness & Enthusiasm',
              body:
                'Full mental engagement toward progress, not busyness. Genuine love for the mission. Without these, nothing above works.',
            },
            {
              title: 'Trust — Friendship, Loyalty & Cooperation',
              body:
                'Genuine respect for your team as humans, not resources. Loyalty flows downward before it flows upward.',
            },
            {
              title:
                'Composure — Self-Control, Alertness, Initiative & Intentness',
              body:
                'Respond, don\'t react. Your team watches how you handle bad news. Stay calm when you don\'t have the answer.',
            },
            {
              title: 'Competence — Condition, Skill & Team Spirit',
              body:
                'Physical and mental stamina to lead. Technical competence for your current stage. Prioritizing the group\'s success over your ego.',
            },
            {
              title:
                'Mastery — Poise, Confidence & Competitive Greatness',
              body:
                'Being fully yourself — no performance, no mask. Deep belief earned through preparation. Love of the hard challenge.',
            },
          ],
        },
      ],
    },

    'people-flywheel': {
      title: 'The People Flywheel',
      tagline:
        'More people ≠ more capacity — without structure, you\'re just adding chaos.',
      sections: [
        {
          label: 'FRAMEWORK',
          heading: 'Three corners that compound — or collapse',
          cards: [
            {
              title: 'Functions — What work needs to happen',
              body:
                'Define outcomes, not tasks. Most leaders hire "a marketing person" without defining what marketing outcomes they need.',
            },
            {
              title: 'People — Who does the work',
              body:
                'Right people in right roles with right skills. You can\'t know what "right" means until you\'ve defined Functions.',
            },
            {
              title: 'Operations — How work flows between people',
              body:
                'Communication, decisions, accountability. This is the connective tissue. Without it, functions and people are islands.',
            },
          ],
        },
        {
          label: 'DIAGNOSTICS',
          heading: 'Chaos is predictable — and tells you what to build next',
          table: {
            columns: ['Stage', 'People', 'Failure Mode', 'Fix'],
            rows: [
              ['0–10', 'Startup', 'Role clarity', 'Job scorecards (outcomes, not tasks)'],
              ['10–50', 'Scale-Up', 'Communication', 'Meeting rhythms + decision frameworks'],
              ['50–100', 'Professional', 'Accountability', 'KPIs, OKRs, ownership charts'],
              ['100+', 'Enterprise', 'Leadership depth', 'Middle management layer'],
            ],
          },
        },
        {
          label: 'FRAMEWORK',
          heading: 'Five levels — train your team to climb',
          body:
            'Most founders want Level 5 autonomy but hire at Level 2 and never train people up. Define the level for each role, then develop people intentionally.',
          cards: [
            {
              title: 'Level 1 — Wait to be told',
              body:
                'No initiative. Pure task execution. "What should I do next?" Entry-level only.',
            },
            {
              title: 'Level 2 — Ask what to do',
              body:
                'Some initiative, needs direction. "Should I do X or Y?" Teach them to bring solutions, not problems.',
            },
            {
              title: 'Level 3 — Recommend, then act',
              body:
                'Brings solutions. "I recommend X. Do you agree?" Train by asking: "What would you do if I weren\'t here?"',
            },
            {
              title: 'Level 4 — Act, then inform',
              body:
                'Makes decisions, keeps you in the loop. "I did X. Here\'s why." Department heads should live here.',
            },
            {
              title: 'Level 5 — Act independently',
              body:
                'Full ownership. You\'re informed only if relevant. "This is handled." C-suite and senior leads.',
            },
          ],
        },
      ],
    },

    'talent-engine': {
      title: 'The Talent Engine',
      tagline:
        'You spend 40 hours a week selling customers — how many hours do you spend selling talent?',
      sections: [
        {
          label: 'FRAMEWORK',
          heading: 'Same structure as your customer funnel — stop ignoring half of it',
          cards: [
            {
              title: 'Applicant Generation',
              body:
                'Market your jobs like products. Your job description is a sales page. Your job title is a headline. A-players aren\'t scrolling Indeed — they\'re being recruited. Make them come to you.',
            },
            {
              title: 'Candidate Experience',
              body:
                'Speed is a signal of excellence. Top candidates leave the market in 8 days. Average hiring takes 23 days. 60% lose interest with no response in 48 hours. 24-hour response rule.',
            },
            {
              title: 'Interview & Close',
              body:
                'Five steps: Screen (15 min — can they do it?), Culture (30 min — values alignment), Skill (60 min — working session, not hypotheticals), Alignment (30 min — do they want what you offer?), Close (30 min — founder sells the vision).',
            },
            {
              title: 'Onboarding',
              body:
                'Onboarding is proof that what you sold in the interview is real. First 30 days: learn the business. 30–60: own outcomes. 60–90: operate independently. No one should wonder if they made a mistake.',
            },
            {
              title: 'Development & Retention',
              body:
                'People don\'t leave companies — they leave lack of progress. 37% quit for lack of growth, 28% for pay, 27% for lack of recognition. Build clear growth paths and a feedback rhythm.',
            },
          ],
        },
        {
          label: 'BENCHMARK',
          heading: 'What a talent funnel changes',
          table: {
            columns: ['Metric', 'Before', 'After'],
            rows: [
              ['Applicants per role', '50', '300+'],
              ['Hires that stay 90 days', '1 of 2', '5 of 5'],
              ['Time-to-hire', '60 days', '21 days'],
              ['Annual turnover', '40%', '8%'],
              ['Pipeline status', 'Scrambling', 'A-player waitlist'],
            ],
          },
        },
      ],
    },

    'systems-to-scale': {
      title: 'Systems to Scale',
      tagline: 'Structure doesn\'t slow you down — it keeps you free.',
      sections: [
        {
          label: 'DAILY SYSTEM',
          heading: 'Five practices — how you run the business day-to-day',
          cards: [
            {
              title: 'Expectations',
              body:
                'Define outcomes, not tasks. Every role has measurable success metrics. No one asks "what should I work on?"',
            },
            {
              title: 'Accountability',
              body:
                'Follow up with facts, not feelings. Weekly check-ins on commitments. Fact-based conversations when outcomes miss.',
            },
            {
              title: 'Communication',
              body:
                'Two-way feedback loops. Information, expectations, and support flow freely — not just from you down.',
            },
            {
              title: 'Cadence',
              body:
                'Predictable rhythm that compounds. Weekly 1:1s. Team syncs. Monthly and quarterly planning. Never cancelled.',
            },
            {
              title: 'Recognition',
              body:
                'Reinforce what you value publicly. Daily and weekly. Tied to specific values and behaviors, not just results.',
            },
          ],
        },
        {
          label: 'STRATEGIC SYSTEM',
          heading: 'Five practices — how you grow the business long-term',
          cards: [
            {
              title: 'Direction',
              body:
                'Show where you\'re going. Repeat your vision in every major meeting. Your team should articulate it without you in the room.',
            },
            {
              title: 'Resources',
              body:
                'Remove roadblocks. Proactively provide tools, people, training, and support so your team executes without being blocked.',
            },
            {
              title: 'Autonomy',
              body:
                'Train your team to make decisions independently. Trust them to own outcomes without needing your permission.',
            },
            {
              title: 'Long-Term Thinking',
              body:
                'Invest in systems even when they slow short-term execution. Make decisions based on 3-year impact, not 3-month results.',
            },
            {
              title: 'Development',
              body:
                'Grow your people\'s capacity. Clear growth paths, skill gap analysis, career conversations. Your people should outgrow their roles.',
            },
          ],
        },
      ],
    },
  },
}

/**
 * Look up a Playbook entry. Returns null if the section or slug
 * doesn't exist so PlaybookPage can render a "not found" panel.
 * @param {string} section
 * @param {string} slug
 */
export function getPlaybookEntry(section, slug) {
  return PLAYBOOK?.[section]?.[slug] ?? null
}
