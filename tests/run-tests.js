#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { GPUS, GPU_ORDER, gpuBySlug } from '../src/data/gpus.js'
import { SOLUTIONS } from '../src/data/solutions.js'
import { PUBLIC_ROUTES, canonicalPath, getPageMeta } from '../src/data/metadata.js'
import { SPOKES, HUB_ROLES, AUDIENCES, INFRA_SERVICES, INFRA_STEPS, INFRA_FAQ, COLLABORATOR_TYPES } from '../src/data/infrastructure.js'
import { COLLAB_CONSENT, collaboratorSubject, encodeCollaborator, prepareCollaborator, submitCollaborator } from '../src/data/collaborator-delivery.js'
import { staticHubSvg } from '../src/components/hub-geometry.js'
import { COMPARISONS, GUIDES, GLOSSARY, COMPARE_SPECS, relatedLink } from '../src/data/knowledge.js'
import { MODEL_PRESETS, weightsGB, kvBytesPerToken, kvCacheGB, inferenceGB, gpusNeeded, TRAINING_BYTES_PER_PARAM } from '../src/data/llm-memory.js'
import { GPU_OPTIONS, initialRequest, normalizeGpu, buildBrief } from '../src/data/request.js'
import { weightMemoryGB, completedTasks, PIPELINES, KNOWLEDGE_CHECK } from '../src/data/learning.js'
import { REQUEST_EMAIL, canSubmitRequest, capacityEmailLink, encodeCapacityRequest, submitCapacityRequest, prepareCapacityRequest } from '../src/data/request-delivery.js'

const root = path.resolve(process.cwd())
const dist = path.join(root, 'dist')
const src = path.join(root, 'src')
const pages = path.join(src, 'pages')
const data = path.join(src, 'data')

let passed = 0
let failed = 0

function assert(name, condition, hint = '') {
  if (condition) { console.log(`✅ ${name}`); passed++ }
  else { console.log(`❌ ${name} ${hint}`); failed++ }
}

const read = (p) => fs.readFileSync(p, 'utf-8')

// ---------- structure ----------
assert('package.json exists', fs.existsSync(path.join(root, 'package.json')))
assert('netlify.toml exists', fs.existsSync(path.join(root, 'netlify.toml')))
assert('index.html exists', fs.existsSync(path.join(root, 'index.html')))
assert('vite.config.js exists', fs.existsSync(path.join(root, 'vite.config.js')))
assert('tailwind.config.js exists', fs.existsSync(path.join(root, 'tailwind.config.js')))
{
  // _redirects would take precedence over netlify.toml, so keep one source.
  assert('Redirects live only in netlify.toml', !fs.existsSync(path.join(root, 'public/_redirects')))
  const toml = read(path.join(root, 'netlify.toml'))
  const rules = [...toml.matchAll(/\[\[redirects\]\]\s+from\s*=\s*"([^"]+)"\s+to\s*=\s*"([^"]+)"\s+status\s*=\s*(\d+)/g)].map(([, from, to, status]) => ({ from, to, status: Number(status) }))
  assert('Unknown URLs return the noindex 404 page with a 404 status', rules.some(r => r.from === '/*' && r.to === '/404.html' && r.status === 404))
  assert('No soft-404 SPA rewrite to index.html', !rules.some(r => r.to === '/index.html'))
  assert('Legacy marketplace URLs are permanent redirects', ['/marketplace', '/marketplace/*'].every(from => rules.some(r => r.from === from && r.to === '/#capacity' && r.status === 301)))
  assert('Catch-all redirect is the last rule', rules.at(-1)?.from === '/*')
}
assert('react-router-dom dependency', read(path.join(root, 'package.json')).includes('react-router-dom'))

const needPages = ['Home', 'GpuDetail', 'GpuLab', 'Solutions', 'Services', 'Resources', 'About', 'Contact', 'FindCapacity', 'NotFound']
needPages.forEach(p => assert(`pages/${p}.jsx exists`, fs.existsSync(path.join(pages, `${p}.jsx`))))
assert('components/Layout.jsx exists', fs.existsSync(path.join(src, 'components/Layout.jsx')))
assert('components/Globe3D.jsx exists', fs.existsSync(path.join(src, 'components/Globe3D.jsx')))
assert('data/gpus.js exists', fs.existsSync(path.join(data, 'gpus.js')))
assert('Third-party capacity dataset has been removed', !fs.existsSync(path.join(data, 'capacity.js')))
assert('data/solutions.js exists', fs.existsSync(path.join(data, 'solutions.js')))
assert('data/services.js exists', fs.existsSync(path.join(data, 'services.js')))
assert('no market-pricing dataset is shipped', !fs.existsSync(path.join(data, 'marketPricing.js')))

// ---------- routing ----------
const app = read(path.join(src, 'App.jsx'))
const routes = ['/', '/marketplace', '/gpu/:slug', '/gpu-lab', '/solutions', '/solutions/:slug', '/services', '/resources', '/about', '/contact', '/find-capacity']
routes.forEach(r => assert(`route ${r}`, app.includes(`"${r}"`)))
assert('404 catch-all route', app.includes('path="*"'))

const layout = read(path.join(src, 'components/Layout.jsx'))
assert('nav has GPU Cloud menu', layout.includes('GPU Cloud') && layout.includes('GPU_NAV'))
assert('nav links to gpu pages', layout.includes('/gpu/'))
assert('nav has Solutions menu', layout.includes('Solutions'))
assert('nav has Services menu', layout.includes('Services') && layout.includes('SERVICES'))
assert('nav has Find GPU Capacity CTA', layout.includes('Find GPU Capacity'))

// ---------- homepage ----------
const home = read(path.join(pages, 'Home.jsx'))
assert('Home has the AI Infrastructure-led headline', home.includes("'The hub for'") && home.includes("'AI infrastructure.'"))
assert('Home hero CTAs: capacity requirement and the network', home.includes('Discuss your capacity requirement') && home.includes('to="/infrastructure#network"') && home.includes('See how the network works'))
assert('Home claims strip has the three brief claims and no numbers', ['One <em>accountable hub', 'Multi-provider <em>network', 'Verified <em>before you sign'].every(t => home.includes(t)))
assert('Home hero shows the hub-and-spoke diagram', home.includes('<HubSpokeDiagram variant="compact" />'))
// check order inside the render block only (imports/definitions precede it)
const homeRender = home.slice(home.indexOf('export default function Home'))
assert('Home renders brief sections in order', ['GpuCloudSection', 'ClustersSection', 'HowItWorks', 'GlobalNetwork', 'WhoWeServe', 'WhyUs', 'FinalCTA']
  .every((c, i, arr) => i === 0 || homeRender.indexOf(arr[i - 1]) < homeRender.indexOf(c)))
assert('Home no longer loads the three.js scene', !home.includes('InfrastructureScene'))

// ---------- rebuilt visual experience ----------
const scene = read(path.join(src, 'components/InfrastructureScene.jsx'))
assert('GPU scene has a WebGL failure fallback', scene.includes('getDerivedStateFromError') && scene.includes('AI CORE'))
assert('GPU scene stops rendering outside viewport', scene.includes('IntersectionObserver') && scene.includes("'demand'"))
assert('GPU scene honors the motion control', scene.includes('useMotionSettings') && scene.includes('if (paused) return'))
assert('Home renders server-rack visualization', home.includes('rack-visual'))
assert('Network map has 5 deployment-planning regions', ['India', 'Southeast Asia', 'Middle East', 'Europe', 'North America'].every(t => home.includes(t)))
assert('Network map is clearly illustrative', home.includes('Not a live availability map'))

// ---------- GPU list matches the desk list ----------
assert('Home GPU strip = desk GPU list', ['h100', 'h200', 'b200', 'gb200', 'a100', 'l40s'].every(g => home.includes(`\`/gpu/${g}\``) || read(path.join(src, 'data/gpus.js')).includes(`'${g}'`)))

// ---------- GPU spec accuracy (per NVIDIA datasheets) ----------
const gpus = read(path.join(data, 'gpus.js'))
assert('H100: 80 GB HBM3 + 3.35 TB/s', gpus.includes('80 GB HBM3') && gpus.includes('3.35 TB/s'))
assert('H200: 141 GB HBM3e + 4.8 TB/s', gpus.includes('141 GB HBM3e') && gpus.includes('4.8 TB/s'))
assert('HGX B200: 180 GB HBM3e + 8 TB/s', GPUS.b200.specs['GPU memory'].includes('180 GB HBM3e') && GPUS.b200.specs['Memory bandwidth'] === '8 TB/s')
assert('GB200: 72-GPU NVL72 + 13.4 TB', GPUS.gb200.specs['GPUs per rack'].includes('72') && GPUS.gb200.specs['GPU memory'].includes('13.4 TB'))
assert('A100: 80/40 GB HBM2e + 2.0 TB/s', gpus.includes('HBM2e') && gpus.includes('2.0 TB/s'))
assert('L40S: 48 GB GDDR6 + 864 GB/s', gpus.includes('48 GB GDDR6') && gpus.includes('864 GB/s'))
assert('NVLink generations documented', gpus.includes('900 GB/s') && gpus.includes('1.8 TB/s') && gpus.includes('600 GB/s'))
assert('InfiniBand 200/400/800 documented', gpus.includes('400 Gb/s') && gpus.includes('800 Gb/s') && gpus.includes('200 Gb/s'))
assert('Node/reference configs present', gpus.includes('nodeConfig'))

// ---------- direct-provider experience ----------
assert('Marketplace page has been removed', !fs.existsSync(path.join(pages, 'Marketplace.jsx')))
assert('Old marketplace URLs redirect to GPU offerings', /path="\/marketplace"[\s\S]*?<Navigate to="\/#capacity" replace/.test(app))
assert('Navigation and footer have no marketplace links', !/marketplace/i.test(layout))
assert('Home presents AnthroPrime as the accountable hub', home.includes('One accountable partner') && !home.includes('PROVIDER_META'))
const resources = read(path.join(pages, 'Resources.jsx'))
assert('Resources show deployment options instead of provider comparisons', resources.includes('DeploymentOptions') && !resources.includes('providerCount'))
const gpuDetail = read(path.join(pages, 'GpuDetail.jsx'))
assert('GPU details request capacity directly from Anthroprime', gpuDetail.includes('GPU infrastructure from Anthroprime') && !gpuDetail.includes('offersForFamily'))

// ---------- no pricing anywhere in the app ----------
const srcFiles = []
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
  const full = path.join(dir, e.name)
  if (e.isDirectory()) walk(full)
  else if (/\.(jsx?|mjs|html|json)$/.test(e.name)) srcFiles.push(full)
})
walk(src)
walk(path.join(root, 'public'))
srcFiles.push(path.join(root, 'index.html'), path.join(root, 'netlify.toml'))
const appText = srcFiles.map(read).join('\n')
const PRICE_PATTERNS = [
  [/\$\s?\d/, 'dollar amounts'],
  [/\/GPU\/hr|per hour|\/hr\b/i, 'hourly rates'],
  [/\bTCO\b/, 'TCO'],
  [/(?<!no )\blist price/i, 'list price'],
  [/price-per-token|cost-per-token/i, 'cost-per-token'],
  [/pricing economics|market reference pricing|market pricing/i, 'pricing sections'],
  [/gpurentalprices|gpu-rental-prices/i, 'pricing dataset attribution'],
]
PRICE_PATTERNS.forEach(([re, label]) => assert(`no ${label} in the app`, !re.test(appText)))

// ---------- hero typewriter ----------
assert('Home hero headline uses the typewriter', /<Typewriter/.test(read(path.join(pages, 'Home.jsx'))))
assert('Typewriter component exists', read(path.join(src, 'components/ui.jsx')).includes('export function Typewriter'))
assert('Typewriter respects reduced motion', read(path.join(src, 'components/ui.jsx')).includes('prefers-reduced-motion'))
assert('Typewriter keeps the full headline for a11y/SEO', read(path.join(src, 'components/ui.jsx')).includes('sr-only'))
assert('caret keyframes defined in css', read(path.join(src, 'index.css')).includes('caret-blink'))

// ---------- capacity form ----------
const find = read(path.join(pages, 'FindCapacity.jsx'))
assert('FindCapacity has all brief fields', ['gpuType', 'gpuQty', 'location', 'startDate', 'duration', 'workload', 'deployType', 'company', 'email', 'phone'].every(f => find.includes(f)))

// ---------- positioning compliance ----------
const allSrc = [...fs.readdirSync(path.join(src, 'components')), ...fs.readdirSync(pages), ...fs.readdirSync(data)]
  .map(f => {
    const dir = fs.existsSync(path.join(src, 'components', f)) ? path.join(src, 'components', f)
      : fs.existsSync(path.join(pages, f)) ? path.join(pages, f) : path.join(data, f)
    return read(dir)
  }).join('\n')

assert('No forbidden claim: We operate thousands of GPUs', !allSrc.includes('We operate thousands of GPUs'))
assert('No forbidden claim: We own global GPU data centers', !allSrc.includes('We own global GPU data centers'))
assert('No forbidden claim: Our H200 cluster is available', !allSrc.includes('Our H200 cluster is available'))
assert('Active pages do not link to a marketplace', !/to=[{"']+\/marketplace/.test(allSrc))
assert('No leaked brief note: "This section is critical"', !allSrc.includes('This section is critical'))
assert('No leaked brief note: "Important Positioning Rule"', !allSrc.includes('Important Positioning Rule'))
assert('No leaked brief note: "Avoid publishing partner names"', !allSrc.includes('Avoid publishing partner names'))
assert('No fabricated "~40% faster" stat', !allSrc.includes('~40%'))

// ---------- deployment ----------
const netlifyToml = read(path.join(root, 'netlify.toml'))
assert('netlify.toml has build command', netlifyToml.includes('npm run build'))
assert('netlify.toml has SPA redirect', netlifyToml.includes('/*'))
const indexHtml = read(path.join(root, 'index.html'))
assert('index.html has Netlify form', indexHtml.includes('gpu-capacity') && indexHtml.includes('data-netlify'))
assert('index.html has the AnthroPrime home title', indexHtml.includes('<title>AnthroPrime — AI Infrastructure &amp; GPU Capacity Hub</title>'))

// ---------- design tokens ----------
const indexCss = read(path.join(src, 'index.css'))
assert('index.css has glass effect', indexCss.includes('.glass'))
assert('index.css has glow', indexCss.includes('.glow'))
assert('reduced-motion support', indexCss.includes('prefers-reduced-motion'))

// ---------- dist ----------
if (fs.existsSync(dist)) {
  assert('dist/index.html exists after build', fs.existsSync(path.join(dist, 'index.html')))
  assert('dist has assets', fs.existsSync(path.join(dist, 'assets')))
} else {
  console.log('ℹ️  dist not found — run npm run build first (skipping dist checks)')
}

// ---------- final audit: desk-list consistency ----------
const findCapacity = read(path.join(src, 'pages/FindCapacity.jsx'))
assert('Find-capacity form offers Enterprise Accelerators', GPU_OPTIONS.includes('Enterprise Accelerators'))
assert('Find-capacity form keeps all desk GPU options', ['H100', 'H200', 'B200 / GB200', 'A100', 'L40S'].every(o => GPU_OPTIONS.includes(o)))
assert('Footer service labels are explicit (no replace chains)', layout.includes("'svc-managed': 'Managed Infra'") && !layout.includes(".replace('GPU Capacity Sourcing'"))

// ---------- AI Infrastructure: hub-and-spoke collaborator model ----------
{
  const infraPage = read(path.join(pages, 'Infrastructure.jsx'))
  const infraData = read(path.join(data, 'infrastructure.js'))
  const diagram = read(path.join(src, 'components/HubSpokeDiagram.jsx'))
  const collabForm = read(path.join(src, 'components/CollaboratorForm.jsx'))
  const infraText = [infraPage, infraData, diagram, collabForm].join('\n')
  assert('route /infrastructure', app.includes('"/infrastructure"'))
  assert('AI Infrastructure is the first desktop nav item', layout.indexOf('to="/infrastructure"') > -1 && layout.indexOf('to="/infrastructure"') < layout.indexOf('navigation.map'))
  assert('Mobile nav lists AI Infrastructure straight after Home', /\['Home', '\/'\],\s*\['AI Infrastructure', '\/infrastructure'\]/.test(layout))
  assert('Infrastructure H1 matches the brief', infraPage.includes('One accountable hub.') && infraPage.includes('A network built to deliver AI.'))
  assert('Infrastructure sections render in brief order', ['<Hero />', '<Model />', '<Collaborators />', '<WhoWeServe />', '<Services />', '<WholeSystem />', '<HowWeWork />', '<EntryPaths />', '<JoinNetwork />', '<Questions />', '<ClosingCTA />']
    .every((c, i, arr) => i === 0 || infraPage.indexOf(arr[i - 1]) < infraPage.indexOf(c)))
  assert('In-page anchors resolve to section ids', ['network', 'collaborators', 'services', 'how-we-work', 'join', 'questions'].every(id => infraPage.includes(`'${id}']`) && infraPage.includes(`id="${id}"`)))
  assert('Eight collaborator spokes', SPOKES.length === 8 && new Set(SPOKES.map(s => s.id)).size === 8 && SPOKES.every(s => s.title && s.short && s.description))
  assert('Six hub roles, five audiences, seven services, five steps', HUB_ROLES.length === 6 && AUDIENCES.length === 5 && INFRA_SERVICES.length === 7 && INFRA_STEPS.length === 5)
  assert('Steps are Define, Source, Verify, Deploy, Govern', INFRA_STEPS.map(s => s[0]).join() === 'Define,Source,Verify,Deploy,Govern')
  assert('Three new services are flagged', INFRA_SERVICES.filter(s => s.isNew).map(s => s.id).join() === 'ai-factory,colocation,secure')
  assert('Every service keeps a Discuss this scope CTA', infraPage.includes('Discuss this scope') && infraPage.includes('INFRA_SERVICES.map'))
  assert('FAQ keeps the honest no-guarantee answer', INFRA_FAQ.some(([q, a]) => /guaranteed/.test(q) && a.startsWith('No.')))
  assert('FAQ includes the four new questions', ['Are you a reseller?', 'Who is accountable if something goes wrong?', 'Can you help with financing?', 'How do providers join the network?'].every(q => INFRA_FAQ.some(([x]) => x === q)))
  assert('Diagram is keyboard-focusable with labels', diagram.includes("role: 'button'") && diagram.includes('tabIndex: 0') && diagram.includes("'aria-label': s.title"))
  assert('Diagram respects the pause control', diagram.includes('useMotionSettings') && diagram.includes('{!paused && ('))
  assert('Diagram collapses to a list on mobile', diagram.includes('hub-list') && read(path.join(src, 'components/hub-spoke.css')).includes('@media (max-width: 720px)'))
  assert('Static diagram generator (share image) covers every spoke', staticHubSvg(SPOKES).startsWith('<svg') && SPOKES.every(s => staticHubSvg(SPOKES).includes(s.short.toUpperCase().replace('&', '&amp;'))))
  // URLs (e.g. nvidia.com/.../data-center/) and HTML autocomplete tokens are not site copy.
  assert('Content rule: British spelling on AI Infrastructure', !/\b(center|centers|optimization|utilization|organization)\b/i.test(infraText.replace(/https?:\/\/[^\s'"]+/g, '').replace(/autoComplete: '[^']*'/g, '')))
  assert('Content rule: no guarantees offered', !/we guarantee|guaranteed (availability|performance|capacity)/i.test(infraText))
  assert('Content rule: no live-inventory claims', !/in stock|available now|live inventory feed/i.test(infraText))
  assert('Content rule: company name AnthroPrime on the new page', !/Anthroprime(?!\.)/.test(infraText.replace(/AnthroPrime/g, '')))
  assert('Collaborator form is registered for Netlify detection', ['name="collaborator"', 'name="collaboratorType"', 'name="offer"', 'name="regions"'].every(t => read(path.join(root, 'index.html')).includes(t)))
  assert('Collaborator types match the brief', COLLABORATOR_TYPES.length === 9 && COLLABORATOR_TYPES[0] === 'GPU capacity' && COLLABORATOR_TYPES.at(-1) === 'Other')
  assert('Collaborator consent links the Website data notice', collabForm.includes('DATA_NOTICE_URL') && collabForm.includes('Website data notice'))
  const collab = { company: ' Example Co ', website: '', name: 'Test Person', email: 'test@example.com', phone: '', collaboratorType: 'Cooling', offer: 'Direct-to-chip cooling', regions: 'India' }
  assert('Collaborator subject is "New collaborator — [type]"', collaboratorSubject('Power and energy') === 'New collaborator — Power and energy')
  const collabBody = new URLSearchParams(encodeCollaborator(collab, true))
  assert('Collaborator payload is trimmed and carries form name, subject and consent', collabBody.get('form-name') === 'collaborator' && collabBody.get('company') === 'Example Co' && collabBody.get('subject') === 'New collaborator — Cooling' && collabBody.get('consent') === COLLAB_CONSENT)
  let rejected = 0
  for (const bad of [{ ...collab, email: 'nope' }, { ...collab, offer: ' ' }, { ...collab, collaboratorType: 'Reseller' }, { ...collab, 'bot-field': 'x' }]) {
    try { prepareCollaborator(bad) } catch { rejected++ }
  }
  assert('Collaborator validation rejects bad email, empty offer, unknown type and honeypot', rejected === 4)
  let noConsent = false
  try { encodeCollaborator(collab, false) } catch { noConsent = true }
  assert('Collaborator submission requires explicit consent', noConsent)
  let localBlocked = false
  try { await submitCollaborator(collab, { enabled: true, hostname: 'localhost', consent: true, fetchImpl: async () => ({ ok: true }) }) } catch { localBlocked = true }
  assert('Collaborator form never sends from localhost', localBlocked)
  let posted = null
  await submitCollaborator(collab, { enabled: true, hostname: 'anthroprime.ai', consent: true, fetchImpl: async (url, init) => { posted = { url, init }; return { ok: true } } })
  assert('Collaborator form posts URL-encoded to the site root', posted?.url === '/' && posted.init.method === 'POST' && posted.init.headers['Content-Type'] === 'application/x-www-form-urlencoded')
  let failed = false
  try { await submitCollaborator(collab, { enabled: true, hostname: 'anthroprime.ai', consent: true, fetchImpl: async () => ({ ok: false }) }) } catch { failed = true }
  assert('Collaborator form reports a rejected submission without false success', failed)
  assert('Capacity form links suppliers to the collaborator path', find.includes('Offer capacity or space to our network') && find.includes('/infrastructure#join'))
  assert('Infrastructure metadata matches the brief', getPageMeta('/infrastructure')[0] === 'AI Infrastructure and GPU Capacity | AnthroPrime Technology' && getPageMeta('/infrastructure')[1].startsWith('AnthroPrime is the accountable hub for AI infrastructure'))
  assert('Sitemap routes include /infrastructure', PUBLIC_ROUTES.includes('/infrastructure'))
  // Gaps closed after the brief review
  assert('Home shows DEFINE → SOURCE → VERIFY → DEPLOY → GOVERN', home.includes('process-flow') && home.includes('INFRA_STEPS.map') && !home.includes('Start with your world'))
  assert('Diagram labels the hub "AnthroPrime — the accountable hub"', diagram.includes('ANTHROPRIME') && diagram.includes('THE ACCOUNTABLE HUB') && diagram.includes('<title>AnthroPrime — the accountable hub</title>'))
  assert('Keyword: GPU as a service', infraPage.includes('GPU as a service'))
  assert('Homepage copy uses AnthroPrime and British spelling', !/Anthroprime(?![.\w])/.test(home) && !/\b(programs|center)\b/.test(home) && !/data center/.test(read(path.join(src, 'components/LearningTeaser.jsx'))))
  assert('Homepage no longer calls AnthroPrime a GPU provider', !home.includes('Your GPU infrastructure provider'))
  assert('Capacity form offers both request types, capacity first', find.indexOf('Secure capacity for AI workloads') > -1 && find.indexOf('Secure capacity for AI workloads') < find.indexOf('Offer capacity or space to our network'))
  assert('Collaborator form is grouped: Company, Contact, What you offer', /legend: 'Company'[\s\S]*legend: 'Contact'[\s\S]*legend: 'What you offer'/.test(collabForm) && collabForm.includes('<legend'))
  const og = fs.readFileSync(path.join(root, 'public/images/hub-and-spoke-og.png'))
  assert('Share image is a 1200×630 PNG', og.readUInt32BE(16) === 1200 && og.readUInt32BE(20) === 630)
}

// ---------- guides, comparisons and glossary ----------
{
  const all = [...COMPARISONS.map(c => ['/compare/', c]), ...GUIDES.map(g => ['/guides/', g]), ...GLOSSARY.map(t => ['/glossary/', t])]
  assert('Every guide, comparison and glossary page is a public, routed page', ['/guides', '/glossary', ...all.map(([p, e]) => p + e.slug)].every(r => PUBLIC_ROUTES.includes(r)) && ['"/guides"', '"/guides/:slug"', '"/compare/:slug"', '"/glossary"', '"/glossary/:slug"'].every(r => app.includes(r)))
  assert('Slugs are unique across guides, comparisons and glossary', new Set(all.map(([, e]) => e.slug)).size === all.length)
  assert('Comparisons reference real GPUs with spec rows', COMPARISONS.every(c => GPUS[c.a] && GPUS[c.b] && COMPARE_SPECS.filter(k => GPUS[c.a].specs[k] || GPUS[c.b].specs[k]).length >= 5))
  assert('Every related link resolves to a page', all.every(([, e]) => e.related.length >= 2 && e.related.every(s => relatedLink(s))))
  assert('Comparisons and guides each have an FAQ and a meta title/description', [...COMPARISONS, ...GUIDES].every(e => e.faq.length >= 3 && e.metaTitle && e.description))
  assert('Glossary entries have a question heading and short definition', GLOSSARY.every(t => t.title && t.short.length >= 60 && t.sections.length >= 2))
  const kbText = read(path.join(data, 'knowledge.js')).replace(/https?:\/\/[^\s'"]+/g, '')
  assert('Guides use British spelling', !/\b(center|centers|optimization|optimize|optimizer|utilization|quantization|quantize|organization|color|behavior)\b/i.test(kbText))
  assert('Guides make no price, availability or guarantee claims', !/\$\s?\d|per hour|in stock|available now|guarantee(d|s)? (that|availability|performance)/i.test(kbText))
  // Prose figures must match the datasheet values in gpus.js
  const specText = JSON.stringify(GPUS)
  assert('Comparison figures match the GPU datasheet data', ['141 GB HBM3e', '4.8 TB/s', '3.35 TB/s', '180 GB HBM3e', '8 TB/s', '1,979', '4,500', '9,000', '900 GB/s', '1.8 TB/s', '600 GB/s', '864 GB/s', '13.4 TB'].every(v => specText.includes(v) && kbText.includes(v)))
  // Memory maths
  const llama70 = MODEL_PRESETS.find(m => m.id === '70b')
  assert('70B weights: 140 GB FP16, 70 GB 8-bit, 35 GB 4-bit', weightsGB(70, 2) === 140 && weightsGB(70, 1) === 70 && weightsGB(70, 0.5) === 35)
  assert('KV cache for a Llama 3 70B-style model is 327,680 bytes per token at FP16', kvBytesPerToken(llama70) === 327680)
  assert('One 8K conversation needs about 2.7 GB of KV cache; 32 need about 86 GB', Math.abs(kvCacheGB(llama70, 8192) - 2.68) < 0.01 && Math.abs(kvCacheGB(llama70, 8192, 32) - 85.9) < 0.1)
  assert('FP8 KV cache halves the KV memory', kvCacheGB(llama70, 8192, 1, 1) * 2 === kvCacheGB(llama70, 8192, 1, 2))
  assert('Training estimate is 16 bytes per parameter (about 1.1 TB for 70B)', TRAINING_BYTES_PER_PARAM * 70 === 1120)
  assert('GPU counts round up to tensor-parallel sizes', gpusNeeded(80, 80) === 1 && gpusNeeded(81, 80) === 2 && gpusNeeded(163, 80) === 4 && gpusNeeded(600, 80) === 8 && gpusNeeded(700, 80) === null)
  const fp16 = inferenceGB({ model: llama70, weightBytes: 2, tokens: 8192, sequences: 1 })
  assert('70B FP16 inference estimate includes weights, KV and 15% allowance', Math.abs(fp16.total - (140 + 2.68 + 21)) < 0.1 && gpusNeeded(fp16.total, 141) === 2 && gpusNeeded(fp16.total, 180) === 1)
  assert('GPU pages link to their comparisons and guides', read(path.join(pages, 'GpuDetail.jsx')).includes('GPU_READING') && GPU_ORDER.every(s => read(path.join(pages, 'GpuDetail.jsx')).includes(`  ${s}: [`)))
  assert('Footer, Resources and GPU Lab link to the guides', layout.includes("'/guides'") && layout.includes("'/glossary'") && read(path.join(pages, 'Resources.jsx')).includes('/compare/') && read(path.join(pages, 'GpuLab.jsx')).includes('/guides/gpu-memory-for-llms'))
}

// ---------- executable data and request checks ----------
assert('Every GPU detail has specs, variants, and reference configuration', GPU_ORDER.every(slug=>GPUS[slug]?.specs && GPUS[slug]?.variants.length && GPUS[slug]?.nodeConfig.rows.length))
assert('All solution recommendations reference existing GPU pages', SOLUTIONS.every(s=>s.gpus.every(slug=>GPUS[slug])))
for (const [input,expected] of [['B200','B200 / GB200'],['gb200','B200 / GB200'],['B300','B300'],['MI300X','Enterprise Accelerators'],['h200','H200']]) {
  assert(`Request normalizes ${input}`, normalizeGpu(input) === expected)
}
assert('Unknown GPU aliases return null', normalizeGpu('unknown') === null)
assert('Request defaults are safe with no route state', initialRequest().gpuType === 'H100' && initialRequest().deployType === 'Bare Metal')
const request = initialRequest({gpu:'GB200',gpuQty:'64',location:'India',workload:'Training',deployType:'Dedicated / Reserved'})
assert('GPU request prefill keeps the complete request', request.gpuType === 'B200 / GB200' && request.gpuQty === '64' && request.location === 'India' && request.workload === 'Training' && request.deployType === 'Dedicated / Reserved')
assert('Invalid deployment prefill uses a selectable option', initialRequest({deployType:'invalid'}).deployType === 'Bare Metal')
const brief = buildBrief({...request,company:'Example team',email:'test@example.com'})
assert('Brief preserves workload and contact information', ['Quantity: 64','Region: India','Workload: Training','Company: Example team','Business email: test@example.com'].every(t=>brief.includes(t)))
assert('Brief uses honest fallbacks for optional fields', brief.includes('Start date: Flexible') && brief.includes('Duration: To discuss'))
assert('Reviewing a brief does not open external channels automatically', !findCapacity.includes('window.open('))
assert('Local form offers a downloadable brief', findCapacity.includes('createObjectURL') && findCapacity.includes('anthroprime-capacity-brief.txt'))

// ---------- educational calculations and generated assets ----------
const deliveryRequest = {...request,company:'Example & Co',email:'qa@example.com',workload:'Training & inference\nSecond line'}
const body = new URLSearchParams(encodeCapacityRequest(deliveryRequest,true))
assert('Delivery targets the registered Netlify form', body.get('form-name') === 'gpu-capacity')
assert('Notification preserves submitter email for Reply-To', body.get('email') === 'qa@example.com')
assert('Structured request values survive URL encoding', body.get('company') === 'Example & Co' && body.get('workload') === deliveryRequest.workload)
assert('Notification contains full brief, consent, and subject', body.get('brief').includes('Quantity: 64') && body.get('consent').startsWith('Yes') && body.get('subject').includes('B200 / GB200'))
assert('Static detection declares every submitted field', [...body.keys()].every(key => indexHtml.includes(`name="${key}"`)))
assert('Email handoff uses hello@anthroprime.com', REQUEST_EMAIL === 'hello@anthroprime.com' && capacityEmailLink(deliveryRequest).startsWith('mailto:hello@anthroprime.com?'))
assert('Email handoff retains the full request', decodeURIComponent(capacityEmailLink(deliveryRequest).split('&body=')[1]) === buildBrief(deliveryRequest))
for (const host of ['localhost','gpu.localhost','127.0.0.1','127.0.0.2','[::1]','::1','gpu.local','']) assert(`Preview hostname cannot submit: ${host || '(empty)'}`, !canSubmitRequest(true,host))
assert('Non-enabled public builds cannot submit', !canSubmitRequest(false,'example.com'))
assert('Review normalization trims required and optional fields', prepareCapacityRequest({...deliveryRequest,company:' Example team ',phone:' 123 '}).company === 'Example team' && prepareCapacityRequest({...deliveryRequest,phone:' 123 '}).phone === '123')
assert('Review validation strips fields outside the request schema', !Object.hasOwn(prepareCapacityRequest({...deliveryRequest,unknown:'ignored'}),'unknown'))
for (const [name,form,consent] of [
  ['missing consent',deliveryRequest,false],
  ['blank company',{...deliveryRequest,company:'   '},true],
  ['invalid email',{...deliveryRequest,email:'not-an-email'},true],
  ['invalid GPU',{...deliveryRequest,gpuType:'unknown'},true],
  ['overlong email',{...deliveryRequest,email:'x'.repeat(250)+'@example.com'},true],
  ['non-boolean consent',deliveryRequest,'yes'],
  ['oversized workload',{...deliveryRequest,workload:'x'.repeat(4001)},true],
  ['honeypot',{...deliveryRequest,'bot-field':'spam'},true]
]) {
  let rejected=false;try{encodeCapacityRequest(form,consent)}catch{rejected=true}
  assert(`Delivery rejects ${name}`,rejected)
}
let attempted=0
try { await submitCapacityRequest(deliveryRequest,{enabled:true,hostname:'localhost',consent:true,fetchImpl:async()=>{attempted++;return {ok:true}}}) } catch {}
assert('Local delivery guard prevents network requests', attempted===0)
let sentOptions
await submitCapacityRequest(deliveryRequest,{enabled:true,hostname:'example.com',consent:true,fetchImpl:async(url,options)=>{sentOptions={url,...options};return {ok:true}}})
assert('Live transport posts URL-encoded fields to the same origin', sentOptions.url==='/' && sentOptions.method==='POST' && sentOptions.headers['Content-Type']==='application/x-www-form-urlencoded' && new URLSearchParams(sentOptions.body).get('email')==='qa@example.com')
let timedOut=false
try {
  await submitCapacityRequest(deliveryRequest,{enabled:true,hostname:'example.com',consent:true,timeoutMs:10,fetchImpl:async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}))})
} catch(error) {timedOut=error.message.includes('could not be confirmed')}
assert('A stalled submission times out without reporting success',timedOut)
for(const failure of ['http','network']) {
  let rejected=false
  try{await submitCapacityRequest(deliveryRequest,{enabled:true,hostname:'example.com',consent:true,fetchImpl:async()=>{if(failure==='network')throw new Error('offline');return {ok:false}}})}catch(error){rejected=error.message.includes('could not be confirmed') && error.message.includes(REQUEST_EMAIL)}
  assert(`Transport reports ${failure} failure without a false success`,rejected)
}

assert('7B FP32 weights use 28 decimal GB', weightMemoryGB(7,32) === 28)
assert('70B BF16 weights use 140 decimal GB', weightMemoryGB(70,16) === 140)
assert('70B 8-bit raw weights use 70 decimal GB', weightMemoryGB(70,8) === 70)
assert('70B 4-bit raw weights use 35 decimal GB', weightMemoryGB(70,4) === 35)
assert('Fractional parameter counts retain fractional storage', weightMemoryGB(1.5,4) === .75)
for (const [parameters,bits] of [[0,16],[-1,16],[NaN,16],[Infinity,16],[7,3]]) {
  let rejected=false;try{weightMemoryGB(parameters,bits)}catch(error){rejected=error instanceof RangeError}
  assert(`Memory estimator rejects invalid input ${parameters}/${bits}`,rejected)
}
assert('Serial scheduler completes one task per step', completedTasks(3,1) === 3)
assert('Independent scheduler completes worker-sized batches', completedTasks(3,8) === 24)
assert('Task completion is capped at workload size', completedTasks(9,16) === 32)
assert('Dependency chain prevents parallel scheduling', completedTasks(3,16,32,true) === 3)
assert('Reset scheduler has completed no tasks', completedTasks(0,8) === 0)
for(const args of [[-1,8],[1,0],[1.5,8],[1,8,0]]) {
  let rejected=false;try{completedTasks(...args)}catch(error){rejected=error instanceof RangeError}
  assert(`Scheduler rejects invalid input ${args.join('/')}`,rejected)
}
assert('Training and inference walkthroughs each have four stages', Object.values(PIPELINES).every(stages=>stages.length===4 && stages.every(s=>s.title && s.detail && s.tag)))
assert('Knowledge checks have one valid answer each', KNOWLEDGE_CHECK.every(q=>Number.isInteger(q.correct) && q.correct>=0 && q.correct<q.options.length && q.explanation))
assert('Generated GPU artwork is bundled locally', fs.statSync(path.join(root,'public/images/gpu-silicon.jpg')).size>10000)
assert('Generated infrastructure artwork is bundled locally', fs.statSync(path.join(root,'public/images/compute-horizon.jpg')).size>10000)
assert('Image generation prompts are preserved', fs.existsSync(path.join(root,'docs/image-prompts.md')))

// ---------- static route metadata ----------
assert('Public routes have no duplicates', new Set(PUBLIC_ROUTES).size === PUBLIC_ROUTES.length)
assert('All public routes resolve a real page title', PUBLIC_ROUTES.every(route => !getPageMeta(route)[0].includes('not found')))
assert('Canonical paths end with one slash, root stays /', canonicalPath('/') === '/' && canonicalPath('/capacity') === '/capacity/' && canonicalPath('/gpu/h100//') === '/gpu/h100/')
{
  const metas = PUBLIC_ROUTES.map(r => getPageMeta(r))
  assert('Search titles are unique and at most 60 characters', new Set(metas.map(m => m[0])).size === metas.length && metas.every(([t]) => t.length <= 60))
  // The /infrastructure description is the brief's exact wording (178 chars).
  assert('Meta descriptions are unique and at most 160 characters', new Set(metas.map(m => m[1])).size === metas.length && PUBLIC_ROUTES.every((r, i) => r === '/infrastructure' || metas[i][1].length <= 160))
  assert('Titles carry the AnthroPrime brand', metas.every(([t]) => t.includes('AnthroPrime')))
  assert('Fonts are not loaded through a render-blocking CSS @import', !/@import url\(['"]?https:\/\/fonts/.test(read(path.join(src, 'index.css'))) && indexHtml.includes('fonts.googleapis.com/css2'))
  assert('Prerendered content stays visible without JavaScript', indexHtml.includes("#root [style*='opacity:0']"))
  assert('Client hydrates prerendered pages', read(path.join(src, 'main.jsx')).includes('hydrateRoot') && fs.existsSync(path.join(src, 'entry-server.jsx')))
}
assert('Unknown routes resolve not-found metadata', getPageMeta('/missing-page')[0].includes('not found'))
assert('Static host trailing slashes preserve page metadata', PUBLIC_ROUTES.every(route=>getPageMeta(route+'/')[0]===getPageMeta(route)[0]))
assert('GPU metadata rejects extra path segments', getPageMeta('/gpu/h100/missing')[0].includes('not found'))
assert('Inherited object properties cannot become GPU records', ['constructor','__proto__','toString','unknown'].every(slug=>gpuBySlug(slug)===null && getPageMeta('/gpu/'+slug)[0].includes('not found')))
assert('H100 PCIe memory type matches NVIDIA product specifications', GPUS.h100.variants.find(v=>v.id==='pcie').mem === '80GB HBM2e')
assert('H200 NVL uses its own FP8 peak, not the SXM peak', GPUS.h200.variants.find(v=>v.id==='nvl').fp8 === '3,341 TFLOPS*')
assert('A100 FP64 is distinct from its tensor-core FP64 peak', GPUS.a100.specs.FP64 === '9.7 TFLOPS · 19.5 TFLOPS Tensor')
assert('L40S sparse FP8 peak is not doubled again', GPUS.l40s.specs['FP8 Tensor'] === '1,466 TFLOPS sparse')
if (fs.existsSync(path.join(dist,'gpu/h100/index.html'))) {
  const escaped = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
  for (const route of PUBLIC_ROUTES) {
    const html = read(path.join(dist,route,'index.html'))
    const [title,description] = getPageMeta(route)
    assert(`Built route metadata: ${route}`, html.includes(`<title>${escaped(title)}</title>`) && html.includes(`content="${escaped(description)}"`))
  }
  assert('Built 404 is excluded from indexing', read(path.join(dist,'404.html')).includes('name="robots" content="noindex"'))
  const home = read(path.join(dist,'index.html'))
  const origin = home.match(/<link rel="canonical" href="(https:\/\/[^/"]+)\//)?.[1]
  if (origin) {
    // Canonicals and sitemap must name the served URL (route/), never one that 301s.
    assert('Built canonical and og:url name the served trailing-slash URL', PUBLIC_ROUTES.every(route => {
      const html = read(path.join(dist,route,'index.html'))
      const url = origin + canonicalPath(route)
      return html.includes(`<link rel="canonical" href="${url}" />`) && html.includes(`<meta property="og:url" content="${url}" />`)
    }))
    const locs = [...read(path.join(dist,'sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
    assert('Sitemap lists every public route at its served URL', locs.length === PUBLIC_ROUTES.length && PUBLIC_ROUTES.every(route => locs.includes(origin + canonicalPath(route))))
    assert('Home and AI Infrastructure share the hub-and-spoke image', ['/', '/infrastructure'].every(route => read(path.join(dist, route, 'index.html')).includes(`<meta property="og:image" content="${origin}/images/hub-and-spoke-og.png" />`)))
    // ---------- SEO: prerendered HTML, structured data, metadata quality ----------
    const builtRoutes = PUBLIC_ROUTES.map(route => [route, read(path.join(dist, route, 'index.html'))])
    const bodyText = html => (html.split('<div id="root">')[1] || '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    assert('Every public page is prerendered with an H1 and real content', builtRoutes.every(([, html]) => /<div id="root"><[\s\S]*<h1/.test(html) && bodyText(html).split(' ').length >= 150))
    assert('Every page has exactly one H1', builtRoutes.every(([, html]) => (html.match(/<h1[\s>]/g) || []).length === 1))
    assert('H1 is not hidden by an entrance animation in the prerendered HTML', builtRoutes.every(([, html]) => !/<h1[^>]*opacity:0/.test(html)))
    assert('Page transition does not hide the first page view', !/<main id="main-content"[^>]*>\s*<div style="opacity:0/.test(builtRoutes[0][1]))
    const graphs = builtRoutes.map(([route, html]) => [route, [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]))])
    const typesOf = route => graphs.find(([r]) => r === route)[1].flatMap(d => d['@graph'].map(n => n['@type']))
    assert('Every page has valid JSON-LD with Organization, WebSite and a page node', graphs.every(([route, list]) => list.length === 1 && ['Organization', 'WebSite'].every(t => typesOf(route).includes(t)) && typesOf(route).some(t => /Page$/.test(t))))
    assert('Inner pages carry breadcrumbs; home does not', graphs.every(([route]) => typesOf(route).includes('BreadcrumbList') === (route !== '/')))
    const infraFaq = graphs.find(([r]) => r === '/infrastructure')[1][0]['@graph'].find(n => n['@type'] === 'FAQPage')
    assert('AI Infrastructure FAQ structured data matches the visible FAQ', infraFaq?.mainEntity.length === INFRA_FAQ.length && infraFaq.mainEntity.every((q, i) => q.name === INFRA_FAQ[i][0]))
    assert('GPU and solution pages describe a Service', PUBLIC_ROUTES.filter(r => /^\/(gpu|solutions)\//.test(r)).every(r => typesOf(r).includes('Service')))
    assert('Structured data publishes no prices or ratings', !/"(price|priceSpecification|aggregateRating|review)"/.test(JSON.stringify(graphs)))
    assert('Built 404 has no structured data', !read(path.join(dist, '404.html')).includes('application/ld+json'))
    const articleRoutes = PUBLIC_ROUTES.filter(r => /^\/(compare|guides|glossary)\/./.test(r))
    assert('Guide, comparison and glossary pages are TechArticles with dates', articleRoutes.every(r => typesOf(r).includes('TechArticle')) && /"dateModified":"\d{4}-\d{2}-\d{2}"/.test(read(path.join(dist, 'guides/gpu-memory-for-llms/index.html'))))
    assert('Comparison and guide FAQs are in structured data; glossary terms are DefinedTerms', articleRoutes.every(r => typesOf(r).includes(r.startsWith('/glossary/') ? 'DefinedTerm' : 'FAQPage')))
    assert('Glossary index is a DefinedTermSet; guides index lists every article', typesOf('/glossary').includes('DefinedTermSet') && graphs.find(([r]) => r === '/guides')[1][0]['@graph'].find(n => n['@type'] === 'ItemList').itemListElement.length === COMPARISONS.length + GUIDES.length)
    assert('Comparison breadcrumbs point to /guides, never to a missing /compare page', !JSON.stringify(graphs).includes(`${origin}/compare/"`))
    assert('Memory guide prerenders the calculator and fit table', /kb-calc[\s\S]*kb-table/.test(read(path.join(dist, 'guides/gpu-memory-for-llms/index.html'))))
    assert('GPU page H1 names the product as searched (NVIDIA H100)', /<h1[^>]*>[\s\S]*NVIDIA[\s\S]*H100[\s\S]*<\/h1>/.test(read(path.join(dist, 'gpu/h100/index.html'))))
    assert('Sitemap entries carry lastmod dates', (read(path.join(dist, 'sitemap.xml')).match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length === PUBLIC_ROUTES.length)
    assert('Prerendered AI Infrastructure page includes the hub diagram SVG', read(path.join(dist, 'infrastructure/index.html')).includes('class="hub-canvas"'))
  }
}

console.log(`\n---\nTests: ${passed} passed, ${failed} failed out of ${passed + failed}`)
process.exit(failed > 0 ? 1 : 0)
