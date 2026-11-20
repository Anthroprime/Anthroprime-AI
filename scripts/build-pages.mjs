import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  PUBLIC_ROUTES,
  canonicalPath,
  getPageMeta
} from '../src/data/metadata.js'
import { structuredData, jsonLdScript } from '../src/data/structured-data.js'

// Prerender every public route: real page HTML (hydrated in the browser),
// route-specific head metadata, JSON-LD, canonical URLs and the sitemap.
const directory = resolve('dist')
const template = await readFile(resolve(directory, 'index.html'), 'utf8')
const serverEntry = resolve('dist-server/entry-server.js')
const { render } = await import(pathToFileURL(serverEntry).href)
const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
let origin = ''
if (process.env.SITE_URL) {
  const url = new URL(process.env.SITE_URL)
  if (
    url.protocol !== 'https:' ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  )
    throw new Error(
      'SITE_URL must be a public HTTPS origin without a path, query, or credentials.'
    )
  origin = url.origin
}
if (!template.includes('<div id="root"></div>'))
  throw new Error('index.html must contain an empty <div id="root"></div>')

for (const pathname of [...PUBLIC_ROUTES, '/404']) {
  const [title, description] = getPageMeta(pathname)
  const body = await render(pathname)
  if (!body.includes('<h1'))
    throw new Error(`Prerendered ${pathname} has no <h1>`)
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(title)}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*("\s*\/>)/,
      `$1${escape(description)}$2`
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/,
      `$1${escape(title)}$2`
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/>)/,
      `$1${escape(description)}$2`
    )
  let extra = '<meta name="twitter:card" content="summary_large_image" />'
  if (pathname === '/404') extra += '<meta name="robots" content="noindex" />'
  else if (origin)
    extra += `<link rel="canonical" href="${origin}${canonicalPath(pathname)}" /><meta property="og:url" content="${origin}${canonicalPath(pathname)}" />`
  if (origin) {
    // Home and AI Infrastructure share the hub-and-spoke visual (brief §7).
    const hub = pathname === '/' || pathname === '/infrastructure'
    extra += hub
      ? `<meta property="og:image" content="${origin}/images/hub-and-spoke-og.png" /><meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" /><meta property="og:image:alt" content="AnthroPrime, the accountable hub, connected to eight collaborator types and one AI workload" />`
      : `<meta property="og:image" content="${origin}/images/compute-horizon.jpg" /><meta property="og:image:alt" content="Conceptual AI infrastructure artwork" />`
    if (pathname !== '/404') extra += jsonLdScript(structuredData(pathname, origin))
  }
  html = html.replace('</head>', `${extra}</head>`)
  const filename =
    pathname === '/404'
      ? resolve(directory, '404.html')
      : resolve(directory, '.' + pathname, 'index.html')
  await mkdir(resolve(filename, '..'), { recursive: true })
  await writeFile(filename, html)
}
if (origin) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = PUBLIC_ROUTES.map(
    (path) =>
      `<url><loc>${escape(origin + canonicalPath(path))}</loc><lastmod>${today}</lastmod></url>`
  ).join('')
  await writeFile(
    resolve(directory, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  )
  await writeFile(
    resolve(directory, 'robots.txt'),
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`
  )
}
// The server bundle is only needed during the build.
await rm(resolve('dist-server'), { recursive: true, force: true })
console.log(
  `Prerendered ${PUBLIC_ROUTES.length} routes and a noindex 404${origin ? ' with canonical URLs, JSON-LD and sitemap' : ' (set SITE_URL for canonical URLs, JSON-LD and sitemap)'}.`
)
