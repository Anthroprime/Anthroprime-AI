import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUpRight,
  ArrowUp,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  Pause,
  Play
} from 'lucide-react'
import LogoMark from './LogoMark'
import ScrollProgress from './ScrollProgress'
import { GPU_NAV, GPUS } from '../data/gpus'
import { SOLUTIONS } from '../data/solutions'
import { SERVICES } from '../data/services'
import { useTheme, applyTheme } from '../theme'
import { useMotionSettings } from './MotionSettings'

// Prerendered pages already carry their head tags; this keeps them in step on
// client-side navigation. Metadata is loaded on demand because it includes
// every guide's text, which most visitors never need.
function useDocumentMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    let cancelled = false
    import('../data/metadata').then((metadata) => {
      if (!cancelled) applyDocumentMeta(pathname, metadata)
    })
    return () => {
      cancelled = true
    }
  }, [pathname])
}

function applyDocumentMeta(pathname, { canonicalPath, getPageMeta, PUBLIC_ROUTES }) {
  {
    const meta = getPageMeta(pathname)
    const route = pathname.replace(/\/+$/, '') || '/'
    let robots = document.querySelector('meta[name="robots"]')
    if (!PUBLIC_ROUTES.includes(route)) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.name = 'robots'
        document.head.appendChild(robots)
      }
      robots.content = 'noindex'
    } else robots?.remove()
    document.title = meta[0]
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      const url = new URL(canonical.href)
      url.pathname = canonicalPath(route)
      canonical.href = url.href
      document
        .querySelector('meta[property="og:url"]')
        ?.setAttribute('content', url.href)
    }
    for (const [selector, attr, content] of [
      ['meta[name="description"]', 'content', meta[1]],
      ['meta[property="og:title"]', 'content', meta[0]],
      ['meta[property="og:description"]', 'content', meta[1]]
    ])
      document.querySelector(selector)?.setAttribute(attr, content)
  }
}

const navigation = [
  {
    label: 'GPU Cloud',
    links: [
      { label: 'Our GPU offerings', to: '/#capacity' },
        { label: 'Capacity overview', to: '/capacity' },
      ...GPU_NAV.map((g) => ({
        label: g.label || g.name || GPUS[g.slug]?.name,
        to: g.to || `/gpu/${g.slug}`
      }))
    ]
  },
  {
    label: 'Solutions',
    links: SOLUTIONS.map((s) => ({ label: s.name, to: `/solutions/${s.slug}` }))
  },
  {
    label: 'Services',
    links: SERVICES.map((s) => ({ label: s.name, to: `/services#${s.id}` }))
  }
]

export function Navbar() {
  const { pathname, hash } = useLocation()
  const [openMenu, setOpenMenu] = useState(null)
  const [pinnedMenu, setPinnedMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const ref = useRef()
  const theme = useTheme()
  const { paused, toggle, reduced } = useMotionSettings()
  useEffect(() => {
    setOpenMenu(null)
    setPinnedMenu(null)
    setMobileOpen(false)
  }, [pathname, hash])
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpenMenu(null)
        setPinnedMenu(null)
        setMobileOpen(false)
      }
    }
    const escape = (e) => {
      if (e.key === 'Escape') {
        const expanded = ref.current?.querySelector(
          'button.nav-link[aria-expanded="true"]'
        )
        const mobile = ref.current?.querySelector(
          '.mobile-toggle[aria-expanded="true"]'
        )
        setOpenMenu(null)
        setPinnedMenu(null)
        setMobileOpen(false)
        ;(mobile || expanded)?.focus()
      }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [])
  return (
    <header className="site-header" ref={ref}>
      <div className="wrap header-inner">
        <Link to="/" aria-label="Anthroprime home">
          <LogoMark />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink className="nav-link nav-infra" to="/infrastructure">
            AI Infrastructure
          </NavLink>
          {navigation.map((item) => (
            <div
              className="nav-item"
              key={item.label}
              onMouseEnter={() => {
                if (!pinnedMenu) setOpenMenu(item.label)
              }}
              onMouseLeave={(e) => {
                if (
                  !pinnedMenu &&
                  !e.currentTarget.contains(document.activeElement)
                )
                  setOpenMenu(null)
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setOpenMenu(null)
                  setPinnedMenu(null)
                }
              }}
            >
              <button
                className="nav-link"
                aria-expanded={openMenu === item.label}
                aria-controls={`nav-${item.label.replace(/ /g, '-')}`}
                onClick={() => {
                  const next = pinnedMenu === item.label ? null : item.label
                  setPinnedMenu(next)
                  setOpenMenu(next)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setOpenMenu(item.label)
                    setPinnedMenu(item.label)
                    const trigger = e.currentTarget
                    requestAnimationFrame(() =>
                      trigger.parentElement
                        ?.querySelector('.nav-dropdown a')
                        ?.focus()
                    )
                  }
                }}
              >
                {item.label}
                <ChevronDown />
              </button>
              <AnimatePresence>
                {openMenu === item.label && (
                  <motion.div
                    id={`nav-${item.label.replace(/ /g, '-')}`}
                    className="nav-dropdown"
                    initial={paused ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.links.map((l, i) => (
                      <Link key={l.to} to={l.to}>
                        {l.label}
                        <span>{String(i + 1).padStart(2, '0')} ↗</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <NavLink className="nav-link" to="/resources">
            Resources
          </NavLink>
          <NavLink className="nav-link nav-lab" to="/gpu-lab">
            GPU Lab <span className="lab-nav-dot" aria-hidden="true" />
          </NavLink>
          <NavLink className="nav-link" to="/about">
            Our practice
          </NavLink>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={
              theme === 'dark'
                ? 'Switch to light theme'
                : 'Switch to dark theme'
            }
            onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
          <button
            className="icon-button"
            aria-label={
              paused ? 'Resume visual effects' : 'Pause visual effects'
            }
            aria-pressed={paused}
            disabled={!!reduced}
            title={
              reduced ? 'Reduced motion is enabled on your device' : undefined
            }
            onClick={toggle}
          >
            {paused ? <Play /> : <Pause />}
          </button>
          <Link className="btn btn-primary header-cta" to="/find-capacity">
            Find GPU Capacity
            <ArrowUpRight />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          {[
            ['Home', '/'],
            ['AI Infrastructure', '/infrastructure'],
            ['GPU Cloud', '/#capacity'],
              ['Capacity overview', '/capacity'],
            ['Solutions', '/solutions'],
            ['Services', '/services'],
            ['Resources', '/resources'],
            ['Guides & comparisons', '/guides'],
            ['GPU Lab', '/gpu-lab'],
            ['Our practice', '/about'],
            ['Contact the desk', '/contact'],
            ['Find GPU Capacity', '/find-capacity']
          ].map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
              <ArrowUpRight size={15} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  const labels = {
    'svc-sourcing': 'GPU provisioning',
    'svc-advisory': 'Architecture advisory',
    'svc-deployment': 'Cluster deployment',
    'svc-managed': 'Managed Infra',
    'svc-security': 'Infrastructure security'
  }
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Link to="/" aria-label="Anthroprime home">
              <LogoMark />
            </Link>
            <p className="footer-intro">
              Human perspective.
              <br />
              Extraordinary infrastructure.
            </p>
          </div>
          <div className="footer-col">
            <h3 className="mono">Explore</h3>
            {[
              ['AI Infrastructure', '/infrastructure'],
              ['Become a collaborator', '/infrastructure#join'],
              ['Our GPU offerings', '/#capacity'],
                ['Capacity overview', '/capacity'],
              ['GPU comparison', '/resources#comparison'],
              ['Guides & comparisons', '/guides'],
              ['Glossary', '/glossary'],
              ['GPU Lab', '/gpu-lab'],
              ['AI solutions', '/solutions'],
              ['Find GPU Capacity', '/find-capacity']
            ].map(([label, to]) => (
              <Link to={to} key={to}>
                {label}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h3 className="mono">Our expertise</h3>
            {SERVICES.map((s) => (
              <Link to={`/services#${s.id}`} key={s.id}>
                {labels[s.id]}
              </Link>
            ))}
          </div>
          <div className="footer-col">
            <h3 className="mono">Start a conversation</h3>
            <a href="mailto:hello@anthroprime.com">hello@anthroprime.com ↗</a>
            <a
              href="https://wa.me/919711554410"
              target="_blank"
              rel="noopener noreferrer"
            >
              +91 97115 54410 ↗
            </a>
            <Link to="/about">Gurugram, India · Global reach</Link>
            <Link to="/contact">Contact the desk</Link>
          </div>
        </div>
        <div className="footer-bottom mono">
          <span>© 2026 Anthroprime Technology Private Limited</span>
          <span>GPU infrastructure · Deployment · Managed services</span>
          <a href="#top">
            Back to top
            <ArrowUp size={11} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const { paused } = useMotionSettings()
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    let anchor = hash.slice(1)
    try {
      anchor = decodeURIComponent(anchor)
    } catch {
      /* Keep malformed fragments harmless. */
    }
    const scrollToAnchor = () => {
      const target = document.getElementById(anchor)
      if (!target) return false
      target.scrollIntoView({
        behavior: pausedRef.current ? 'instant' : 'smooth'
      })
      return true
    }
    if (scrollToAnchor()) return
    // Lazy routes can arrive after the navigation effect. Wait for the target,
    // rather than assuming that a fixed delay is enough on every connection.
    const observer = new MutationObserver(() => {
      if (scrollToAnchor()) observer.disconnect()
    })
    observer.observe(document.getElementById('main-content') || document.body, {
      childList: true,
      subtree: true
    })
    const timeout = setTimeout(() => observer.disconnect(), 10000)
    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [pathname, hash])
  return null
}

export default function Layout() {
  useDocumentMeta()
  const { pathname } = useLocation()
  const { paused } = useMotionSettings()
  // No fade on the first page view: the prerendered content stays visible
  // (faster first paint, nothing hidden from crawlers). Later navigations fade.
  const firstView = useRef(true)
  useEffect(() => {
    firstView.current = false
  }, [])
  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <ScrollProgress />
      <ScrollManager />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <motion.div
          key={pathname}
          initial={paused || firstView.current ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <Suspense
            fallback={
              <div
                className="wrap"
                style={{ minHeight: '60vh', paddingBlock: 80 }}
                role="status"
              >
                <p className="eyebrow mono">Anthroprime / Loading</p>
                <p className="text-muted mt-4">Preparing your page…</p>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
