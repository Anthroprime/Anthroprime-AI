// Shared geometry for the hub-and-spoke diagram. Pure JS so the build script
// can emit the same static SVG used when JavaScript is unavailable.
export const VIEW = { width: 720, height: 500 }
export const HUB = { x: 360, y: 210, r: 68 }
export const RING = 166
export const NODE_R = 24
export const LABEL_GAP = 44
export const CLIENT = { x: 360, y: 452, width: 210, height: 38 }

/** Eight spokes, offset half a step so none sits on the client line. */
export function spokePositions(count = 8) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((-90 + 180 / count + (360 / count) * i) * Math.PI) / 180
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const round = (n) => Math.round(n * 10) / 10
    return {
      x: round(HUB.x + RING * cos),
      y: round(HUB.y + RING * sin),
      // Line from the node edge to the hub edge.
      x1: round(HUB.x + (RING - NODE_R) * cos),
      y1: round(HUB.y + (RING - NODE_R) * sin),
      x2: round(HUB.x + HUB.r * cos),
      y2: round(HUB.y + HUB.r * sin),
      lx: round(HUB.x + (RING + LABEL_GAP) * cos),
      ly: round(HUB.y + (RING + LABEL_GAP) * sin + 4),
      anchor: cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle'
    }
  })
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const THEMES = {
  light: { bg: '#f5f4f1', ink: '#2e4080', node: '#faf9f7', text: '#1a2744' },
  dark: { bg: 'none', ink: '#9fb0e3', node: '#16233f', text: '#e9e7e1' }
}

/**
 * Static, dependency-free SVG (no icons, no motion) for the no-JavaScript
 * fallback and the social share image.
 */
export function staticHubSvg(spokes, { theme = 'light', mono = 'IBM Plex Mono, monospace' } = {}) {
  const pos = spokePositions(spokes.length)
  const { bg, ink, node, text } = THEMES[theme]
  const gold = '#b8a080'
  const parts = spokes.map((s, i) => {
    const p = pos[i]
    return `<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}" stroke="${ink}" stroke-opacity=".45" stroke-width="1.5"/><circle cx="${p.x}" cy="${p.y}" r="${NODE_R}" fill="${node}" stroke="${ink}" stroke-opacity=".5"/><circle cx="${p.x}" cy="${p.y}" r="4" fill="${gold}"/><text x="${p.lx}" y="${p.ly}" text-anchor="${p.anchor}" font-family="${mono}" font-size="12" fill="${text}">${esc(s.short.toUpperCase())}</text>`
  })
  const top = HUB.y + HUB.r
  const clientTop = CLIENT.y - CLIENT.height / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="AnthroPrime at the centre of eight collaborator types, with one connection to your AI workload"><rect width="100%" height="100%" fill="${bg}"/>${parts.join('')}<line x1="${HUB.x}" y1="${top}" x2="${CLIENT.x}" y2="${clientTop}" stroke="${gold}" stroke-width="5"/><circle cx="${HUB.x}" cy="${HUB.y}" r="${HUB.r}" fill="#142039" stroke="${gold}"/><text x="${HUB.x}" y="${HUB.y - 4}" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#f5f4f1">AP</text><text x="${HUB.x}" y="${HUB.y + 22}" text-anchor="middle" font-family="${mono}" font-size="9" letter-spacing="1" fill="#f5f4f1">ANTHROPRIME</text><text x="${HUB.x}" y="${HUB.y + 35}" text-anchor="middle" font-family="${mono}" font-size="7.5" letter-spacing=".6" fill="${gold}">THE ACCOUNTABLE HUB</text><rect x="${CLIENT.x - CLIENT.width / 2}" y="${clientTop}" width="${CLIENT.width}" height="${CLIENT.height}" rx="${CLIENT.height / 2}" fill="#142039" stroke="${gold}"/><text x="${CLIENT.x}" y="${CLIENT.y + 4}" text-anchor="middle" font-family="${mono}" font-size="12" fill="#f5f4f1">YOUR AI WORKLOAD</text></svg>`
}
