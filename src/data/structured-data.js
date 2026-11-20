// schema.org JSON-LD for each prerendered page (emitted by build-pages.mjs).
// Describes only what the page visibly says: no prices, ratings or inventory.
import { GPUS } from './gpus.js'
import { SOLUTIONS, solutionBySlug } from './solutions.js'
import { SERVICES } from './services.js'
import { INFRA_FAQ, INFRA_SERVICES } from './infrastructure.js'
import { REQUEST_EMAIL } from './request-delivery.js'
import { canonicalPath, getPageMeta, gpuSearchName } from './metadata.js'
import {
  COMPARISONS,
  GUIDES,
  GLOSSARY,
  KNOWLEDGE_UPDATED,
  comparisonBySlug,
  guideBySlug,
  termBySlug
} from './knowledge.js'

const CRUMB_NAMES = {
  guides: 'Guides',
  compare: 'Guides',
  glossary: 'Glossary',
  infrastructure: 'AI Infrastructure',
  capacity: 'GPU Capacity',
  'find-capacity': 'Find GPU Capacity',
  'gpu-lab': 'GPU Lab',
  solutions: 'Solutions',
  services: 'Services',
  resources: 'Resources',
  about: 'About',
  contact: 'Contact',
  gpu: 'GPU Cloud'
}

export function organization(origin) {
  return {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: 'AnthroPrime Technology',
    legalName: 'Anthroprime Technology Private Limited',
    alternateName: ['AnthroPrime', 'Anthroprime.ai'],
    url: `${origin}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${origin}/favicon.png`,
      width: 512,
      height: 512
    },
    image: `${origin}/images/hub-and-spoke-og.png`,
    description:
      'The accountable hub for AI infrastructure: GPU capacity, AI data centres, power, cooling and capital through a vetted collaborator network.',
    email: REQUEST_EMAIL,
    telephone: '+91-97115-54410',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gurugram',
      addressRegion: 'Haryana',
      addressCountry: 'IN'
    },
    areaServed: 'Worldwide',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: REQUEST_EMAIL,
      telephone: '+91-97115-54410'
    },
    knowsAbout: [
      'AI infrastructure',
      'GPU capacity',
      'GPU as a service',
      'GPU clusters',
      'AI factory',
      'AI data centre',
      'Colocation',
      'Liquid cooling',
      'NVIDIA H100',
      'NVIDIA H200',
      'NVIDIA B200',
      'NVIDIA GB300'
    ]
  }
}

function website(origin) {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: `${origin}/`,
    name: 'AnthroPrime',
    alternateName: 'Anthroprime.ai',
    inLanguage: 'en',
    publisher: { '@id': `${origin}/#organization` }
  }
}

function crumbName(segments, i) {
  const seg = segments[i]
  if (segments[0] === 'gpu' && i === 1) return gpuSearchName(GPUS[seg])
  if (segments[0] === 'solutions' && i === 1) return solutionBySlug(seg)?.name
  if (segments[0] === 'compare' && i === 1) {
    const c = comparisonBySlug(seg)
    return `${GPUS[c.a].name} vs ${GPUS[c.b].name}`
  }
  if (segments[0] === 'guides' && i === 1) return guideBySlug(seg)?.title
  if (segments[0] === 'glossary' && i === 1) return termBySlug(seg)?.term
  return CRUMB_NAMES[seg] || seg
}

function breadcrumbs(origin, pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const items = [{ name: 'Home', path: '/' }]
  segments.forEach((_, i) => {
    // /gpu has no index page: link that crumb to the GPU offerings section.
    // /compare has none either: comparisons are listed on /guides.
    const path =
      segments[0] === 'gpu' && i === 0
        ? '/#capacity'
        : segments[0] === 'compare' && i === 0
          ? '/guides/'
          : canonicalPath('/' + segments.slice(0, i + 1).join('/'))
    items.push({ name: crumbName(segments, i), path })
  })
  return {
    '@type': 'BreadcrumbList',
    '@id': `${origin}${canonicalPath(pathname)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`
    }))
  }
}

function service(origin, { name, description, serviceType, url }) {
  return {
    '@type': 'Service',
    name,
    description,
    serviceType,
    url,
    provider: { '@id': `${origin}/#organization` },
    areaServed: 'Worldwide'
  }
}

function faq(items) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  }
}

/** The JSON-LD @graph for one public route. */
export function structuredData(pathname, origin) {
  const url = `${origin}${canonicalPath(pathname)}`
  const [title, description] = getPageMeta(pathname)
  const graph = [organization(origin), website(origin)]
  const page = {
    '@type': pathname === '/about' ? 'AboutPage' : pathname === '/contact' ? 'ContactPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': `${origin}/#website` },
    about: { '@id': `${origin}/#organization` }
  }
  if (pathname !== '/') {
    const crumbs = breadcrumbs(origin, pathname)
    page.breadcrumb = { '@id': crumbs['@id'] }
    graph.push(crumbs)
  }
  graph.push(page)

  const [, type, slug] = pathname.split('/')
  const article =
    (type === 'compare' && comparisonBySlug(slug)) ||
    (type === 'guides' && guideBySlug(slug))
  const term = type === 'glossary' && termBySlug(slug)
  if (article || term) {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: article ? article.title : term.title,
      description,
      url,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      datePublished: KNOWLEDGE_UPDATED,
      dateModified: KNOWLEDGE_UPDATED,
      inLanguage: 'en-GB',
      author: { '@id': `${origin}/#organization` },
      publisher: { '@id': `${origin}/#organization` },
      image: `${origin}/images/hub-and-spoke-og.png`
    })
    if (article?.faq) graph.push(faq(article.faq))
    if (term)
      graph.push({
        '@type': 'DefinedTerm',
        name: term.term,
        description: term.short,
        url,
        inDefinedTermSet: `${origin}${canonicalPath('/glossary')}`
      })
  } else if (pathname === '/glossary') {
    page['@type'] = 'CollectionPage'
    graph.push({
      '@type': 'DefinedTermSet',
      '@id': `${url}`,
      name: 'AI infrastructure glossary',
      hasDefinedTerm: GLOSSARY.map((t) => ({
        '@type': 'DefinedTerm',
        name: t.term,
        description: t.short,
        url: `${origin}${canonicalPath('/glossary/' + t.slug)}`
      }))
    })
  } else if (pathname === '/guides') {
    page['@type'] = 'CollectionPage'
    graph.push({
      '@type': 'ItemList',
      name: 'GPU guides and comparisons',
      itemListElement: [
        ...COMPARISONS.map((c) => ['/compare/' + c.slug, c.title]),
        ...GUIDES.map((g) => ['/guides/' + g.slug, g.title])
      ].map(([path, name], i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${origin}${canonicalPath(path)}`,
        name
      }))
    })
  } else if (pathname === '/infrastructure') {
    graph.push({
      ...service(origin, {
        name: 'AI infrastructure and GPU capacity',
        description,
        serviceType: 'AI infrastructure',
        url
      }),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'AI infrastructure services',
        itemListElement: INFRA_SERVICES.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: s.title, description: s.points }
        }))
      }
    })
    graph.push(faq(INFRA_FAQ))
  } else if (pathname === '/services') {
    graph.push({
      '@type': 'ItemList',
      name: 'AI infrastructure services',
      itemListElement: SERVICES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: service(origin, {
          name: s.name,
          description: s.desc || s.summary || s.name,
          serviceType: 'AI infrastructure',
          url: `${url}#${s.id}`
        })
      }))
    })
  } else if (type === 'gpu' && GPUS[slug]) {
    graph.push(
      service(origin, {
        name: `${gpuSearchName(GPUS[slug])} capacity`,
        description,
        serviceType: 'GPU as a service',
        url
      })
    )
  } else if (type === 'solutions' && solutionBySlug(slug)) {
    graph.push(
      service(origin, {
        name: solutionBySlug(slug).name,
        description,
        serviceType: 'AI infrastructure',
        url
      })
    )
  } else if (pathname === '/solutions') {
    graph.push({
      '@type': 'ItemList',
      name: 'AI infrastructure solutions',
      itemListElement: SOLUTIONS.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${origin}${canonicalPath('/solutions/' + s.slug)}`,
        name: s.name
      }))
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

/** Safe to inline in <script type="application/ld+json">. */
export function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}
