import React, { useId, useState } from 'react'
import {
  Cpu,
  Building2,
  Zap,
  Snowflake,
  Server,
  Network,
  Landmark,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { SPOKES } from '../data/infrastructure'
import { useMotionSettings } from './MotionSettings'
import {
  VIEW,
  HUB,
  NODE_R,
  RING,
  CLIENT,
  spokePositions
} from './hub-geometry'
import './hub-spoke.css'

export const SPOKE_ICONS = {
  Cpu,
  Building2,
  Zap,
  Snowflake,
  Server,
  Network,
  Landmark,
  RefreshCw
}

const POSITIONS = spokePositions(SPOKES.length)
const HUB_TEXT =
  'AnthroPrime is the accountable hub: one point of contact that brings the right collaborators together, verifies every option and stays accountable from requirement to running workload.'

/**
 * Hub-and-spoke model: AnthroPrime at the centre, eight collaborator types
 * around it, and one connection to the client's AI workload.
 * variant="full"    interactive diagram + detail panel; a list on mobile.
 * variant="compact" decorative hero version (no interaction).
 */
export default function HubSpokeDiagram({ variant = 'full' }) {
  const { paused } = useMotionSettings()
  const [active, setActive] = useState(null)
  const id = useId().replace(/:/g, '')
  const compact = variant === 'compact'
  const spoke = active === null ? null : SPOKES[active]
  const interactive = !compact

  const canvas = (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className="hub-canvas"
      role={compact ? undefined : 'group'}
      aria-hidden={compact || undefined}
      aria-label={
        compact ? undefined : 'Collaborator network. Select a collaborator type.'
      }
    >
      <defs>
        <clipPath id={`${id}-hub`}>
          <circle cx={HUB.x} cy={HUB.y} r={HUB.r - 6} />
        </clipPath>
      </defs>
      <circle cx={HUB.x} cy={HUB.y} r={RING} className="hub-orbit" />
      {SPOKES.map((s, i) => {
        const p = POSITIONS[i]
        return (
          <g key={s.id} className={active === i ? 'is-active' : ''}>
            <line
              x1={p.x1}
              y1={p.y1}
              x2={p.x2}
              y2={p.y2}
              className="hub-line"
            />
            {!paused && (
              <line
                x1={p.x1}
                y1={p.y1}
                x2={p.x2}
                y2={p.y2}
                pathLength="100"
                className="hub-pulse"
                style={{ animationDelay: `${i * -0.45}s` }}
              />
            )}
          </g>
        )
      })}
      <line
        x1={HUB.x}
        y1={HUB.y + HUB.r}
        x2={CLIENT.x}
        y2={CLIENT.y - CLIENT.height / 2}
        className="hub-client-line"
      />
      {!paused && (
        <line
          x1={HUB.x}
          y1={HUB.y + HUB.r}
          x2={CLIENT.x}
          y2={CLIENT.y - CLIENT.height / 2}
          pathLength="100"
          className="hub-pulse hub-pulse-client"
        />
      )}
      <g className="hub-centre">
        <title>AnthroPrime — the accountable hub</title>
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r} className="hub-core" />
        <image
          href="/logo.png"
          x={HUB.x - 38}
          y={HUB.y - 38}
          width="76"
          height="47"
          clipPath={`url(#${id}-hub)`}
          preserveAspectRatio="xMidYMid meet"
        />
        <text x={HUB.x} y={HUB.y + 22} textAnchor="middle" className="hub-name">
          ANTHROPRIME
        </text>
        <text x={HUB.x} y={HUB.y + 35} textAnchor="middle" className="hub-role">
          THE ACCOUNTABLE HUB
        </text>
      </g>
      {SPOKES.map((s, i) => {
        const p = POSITIONS[i]
        const Icon = SPOKE_ICONS[s.icon]
        const select = () => setActive(i)
        return (
          <g
            key={s.id}
            className={`hub-node ${active === i ? 'is-active' : ''}`}
            {...(interactive && {
              role: 'button',
              tabIndex: 0,
              'aria-label': s.title,
              'aria-pressed': active === i,
              'aria-controls': `${id}-panel`,
              onClick: select,
              onFocus: select,
              onMouseEnter: select,
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  select()
                }
              }
            })}
          >
            <circle cx={p.x} cy={p.y} r={NODE_R + 10} className="hub-hit" />
            <circle cx={p.x} cy={p.y} r={NODE_R} className="hub-node-ring" />
            <Icon
              x={p.x - 10}
              y={p.y - 10}
              width="20"
              height="20"
              strokeWidth={1.5}
              aria-hidden="true"
              className="hub-node-icon"
            />
            <text
              x={p.lx}
              y={p.ly}
              textAnchor={p.anchor}
              className="hub-label"
            >
              {s.short}
            </text>
          </g>
        )
      })}
      <g className="hub-client">
        <rect
          x={CLIENT.x - CLIENT.width / 2}
          y={CLIENT.y - CLIENT.height / 2}
          width={CLIENT.width}
          height={CLIENT.height}
          rx={CLIENT.height / 2}
        />
        <text x={CLIENT.x} y={CLIENT.y + 4} textAnchor="middle">
          YOUR AI WORKLOAD
        </text>
      </g>
    </svg>
  )

  if (compact)
    return (
      <figure
        className="hub-diagram hub-diagram--compact"
        role="img"
        aria-label="AnthroPrime as the accountable hub, connected to GPU, data centre, power, cooling, integration, network, capital and lifecycle collaborators, with a single connection to your AI workload"
      >
        {canvas}
      </figure>
    )

  return (
    <div className="hub-diagram hub-diagram--full">
      <figure className="hub-figure">
        {canvas}
        <figcaption className="mono">
          One connection for you. Many collaborators behind the hub.
        </figcaption>
      </figure>
      <aside
        id={`${id}-panel`}
        className="hub-panel"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="mono hub-panel-index">
          {spoke
            ? `Spoke ${String(active + 1).padStart(2, '0')} / ${String(SPOKES.length).padStart(2, '0')}`
            : 'The hub'}
        </span>
        <h3>{spoke ? spoke.title : 'AnthroPrime — the accountable hub'}</h3>
        <p>{spoke ? spoke.description : HUB_TEXT}</p>
        <div className="hub-panel-chips" aria-label="Collaborator types">
          {SPOKES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={active === i}
              onClick={() => setActive(active === i ? null : i)}
            >
              {s.short}
            </button>
          ))}
        </div>
      </aside>
      {/* Mobile: hub at the top, spokes as an accordion. */}
      <div className="hub-list">
        <div className="hub-list-hub">
          <img src="/logo.png" alt="" width="56" height="35" />
          <div>
            <h3>AnthroPrime — the accountable hub</h3>
            <p>{HUB_TEXT}</p>
          </div>
        </div>
        <ul>
          {SPOKES.map((s) => {
            const Icon = SPOKE_ICONS[s.icon]
            return (
              <li key={s.id}>
                <details>
                  <summary>
                    <Icon aria-hidden="true" />
                    <span>{s.title}</span>
                    <ChevronDown aria-hidden="true" className="hub-chevron" />
                  </summary>
                  <p>{s.description}</p>
                </details>
              </li>
            )
          })}
        </ul>
        <div className="hub-list-client mono">
          Your AI workload · one connection
        </div>
      </div>
    </div>
  )
}
