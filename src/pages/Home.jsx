import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ShieldCheck,
  Network,
  Server,
  Layers,
  Cpu,
  Compass,
  Rocket,
  Fingerprint,
  Globe2
} from 'lucide-react'
import { Reveal, Typewriter } from '../components/ui'
import { GPUS, GPU_ORDER } from '../data/gpus'
import FinalCTA from '../components/FinalCTA'
import LearningTeaser, {
  InfrastructureStory
} from '../components/LearningTeaser'
import GpuFaq from '../components/GpuFaq'
import HubSpokeDiagram from '../components/HubSpokeDiagram'
import { INFRA_STEPS } from '../data/infrastructure'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="wrap">
        <div className="hero-topline mono">
          <span>
            <span className="status-dot" />
            AnthroPrime / AI Infrastructure
          </span>
          <span>India-led. Globally connected. ↗</span>
        </div>
        <div className="hero-main">
          <div className="hero-copy">
            <div className="eyebrow mono">One accountable partner</div>
            <h1>
              <Typewriter
                speed={24}
                startDelay={80}
                linePause={140}
                caret={false}
                lines={[
                  { text: 'The hub for' },
                  { text: 'AI infrastructure.', className: 'gold-line' }
                ]}
              />
            </h1>
            <p className="hero-description">
              One accountable partner. A vetted network of compute, data
              centre, power, cooling and capital collaborators. AI capacity
              that is sourced, verified and ready to run.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" to="/find-capacity">
                Discuss your capacity requirement
                <ArrowUpRight />
              </Link>
              <Link className="btn btn-outline" to="/infrastructure#network">
                See how the network works
                <ArrowUpRight />
              </Link>
            </div>
            <div className="hero-footnote mono">
              <ShieldCheck />
              Independent. Multi-provider. Security built in.
            </div>
          </div>
          <HubSpokeDiagram variant="compact" />
        </div>
        <div className="hero-bottom hero-claims">
          <div>
            <p className="intro">
              AI capacity, sourced,
              <br />
              verified and ready to run.
            </p>
            <Link
              to="/infrastructure"
              className="mono caption inline-flex gap-3"
            >
              Explore AI Infrastructure
              <ArrowUpRight size={12} />
            </Link>
          </div>
          <div>
            <span className="number">
              One <em>accountable hub</em>
            </span>
            <span className="mono caption">A single point of contact</span>
          </div>
          <div>
            <span className="number">
              Multi-provider <em>network</em>
            </span>
            <span className="mono caption">The right collaborator per need</span>
          </div>
          <div>
            <span className="number">
              Verified <em>before you sign</em>
            </span>
            <span className="mono caption">Technical & commercial assurance</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function CapacityTicker() {
  return (
    <div className="gpu-marquee" aria-label="Accelerator families">
      <div className="gpu-marquee-track">
        {[0, 1, 2].map((copy) => (
          <div className="gpu-marquee-copy" key={copy} aria-hidden={copy > 0}>
            {GPU_ORDER.map((slug) => (
              <Link tabIndex={copy ? -1 : 0} to={`/gpu/${slug}`} key={slug}>
                {GPUS[slug].name}
                <span>{GPUS[slug].generation}</span>
              </Link>
            ))}
            <Link
              tabIndex={copy ? -1 : 0}
              to="/find-capacity"
              state={{ gpu: 'Enterprise Accelerators' }}
            >
              Enterprise Accelerators<span>Explore more</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

function GpuCloudSection() {
  return (
    <section className="section" id="capacity">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">01 / Accelerated possibilities</div>
            <h2>
              The right compute.
              <br />
              <em>For what comes next.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              From experimentation to enterprise scale. Explore the accelerators
              and dedicated infrastructure available through AnthroPrime.
            </p>
            <Link to="/resources#comparison" className="text-link mt-4">
              Compare GPU specifications
              <ArrowUpRight />
            </Link>
          </Reveal>
        </div>
        <div className="gpu-grid">
          {['h100', 'h200', 'b200', 'a100'].map((slug, i) => {
            const g = GPUS[slug]
            return (
              <Reveal key={slug} delay={i * 0.08}>
                <Link className="gpu-card" to={`/gpu/${slug}`}>
                  <div className="gpu-card-art" aria-hidden="true">
                    <span className="gpu-art-label mono">
                      NVIDIA / {g.generation}
                    </span>
                    <div className="gpu-die">
                      <span>{g.name}</span>
                    </div>
                  </div>
                  <div className="gpu-card-body">
                    <div className="gpu-card-head">
                      <h3>{g.name}</h3>
                      <ArrowUpRight />
                    </div>
                    <p>{g.tagline}</p>
                    <div className="gpu-specs mono">
                      {g.chips.slice(0, 3).map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
        <div className="catalog-bottom">
          <span className="mono">
            Dedicated GPUs · Clusters · Managed infrastructure
          </span>
          <Link to="/services#svc-advisory" className="text-link">
            Not sure where to start? Talk to an expert
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </section>
  )
}

function ClustersSection() {
  return (
    <section className="section cluster-section">
      <div className="wrap cluster-grid">
        <Reveal className="cluster-copy">
          <div className="eyebrow mono">02 / Built to go bigger</div>
          <h2 className="editorial-title">
            From a single node.
            <br />
            <em>To your next frontier.</em>
          </h2>
          <p>
            Training a foundation model or taking inference to production? We
            bring compute, networking, storage, and deployment together around
            your workload.
          </p>
          <div className="cluster-features">
            {[
              [Server, 'Dedicated GPU clusters'],
              [Network, 'High-speed interconnects'],
              [Layers, 'Kubernetes / Slurm'],
              [ShieldCheck, 'Private AI infrastructure']
            ].map(([Icon, t]) => (
              <div key={t}>
                <Icon />
                {t}
              </div>
            ))}
          </div>
          <Link to="/solutions/clusters" className="btn btn-primary">
            Explore dedicated clusters
            <ArrowUpRight />
          </Link>
        </Reveal>
        <Reveal delay={0.15}>
          <div
            className="rack-visual"
            role="img"
            aria-label="Animated illustration of three connected GPU server racks"
          >
            <div className="rack-topline mono">
              <span>Cluster architecture / Illustration</span>
              <span>GPU • Fabric • Storage</span>
            </div>
            <div className="rack-grid">
              {[0, 1, 2].map((r) => (
                <div className="rack" key={r}>
                  {Array.from({ length: 7 }, (_, i) => (
                    <div className="rack-unit" key={i}>
                      <i style={{ animationDelay: `${r + i * 0.3}s` }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="rack-caption mono">
              One connected architecture. Designed around your workload.
            </div>
            <div className="rack-scan" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">03 / A clearer path forward</div>
            <h2>
              Complex infrastructure.
              <br />
              <em>Considered. Connected. Delivered.</em>
            </h2>
          </Reveal>
          <p>
            One accountable team stays with you from the first question to the
            running workload, with the right collaborators behind it.
          </p>
        </div>
        <p className="process-flow mono" aria-label="Define, Source, Verify, Deploy, Govern">
          {INFRA_STEPS.map(([step], i) => (
            <React.Fragment key={step}>
              {i > 0 && <span aria-hidden="true"> → </span>}
              <span aria-hidden="true">{step.toUpperCase()}</span>
            </React.Fragment>
          ))}
        </p>
        <div className="process-grid process-grid--five">
          {INFRA_STEPS.map(([step, text], i) => (
            <Reveal className="process-step" delay={i * 0.08} key={step}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{step}</h3>
              <p>{text}.</p>
            </Reveal>
          ))}
        </div>
        <Link to="/infrastructure#how-we-work" className="text-link mt-8">
          How we work, step by step
          <ArrowUpRight />
        </Link>
      </div>
    </section>
  )
}

const regions = [
  {
    name: 'North America',
    x: 173,
    y: 142,
    note: 'Discuss deployment requirements for research, model development, and enterprise workloads in North America.'
  },
  {
    name: 'Europe',
    x: 400,
    y: 112,
    note: 'Plan European deployments around your residency, connectivity, and workload requirements.'
  },
  {
    name: 'Middle East',
    x: 471,
    y: 181,
    note: 'Find regional infrastructure options for latency-sensitive and enterprise AI programmes.'
  },
  {
    name: 'India',
    x: 534,
    y: 204,
    note: 'Work directly with our India-based team on GPU capacity, architecture, and deployment.'
  },
  {
    name: 'Southeast Asia',
    x: 591,
    y: 236,
    note: 'Explore regional capacity for APAC workloads and distributed inference.'
  }
]

function NetworkMap({ active }) {
  return (
    <svg
      viewBox="0 0 800 380"
      className="world-map"
      role="img"
      aria-label={`Deployment planning regions. Selected region: ${regions[active].name}`}
    >
      <defs>
        <pattern
          id="map-dots"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="#8193b9" />
        </pattern>
      </defs>
      {[80, 140, 200, 260, 320].map((y) => (
        <path className="map-lat" d={`M20 ${y}H780`} key={y} />
      ))}
      {[100, 200, 300, 400, 500, 600, 700].map((x) => (
        <path className="map-lat" d={`M${x} 40V345`} key={x} />
      ))}
      <g fill="url(#map-dots)" opacity=".65">
        <path d="M55 91 87 71 118 78 146 57 184 61 208 45 245 66 257 94 236 117 208 127 196 157 169 171 164 194 185 210 172 228 152 202 137 190 125 168 100 151 93 128 67 121Z" />
        <path d="M191 229 220 216 246 237 267 252 257 281 239 298 225 331 207 351 201 317 191 294 179 261Z" />
        <path d="M277 42 318 39 327 59 307 94 280 79Z" />
        <path d="M356 115 369 94 397 93 406 69 435 68 447 102 429 121 435 146 411 158 395 142 378 145 365 133Z" />
        <path d="M365 160 395 147 428 161 453 196 442 228 422 243 410 283 394 278 378 247 358 223 345 191Z" />
        <path d="M445 82 479 55 520 62 554 49 594 68 630 57 673 79 713 76 748 98 727 127 693 127 683 152 651 164 638 185 614 193 611 222 585 230 576 257 554 237 544 204 525 222 508 211 498 184 476 177 457 147 437 136Z" />
        <path d="M588 246 603 258 625 264 640 281 618 276 603 272Z M646 282 679 265 705 279 716 307 693 327 654 320 635 301Z M738 321 750 309 754 331 740 348Z" />
      </g>
      {regions
        .filter((_, i) => i !== 3)
        .map((r) => (
          <path
            key={r.name}
            className="map-arc"
            d={`M534 204 Q${(r.x + 534) / 2} ${Math.min(r.y, 204) - 110} ${r.x} ${r.y}`}
          />
        ))}
      {regions.map((r, i) => (
        <g key={r.name} opacity={active === i ? 1 : 0.6}>
          <circle
            className="map-pulse"
            cx={r.x}
            cy={r.y}
            r={7}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <circle
            className="map-node"
            cx={r.x}
            cy={r.y}
            r={active === i ? 5 : 3}
          />
          <text className="map-label" x={r.x + 12} y={r.y - 10}>
            {r.name.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  )
}

function GlobalNetwork() {
  const [active, setActive] = useState(3)
  return (
    <section className="section network-section">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">04 / A world of possibilities</div>
            <h2>
              Global perspective.
              <br />
              <em>Local understanding.</em>
            </h2>
          </Reveal>
          <p>
            Plan your deployment around geography, latency, and data residency.
            Our team confirms regional capacity for your requirement.
          </p>
        </div>
        <div className="network-layout">
          <Reveal>
            <NetworkMap active={active} />
          </Reveal>
          <Reveal delay={0.15}>
            <div
              className="region-buttons"
              aria-label="Explore deployment regions"
            >
              {regions.map((r, i) => (
                <button
                  className={i === active ? 'active' : ''}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  key={r.name}
                >
                  {r.name}
                  <ArrowUpRight />
                </button>
              ))}
            </div>
            <p className="region-info" aria-live="polite">
              {regions[active].note}
            </p>
          </Reveal>
        </div>
        <div className="network-caption mono">
          <span>
            <span className="status-dot" />
            Illustrative deployment regions · Not a live availability map
          </span>
          <span>Regional availability confirmed on request.</span>
        </div>
      </div>
    </section>
  )
}

function WhoWeServe() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">05 / Ambition takes many forms</div>
            <h2>
              Built around the work.
              <br />
              <em>And the people behind it.</em>
            </h2>
          </Reveal>
          <Link to="/solutions" className="text-link">
            Discover all solutions
            <ArrowUpRight />
          </Link>
        </div>
        <div className="solutions-grid">
          {[
            {
              n: '01 / Train',
              icon: Cpu,
              title: 'Build the next model.',
              desc: 'Dedicated training infrastructure for AI teams taking ambitious ideas into the world.',
              to: '/solutions/training'
            },
            {
              n: '02 / Serve',
              icon: Rocket,
              title: 'Make intelligence useful.',
              desc: 'Inference foundations designed around your latency, throughput, and deployment needs.',
              to: '/solutions/inference'
            },
            {
              n: '03 / Own your environment',
              icon: Fingerprint,
              title: 'Your AI. Your boundaries.',
              desc: 'Private and sovereign infrastructure for enterprises with specific control requirements.',
              to: '/solutions/private-cloud'
            }
          ].map((s) => (
            <Link to={s.to} className="solution-tile" key={s.to}>
              <span className="mono">{s.n}</span>
              <ArrowUpRight className="solution-arrow" />
              <s.icon />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhyUs() {
  return (
    <section className="why-section">
      <div className="wrap why-grid">
        <h2>
          Technical depth.
          <br />
          <em className="text-gold">Human perspective.</em>
        </h2>
        {[
          [
            Compass,
            'Your accountable hub',
            'Work directly with AnthroPrime for GPU capacity and AI infrastructure, sourced across a vetted collaborator network.'
          ],
          [
            ShieldCheck,
            'Confidence before commitment',
            'Configuration, availability, and terms confirmed before commitment. Confidential discussions under NDA.'
          ],
          [
            Globe2,
            'A partner, beyond procurement',
            'From architecture to deployment and operations. A team that stays connected.'
          ]
        ].map(([Icon, t, d]) => (
          <div className="why-item" key={t}>
            <Icon />
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <CapacityTicker />
      <GpuCloudSection />
      <LearningTeaser />
      <ClustersSection />
      <HowItWorks />
      <GlobalNetwork />
      <WhoWeServe />
      <WhyUs />
      <InfrastructureStory />
      <GpuFaq />
      <FinalCTA />
    </>
  )
}
