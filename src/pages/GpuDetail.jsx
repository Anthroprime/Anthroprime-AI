import React from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowLeft, ArrowRight, Check, Cpu } from 'lucide-react'
import {
  PageHero,
  Reveal,
  SectionHead,
  CTAPrimary,
  CTAGhost,
  Tilt
} from '../components/ui'
import { GPUS, GPU_ORDER, GPU_REFERENCES, gpuBySlug } from '../data/gpus'
import { useTheme } from '../theme'
import FinalCTA from '../components/FinalCTA'
import { useMotionSettings } from '../components/MotionSettings'
import { relatedLink } from '../data/knowledge'

// Comparison and guide pages relevant to each GPU (internal linking).
const GPU_READING = {
  h100: ['h100-vs-h200', 'a100-vs-h100', 'gpu-memory-for-llms'],
  h200: ['h100-vs-h200', 'h200-vs-b200', 'gpu-memory-for-llms'],
  b200: ['h200-vs-b200', 'gb200-nvl72-explained', 'choosing-gpus-for-inference'],
  gb200: ['gb200-nvl72-explained', 'h200-vs-b200', 'liquid-cooling'],
  a100: ['a100-vs-h100', 'choosing-gpus-for-inference', 'mig'],
  l40s: ['choosing-gpus-for-inference', 'gpu-memory-for-llms', 'bare-metal-vs-managed-gpu']
}

function AvailabilityPanel({ slug }) {
  return (
    <Reveal className="mt-16">
      <div className="rounded-[20px] bg-surface border border-border p-6 lg:p-8">
        <div className="font-mono text-[11px] uppercase tracking-wide text-gold">
          GPU infrastructure from Anthroprime
        </div>
        <h2 className="font-display font-semibold text-[22px] mt-3">
          Plan your {GPUS[slug].name} deployment with us.
        </h2>
        <p className="text-[14px] text-muted leading-relaxed max-w-[700px] mt-3">
          Tell us your GPU quantity, workload, preferred region, and timeline.
          Our team will confirm capacity and propose a configuration and
          commercial terms directly.
        </p>
        <div className="grid sm:grid-cols-3 gap-5 mt-6 border-t border-border pt-6">
          {[
            [
              'GPU configuration',
              'Choose the accelerator and node configuration for your workload.'
            ],
            [
              'Deployment model',
              'Discuss dedicated, bare-metal, or managed infrastructure.'
            ],
            [
              'Availability',
              'Capacity, region, and delivery dates are confirmed with your request.'
            ]
          ].map(([title, desc]) => (
            <div key={title}>
              <h3 className="text-[13px] font-semibold">{title}</h3>
              <p className="text-[12px] text-muted mt-2 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
        <CTAPrimary
          to="/find-capacity"
          state={{ gpu: GPUS[slug].name }}
          className="mt-6"
        >
          Request {GPUS[slug].name} capacity
        </CTAPrimary>
      </div>
    </Reveal>
  )
}

export default function GpuDetail() {
  const { slug } = useParams()
  const gpu = gpuBySlug(slug)
  const theme = useTheme()
  const { paused } = useMotionSettings()
  if (!gpu) return <Navigate to="/#capacity" replace />

  const accent = theme === 'dark' ? '#b8a080' : '#2e4080'

  const idx = GPU_ORDER.indexOf(slug)
  const prev = GPU_ORDER[(idx - 1 + GPU_ORDER.length) % GPU_ORDER.length]
  const next = GPU_ORDER[(idx + 1) % GPU_ORDER.length]
  const related = GPU_ORDER.filter(
    (s) => s !== slug && GPUS[s].generation === gpu.generation
  ).slice(0, 3)
  const rel = related.length
    ? related
    : GPU_ORDER.filter((s) => s !== slug).slice(0, 3)

  return (
    <>
      <PageHero
        crumb={`GPU Cloud / ${gpu.name}`}
        title={`NVIDIA ${gpu.name}`}
        highlight={
          /NVL/.test(gpu.full)
            ? `NVL72 · ${gpu.generation}`
            : `${gpu.generation} GPU`
        }
        diagramLabel={gpu.name}
        sub={gpu.desc}
      >
        <div className="flex flex-wrap items-center gap-3">
          <CTAPrimary to="/find-capacity" state={{ gpu: gpu.name }}>
            Find {gpu.name} Capacity
          </CTAPrimary>
          <CTAGhost to="/#capacity">Explore our GPUs</CTAGhost>
          <span className="font-mono text-[11px] px-3 py-1.5 rounded-full bg-surface border border-border text-faint">
            {gpu.status}
          </span>
        </div>
      </PageHero>

      {/* chips strip */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 -mt-4">
        <div className="flex flex-wrap gap-2">
          {gpu.chips.map((c) => (
            <span
              key={c}
              className="font-mono text-[12px] px-3.5 py-1.5 rounded-full bg-surface border border-border text-muted"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      <section className="py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
          {/* 3D tilt visual card */}
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <Tilt max={6}>
                <div className="relative rounded-[24px] bg-gradient-to-b from-surface to-surface2 border border-border p-8 lg:p-10 overflow-hidden">
                  <div
                    className="absolute inset-0 dot-pattern opacity-20"
                    aria-hidden
                  />
                  <div
                    className="absolute -top-20 -right-20 w-[280px] h-[280px] rounded-full blur-[70px]"
                    style={{ background: `${accent}18` }}
                    aria-hidden
                  />

                  <div
                    className="relative"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint">
                        {gpu.full}
                      </span>
                      <Cpu className="w-5 h-5 text-faint" />
                    </div>

                    {/* stylized GPU die */}
                    <div className="mt-8 flex justify-center">
                      <div className="relative w-[240px] h-[240px]">
                        <div className="absolute inset-0 rounded-[28px] border-2 border-border bg-bg/60" />
                        <div className="absolute inset-[18px] rounded-[20px] border border-border bg-surface2" />
                        <div
                          className="absolute inset-[42px] rounded-[14px] border flex items-center justify-center"
                          style={{
                            borderColor: `${accent}55`,
                            background: `${accent}0d`
                          }}
                        >
                          <div className="text-center">
                            <div
                              className="font-display font-bold text-[34px] leading-none"
                              style={{ color: accent }}
                            >
                              {gpu.name}
                            </div>
                            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-faint mt-2">
                              {gpu.generation}
                            </div>
                            <div className="font-mono text-[11px] text-muted mt-3">
                              {gpu.specs['GPU memory'] ||
                                gpu.specs['GPUs per rack']}
                            </div>
                          </div>
                        </div>
                        {/* corner pads */}
                        {[
                          ['top-2 left-2'],
                          ['top-2 right-2'],
                          ['bottom-2 left-2'],
                          ['bottom-2 right-2']
                        ].map((pos) => (
                          <div
                            key={pos}
                            className={`absolute ${pos} w-3 h-3 rounded-full bg-surface3 border border-border`}
                          />
                        ))}
                        <motion.div
                          aria-hidden
                          className="absolute inset-[42px] rounded-[14px]"
                          style={{ boxShadow: `0 0 40px ${accent}33` }}
                          animate={{ opacity: paused ? 1 : [0.4, 1, 0.4] }}
                          transition={{
                            duration: paused ? 0 : 3,
                            repeat: paused ? 0 : Infinity
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {Object.entries(gpu.specs)
                        .slice(0, 4)
                        .map(([k, v]) => (
                          <div
                            key={k}
                            className="rounded-xl bg-bg/70 border border-border p-3"
                          >
                            <div className="font-mono text-[9.5px] uppercase tracking-wide text-faint">
                              {k}
                            </div>
                            <div className="font-mono text-[12px] text-text mt-1 leading-snug">
                              {v}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </Tilt>

              {/* best for */}
              <div className="mt-5 rounded-2xl bg-surface border border-border p-6">
                <div className="font-mono text-[11px] tracking-wide uppercase text-faint mb-3">
                  Best suited for
                </div>
                <div className="space-y-2.5">
                  {gpu.bestFor.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-2.5 text-[13.5px] text-muted"
                    >
                      <Check className="w-4 h-4 text-accent shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* specs */}
          <div>
            <Reveal>
              <div className="rounded-[20px] bg-surface border border-border overflow-hidden">
                <div className="px-6 lg:px-8 py-5 border-b border-border">
                  <div className="font-display font-semibold text-[17px]">
                    Datasheet specifications
                  </div>
                  <div className="font-mono text-[11.5px] text-faint mt-0.5">
                    Compute figures describe the reference variant; see the
                    variant table below. *Sparse where applicable.
                  </div>
                  <a
                    className="inline-flex items-center gap-1 text-[12px] text-accent mt-3 underline underline-offset-4"
                    href={GPU_REFERENCES[slug]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    NVIDIA specifications{' '}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </a>
                </div>
                <div className="divide-y divide-border">
                  {Object.entries(gpu.specs).map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-4 px-6 lg:px-8 py-3.5 hover:bg-surface2/50 transition-colors"
                    >
                      <div className="font-mono text-[11.5px] uppercase tracking-wide text-faint pt-0.5">
                        {k}
                      </div>
                      <div className="font-mono text-[13px] text-text leading-[1.5]">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* variants */}
            <Reveal delay={0.05} className="mt-6">
              <div
                className="rounded-[20px] bg-surface border border-border overflow-hidden overflow-x-auto"
                role="region"
                aria-label={`${gpu.name} variants, horizontally scrollable`}
                tabIndex={0}
              >
                <table className="w-full min-w-[560px]">
                  <caption className="sr-only">
                    {gpu.name} hardware variants and reference specifications
                  </caption>
                  <thead>
                    <tr className="border-b border-border bg-surface2/40">
                      {[
                        'Variant',
                        'Memory',
                        'Bandwidth',
                        'Tensor peak*',
                        'TDP',
                        'Typical use'
                      ].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="text-left font-mono text-[10.5px] tracking-wide uppercase text-faint font-medium px-5 py-3.5"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {gpu.variants.map((v) => (
                      <tr
                        key={v.id}
                        className="hover:bg-surface2/50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-display font-semibold text-[13.5px]">
                          {v.name}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12.5px] text-muted">
                          {v.mem}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12.5px] text-muted">
                          {v.bw}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12.5px] text-muted">
                          {v.fp8}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12.5px] text-muted">
                          {v.tdp}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[12px] text-faint">
                          {v.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            {/* node config */}
            <Reveal delay={0.1} className="mt-6">
              <div className="rounded-[20px] bg-surface border border-border overflow-hidden">
                <div className="px-6 lg:px-8 py-5 border-b border-border flex items-center justify-between">
                  <div className="font-display font-semibold text-[17px]">
                    {gpu.nodeConfig.title}
                  </div>
                  <span className="font-mono text-[10.5px] px-2.5 py-1 rounded-full bg-accentDim text-accent border border-accent/20">
                    REFERENCE
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {gpu.nodeConfig.rows.map(([k, v]) => (
                    <div
                      key={k}
                      className="grid grid-cols-[150px_1fr] gap-4 px-6 lg:px-8 py-3.5 hover:bg-surface2/50 transition-colors"
                    >
                      <div className="font-mono text-[11.5px] uppercase tracking-wide text-faint pt-0.5">
                        {k}
                      </div>
                      <div className="text-[13.5px] text-text leading-[1.5]">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <AvailabilityPanel slug={slug} />
        </div>
      </section>

      {/* prev / next + related */}
      <section className="pb-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <div className="font-mono text-[10px] uppercase tracking-wide text-faint mb-3">
              Compare and learn
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {(GPU_READING[slug] || []).map(relatedLink).filter(Boolean).map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="group rounded-xl bg-surface border border-border p-5 hover:border-accent/25 hover:bg-surface2 transition-all"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-faint">
                    {l.kind}
                  </div>
                  <div className="font-display font-semibold text-[15px] mt-1 group-hover:text-accent transition-colors">
                    {l.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rel.map((s) => {
              const g = GPUS[s]
              return (
                <Link
                  key={s}
                  to={`/gpu/${s}`}
                  className="group rounded-xl bg-surface border border-border p-5 hover:border-accent/25 hover:bg-surface2 transition-all"
                >
                  <div className="font-mono text-[10px] uppercase tracking-wide text-faint">
                    {g.generation}
                  </div>
                  <div className="font-display font-bold text-[20px] mt-1 group-hover:text-accent transition-colors">
                    {g.name}
                  </div>
                  <div className="font-mono text-[11.5px] text-faint mt-1">
                    {g.chips[0]} · {g.chips[1]}
                  </div>
                </Link>
              )
            })}
            <div className="rounded-xl bg-accentDim border border-accent/20 p-5 flex flex-col justify-between">
              <div className="font-display font-semibold text-[15px]">
                Not sure which GPU fits your workload?
              </div>
              <Link
                to="/services#svc-advisory"
                className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] text-accent hover:underline"
              >
                Get architecture advisory{' '}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Link
              to={`/gpu/${prev}`}
              className="inline-flex items-center gap-2 font-mono text-[12.5px] text-muted hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> {GPUS[prev].name}
            </Link>
            <Link
              to={`/gpu/${next}`}
              className="inline-flex items-center gap-2 font-mono text-[12.5px] text-muted hover:text-accent transition-colors"
            >
              {GPUS[next].name} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  )
}
