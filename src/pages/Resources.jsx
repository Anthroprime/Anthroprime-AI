import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  LineChart,
  Boxes
} from 'lucide-react'
import { PageHero, Reveal, SectionHead } from '../components/ui'
import { GPUS, GPU_ORDER, GPU_REFERENCES } from '../data/gpus'
import FinalCTA from '../components/FinalCTA'
import { COMPARISONS, GUIDES } from '../data/knowledge'

const COMPARE_ROWS = [
  ['GPU memory', (g) => g.specs['GPU memory'] || g.specs['GPUs per rack']],
  ['Memory bandwidth', (g) => g.specs['Memory bandwidth'] || '—'],
  [
    'FP8 / FP4 Tensor (as labelled)',
    (g) => g.specs['FP8 Tensor'] || g.specs['FP4 Tensor'] || g.specs.FP8 || '—'
  ],
  ['BF16 / FP16 Tensor', (g) => g.specs['BF16 / FP16 Tensor'] || '—'],
  ['NVLink', (g) => g.specs['NVLink'] || g.specs['NVLink domain'] || '—'],
  ['Max power', (g) => g.specs['Max power'] || '—'],
  ['Generation', (g) => g.generation]
]

function CompareTool() {
  const [selected, setSelected] = useState(['h100', 'h200', 'b200'])
  const navigate = useNavigate()

  const toggle = (slug) =>
    setSelected((prev) => {
      if (prev.includes(slug))
        return prev.length > 1 ? prev.filter((x) => x !== slug) : prev
      if (prev.length >= 3) return [...prev.slice(1), slug]
      return [...prev, slug]
    })

  return (
    <div
      id="comparison"
      className="scroll-mt-28 rounded-[20px] bg-surface border border-border overflow-hidden"
    >
      <div className="px-6 lg:px-8 pt-6 pb-4 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="font-display font-semibold text-[17px]">
            GPU Comparison
          </div>
          <div className="font-mono text-[12px] text-faint mt-0.5">
            Pick up to 3 accelerators · per NVIDIA public datasheets
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {GPU_ORDER.map((slug) => {
            const g = GPUS[slug]
            const on = selected.includes(slug)
            return (
              <button
                key={slug}
                onClick={() => toggle(slug)}
                aria-pressed={on}
                className={`px-3.5 py-1.5 rounded-full font-mono text-[12px] border transition-all ${on ? 'bg-accent text-bg border-accent glow' : 'bg-bg border-border text-muted hover:text-text hover:border-border2'}`}
              >
                {g.name}
              </button>
            )
          })}
        </div>
      </div>

      <motion.div
        key={selected.join('|')}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-x-auto"
        role="region"
        aria-label="GPU comparison, horizontally scrollable"
        tabIndex={0}
      >
        <table className="w-full min-w-[680px]">
          <caption className="sr-only">
            GPU reference specifications comparison. Scroll horizontally on
            smaller screens.
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left font-mono text-[11px] tracking-wide uppercase text-faint font-medium px-6 lg:px-8 py-4 w-[190px]">
                Spec
              </th>
              {selected.map((slug) => {
                const g = GPUS[slug]
                return (
                  <th key={slug} className="text-left px-4 py-4">
                    <div className="font-display font-bold text-[18px]">
                      {g.name}
                    </div>
                    <div className="font-mono text-[10.5px] text-faint">
                      {g.generation} · {g.tagline}
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Link
                        to={`/gpu/${slug}`}
                        className="font-mono text-[10.5px] px-2.5 py-1 rounded-full border border-border text-muted hover:text-accent hover:border-accent/30 transition-colors"
                      >
                        Specs →
                      </Link>
                      <button
                        onClick={() =>
                          navigate('/find-capacity', { state: { gpu: g.name } })
                        }
                        className="font-mono text-[10.5px] px-2.5 py-1 rounded-full bg-accent text-bg font-semibold hover:bg-accent2 transition-colors"
                      >
                        Request →
                      </button>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {COMPARE_ROWS.map(([label, get]) => (
              <tr
                key={label}
                className="hover:bg-surface2/50 transition-colors"
              >
                <td className="px-6 lg:px-8 py-3.5 font-mono text-[11.5px] text-faint uppercase tracking-wide">
                  {label}
                </td>
                {selected.map((slug) => (
                  <td
                    key={slug}
                    className="px-4 py-3.5 font-mono text-[12.5px] text-text leading-[1.5]"
                  >
                    {get(GPUS[slug])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <div className="px-6 lg:px-8 py-4 border-t border-border font-mono text-[11px] text-faint">
        * Sparse acceleration where applicable · Sources: NVIDIA public
        datasheets · Availability verified per mandate — never assumed.
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
          {selected.map((slug) => (
            <a
              key={slug}
              href={GPU_REFERENCES[slug]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4"
            >
              NVIDIA {GPUS[slug].name} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function DeploymentOptions() {
  return (
    <div
      id="deployment"
      className="rounded-[20px] bg-surface border border-border p-6 lg:p-8"
    >
      <div className="flex flex-wrap justify-between gap-5 items-start">
        <div>
          <h2 className="font-display font-semibold text-[22px]">
            Choose how you deploy.
          </h2>
          <p className="text-[13px] text-muted mt-2">
            GPU infrastructure from Anthroprime, configured around your
            workload.
          </p>
        </div>
        <Link to="/find-capacity" className="text-link">
          Discuss your deployment
          <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 mt-8">
        {[
          [
            'Bare Metal',
            'Direct access to a dedicated GPU environment for your own software stack.'
          ],
          [
            'Dedicated / Reserved',
            'Plan dedicated GPU capacity around the scale and duration of your project.'
          ],
          [
            'Managed',
            'Discuss deployment, orchestration, monitoring, and infrastructure support with our team.'
          ]
        ].map(([title, desc]) => (
          <div className="border-t border-border pt-5" key={title}>
            <h3 className="font-semibold text-[15px]">{title}</h3>
            <p className="text-[13px] text-muted leading-relaxed mt-3">
              {desc}
            </p>
            <Link
              to="/find-capacity"
              state={{ deployType: title }}
              className="text-link mt-3"
            >
              Request capacity
              <ArrowUpRight size={14} />
            </Link>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-faint mt-7">
        GPU specifications are reference figures. Configuration, regional
        availability, and commercial terms are confirmed on request.
      </p>
    </div>
  )
}

export default function Resources() {
  const guides = [
    {
      icon: BookOpen,
      tag: 'Explore',
      title: 'Inside a GPU',
      desc: 'Explore compute engines, memory, interconnects, and the system around the silicon.',
      to: '/gpu-lab#architecture'
    },
    {
      icon: Boxes,
      tag: 'Experiment',
      title: 'Model Memory Essentials',
      desc: 'Change model size and precision to understand the weight-storage footprint.',
      to: '/gpu-lab#memory'
    },
    {
      icon: BarChart3,
      tag: 'Follow the flow',
      title: 'Training vs. Inference',
      desc: 'Follow the stages behind learning a model and generating a response.',
      to: '/gpu-lab#workflows'
    },
    {
      icon: LineChart,
      tag: 'Try it',
      title: 'Parallelism in Practice',
      desc: 'Discover what changes when work is independent, and what happens when it is not.',
      to: '/gpu-lab#parallel'
    }
  ]

  return (
    <>
      <PageHero
        crumb="Resources"
        title="Compare first."
        highlight="Then decide."
        sub="Datasheet-accurate GPU comparisons, deployment options, and infrastructure guides to help you plan your next workload."
      />

      <section className="pb-20 lg:pb-28">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-10">
          <Reveal className="resource-lab-banner">
            <img
              src="/images/gpu-silicon.jpg"
              alt="Generated concept artwork of a GPU package"
              width="1536"
              height="1024"
              loading="lazy"
            />
            <div>
              <span className="mono">Introducing the GPU Lab</span>
              <h2>Go beyond the specification.</h2>
              <p>
                Explore the architecture, run a parallelism experiment, and see
                how model weights occupy memory.
              </p>
              <Link to="/gpu-lab" className="text-link">
                Open the interactive lab
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <CompareTool />
          </Reveal>
          <Reveal>
            <DeploymentOptions />
          </Reveal>

          <div id="guides" className="scroll-mt-28">
            <SectionHead
              tag="Learn by exploring"
              title="Good questions. Hands-on answers."
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {guides.map((g, i) => (
                <Reveal key={g.title} delay={i * 0.05}>
                  <Link
                    to={g.to}
                    className="block rounded-2xl bg-surface border border-border p-6 hover:border-border2 hover:bg-surface2 hover:-translate-y-0.5 transition-all h-full"
                  >
                    <div className="flex items-center justify-between">
                      <g.icon className="w-5 h-5 text-faint" />
                      <span className="font-mono text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full bg-surface3 border border-border text-faint">
                        {g.tag}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-[15.5px] mt-4">
                      {g.title}
                    </h3>
                    <p className="text-[13px] leading-[1.5] text-muted mt-2">
                      {g.desc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[11px] text-accent mt-5">
                      Open the guide
                      <ArrowUpRight size={13} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-12">
              <SectionHead
                tag="Guides & comparisons"
                title="Read before you choose."
              />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {[
                  ...COMPARISONS.map((c) => [`/compare/${c.slug}`, 'Comparison', c.title]),
                  ...GUIDES.map((g) => [`/guides/${g.slug}`, 'Guide', g.title])
                ].map(([to, tag, title]) => (
                  <Link
                    key={to}
                    to={to}
                    className="block rounded-2xl bg-surface border border-border p-6 hover:border-border2 hover:bg-surface2 transition-all"
                  >
                    <span className="font-mono text-[10px] tracking-wide uppercase text-faint">
                      {tag}
                    </span>
                    <h3 className="font-display font-semibold text-[15.5px] mt-2">
                      {title}
                    </h3>
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-6">
                <Link to="/guides" className="text-link">
                  All guides and comparisons
                  <ArrowUpRight />
                </Link>
                <Link to="/glossary" className="text-link">
                  AI infrastructure glossary
                  <ArrowUpRight />
                </Link>
              </div>
            </div>
            <div className="mt-6 font-mono text-[12px] text-faint">
              Need the knowledge now? It already lives with our desk —{' '}
              <Link to="/contact" className="text-accent hover:underline">
                talk to an expert →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}
