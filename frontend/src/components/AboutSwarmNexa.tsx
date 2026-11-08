import React, { useState, useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const ARROW_PATH =
  'M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

interface CursorData {
  x: number
  y: number
  color: string
  label: string
  shape: 'arrow' | 'cross'
  box?: { x: number; y: number; w: number; h: number; badge?: string }
}

interface AboutSwarmNexaProps {
  children: (props: {
    cardRef: React.RefObject<HTMLDivElement | null>
    logoRef: React.RefObject<HTMLDivElement | null>
    isCardRevealed: boolean
    isLogoRevealed: boolean
  }) => React.ReactNode
}

export function AboutSwarmNexa({ children }: AboutSwarmNexaProps) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLDivElement | null>(null)

  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(Boolean(shouldReduceMotion))
  const [isLogoRevealed, setIsLogoRevealed] = useState<boolean>(Boolean(shouldReduceMotion))
  const [cursors, setCursors] = useState<Record<string, CursorData>>({})

  // Intersection observer to trigger animation when scrolled into view
  useEffect(() => {
    if (shouldReduceMotion) {
      setIsCardRevealed(true)
      setIsLogoRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
          setIsAnimating(true)
        }
      },
      { threshold: 0.15 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [hasStarted, shouldReduceMotion])

  useEffect(() => {
    if (!isAnimating) return

    let rafId: number
    const startTime = performance.now()
    const DURATION = 2400 // Fast and crisp 2.4s

    const getRect = (el: HTMLElement | null) => {
      if (!el || !containerRef.current) return null
      const cRect = containerRef.current.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      return {
        x: eRect.left - cRect.left,
        y: eRect.top - cRect.top,
        w: eRect.width,
        h: eRect.height,
      }
    }

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = clamp(elapsed / DURATION, 0, 1)

      const cardBox = getRect(cardRef.current)
      const logoBox = getRect(logoRef.current)

      const newCursors: Record<string, CursorData> = {}

      // Cursor 1: Systems (#0D99FF) drags the main card container
      if (cardBox && progress < 0.88) {
        const pCard = clamp(progress / 0.55, 0, 1)
        const eCard = easeOutCubic(pCard)
        const w = cardBox.w * eCard
        const h = cardBox.h * eCard

        newCursors['sys'] = {
          x: cardBox.x + w,
          y: cardBox.y + h,
          color: '#0D99FF',
          label: 'Systems',
          shape: pCard < 0.95 ? 'cross' : 'arrow',
          box: {
            x: cardBox.x,
            y: cardBox.y,
            w,
            h,
            badge: `${Math.round(w)} × ${Math.round(h)}`,
          },
        }

        if (pCard >= 0.8) {
          setIsCardRevealed(true)
        }
      }

      // Cursor 2: Design (#F24E1E) drags the SVG logo box
      if (logoBox && progress >= 0.25 && progress < 0.88) {
        const pLogo = clamp((progress - 0.25) / 0.45, 0, 1)
        const eLogo = easeOutCubic(pLogo)
        const w = logoBox.w * eLogo
        const h = logoBox.h * eLogo

        newCursors['des'] = {
          x: logoBox.x + w,
          y: logoBox.y + h,
          color: '#F24E1E',
          label: 'Design',
          shape: pLogo < 0.95 ? 'cross' : 'arrow',
          box: {
            x: logoBox.x,
            y: logoBox.y,
            w,
            h,
            badge: `Logo (SVG): ${Math.round(w)} × ${Math.round(h)}`,
          },
        }

        if (pLogo >= 0.8) {
          setIsLogoRevealed(true)
        }
      }

      // Dispersal Stage (0.80 - 1.0)
      if (progress >= 0.8) {
        setIsCardRevealed(true)
        setIsLogoRevealed(true)

        const disp = clamp((progress - 0.8) / 0.2, 0, 1)
        const dispEase = easeInOutCubic(disp)

        for (const [id, c] of Object.entries(newCursors)) {
          c.x += (id === 'sys' ? -150 : 180) * dispEase
          c.y += (id === 'sys' ? 60 : -60) * dispEase
          delete c.box
        }
      }

      setCursors(newCursors)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setIsAnimating(false)
        setIsCardRevealed(true)
        setIsLogoRevealed(true)
        setCursors({})
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isAnimating])

  return (
    <div ref={containerRef} className="relative">
      {children({
        cardRef,
        logoRef,
        isCardRevealed,
        isLogoRevealed,
      })}

      {/* Live Overlay Layer */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {Object.entries(cursors).map(([id, c]) => (
            <React.Fragment key={id}>
              {/* Dragged Bounding Box */}
              {c.box && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: c.box.x,
                    top: c.box.y,
                    width: c.box.w,
                    height: c.box.h,
                    border: `1.5px dashed ${c.color}`,
                    backgroundColor: `${c.color}08`,
                  }}
                >
                  <span
                    className="absolute -top-1 -left-1 w-2 h-2 bg-white border"
                    style={{ borderColor: c.color }}
                  />
                  <span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-white border"
                    style={{ borderColor: c.color }}
                  />
                  <span
                    className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border"
                    style={{ borderColor: c.color }}
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border"
                    style={{ borderColor: c.color }}
                  />

                  {c.box.badge && (
                    <div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-mono font-medium text-white shadow-2xs whitespace-nowrap select-none"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.box.badge}
                    </div>
                  )}
                </div>
              )}

              {/* Bot Cursor Graphic + Role Label */}
              <div
                className="absolute transition-transform duration-75 pointer-events-none select-none z-50 flex items-start"
                style={{
                  left: c.x,
                  top: c.y,
                  transform: 'translate(-2px, -2px)',
                }}
              >
                {c.shape === 'cross' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-sm">
                    <path
                      d="M12 3.5 V20.5 M3.5 12 H20.5"
                      stroke="#FFFFFF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 3.5 V20.5 M3.5 12 H20.5"
                      stroke={c.color}
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-sm">
                    <path
                      d={ARROW_PATH}
                      fill={c.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {c.label && (
                  <div
                    style={{ backgroundColor: c.color }}
                    className="ml-1 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-white tracking-wide shadow-xs whitespace-nowrap"
                  >
                    {c.label}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
