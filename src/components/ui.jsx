import React, { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { useMotionSettings } from './MotionSettings'
import HeroDiagram from './HeroDiagram'

/**
 * Typewriter — types its lines out one character at a time, line by line.
 *
 * lines: ['text'] or [{ text, className, tail }]. `tail` is rendered after the
 * line once that line has finished typing (used for the headline underline).
 *
 * Accessibility / SEO: the complete text is always in the DOM as an sr-only
 * node, so screen readers and crawlers read the finished headline even while
 * the visible copy is still animating. Users who prefer reduced motion get the
 * full text immediately.
 */
export function Typewriter({
  lines,
  speed = 52,
  linePause = 300,
  startDelay = 220,
  caret = true,
  caretClassName = '',
  lineClassName = '',
  className = '',
  onDone
}) {
  const items = lines.map((l) => (typeof l === 'string' ? { text: l } : l))
  const ends = []
  let acc = 0
  items.forEach((l) => {
    acc += l.text.length
    ends.push(acc)
  })
  const total = acc

  const [typed, setTyped] = useState(0)
  const [reduced, setReduced] = useState(false)
  const { paused } = useMotionSettings()
  const doneRef = useRef(null)
  const completedRef = useRef(false)
  doneRef.current = onDone

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e) => setReduced(e.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else if (mq.addListener) mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else if (mq.removeListener) mq.removeListener(onChange)
    }
  }, [])

  useEffect(() => {
    if (completedRef.current) return
    if (reduced || paused || total === 0) {
      completedRef.current = true
      setTyped(total)
      doneRef.current?.()
      return
    }
    setTyped(0)
    const boundaries = new Set(ends.slice(0, -1))
    let n = 0
    let id
    const step = () => {
      n += 1
      setTyped(n)
      if (n < total)
        id = setTimeout(step, boundaries.has(n) ? linePause : speed)
      else {
        completedRef.current = true
        doneRef.current?.()
      }
    }
    id = setTimeout(step, startDelay)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, paused, total, speed, linePause, startDelay])

  const done = typed >= total
  const caretLine = done
    ? items.length - 1
    : Math.max(
        0,
        ends.findIndex((e) => typed < e)
      )

  return (
    <>
      <span className="sr-only">{items.map((l) => l.text).join(' ')}</span>
      <span aria-hidden="true" className={className}>
        {items.map((item, i) => {
          const start = i === 0 ? 0 : ends[i - 1]
          const shown = item.text.slice(
            0,
            Math.max(0, Math.min(item.text.length, typed - start))
          )
          const lineDone = typed >= ends[i]
          return (
            <span
              key={i}
              className={`block ${item.className || lineClassName}`}
            >
              {shown}
              {caret && i === caretLine && (
                <span className={`type-caret ${caretClassName}`} />
              )}
              {lineDone && item.tail}
            </span>
          )
        })}
      </span>
    </>
  )
}

/** Eyebrow tag used above section titles */
export function Tag({ children }) {
  return (
    <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-accent mb-4">
      <span className="w-6 h-px bg-accent" /> {children}
    </div>
  )
}

/** Scroll-reveal wrapper */
export function Reveal({ children, delay = 0, className = '' }) {
  const { paused } = useMotionSettings()
  return (
    <motion.div
      initial={paused ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.55, ease: [0.21, 0.6, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/** Primary / secondary CTA buttons (router-aware) */
export function CTAPrimary({ to, href, state, children, className = '' }) {
  const cls = `btn btn-primary ${className}`
  return to ? (
    <Link to={to} state={state} className={cls}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children} <ArrowUpRight className="w-4 h-4" />
    </a>
  )
}

export function CTAGhost({ to, href, state, children, className = '' }) {
  const cls = `btn btn-secondary ${className}`
  return to ? (
    <Link to={to} state={state} className={cls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls}>
      {children}
    </a>
  )
}

/** Sub-page hero with breadcrumb */
export function PageHero({
  crumb,
  title,
  highlight,
  sub,
  children,
  diagram,
  diagramLabel
}) {
  // The hero is above the fold: no entrance animation on the first page view.
  const { paused: motionPaused, firstView } = useMotionSettings()
  const paused = motionPaused || firstView
  const variant =
    diagram ||
    { Company: 'practice', 'GPU Cloud': 'gpu' }[crumb.split(' / ')[0]] ||
    crumb.split(' / ')[0]
  return (
    <section className="page-hero">
      <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="page-hero-layout">
          <div className="page-hero-copy">
            <motion.nav
              initial={paused ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="breadcrumb mono"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-muted">{crumb}</span>
            </motion.nav>
            <motion.h1
              initial={paused ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
            >
              {title} {highlight && <span>{highlight}</span>}
            </motion.h1>
            {sub && (
              <motion.p
                initial={paused ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
              >
                {sub}
              </motion.p>
            )}
            {children && (
              <motion.div
                initial={paused ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="hero-children"
              >
                {children}
              </motion.div>
            )}
          </div>
          <HeroDiagram
            variant={variant}
            label={diagramLabel || (variant === 'gpu' ? title : undefined)}
          />
        </div>
      </div>
    </section>
  )
}

/** 3D mouse-tilt card */
export function Tilt({ children, className = '', max = 7 }) {
  const ref = useRef(null)
  const [t, setT] = useState({ rx: 0, ry: 0 })
  const { paused } = useMotionSettings()

  const onMove = (e) => {
    const el = ref.current
    if (!el || paused) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    setT({ rx: -py * max, ry: px * max })
  }

  return (
    <div style={{ perspective: '1000px' }} className={className}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setT({ rx: 0, ry: 0 })}
        style={{
          transform: paused
            ? 'none'
            : `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.18s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Stat block */
export function Stat({ value, label, accent = false }) {
  return (
    <div>
      <div
        className={`font-display font-bold text-[26px] leading-none ${accent ? 'text-accent' : ''}`}
      >
        {value}
      </div>
      <div className="font-mono text-[10.5px] tracking-wide uppercase text-faint mt-1.5">
        {label}
      </div>
    </div>
  )
}

/** Section heading block */
export function SectionHead({ tag, title, sub, center = false }) {
  return (
    <Reveal className={`max-w-[760px] ${center ? 'mx-auto text-center' : ''}`}>
      {tag && <Tag>{tag}</Tag>}
      <h2 className="font-display font-bold text-[30px] lg:text-[42px] leading-[1.08] tracking-[-0.02em]">
        {title}
      </h2>
      {sub && (
        <p className="text-[16px] leading-[1.6] text-muted mt-4">{sub}</p>
      )}
    </Reveal>
  )
}
