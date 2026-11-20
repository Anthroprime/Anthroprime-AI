import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  Scale,
  BadgeCheck,
  ShieldCheck,
  Workflow,
  Gauge,
  Check
} from 'lucide-react'
import { Reveal } from '../components/ui'
import HubSpokeDiagram, { SPOKE_ICONS } from '../components/HubSpokeDiagram'
import CollaboratorForm from '../components/CollaboratorForm'
import {
  SPOKES,
  HUB_ROLES,
  AUDIENCES,
  INFRA_SERVICES,
  INFRA_STEPS,
  SYSTEM_LAYERS,
  FURTHER_READING,
  INFRA_FAQ
} from '../data/infrastructure'
import '../components/infrastructure.css'

const ROLE_ICONS = {
  ClipboardList,
  Scale,
  BadgeCheck,
  ShieldCheck,
  Workflow,
  Gauge
}

const ANCHORS = [
  ['The model', 'network'],
  ['Collaborators', 'collaborators'],
  ['Services', 'services'],
  ['How we work', 'how-we-work'],
  ['Join the network', 'join'],
  ['Questions', 'questions']
]

const REQUIREMENT = '/find-capacity'
const scopeState = (title) => ({
  gpu: 'Not sure / need advice',
  workload: `Scope: ${title}. `
})

function Hero() {
  return (
    <section className="page-hero infra-hero">
      <div className="wrap">
        <nav className="breadcrumb mono" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-muted">AI Infrastructure</span>
        </nav>
        <div className="infra-hero-grid">
          <div>
            <div className="eyebrow mono">
              AI infrastructure / the accountable hub
            </div>
            <h1>
              One accountable hub.{' '}
              <span>A network built to deliver AI.</span>
            </h1>
            <p className="infra-intro">
              AnthroPrime orchestrates a vetted network of collaborators — GPU
              capacity providers, AI-ready data centres, power, cooling,
              system integrators, connectivity and capital partners. You
              define the outcome; we bring the right collaborators together,
              verify every option and stay accountable from requirement to
              running workload.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to={REQUIREMENT}>
                Discuss your capacity requirement
                <ArrowUpRight />
              </Link>
              <a className="btn btn-secondary" href="#join">
                Become a collaborator
                <ArrowDown />
              </a>
            </div>
          </div>
          <aside className="infra-glance" aria-label="At a glance">
            <span className="mono">At a glance</span>
            <dl>
              {[
                ['One accountable partner', 'Instead of managing ten vendors.'],
                ['Independent and multi-provider', 'The right collaborator for each requirement.'],
                ['Speed', 'Collaborators are pre-vetted, so sourcing starts on day one.'],
                ['Assurance', 'Every option verified technically and commercially before you sign.'],
                ['Security built in', 'ISO 27001, CERT-In and DPDP thinking at the hub.']
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
        <nav className="infra-anchors" aria-label="On this page">
          {ANCHORS.map(([label, id], i) => (
            <a key={id} href={`#${id}`}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}

function Model() {
  return (
    <section className="section infra-model" id="network">
      <div className="wrap">
        <div className="section-top">
          <div>
            <div className="eyebrow mono">01 / How the hub works</div>
            <h2>
              One hub.
              <br />
              <em>Every gap closed.</em>
            </h2>
          </div>
          <p>
            Most AI infrastructure projects fail in the gaps between vendors —
            the GPU arrives before the power, the cooling doesn’t match the
            rack, the contract doesn’t match the financing. We sit at the
            centre and close those gaps.
          </p>
        </div>
        <Reveal>
          <HubSpokeDiagram />
        </Reveal>
        <h3 className="infra-subhead mono">What the hub does</h3>
        <div className="infra-roles">
          {HUB_ROLES.map((role, i) => {
            const Icon = ROLE_ICONS[role.icon]
            return (
              <Reveal key={role.title} delay={i * 0.04} className="infra-role">
                <Icon aria-hidden="true" />
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h4>{role.title}</h4>
                <p>{role.description}</p>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Collaborators() {
  return (
    <section className="section infra-band" id="collaborators">
      <div className="wrap">
        <div className="section-top">
          <div>
            <div className="eyebrow mono">02 / Our collaborators</div>
            <h2>
              The spokes.
              <br />
              <em>Chosen per requirement.</em>
            </h2>
          </div>
          <p>
            Independent and multi-provider — from GPU as a service and
            reserved clusters to AI data centre colocation, liquid cooling and
            AI factory builds. We match each requirement to the right
            collaborators, rather than to a single supplier.
          </p>
        </div>
        <div className="infra-spokes">
          {SPOKES.map((s, i) => {
            const Icon = SPOKE_ICONS[s.icon]
            return (
              <Reveal key={s.id} delay={(i % 4) * 0.04} className="infra-spoke">
                <Icon aria-hidden="true" />
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </Reveal>
            )
          })}
        </div>
        <p className="infra-vetted">
          <ShieldCheck aria-hidden="true" />
          Every collaborator is vetted before they join the network, and
          re-verified for every engagement.
        </p>
      </div>
    </section>
  )
}

function WhoWeServe() {
  return (
    <section className="section infra-serve">
      <div className="wrap">
        <div className="eyebrow mono">03 / Who we serve</div>
        <h2 className="editorial-title">
          Built for the people <em>building AI.</em>
        </h2>
        <div className="infra-audiences">
          {AUDIENCES.map(([who, what]) => (
            <div key={who} className="infra-audience">
              <h3>{who}</h3>
              {what && <p>{what}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services() {
  return (
    <section className="section infra-band" id="services">
      <div className="wrap">
        <div className="section-top">
          <div>
            <div className="eyebrow mono">04 / Services</div>
            <h2>
              Depth where
              <br />
              <em>it matters.</em>
            </h2>
          </div>
          <p>
            From the first sizing exercise to the quarterly capacity review —
            scope one stage or the whole programme.
          </p>
        </div>
        <div className="infra-services">
          {INFRA_SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 0.04} className="infra-service" >
              <div className="infra-service-top mono">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.isNew && <span className="infra-new">New</span>}
              </div>
              <h3 id={`scope-${s.id}`}>{s.title}</h3>
              <p>{s.points}</p>
              <Link
                to={REQUIREMENT}
                state={scopeState(s.title)}
                className="text-link"
                aria-describedby={`scope-${s.id}`}
              >
                Discuss this scope
                <ArrowUpRight />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function WholeSystem() {
  return (
    <section className="section infra-system">
      <div className="wrap">
        <div className="section-top">
          <div>
            <div className="eyebrow mono">Why it matters</div>
            <h2>
              The GPU is one part
              <br />
              <em>of the whole system.</em>
            </h2>
          </div>
          <p>
            Compute can only serve a workload when data can reach it and the
            environment can support it. That is why the network reaches
            beyond GPUs.
          </p>
        </div>
        <ol className="infra-layers">
          {SYSTEM_LAYERS.map(([name, text], i) => (
            <li key={name}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{name}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <p className="infra-reading">
          Further reading:{' '}
          {FURTHER_READING.map(([label, href], i) => (
            <React.Fragment key={href}>
              {i > 0 && ' · '}
              <a href={href} target="_blank" rel="noopener noreferrer">
                {label} ↗
              </a>
            </React.Fragment>
          ))}
        </p>
        <p className="infra-disclaimer mono">
          Diagrams on this page are qualitative and illustrative. They are not
          benchmarks, live systems or availability statements.
        </p>
      </div>
    </section>
  )
}

function HowWeWork() {
  return (
    <section className="section infra-band" id="how-we-work">
      <div className="wrap">
        <div className="eyebrow mono">05 / How we work</div>
        <h2 className="editorial-title">
          From requirement <em>to running workload.</em>
        </h2>
        <ol className="infra-steps">
          {INFRA_STEPS.map(([step, text], i) => (
            <li key={step}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{step}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function EntryPaths() {
  const paths = [
    {
      title: 'I need AI capacity',
      text: 'GPU capacity for training or inference.',
      to: REQUIREMENT,
      cta: 'Discuss your capacity requirement'
    },
    {
      title: 'I’m building an AI factory or data centre',
      text: 'Space, power, cooling, systems and financing.',
      to: REQUIREMENT,
      state: {
        gpu: 'Dedicated build',
        deployType: 'Not sure',
        workload:
          'AI factory or data centre build: space, power, cooling, systems and financing. '
      },
      cta: 'Start the conversation'
    },
    {
      title: 'I have capacity, space, power or capital to offer',
      text: 'Join the collaborator network.',
      href: '#join',
      cta: 'Become a collaborator'
    }
  ]
  return (
    <section className="section infra-paths">
      <div className="wrap">
        <div className="eyebrow mono">06 / Where do you start?</div>
        <h2 className="editorial-title">
          Three ways <em>in.</em>
        </h2>
        <div className="infra-path-grid">
          {paths.map((p, i) => {
            const inner = (
              <>
                <span className="mono">0{i + 1}</span>
                <h3>“{p.title}”</h3>
                <p>{p.text}</p>
                <span className="infra-path-cta">
                  {p.cta}
                  <ArrowUpRight />
                </span>
              </>
            )
            return p.to ? (
              <Link key={p.title} to={p.to} state={p.state} className="infra-path">
                {inner}
              </Link>
            ) : (
              <a key={p.title} href={p.href} className="infra-path">
                {inner}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function JoinNetwork() {
  return (
    <section className="section infra-join" id="join">
      <div className="wrap request-layout">
        <div className="request-sidebar">
          <div className="eyebrow mono">07 / Join the network</div>
          <h2 className="editorial-title">
            Build the network <em>with us.</em>
          </h2>
          <p className="text-muted text-[14px] leading-[1.9] mt-6">
            We partner with providers who meet our standards for reliability,
            transparency and security. Join the network and get matched to
            qualified, well-defined requirements.
          </p>
          <ul className="infra-join-list">
            {[
              'Qualified requirements, defined before they reach you',
              'One accountable hub managing the client relationship',
              'Technical, commercial and security vetting, applied consistently',
              'GPU capacity, space, power, cooling, systems, connectivity and capital'
            ].map((item) => (
              <li key={item}>
                <Check aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <CollaboratorForm />
      </div>
    </section>
  )
}

function Questions() {
  return (
    <section className="section infra-faq" id="questions">
      <div className="wrap infra-faq-grid">
        <div>
          <div className="eyebrow mono">08 / Questions</div>
          <h2 className="editorial-title">
            Straight answers. <em>Before you begin.</em>
          </h2>
        </div>
        <div className="infra-faq-list">
          {INFRA_FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section className="infra-close">
      <div className="wrap">
        <h2>
          Bring us the requirement.
          <br />
          <em>We’ll bring the network.</em>
        </h2>
        <div className="hero-actions">
          <Link className="btn btn-gold" to={REQUIREMENT}>
            Start a conversation
            <ArrowUpRight />
          </Link>
          <a className="btn btn-outline" href="#join">
            Become a collaborator
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </section>
  )
}

export default function Infrastructure() {
  return (
    <>
      <Hero />
      <Model />
      <Collaborators />
      <WhoWeServe />
      <Services />
      <WholeSystem />
      <HowWeWork />
      <EntryPaths />
      <JoinNetwork />
      <Questions />
      <ClosingCTA />
    </>
  )
}
