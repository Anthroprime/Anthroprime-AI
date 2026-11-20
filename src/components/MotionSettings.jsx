import React, { createContext, useContext, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'

const MotionContext = createContext({ paused: false, toggle: () => {} })
export const useMotionSettings = () => useContext(MotionContext)

export default function MotionSettings({ children }) {
  // Start false on both server and client so prerendered HTML hydrates
  // cleanly; the effect below applies the visitor's preference immediately.
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const [userPaused, setPaused] = useState(false)
  const paused = !!reduced || userPaused
  // True for the prerender and the hydration render only. Above-the-fold
  // entrance animations skip it, so the first page view shows its heading
  // immediately (good for Largest Contentful Paint); later navigations animate.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return (
    <MotionContext.Provider
      value={{
        paused,
        toggle: () => setPaused((p) => !p),
        reduced,
        firstView: !hydrated
      }}
    >
      <MotionConfig reducedMotion={paused ? 'always' : 'user'}>
        <div className={paused ? 'motion-paused' : ''}>{children}</div>
      </MotionConfig>
    </MotionContext.Provider>
  )
}
