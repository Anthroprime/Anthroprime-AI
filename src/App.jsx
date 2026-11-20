import React, { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
const GpuDetail = lazy(() => import('./pages/GpuDetail'))
const SolutionsIndex = lazy(() =>
  import('./pages/Solutions').then((module) => ({
    default: module.SolutionsIndex
  }))
)
const SolutionDetail = lazy(() =>
  import('./pages/Solutions').then((module) => ({
    default: module.SolutionDetail
  }))
)
const Services = lazy(() => import('./pages/Services'))
const Resources = lazy(() => import('./pages/Resources'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const FindCapacity = lazy(() => import('./pages/FindCapacity'))
const Capacity = lazy(() => import('./pages/Capacity'))
const NotFound = lazy(() => import('./pages/NotFound'))
const GpuLab = lazy(() => import('./pages/GpuLab'))
const Infrastructure = lazy(() => import('./pages/Infrastructure'))
const knowledge = (name) =>
  lazy(() =>
    import('./pages/Knowledge').then((module) => ({ default: module[name] }))
  )
const KnowledgeIndex = knowledge('KnowledgeIndex')
const GuidePage = knowledge('GuidePage')
const ComparePage = knowledge('ComparePage')
const GlossaryIndex = knowledge('GlossaryIndex')
const GlossaryTerm = knowledge('GlossaryTerm')

/**
 * Anthroprime.ai — multi-page site
 *
 * /infrastructure        AI Infrastructure — hub-and-spoke collaborator model
 * /                      Home (hero, GPU offerings, clusters, how-it-works,
 *                          global network, services, who-we-serve, why-us)
 * /marketplace           Legacy redirect to the GPU offerings section
 * /gpu/:slug             GPU detail pages (h100 h200 b200 gb200 a100 l40s)
 * /solutions             Solutions index
 * /solutions/:slug       Solution detail pages
 * /services              Services (capacity, advisory, deployment, managed, security)
 * /resources             GPU comparison + deployment options + guides
 * /about                 About + Partners
 * /contact               Contact
 * /find-capacity         Find GPU Capacity form (primary CTA destination)
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/guides" element={<KnowledgeIndex />} />
        <Route path="/guides/:slug" element={<GuidePage />} />
        <Route path="/compare/:slug" element={<ComparePage />} />
        <Route path="/glossary" element={<GlossaryIndex />} />
        <Route path="/glossary/:slug" element={<GlossaryTerm />} />
        <Route
          path="/marketplace"
          element={<Navigate to="/#capacity" replace />}
        />
        <Route path="/gpu/:slug" element={<GpuDetail />} />
        <Route path="/solutions" element={<SolutionsIndex />} />
        <Route path="/solutions/:slug" element={<SolutionDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/gpu-lab" element={<GpuLab />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/find-capacity" element={<FindCapacity />} />
        <Route path="/capacity" element={<Capacity />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
