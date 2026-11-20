import { GPUS } from './gpus.js'
import { SOLUTIONS, solutionBySlug } from './solutions.js'
import {
  COMPARISONS,
  GUIDES,
  GLOSSARY,
  comparisonBySlug,
  guideBySlug,
  termBySlug
} from './knowledge.js'

// Search titles stay under ~60 characters and descriptions under ~160 so
// Google shows them in full. Each page targets its own primary query.
export const PAGE_META = {
  '/infrastructure': [
    'AI Infrastructure and GPU Capacity | AnthroPrime Technology',
    'AnthroPrime is the accountable hub for AI infrastructure — a vetted network of GPU, data centre, power, cooling and capital collaborators delivering verified, secure AI capacity.'
  ],
  '/capacity': [
    'GPU Capacity: H100, H200, B200, GB200 & More | AnthroPrime',
    'NVIDIA GPU configurations AnthroPrime sources — H100, H200, B200, B300, GB200, A100 and L40S. Request capacity by region and term; confirmed on enquiry.'
  ],
  '/gpu-lab': [
    'GPU Lab — How GPUs Power AI, Explained | AnthroPrime',
    'Learn how GPUs run AI: explore GPU architecture, parallel processing, model memory sizing, and training versus inference through interactive explainers.'
  ],
  '/': [
    'AnthroPrime — AI Infrastructure & GPU Capacity Hub',
    'One accountable partner for AI infrastructure and GPU capacity — H100, H200, B200 and GB300 through a vetted network of cloud, data centre and power partners.'
  ],
  '/solutions': [
    'AI Training, Inference & HPC Infrastructure | AnthroPrime',
    'GPU infrastructure for AI training, inference, dedicated GPU clusters, private AI cloud, HPC and sovereign AI — designed around your workload.'
  ],
  '/services': [
    'AI Infrastructure Services & GPU Sourcing | AnthroPrime',
    'GPU capacity sourcing, AI infrastructure advisory, GPU cluster deployment, managed AI infrastructure and security — one accountable team, brief to production.'
  ],
  '/resources': [
    'GPU Comparison: H100 vs H200 vs B200 Specs | AnthroPrime',
    'Compare NVIDIA H100, H200, B200, GB200, A100 and L40S side by side — memory, bandwidth, FP8 and FP16 performance, NVLink — and explore deployment options.'
  ],
  '/about': [
    'About AnthroPrime — India-Led AI Infrastructure Partner',
    'AnthroPrime Technology is an India-led, globally connected AI infrastructure practice in Gurugram — the accountable hub for GPU capacity and AI factories.'
  ],
  '/contact': [
    'Contact AnthroPrime — Discuss Your GPU Requirement',
    'Talk to AnthroPrime about GPU capacity, AI clusters or joining the collaborator network. Email hello@anthroprime.com or WhatsApp +91 97115 54410.'
  ],
  '/guides': [
    'GPU Guides & Comparisons: H100, H200, B200 | AnthroPrime',
    'Practical GPU guides for AI infrastructure: H100 vs H200, H200 vs B200, LLM memory sizing, choosing inference GPUs, and bare metal vs managed.'
  ],
  '/glossary': [
    'Glossary: GPU, Networking & Cooling Terms | AnthroPrime',
    'Plain-English definitions of AI infrastructure terms: NVLink, InfiniBand vs RoCE, HBM3e, MIG and liquid cooling, with links to deeper guides.'
  ],
  '/find-capacity': [
    'Request GPU Capacity for AI Workloads | AnthroPrime',
    'Share your GPU type, quantity, region and timeline. AnthroPrime sources and verifies matching capacity — bare metal, managed or dedicated GPU clusters.'
  ]
}

export const PUBLIC_ROUTES = [
  ...Object.keys(PAGE_META),
  ...Object.keys(GPUS).map((slug) => '/gpu/' + slug),
  ...SOLUTIONS.map((s) => '/solutions/' + s.slug),
  ...COMPARISONS.map((c) => '/compare/' + c.slug),
  ...GUIDES.map((g) => '/guides/' + g.slug),
  ...GLOSSARY.map((t) => '/glossary/' + t.slug)
]

// Each route is built as <route>/index.html, and Netlify answers /route with a
// 301 to /route/. Canonical URLs and the sitemap must name the URL that is
// actually served (200), so every non-root route ends with a slash.
export function canonicalPath(route) {
  const path = route.replace(/\/+$/, '')
  return path ? path + '/' : '/'
}

/** Trim to a word boundary so descriptions are not cut mid-word in results. */
export function clip(text, max = 158) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—–-]\s*$/, '') + '…'
}

const SOLUTION_TITLES = {
  training: 'AI Training Infrastructure & GPU Clusters | AnthroPrime',
  inference: 'AI Inference Infrastructure & GPU Serving | AnthroPrime',
  clusters: 'Dedicated GPU Clusters (HGX, InfiniBand) | AnthroPrime',
  'private-cloud': 'Private AI Cloud: Dedicated GPU Infrastructure | AnthroPrime',
  hpc: 'HPC Infrastructure: GPU Clusters for Research | AnthroPrime',
  sovereign: 'Sovereign AI Infrastructure & Data Residency | AnthroPrime'
}

/** "NVIDIA H100 GPU", "NVIDIA GB200 NVL72" — the name people search for. */
export function gpuSearchName(gpu) {
  return /NVL/.test(gpu.full) ? `NVIDIA ${gpu.name} NVL72` : `NVIDIA ${gpu.name} GPU`
}

export function getPageMeta(pathname) {
  pathname = pathname.replace(/\/+$/, '') || '/'
  const [, type, slug] = pathname.split('/')
  if (
    type === 'gpu' &&
    Object.hasOwn(GPUS, slug) &&
    pathname === '/gpu/' + slug
  )
    return [
      `${gpuSearchName(GPUS[slug])}: Specs & Capacity | AnthroPrime`,
      clip(GPUS[slug].desc)
    ]
  if (
    type === 'solutions' &&
    solutionBySlug(slug) &&
    pathname === '/solutions/' + slug
  ) {
    const s = solutionBySlug(slug)
    return [
      SOLUTION_TITLES[slug] || `${s.name} | AnthroPrime`,
      clip(
        `${s.short} GPU infrastructure designed, sourced and verified around your workload by AnthroPrime.`
      )
    ]
  }
  const article =
    pathname === `/${type}/${slug}` &&
    ((type === 'compare' && comparisonBySlug(slug)) ||
      (type === 'guides' && guideBySlug(slug)))
  if (article) return [article.metaTitle, article.description]
  const term =
    type === 'glossary' && pathname === `/glossary/${slug}` && termBySlug(slug)
  if (term) return [term.metaTitle, clip(term.short)]
  return (
    PAGE_META[pathname] || [
      'Page not found | AnthroPrime',
      'Explore AI infrastructure, GPU capacity, solutions and deployment services from AnthroPrime.'
    ]
  )
}
