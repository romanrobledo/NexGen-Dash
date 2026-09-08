/**
 * Content for the REVENUE FRAMEWORK section pages.
 *
 * Keyed by slug so RevenueFrameworkPage.jsx can look up an entry from
 * URL params (/framework/:slug). Same schema as playbookContent.js —
 * both feed through src/components/RichContentView.jsx.
 *
 * Adding a new page: add the entry here, then wire the sidebar leaf's
 * path (in src/lib/navItems.js) to /framework/<slug>.
 */

export const REVENUE_FRAMEWORK = {
  '30-day-parent-confidence': {
    title: '30-Day Parent Confidence Guarantee',
    tagline:
      'A conditional, results-based guarantee — reverses a parent\'s real risk without opening the door to cash refunds.',
    sections: [
      {
        heading: 'Why conditional, not blanket money-back',
        body:
          'You control the quality of care, communication, classroom experience, and onboarding. You do NOT fully control a child\'s behavior, development, attendance, or a parent\'s personal circumstances. Guarantee what you can operationally deliver.',
      },
      {
        label: 'THE OFFER',
        heading: 'What you promise on the enrollment form',
        body:
          '"Enroll your child with NexGen. During the first 30 days, if we do not deliver the following experience, we will fix it immediately or credit your next week of tuition."',
      },
      {
        heading: 'Conditions the parent must meet',
        steps: [
          'Parent completes the enrollment and orientation process.',
          'Child attends at least 15 scheduled days.',
          'Parent communicates concerns within 24 hours.',
        ],
      },
      {
        heading: 'What NexGen must provide',
        cards: [
          {
            title: 'Daily attendance & incident communication',
            body: 'Every day, every family. No exceptions.',
          },
          {
            title: 'A documented classroom welcome process',
            body: 'A written procedure the lead teacher runs on Day 1 — same experience across every room.',
          },
          {
            title: 'A parent check-in during week one',
            body: 'Robyn owns the touchpoint; goal is to surface concerns before day 14.',
          },
          {
            title: 'A progress & adjustment call by day 30',
            body: 'Structured call — what\'s going well, what needs to change, what happens next.',
          },
          {
            title: 'Response to concerns within one business day',
            body: '24-hour SLA on any concern raised. Missing this is a guarantee-triggering event.',
          },
          {
            title: 'Four free uniforms',
            body: 'As already promised in the enrollment offer.',
          },
        ],
      },
      {
        body:
          'If NexGen misses one of those commitments, the family receives a tuition credit plus a corrective action plan — NOT an automatic cash refund. This follows the strongest guarantee structure: "If you do not get X result in Y time, we will provide Z," with conditions tied to the customer\'s participation. Guarantees work best when they reduce risk without attracting customers who only want something free.  [$100M Offers, pp. 125, 127]',
      },
      {
        heading: 'Why this is the right play',
        body:
          'Your real sale is not "four free uniforms." It is: "You can trust us to provide reliable care, communicate clearly, and make the transition safe for your family." That is the parent\'s perceived risk. Reverse that risk.',
      },
      {
        label: 'DO NOT GUARANTEE',
        heading: 'Six things outside your control',
        body:
          'These guarantees create disputes, refund leakage, and operational chaos. Your center has fixed classroom capacity and compliance constraints, so every refunded enrollment can consume staff time and a seat you cannot easily resell. The guarantee must improve conversion without damaging margin.',
        cards: [
          {
            title: 'Your child will never get sick',
            body: 'Illness is a fact of childcare, not a service failure.',
          },
          {
            title: 'Your child will improve behavior',
            body: 'Development is a child variable, not an operator variable.',
          },
          {
            title: 'Your child will love every day',
            body: 'Some days are hard; you cannot promise emotional outcomes.',
          },
          {
            title: 'A specific developmental outcome',
            body: 'Same reason — the outcome depends on the child, not the center.',
          },
          {
            title: 'A seat will always be available',
            body: 'Enrollment ratios and licensing caps are hard constraints.',
          },
          {
            title: 'A refund for any reason after enrollment',
            body: 'Cash refunds after seat allocation destroy margin and re-fill lag.',
          },
        ],
      },
      {
        label: 'EXECUTION',
        heading: 'Rollout playbook',
        steps: [
          'Add the guarantee to every Meta lead response, VSL, tour script, and enrollment form.',
          'Give Robyn ownership of the 30-day checklist.',
          'Give Rachel ownership of classroom delivery and parent issue resolution.',
          'Review every active family at days 7, 14, and 30.',
        ],
      },
      {
        heading: 'Metrics to track',
        cards: [
          {
            title: 'Tour-to-enrollment rate',
            body: 'The guarantee\'s conversion signal — should climb once the guarantee is on every touchpoint.',
          },
          {
            title: '30-day retention',
            body: 'Are families staying past the guarantee window?',
          },
          {
            title: 'Guarantee claims',
            body: 'How many families invoke the guarantee — low is healthy.',
          },
          {
            title: 'Claim reason',
            body: 'Which commitment failed — patterns show up fast once you track this.',
          },
          {
            title: 'Churn within 90 days',
            body: 'Does the guarantee just delay churn or actually prevent it?',
          },
        ],
      },
      {
        heading: 'Start with a tuition credit, not cash',
        body:
          'If claims are under control and enrollment improves, you can strengthen the remedy later. First prove the math. A guarantee is a sales tool, not a charity program.',
      },
    ],
  },

  'lead-magnets': {
    title: 'Lead Magnets Framework',
    tagline:
      'How you attract, capture, and convert prospects into paying clients.',
    sections: [
      {
        heading: 'The Lead Machine',
        body:
          'Leads are the lifeblood of your business. This framework covers the full journey — from getting attention to closing the deal. Every stage needs a system, not just effort.',
      },
      {
        label: 'ATTRACTION',
        heading: 'Where do leads come from?',
        cards: [
          {
            title: 'Lead sources',
            body:
              'What channels are generating leads today? Paid ads, organic search, referrals, cold outreach, social media? Know which ones actually convert, not just which ones feel busy.',
          },
          {
            title: 'Messaging & hooks',
            body:
              'What gets their attention? Your hook has to call out the pain your avatar feels and promise a specific result. Generic "we help businesses grow" doesn\'t stop the scroll.',
          },
        ],
      },
      {
        heading: 'Types of Lead Magnets',
        body:
          'A lead magnet is the thing you give away to get contact information. There are four types.',
        cards: [
          {
            title: 'Software',
            body:
              'You give them a tool. A spreadsheet, calculator, or small software that does a job for them.',
            example:
              'A spreadsheet that gives a gym owner all their relevant business stats, compares them to industry averages, and gives them a rank.',
          },
          {
            title: 'Information',
            body:
              'You teach them something: courses, lessons, interviews with experts, keynote presentations, live events, mistakes and pitfalls, hacks/tips — anything they can learn from.',
            example: 'A mini course for gym owners on how to write ads.',
          },
          {
            title: 'Services',
            body:
              'You do work for free: adjust their back, perform a website audit, apply the first layer, transform their video into an ebook, etc.',
            example: 'Run gym owners\' ads for free for 30 days.',
          },
          {
            title: 'Physical Products',
            body:
              'You give them something they can hold in their hands: a posture assessment chart, a supplement, a small sample, branded gear, a book.',
            example: 'A book for gym owners called Gym Launch Secrets.',
          },
        ],
      },
      {
        heading: '7 Steps to an Effective Lead Magnet',
        steps: [
          'Figure out the problem and who to solve it for',
          'Figure out how to solve it',
          'Figure out how to deliver it',
          'Test what\'s in the magnet',
          'Make it easy to consume',
          'Make it darn good',
          'Make it easy to tell you they want more',
        ],
      },
    ],
  },
}

/**
 * Look up a Revenue Framework entry by slug. Returns null if the slug
 * doesn't exist so RevenueFrameworkPage renders a not-found panel.
 * @param {string} slug
 */
export function getRevenueFrameworkEntry(slug) {
  return REVENUE_FRAMEWORK?.[slug] ?? null
}
