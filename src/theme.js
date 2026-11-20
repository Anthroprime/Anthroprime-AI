import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ap-theme'

/** Read the current theme from the <html> class (set by the inline script / applyTheme). */
export function getTheme() {
  if (typeof document !== 'undefined') {
    return document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
  }
  return 'light'
}

/** Apply a theme, persist it, and notify subscribers so token/inline-style consumers re-render. */
export function applyTheme(theme) {
  const next = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.classList.toggle('dark', next === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch (e) {
    /* private mode */
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta)
    meta.setAttribute('content', next === 'dark' ? '#0f182b' : '#f5f4f1')
  window.dispatchEvent(
    new CustomEvent('ap-theme-change', { detail: { theme: next } })
  )
}

/** React hook: returns 'light' | 'dark' and re-renders on theme changes. */
export function useTheme() {
  // 'light' on the first render matches the prerendered HTML; the effect
  // then reads the real theme set by the inline script in index.html.
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    setTheme(getTheme())
    const onChange = () => setTheme(getTheme())
    window.addEventListener('ap-theme-change', onChange)
    return () => window.removeEventListener('ap-theme-change', onChange)
  }, [])
  return theme
}
