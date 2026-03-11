import { Users } from 'lucide-react'

const Section = ({ id, title, children, accent = '#2563EB' }) => (
  <div
    id={id}
    style={{
      marginBottom: '2.5rem',
      borderLeft: `4px solid ${accent}`,
      paddingLeft: '1.5rem',
    }}
  >
    <h2
      style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: accent,
        marginBottom: '0.5rem',
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {title}
    </h2>
    {children}
  </div>
)

const ValueCard = ({ icon, title, description }) => (
  <div
    style={{
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}
  >
    <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    <div
      style={{
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#0F172A',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: '0.82rem',
        color: '#64748B',
        lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {description}
    </div>
  </div>
)

const TeamCard = ({ name, title, role, description, initials, color }) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: '14px',
      padding: '1.5rem',
      display: 'flex',
      gap: '1.2rem',
      alignItems: 'flex-start',
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: '1rem',
        color: '#fff',
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: '#0F172A',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {name}
        </span>
        <span
          style={{
            background: color + '18',
            color: color,
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '99px',
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {role}
        </span>
      </div>
      <div
        style={{
          fontSize: '0.78rem',
          color: '#94A3B8',
          fontWeight: 600,
          marginBottom: '0.5rem',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: '0.83rem',
          color: '#475569',
          lineHeight: 1.65,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {description}
      </div>
    </div>
  </div>
)

const PillarBadge = ({ label }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: '#EFF6FF',
      color: '#1D4ED8',
      border: '1px solid #BFDBFE',
      padding: '6px 14px',
      borderRadius: '99px',
      fontSize: '0.8rem',
      fontWeight: 600,
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {label}
  </div>
)

function NexGenClarityCard() {
  const sections = [
    {
      id: 'what-we-do',
      question: 'What We Do',
      color: '#2563EB',
      icon: '🏫',
      headline: 'We provide safe, structured, high-quality early childhood education and care.',
      body: 'NexGen School for Early Life Foundations is a TRS-certified early childhood education center serving children from 6 weeks through school age. We offer full-day childcare, structured curriculum, self-defense programming, and afterschool care — all under one roof.',
    },
    {
      id: 'who-we-help',
      question: 'Who We Help',
      color: '#7C3AED',
      icon: '👨‍👩‍👧',
      headline: 'Families who need affordable, excellent care they can trust.',
      body: 'We serve working families in the Harlingen, TX area who want more than just a place to drop their child off. Our families choose NexGen because they want structured learning, safety-first environments, and educators who treat their child like their own — without paying private school prices.',
    },
    {
      id: 'how-we-help',
      question: 'How We Help',
      color: '#059669',
      icon: '🤝',
      headline: 'Through daily programs built around safety, learning, and family partnership.',
      items: [
        { label: 'Infant & Toddler Care', detail: '6 weeks – 3 years — responsive, nurturing, developmentally appropriate classrooms' },
        { label: 'Pre-K & Kinder Programs', detail: 'School-readiness curriculum aligned to TRS standards and developmental milestones' },
        { label: 'Afterschool Program', detail: 'Structured homework support, enrichment activities, and supervised care after school' },
        { label: 'Self-Defense Curriculum', detail: 'Age-appropriate confidence and safety training built into the school week' },
        { label: 'Family Communication', detail: 'Daily updates, open-door policy, and responsive staff at every touchpoint' },
        { label: 'TRS-Certified Environment', detail: 'Independently verified to meet Texas Rising Star quality standards' },
      ],
    },
    {
      id: 'what-we-sell',
      question: 'What We Sell',
      color: '#D97706',
      icon: '📋',
      headline: 'Enrollment by age group and program type.',
      note: 'All rates are weekly. Contact Front Desk for current pricing and availability.',
      offers: [
        { name: 'Infant Care',         detail: '6 weeks – 12 months',  tag: 'Full Day' },
        { name: 'Older Infant',        detail: '12 – 18 months',       tag: 'Full Day' },
        { name: 'Young Toddler',       detail: '18 – 24 months',       tag: 'Full Day' },
        { name: 'Toddler',             detail: '2 – 3 years',          tag: 'Full Day' },
        { name: 'Pre-Kinder',          detail: '3 – 4 years',          tag: 'Full Day' },
        { name: 'Kinder',              detail: '4 – 5 years',          tag: 'Full Day' },
        { name: 'Afterschool Program', detail: '5+ years',             tag: 'After School' },
      ],
    },
  ]

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Section Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
      }}>
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#94A3B8', whiteSpace: 'nowrap',
        }}>
          Business Clarity
        </span>
        <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
      </div>

      {/* Four Question Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map((section) => (
          <div
            key={section.id}
            style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              overflow: 'hidden',
              borderLeft: `4px solid ${section.color}`,
            }}
          >
            {/* Card Header */}
            <div style={{
              padding: '1rem 1.5rem 0.75rem',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex', alignItems: 'center', gap: '0.65rem',
            }}>
              <span style={{
                width: 32, height: 32, borderRadius: '8px',
                background: section.color + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0,
              }}>
                {section.icon}
              </span>
              <div>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: section.color,
                }}>
                  {section.question}
                </span>
                <p style={{
                  fontSize: '0.9rem', fontWeight: 700, color: '#0F172A',
                  margin: '0.1rem 0 0', lineHeight: 1.4,
                }}>
                  {section.headline}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div style={{ padding: '1rem 1.5rem' }}>
              {/* What We Do + Who We Help — text body */}
              {section.body && (
                <p style={{
                  fontSize: '0.85rem', color: '#475569',
                  lineHeight: 1.75, margin: 0,
                }}>
                  {section.body}
                </p>
              )}

              {/* How We Help — item grid */}
              {section.items && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '0.6rem',
                }}>
                  {section.items.map((item, i) => (
                    <div key={i} style={{
                      background: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      borderRadius: '10px',
                      padding: '0.75rem 0.9rem',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        marginBottom: '0.25rem',
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: section.color, flexShrink: 0,
                        }} />
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 700, color: '#0F172A',
                        }}>
                          {item.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.76rem', color: '#64748B', lineHeight: 1.55,
                        paddingLeft: '0.85rem', display: 'block',
                      }}>
                        {item.detail}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* What We Sell — offer rows */}
              {section.offers && (
                <>
                  {section.note && (
                    <p style={{
                      fontSize: '0.75rem', color: '#94A3B8',
                      margin: '0 0 0.85rem', fontStyle: 'italic',
                    }}>
                      {section.note}
                    </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {section.offers.map((offer, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        background: i % 2 === 0 ? '#F8FAFC' : '#fff',
                        borderRadius: '8px',
                        border: '1px solid #F1F5F9',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: section.color, flexShrink: 0,
                          }} />
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                              {offer.name}
                            </span>
                            <span style={{
                              fontSize: '0.75rem', color: '#94A3B8',
                              marginLeft: '0.5rem',
                            }}>
                              {offer.detail}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            background: section.color + '15',
                            color: section.color,
                            padding: '2px 8px', borderRadius: '99px',
                            border: `1px solid ${section.color}25`,
                          }}>
                            {offer.tag}
                          </span>
                          {/* Price placeholder — fill in with actual rates */}
                          <span style={{
                            fontSize: '0.82rem', fontWeight: 700,
                            color: '#0F172A',
                            background: '#F1F5F9',
                            padding: '3px 10px', borderRadius: '6px',
                            letterSpacing: '0.02em',
                          }}>
                            $— / wk
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WhoAreWePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.03em',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Who Are We
            </h2>
            <p
              style={{
                color: '#64748B',
                marginTop: '0.35rem',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Our identity, mission, values, and the team that makes it all happen.
            </p>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '2.25rem',
          maxWidth: 780,
        }}
      >
        {/* WHO WE ARE */}
        <Section id="identity" title="Who We Are" accent="#2563EB">
          <p
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.6,
              marginBottom: '0.75rem',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            NexGen School for Early Life Foundations is where a child's future begins.
          </p>
          <p
            style={{
              fontSize: '0.88rem',
              color: '#475569',
              lineHeight: 1.75,
              marginBottom: 0,
            }}
          >
            We are an early childhood education center committed to providing exceptional care,
            safety, and learning for every child we serve. We are not "just a daycare." We are the
            first chapter of a child's story — and we take that responsibility seriously. Every
            classroom, every routine, every interaction is intentionally designed to build confidence,
            curiosity, and character from day one.
          </p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* MISSION */}
        <Section id="mission" title="Our Mission" accent="#7C3AED">
          <div
            style={{
              background: 'linear-gradient(135deg, #EDE9FE 0%, #EFF6FF 100%)',
              border: '1px solid #DDD6FE',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1rem',
            }}
          >
            <p
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#3730A3',
                margin: 0,
                lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif",
                fontStyle: 'italic',
              }}
            >
              "To build the foundation that every child deserves — through safe environments,
              exceptional educators, and systems that never cut corners."
            </p>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            We exist to give children the strongest possible start in life. That means we hold
            ourselves to a higher standard than what's required — because the families who trust us
            are counting on it.
          </p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* WHAT WE DO */}
        <Section id="what-we-do" title="What We Do" accent="#0891B2">
          <p
            style={{
              fontSize: '0.88rem',
              color: '#475569',
              lineHeight: 1.75,
              marginBottom: '1rem',
            }}
          >
            We serve children from infancy through school-age with full-day care, afterschool
            programming, and self-defense training built into our curriculum. Every program is
            designed around three things:
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <PillarBadge label="🛡️ Safety First" />
            <PillarBadge label="📚 Structured Learning" />
            <PillarBadge label="🥋 Self Defense" />
            <PillarBadge label="❤️ Family Partnership" />
            <PillarBadge label="⭐ TRS Certified" />
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            Our Texas Rising Star (TRS) certification reflects our commitment to going beyond the
            minimum. We audit ourselves constantly. We train relentlessly. We document everything.
            Because excellence isn't a one-time achievement — it's a daily standard.
          </p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* VALUES */}
        <Section id="values" title="What We Believe" accent="#059669">
          <p
            style={{
              fontSize: '0.88rem',
              color: '#475569',
              lineHeight: 1.75,
              marginBottom: '1.25rem',
            }}
          >
            These aren't posters on a wall. They're the filter for every decision we make.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}
          >
            <ValueCard
              icon="🛡️"
              title="Safety Above All"
              description="Every child in our care goes home safe. No exceptions, no excuses. Safety is never negotiated."
            />
            <ValueCard
              icon="⭐"
              title="Excellence, Always"
              description="Good enough is not our standard. We pursue operational and educational excellence relentlessly, in every room, every day."
            />
            <ValueCard
              icon="💡"
              title="Innovation"
              description="We build systems that scale. We adopt better tools. We never get comfortable with the old way if a better way exists."
            />
            <ValueCard
              icon="🤝"
              title="Family Partnership"
              description="Parents aren't customers — they're partners. We communicate openly, act with integrity, and treat every family like our own."
            />
            <ValueCard
              icon="📋"
              title="Accountability"
              description="We own our outcomes. If something isn't working, we fix it. We don't point fingers — we find solutions."
            />
            <ValueCard
              icon="🌱"
              title="Grow Every Day"
              description="We invest in our team's growth because the children we serve deserve educators who never stop improving."
            />
          </div>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* WHY WE EXIST */}
        <Section id="why" title="Why We Exist" accent="#DC2626">
          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FED7AA',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              marginBottom: '1rem',
            }}
          >
            <p
              style={{
                fontSize: '0.92rem',
                fontWeight: 600,
                color: '#92400E',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              Because every child deserves the same quality start — regardless of their zip code or
              family income. NexGen exists to close the gap between "affordable" and "excellent." We
              prove every day that you don't have to choose between the two.
            </p>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.7, margin: 0 }}>
            The work we do here shapes who these children become. The way we speak to them, the
            environments we create, the routines we build — all of it matters. That's not a burden.
            That's the privilege of this work.
          </p>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* LEADERSHIP */}
        <Section id="team" title="Our Leadership" accent="#0F172A">
          <p
            style={{
              fontSize: '0.88rem',
              color: '#475569',
              lineHeight: 1.75,
              marginBottom: '1.25rem',
            }}
          >
            NexGen operates on the Visionary/Integrator model. One person sets the direction.
            Another builds the systems to get there. Together, they create the conditions for every
            team member to succeed.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <TeamCard
              initials="RN"
              color="#2563EB"
              name="Roman"
              title="Founder & CEO"
              role="Visionary"
              description="Roman sets the direction for NexGen. He defines the vision, builds the strategy, identifies where we're growing, and makes sure we're always building toward something bigger. He is focused on brand, culture, partnerships, and the long-term picture of what NexGen becomes."
            />
            <TeamCard
              initials="RB"
              color="#059669"
              name="Robyn"
              title="Director of Operations"
              role="Integrator"
              description="Robyn runs the day-to-day. She translates the vision into execution — managing staff, ensuring classroom quality, upholding compliance, and making sure NexGen delivers on its promises to every family, every single day. If Roman sets the destination, Robyn builds the road to get there."
            />
          </div>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* WHAT MAKES US DIFFERENT */}
        <Section id="difference" title="What Makes Us Different" accent="#7C3AED">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
            }}
          >
            {[
              [
                'We are TRS Certified',
                'We hold ourselves to a state-recognized standard of quality.',
              ],
              [
                'We teach self-defense',
                'We give children tools to protect themselves, building confidence early.',
              ],
              [
                'We document everything',
                'Our systems are built to be consistent, auditable, and improvable.',
              ],
              [
                'We treat staff as assets',
                'Your growth matters here. We invest in the team, not just the program.',
              ],
              [
                'We partner with families',
                'Parents are informed, involved, and treated as teammates.',
              ],
              [
                'We never stop improving',
                'Comfortable is not in our vocabulary. We audit, iterate, and elevate.',
              ],
            ].map(([title, desc]) => (
              <div
                key={title}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.83rem',
                    color: '#0F172A',
                    marginBottom: '0.3rem',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  ✓ {title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.6 }}>
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* BUSINESS CLARITY CARD */}
        <NexGenClarityCard />

        <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '2rem 0' }} />

        {/* CLOSING STATEMENT */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
            borderRadius: '14px',
            padding: '1.75rem 2rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#fff',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            We're not just a place children go.
          </p>
          <p
            style={{
              fontSize: '0.88rem',
              color: '#94A3B8',
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            We're the first chapter of who they become. Every educator on this team plays a role in
            writing that chapter. Welcome to NexGen — where the work we do every day matters more
            than most people will ever know.
          </p>
        </div>
      </div>
    </div>
  )
}
