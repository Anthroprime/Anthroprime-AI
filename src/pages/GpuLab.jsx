import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Cpu,
  Lightbulb,
  Check,
  ChevronRight
} from 'lucide-react'
import { Reveal } from '../components/ui'
import { useMotionSettings } from '../components/MotionSettings'
import {
  GPU_PARTS,
  LEARNING_SOURCES,
  PRECISIONS,
  PIPELINES,
  KNOWLEDGE_CHECK,
  weightMemoryGB,
  completedTasks
} from '../data/learning'
import FinalCTA from '../components/FinalCTA'

function Tabs({ items, value, onChange, label, prefix }) {
  const buttons = useRef([])
  const move = (e, index) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % items.length
    else if (e.key === 'ArrowLeft')
      next = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else return
    e.preventDefault()
    onChange(items[next].id)
    buttons.current[next]?.focus()
  }
  return (
    <div className="lab-tabs" role="tablist" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item.id}
          ref={(el) => (buttons.current[i] = el)}
          id={`${prefix}-tab-${item.id}`}
          role="tab"
          aria-selected={value === item.id}
          aria-controls={`${prefix}-panel`}
          tabIndex={value === item.id ? 0 : -1}
          onKeyDown={(e) => move(e, i)}
          onClick={() => onChange(item.id)}
        >
          {item.number && <span>{item.number}</span>}
          {item.title || item.label}
        </button>
      ))}
    </div>
  )
}

function ArchitectureExplorer() {
  const [selected, setSelected] = useState('compute')
  const part = GPU_PARTS.find((p) => p.id === selected)
  return (
    <section className="section" id="architecture">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">01 / Open the black box</div>
            <h2>
              A small package.
              <br />
              <em>An extraordinary system.</em>
            </h2>
          </Reveal>
          <p>
            Select a component to see what it does, and why it matters to your
            workload.
          </p>
        </div>
        <div className="lab-console architecture-console">
          <div className="console-topline mono">
            <span>
              <span className="status-dot" />
              Architecture explorer
            </span>
            <span>Conceptual schematic / Not to scale</span>
          </div>
          <Tabs
            items={GPU_PARTS}
            value={selected}
            onChange={setSelected}
            label="GPU components"
            prefix="architecture"
          />
          <div className="architecture-layout">
            <div className={`chip-schematic chip-focus-${selected}`}>
              <svg
                viewBox="0 0 600 410"
                aria-hidden="true"
                className="chip-svg"
              >
                <defs>
                  <pattern
                    id="chip-grid"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M24 0H0V24"
                      fill="none"
                      stroke="#7288d6"
                      strokeWidth=".5"
                      opacity=".22"
                    />
                  </pattern>
                  <linearGradient id="die-fill" x2="1" y2="1">
                    <stop stopColor="#2b4068" />
                    <stop offset="1" stopColor="#12213b" />
                  </linearGradient>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="600"
                  height="410"
                  fill="url(#chip-grid)"
                />
                <rect
                  className="schematic-board"
                  x="58"
                  y="28"
                  width="484"
                  height="342"
                  rx="20"
                />
                <rect
                  x="82"
                  y="49"
                  width="436"
                  height="300"
                  rx="12"
                  fill="#14243e"
                  stroke="#7288d64a"
                />
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <g
                    className="schematic-memory"
                    key={i}
                    transform={`translate(${i < 3 ? 105 : 425},${76 + (i % 3) * 85})`}
                  >
                    <rect width="70" height="59" rx="4" />
                    {[0, 1, 2, 3].map((j) => (
                      <path key={j} d={`M9 ${13 + j * 10}H61`} />
                    ))}
                  </g>
                ))}
                <rect
                  className="schematic-compute"
                  x="204"
                  y="83"
                  width="192"
                  height="225"
                  rx="8"
                />
                {Array.from({ length: 24 }, (_, i) => (
                  <rect
                    key={i}
                    className={`compute-tile tile-${i % 4}`}
                    x={220 + (i % 4) * 43}
                    y={100 + Math.floor(i / 4) * 32}
                    width="30"
                    height="20"
                    rx="2"
                  />
                ))}
                {Array.from({ length: 6 }, (_, i) => (
                  <path
                    className="schematic-trace"
                    key={i}
                    d={`M175 ${100 + i * 31}H204M396 ${100 + i * 31}H425`}
                  />
                ))}
                <path
                  className="schematic-fabric"
                  d="M220 319V341H380V319M254 341V379M279 341V379M304 341V379M329 341V379M354 341V379"
                />
                <rect
                  className="schematic-connector"
                  x="218"
                  y="372"
                  width="165"
                  height="14"
                  rx="2"
                />
                <path
                  className="chip-data-packet"
                  d="M175 116H204M396 178H425M300 320V370"
                />
                <text
                  x="300"
                  y="326"
                  textAnchor="middle"
                  className="schematic-label"
                >
                  AI ACCELERATOR
                </text>
              </svg>
              <button
                className={`chip-hotspot hotspot-compute ${selected === 'compute' ? 'active' : ''}`}
                aria-label="Explore compute engines"
                aria-pressed={selected === 'compute'}
                onClick={() => setSelected('compute')}
              >
                01
              </button>
              <button
                className={`chip-hotspot hotspot-memory ${selected === 'memory' ? 'active' : ''}`}
                aria-label="Explore high-bandwidth memory"
                aria-pressed={selected === 'memory'}
                onClick={() => setSelected('memory')}
              >
                02
              </button>
              <button
                className={`chip-hotspot hotspot-fabric ${selected === 'fabric' ? 'active' : ''}`}
                aria-label="Explore GPU interconnect"
                aria-pressed={selected === 'fabric'}
                onClick={() => setSelected('fabric')}
              >
                03
              </button>
              <button
                className={`chip-hotspot hotspot-system ${selected === 'system' ? 'active' : ''}`}
                aria-label="Explore the surrounding system"
                aria-pressed={selected === 'system'}
                onClick={() => setSelected('system')}
              >
                04
              </button>
              <div className="schematic-bottom mono">
                Select a numbered hotspot to explore
              </div>
            </div>
            <div
              className="architecture-detail"
              id="architecture-panel"
              role="tabpanel"
              aria-labelledby={`architecture-tab-${selected}`}
              tabIndex={0}
            >
              <span className="mono lab-gold">Component / {part.number}</span>
              <h3>{part.label}</h3>
              <p>{part.body}</p>
              <div className="lab-insight">
                <Lightbulb size={17} />
                <p>{part.why}</p>
              </div>
              <span className="lab-signal mono">{part.signal}</span>
              <a
                className="lab-source"
                href={LEARNING_SOURCES[part.source].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the engineering background
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ParallelExplorer() {
  const [step, setStep] = useState(0)
  const [workers, setWorkers] = useState(8)
  const [dependent, setDependent] = useState(false)
  const [running, setRunning] = useState(false)
  const [visible, setVisible] = useState(true)
  const holder = useRef()
  const { paused } = useMotionSettings()
  const total = 32
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    o.observe(holder.current)
    return () => o.disconnect()
  }, [])
  useEffect(() => {
    if (!running || paused || !visible || step >= total) return
    const timer = setTimeout(() => setStep((s) => Math.min(total, s + 1)), 320)
    return () => clearTimeout(timer)
  }, [running, paused, visible, step])
  useEffect(() => {
    if (step === total) setRunning(false)
  }, [step])
  const reset = () => {
    setStep(0)
    setRunning(false)
  }
  const values = [
    completedTasks(step, 1, total, dependent),
    completedTasks(step, workers, total, dependent)
  ]
  return (
    <section className="section parallel-section" id="parallel" ref={holder}>
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">02 / Think in parallel</div>
            <h2>
              Same work.
              <br />
              <em>A different way through.</em>
            </h2>
          </Reveal>
          <p>
            Move through 32 tasks one step at a time. Change the number of
            workers. Then introduce a dependency.
          </p>
        </div>
        <div className="lab-console parallel-console">
          <div className="console-topline mono">
            <span>
              <span className="status-dot" />
              Parallelism playground
            </span>
            <span>Illustrative scheduler · Not a benchmark</span>
          </div>
          <div className="parallel-controls">
            <div className="lab-toggle" aria-label="Task relationship">
              {[
                [false, 'Independent tasks'],
                [true, 'Chained tasks']
              ].map(([value, label]) => (
                <button
                  key={label}
                  aria-pressed={dependent === value}
                  onClick={() => {
                    setDependent(value)
                    reset()
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="worker-control">
              Parallel workers
              <select
                aria-label="Parallel workers"
                value={workers}
                onChange={(e) => {
                  setWorkers(Number(e.target.value))
                  reset()
                }}
              >
                {[4, 8, 16].map((n) => (
                  <option key={n} value={n}>
                    {n} workers
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="task-lanes">
            {values.map((done, lane) => (
              <div className={`task-lane lane-${lane}`} key={lane}>
                <div className="lane-heading">
                  <div>
                    <Cpu size={18} />
                    <h3>{lane ? 'Parallel execution' : 'Serial execution'}</h3>
                    <span>
                      {lane
                        ? `${workers} illustrative workers`
                        : '1 illustrative worker'}
                    </span>
                  </div>
                  <span className="mono">
                    {done} / {total}
                  </span>
                </div>
                <div
                  className="task-cells"
                  role="progressbar"
                  aria-label={
                    lane ? 'Parallel tasks completed' : 'Serial tasks completed'
                  }
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={done}
                >
                  {Array.from({ length: total }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < done
                          ? 'done'
                          : i < done + (lane ? workers : 1) && step > 0
                            ? 'working'
                            : ''
                      }
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="parallel-footer">
            <div className="simulation-actions">
              <button
                className="btn btn-gold"
                disabled={paused}
                onClick={() => {
                  if (step === total) setStep(0)
                  setRunning((r) => !r)
                }}
              >
                {running && !paused ? <Pause size={15} /> : <Play size={15} />}{' '}
                {running ? 'Pause' : 'Run demo'}
              </button>
              <button
                className="simulation-icon"
                aria-label="Advance one step"
                disabled={step === total}
                onClick={() => {
                  setRunning(false)
                  setStep((s) => Math.min(total, s + 1))
                }}
              >
                <SkipForward size={18} />
              </button>
              <button
                className="simulation-icon"
                aria-label="Reset simulation"
                onClick={reset}
              >
                <RotateCcw size={17} />
              </button>
            </div>
            <span className="mono">
              Step {step} / {total}
              {paused ? ' · Motion paused. Use Step.' : ''}
            </span>
          </div>
          <p className="parallel-explanation">
            {dependent
              ? 'When each task needs the previous result, the dependency chain limits parallel work—even with more workers.'
              : 'Independent tasks can be divided across workers. This diagram illustrates scheduling, not CPU/GPU speed, core counts, or measured throughput.'}
          </p>
        </div>
        <p className="lab-footnote">
          Real CPUs also execute work in parallel. GPU acceleration depends on
          the algorithm, data movement, utilization, and software.{' '}
          <a
            href={LEARNING_SOURCES[0].url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore CUDA’s programming model ↗
          </a>
        </p>
      </div>
    </section>
  )
}

function MemoryExplorer() {
  const [parameters, setParameters] = useState(70)
  const [precision, setPrecision] = useState('bf16')
  const [budget, setBudget] = useState(80)
  const setting = PRECISIONS.find((p) => p.id === precision)
  const weights = weightMemoryGB(parameters, setting.bits)
  const remaining = budget - weights
  const percentage = Math.min(100, (weights / budget) * 100)
  return (
    <section className="section" id="memory">
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">03 / Make room for intelligence</div>
            <h2>
              How big is a model,
              <br />
              <em>really?</em>
            </h2>
          </Reveal>
          <p>
            Change model size and precision. Watch the weight-storage footprint
            change before runtime memory even enters the picture.
          </p>
        </div>
        <div className="memory-explorer">
          <div className="memory-inputs">
            <span className="mono lab-gold">Try a different scale</span>
            <label htmlFor="model-size" className="memory-slider-label">
              Model parameters
              <strong>
                {parameters}
                <span> billion</span>
              </strong>
            </label>
            <input
              id="model-size"
              type="range"
              min="1"
              max="200"
              step="1"
              value={parameters}
              onChange={(e) => setParameters(Number(e.target.value))}
              aria-valuetext={`${parameters} billion parameters`}
            />
            <div className="memory-presets" aria-label="Parameter presets">
              {[7, 13, 70, 175].map((n) => (
                <button
                  key={n}
                  aria-pressed={parameters === n}
                  onClick={() => setParameters(n)}
                >
                  {n}B
                </button>
              ))}
            </div>
            <label htmlFor="weight-precision" className="memory-field-label">
              Weight precision
            </label>
            <select
              id="weight-precision"
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
            >
              {PRECISIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} · {p.note}
                </option>
              ))}
            </select>
            <label htmlFor="memory-budget" className="memory-field-label">
              Illustrative memory budget
            </label>
            <select
              id="memory-budget"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            >
              {[24, 48, 80, 141, 192].map((n) => (
                <option key={n} value={n}>
                  {n} GB
                </option>
              ))}
            </select>
            <p className="memory-unit-note">
              Decimal GB (10⁹ bytes). These are memory budgets, not GPU
              recommendations.
            </p>
          </div>
          <div className="memory-output" aria-live="polite" aria-atomic="true">
            <div className="console-topline mono">
              <span>Weights only</span>
              <span>{setting.label}</span>
            </div>
            <div className="memory-number">
              {Number(weights.toFixed(2))}
              <span> GB</span>
            </div>
            <p className="memory-formula">
              {parameters}B parameters × {setting.bits} bits ÷ 8
            </p>
            <div
              className="memory-tank"
              role="img"
              aria-label={`${weights} GB of weights against a ${budget} GB budget`}
            >
              <div
                className={`memory-fill ${remaining < 0 ? 'overflow' : ''}`}
                style={{ width: `${percentage}%` }}
              />
              <div className="memory-tank-lines" aria-hidden="true" />
            </div>
            <div className="memory-scale mono">
              <span>0 GB</span>
              <span>{budget} GB budget</span>
            </div>
            <div className={`memory-result ${remaining <= 0 ? 'tight' : ''}`}>
              <span className="status-dot" />
              {remaining > 0
                ? `${Number(remaining.toFixed(2))} GB remains before runtime allocations.`
                : remaining === 0
                  ? 'Weights fill the budget. No room remains for runtime allocations.'
                  : `Weights exceed this budget by ${Number(Math.abs(remaining).toFixed(2))} GB.`}
            </div>
            <div className="memory-runtime">
              <h3>Weights are the starting point.</h3>
              <p>
                KV cache, activations, temporary buffers, and framework
                allocations need additional space. Quantized weights also need
                metadata. Training adds gradients and optimizer state. This is
                not a total VRAM estimate or a guarantee that a model will run.
              </p>
              <p>
                <Link to="/guides/gpu-memory-for-llms" className="underline">
                  Estimate the full total, including KV cache, in our GPU
                  memory guide
                </Link>
                .
              </p>
            </div>
            <a
              className="lab-source"
              href={LEARNING_SOURCES[2].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about memory estimation
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function WorkflowExplorer({ compact = false }) {
  const [mode, setMode] = useState('inference')
  const [stage, setStage] = useState(0)
  const stages = PIPELINES[mode]
  const changeMode = (value) => {
    setMode(value)
    setStage(0)
  }
  return (
    <section
      className={`section workflow-section ${compact ? 'workflow-compact' : ''}`}
      id="workflows"
    >
      <div className="wrap">
        <div className="section-top">
          <Reveal>
            <div className="eyebrow mono">04 / Follow the workload</div>
            <h2>
              From data
              <br />
              <em>to something useful.</em>
            </h2>
          </Reveal>
          <p>
            Training changes a model’s parameters. Inference uses them. Trace
            the steps behind each process.
          </p>
        </div>
        <div className="workflow-console">
          <div className="workflow-top">
            <div className="lab-toggle" aria-label="AI workflow">
              {['inference', 'training'].map((m) => (
                <button
                  key={m}
                  aria-pressed={m === mode}
                  onClick={() => changeMode(m)}
                >
                  {m === 'inference' ? 'Inference' : 'Training'}
                </button>
              ))}
            </div>
            <span className="mono">
              Interactive walkthrough / Select a stage
            </span>
          </div>
          <div className="pipeline-stages">
            {stages.map((s, i) => (
              <button
                key={s.title}
                className={i === stage ? 'active' : i < stage ? 'visited' : ''}
                aria-pressed={stage === i}
                onClick={() => setStage(i)}
              >
                <span className="pipeline-node">
                  {i < stage ? (
                    <Check size={17} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <span>{s.title}</span>
                {i < 3 && <ArrowRight className="pipeline-arrow" size={18} />}
              </button>
            ))}
          </div>
          <div className="pipeline-detail" aria-live="polite">
            <span className="mono lab-gold">{stages[stage].tag}</span>
            <h3>{stages[stage].title}</h3>
            <p>{stages[stage].detail}</p>
            <div className="pipeline-actions">
              <button
                disabled={stage === 0}
                onClick={() => setStage((i) => Math.max(0, i - 1))}
              >
                ← Previous
              </button>
              <button onClick={() => setStage((i) => (i + 1) % 4)}>
                {stage === 3 ? 'Replay' : 'Next stage'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function KnowledgeCheck() {
  const [question, setQuestion] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const q = KNOWLEDGE_CHECK[question]
  const choose = (index) => {
    if (answer !== null) return
    setAnswer(index)
    if (index === q.correct) setScore((s) => s + 1)
  }
  const next = () => {
    if (question === KNOWLEDGE_CHECK.length - 1) {
      setFinished(true)
      return
    }
    setQuestion((i) => i + 1)
    setAnswer(null)
  }
  return (
    <section className="section knowledge-section" id="knowledge">
      <div className="wrap knowledge-layout">
        <div>
          <div className="eyebrow mono">05 / A little signal check</div>
          <h2 className="editorial-title">
            A few questions.
            <br />
            <em>A clearer picture.</em>
          </h2>
          <p className="knowledge-intro">
            Put the ideas together. Three quick questions, with an explanation
            after every answer.
          </p>
        </div>
        <div className="knowledge-card">
          <span className="sr-only" role="status">
            {finished
              ? `Knowledge check complete: ${score} out of ${KNOWLEDGE_CHECK.length} correct.`
              : ''}
          </span>
          {finished ? (
            <>
              <span className="mono lab-gold">Session complete</span>
              <h3>
                {score} / {KNOWLEDGE_CHECK.length}
              </h3>
              <p>
                {score === 3
                  ? 'A clear signal. You’ve connected the core ideas.'
                  : 'Good questions lead to better understanding. Revisit any section, or give it another go.'}
              </p>
              <button
                className="btn btn-primary mt-6"
                onClick={() => {
                  setQuestion(0)
                  setAnswer(null)
                  setScore(0)
                  setFinished(false)
                }}
              >
                Try again
                <RotateCcw size={16} />
              </button>
            </>
          ) : (
            <>
              <span className="mono lab-gold">
                Question {question + 1} / {KNOWLEDGE_CHECK.length}
              </span>
              <h3>{q.question}</h3>
              <div className="knowledge-options">
                {q.options.map((option, i) => (
                  <button
                    key={option}
                    disabled={answer !== null}
                    className={
                      answer !== null
                        ? i === q.correct
                          ? 'correct'
                          : i === answer
                            ? 'incorrect'
                            : ''
                        : ''
                    }
                    onClick={() => choose(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {option}
                    {answer !== null && i === q.correct && <Check size={16} />}
                  </button>
                ))}
              </div>
              {answer !== null && (
                <div className="answer-feedback" role="status">
                  <strong>
                    {answer === q.correct
                      ? 'Exactly.'
                      : 'Here’s the useful distinction.'}
                  </strong>
                  <p>{q.explanation}</p>
                  <button className="text-link" onClick={next}>
                    {question === 2 ? 'See result' : 'Next question'}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function GpuLab() {
  return (
    <>
      <section className="lab-hero">
        <div className="lab-hero-grid" aria-hidden="true" />
        <div className="wrap lab-hero-layout">
          <div className="lab-hero-copy">
            <div className="eyebrow mono">Anthroprime / The GPU Lab</div>
            <h1>
              Meet the engine.
              <br />
              <em>Behind the intelligence.</em>
            </h1>
            <p>
              Big ideas begin with a little understanding. Explore the silicon,
              follow the work, and make sense of the memory behind modern AI.
            </p>
            <a href="#architecture" className="btn btn-gold">
              Start exploring
              <ArrowDown size={16} />
            </a>
            <span className="lab-hero-note mono">
              Five experiments. One curious mind.
            </span>
          </div>
          <div className="lab-hero-art">
            <img
              src="/images/gpu-silicon.jpg"
              alt="Generated concept artwork of an AI accelerator package with gold contacts and indigo circuitry"
              width="1536"
              height="1024"
              fetchpriority="high"
            />
            <div className="lab-image-index mono">
              <span className="status-dot" />
              Silicon study / Concept artwork
            </div>
            <div className="lab-hero-scan" aria-hidden="true" />
          </div>
        </div>
      </section>
      <nav className="lab-section-nav" aria-label="GPU Lab experiments">
        <div className="wrap">
          {[
            ['architecture', 'Inside a GPU'],
            ['parallel', 'Parallelism'],
            ['memory', 'Model memory'],
            ['workflows', 'AI workflows'],
            ['knowledge', 'Knowledge check']
          ].map(([id, label], i) => (
            <a key={id} href={`#${id}`}>
              <span className="mono">0{i + 1}</span>
              {label}
              <ChevronRight size={13} />
            </a>
          ))}
        </div>
      </nav>
      <ArchitectureExplorer />
      <ParallelExplorer />
      <MemoryExplorer />
      <WorkflowExplorer />
      <KnowledgeCheck />
      <section className="lab-reading">
        <div className="wrap">
          <div>
            <span className="eyebrow mono">Keep exploring</span>
            <h2>Go closer to the source.</h2>
            <p>
              These explainers simplify concepts. Explore the engineering
              documentation for implementation details.
            </p>
          </div>
          <div className="lab-reading-links">
            {LEARNING_SOURCES.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.label}
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
          <Link className="text-link" to="/resources#comparison">
            Compare GPU specifications
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
      <FinalCTA />
    </>
  )
}
