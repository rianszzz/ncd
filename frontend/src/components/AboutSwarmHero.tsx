import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'

// --- SVG Cursor Geometry & Paths (derived from Swarm rebuild) ---
const ARROW_PATH =
  'M4.6 3.9 C4.2 3.1 4.9 2.4 5.7 2.8 L20.6 9.4 C21.5 9.8 21.4 11.1 20.4 11.3 L13.9 12.9 C13.4 13 13 13.4 12.9 13.9 L11.3 20.4 C11.1 21.4 9.8 21.5 9.4 20.6 Z'

export type CursorShape = 'arrow' | 'cross' | 'ibeam' | 'dup'

// Easing functions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

interface CursorState {
  x: number
  y: number
  shape: CursorShape
  active: boolean
  label?: string
  color: string
  box?: { x: number; y: number; w: number; h: number; badge?: string }
}

interface RedGuide {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

interface AboutSwarmHeroProps {
  children: (props: {
    titleRef: React.RefObject<HTMLHeadingElement | null>
    cardsRef: React.RefObject<(HTMLElement | null)[]>
    isAnimating: boolean
    revealedCards: boolean[]
    typedTitleProgress: number
  }) => React.ReactNode
}

export function AboutSwarmHero({ children }: AboutSwarmHeroProps) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const cardsRef = useRef<(HTMLElement | null)[]>([])

  // Always animate on page load / refresh unless reduced motion is active
  const [isAnimating, setIsAnimating] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return !shouldReduceMotion
  })

  const [revealedCards, setRevealedCards] = useState<boolean[]>([false, false, false])
  const [typedTitleProgress, setTypedTitleProgress] = useState<number>(0)
  const [cursors, setCursors] = useState<Record<string, CursorState>>({})
  const [redGuides, setRedGuides] = useState<RedGuide[]>([])
  const [stageBadge, setStageBadge] = useState<string>('Rekonstruksi Blueprint...')

  // Skip animation instantly
  const skip = useCallback(() => {
    setIsAnimating(false)
    setRevealedCards([true, true, true])
    setTypedTitleProgress(1)
    setCursors({})
    setRedGuides([])
  }, [])

  useEffect(() => {
    if (!isAnimating) {
      setRevealedCards([true, true, true])
      setTypedTitleProgress(1)
      return
    }

    let rafId: number
    const startTime = performance.now()
    const DURATION = 3200 // Streamlined intro duration ~3.2s

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

    const isMobile = window.innerWidth < 640

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = clamp(elapsed / DURATION, 0, 1)

      const titleBox = getRect(titleRef.current)
      const c0 = getRect(cardsRef.current[0])
      const c1 = getRect(cardsRef.current[1])
      const c2 = getRect(cardsRef.current[2])

      const newCursors: Record<string, CursorState> = {}
      const newGuides: RedGuide[] = []

      // Stage 1: (0.00 - 0.40) Frontend types headline
      if (progress < 0.9) {
        const typeProgress = clamp(progress / 0.40, 0, 1)
        setTypedTitleProgress(typeProgress)

        if (titleBox) {
          const tEase = easeInOutCubic(typeProgress)
          const curX = titleBox.x + titleBox.w * tEase
          const curY = titleBox.y + titleBox.h * 0.55
          newCursors['fe'] = {
            x: curX,
            y: curY,
            shape: 'ibeam',
            active: true,
            label: 'Frontend',
            color: '#6456EB',
          }
        }
      }

      // Stage 2: (0.15 - 0.65) Cards drag & bounding boxes
      // Card 0 (Design)
      if (c0) {
        const p0 = clamp((progress - 0.15) / 0.35, 0, 1)
        if (p0 > 0 && progress < 0.88) {
          const e0 = easeOutCubic(p0)
          const w = c0.w * e0
          const h = c0.h * e0
          newCursors['des'] = {
            x: c0.x + w,
            y: c0.y + h,
            shape: p0 < 0.95 ? 'cross' : 'arrow',
            active: true,
            label: 'Design',
            color: '#F24E1E',
            box: {
              x: c0.x,
              y: c0.y,
              w,
              h,
              badge: `${Math.round(w)} × ${Math.round(h)}`,
            },
          }
          if (p0 >= 0.85) {
            setRevealedCards((prev) => (prev[0] ? prev : [true, prev[1], prev[2]]))
          }
        }
      }

      // Card 1 (Systems)
      if (c1 && !isMobile) {
        const p1 = clamp((progress - 0.28) / 0.35, 0, 1)
        if (p1 > 0 && progress < 0.88) {
          const e1 = easeOutCubic(p1)
          const w = c1.w * e1
          const h = c1.h * e1
          newCursors['sys'] = {
            x: c1.x + w,
            y: c1.y + h,
            shape: p1 < 0.95 ? 'cross' : 'arrow',
            active: true,
            label: 'Systems',
            color: '#0D99FF',
            box: {
              x: c1.x,
              y: c1.y,
              w,
              h,
              badge: `${Math.round(w)} × ${Math.round(h)}`,
            },
          }
          if (p1 >= 0.85) {
            setRevealedCards((prev) => (prev[1] ? prev : [prev[0], true, prev[2]]))
          }
        }
      } else if (c1 && isMobile) {
        const p1 = clamp((progress - 0.35) / 0.3, 0, 1)
        if (p1 >= 0.8) {
          setRevealedCards((prev) => (prev[1] ? prev : [prev[0], true, prev[2]]))
        }
      }

      // Card 2 (Security)
      if (c2 && !isMobile) {
        const p2 = clamp((progress - 0.42) / 0.35, 0, 1)
        if (p2 > 0 && progress < 0.88) {
          const e2 = easeOutCubic(p2)
          const w = c2.w * e2
          const h = c2.h * e2
          newCursors['sec'] = {
            x: c2.x + w,
            y: c2.y + h,
            shape: p2 < 0.95 ? 'cross' : 'arrow',
            active: true,
            label: 'Security',
            color: '#10B981',
            box: {
              x: c2.x,
              y: c2.y,
              w,
              h,
              badge: `${Math.round(w)} × ${Math.round(h)}`,
            },
          }
          if (p2 >= 0.85) {
            setRevealedCards((prev) => (prev[2] ? prev : [prev[0], prev[1], true]))
          }
        }
      } else if (c2 && isMobile) {
        const p2 = clamp((progress - 0.5) / 0.3, 0, 1)
        if (p2 >= 0.8) {
          setRevealedCards((prev) => (prev[2] ? prev : [prev[0], prev[1], true]))
        }
      }

      // Stage 3: (0.55 - 0.82) Platform draws red Figma alignment guides
      if (c0 && c1 && !isMobile && progress >= 0.55 && progress < 0.88) {
        const pGuide = clamp((progress - 0.55) / 0.25, 0, 1)
        const gap = Math.round(c1.x - (c0.x + c0.w))
        const guideY = c0.y + c0.h / 2

        newGuides.push({
          x1: c0.x + c0.w,
          y1: guideY,
          x2: c0.x + c0.w + gap * pGuide,
          y2: guideY,
          label: `${gap}px`,
        })

        if (c2) {
          const gap2 = Math.round(c2.x - (c1.x + c1.w))
          newGuides.push({
            x1: c1.x + c1.w,
            y1: guideY,
            x2: c1.x + c1.w + gap2 * pGuide,
            y2: guideY,
            label: `${gap2}px`,
          })
        }

        newCursors['plat'] = {
          x: c0.x + c0.w + gap * pGuide,
          y: guideY,
          shape: 'arrow',
          active: true,
          label: 'Platform',
          color: '#EC4899',
        }
        setStageBadge('Mengukur Spacing & Alignment...')
      }

      // Stage 4: (0.82 - 1.0) Disperse & Complete
      if (progress >= 0.82) {
        setStageBadge('Selesai • Terverifikasi ✓')
        setRevealedCards([true, true, true])
        setTypedTitleProgress(1)

        const disp = clamp((progress - 0.82) / 0.18, 0, 1)
        const dispEase = easeInOutCubic(disp)

        for (const [id, c] of Object.entries(newCursors)) {
          c.x += (id === 'fe' || id === 'des' ? -180 : 220) * dispEase
          c.y += (id === 'plat' || id === 'sec' ? 120 : -100) * dispEase
          delete c.box
        }
      }

      setCursors(newCursors)
      setRedGuides(newGuides)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        skip()
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isAnimating, skip])

  return (
    <div ref={containerRef} className="relative">
      {/* Top Banner Control during Animation */}
      {isAnimating && (
        <div className="absolute top-0 right-0 z-50 flex items-center gap-2 -translate-y-8 sm:-translate-y-10 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium text-[#111215] bg-[#F4F1EB] border border-[#111215]/20 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>{stageBadge}</span>
          </div>

          <button
            onClick={skip}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-[#525660] hover:text-[#111215] bg-white border border-[#111215]/20 hover:border-[#111215] transition-colors shadow-2xs cursor-pointer"
            title="Lewati animasi intro"
          >
            <span>Lewati</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Render children with state hooks */}
      {children({
        titleRef,
        cardsRef,
        isAnimating,
        revealedCards,
        typedTitleProgress,
      })}

      {/* Live Overlay Layer: Bounding Boxes, Smart Guides, and Multiplayer Cursors */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {/* SVG Canvas for Guides */}
          <svg className="absolute inset-0 w-full h-full">
            {redGuides.map((g, i) => (
              <g key={i}>
                <line
                  x1={g.x1}
                  y1={g.y1}
                  x2={g.x2}
                  y2={g.y2}
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle cx={g.x1} cy={g.y1} r="2.5" fill="#F43F5E" />
                <circle cx={g.x2} cy={g.y2} r="2.5" fill="#F43F5E" />
              </g>
            ))}
          </svg>

          {/* Red Guide Badges */}
          {redGuides.map((g, i) => (
            <div
              key={`badge-${i}`}
              className="absolute bg-[#F43F5E] text-white px-1.5 py-0.5 text-[10px] font-mono font-semibold shadow-xs -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{
                left: (g.x1 + g.x2) / 2,
                top: (g.y1 + g.y2) / 2 - 12,
              }}
            >
              {g.label}
            </div>
          ))}

          {/* Cursors & Active Bounding Boxes */}
          {Object.entries(cursors).map(([id, c]) => (
            <React.Fragment key={id}>
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

              <div
                className="absolute transition-transform duration-75 pointer-events-none select-none z-50 flex items-start"
                style={{
                  left: c.x,
                  top: c.y,
                  transform: 'translate(-2px, -2px)',
                }}
              >
                {c.shape === 'ibeam' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" className="drop-shadow-sm">
                    <path
                      d="M8 4 H16 M12 4 V20 M8 20 H16"
                      stroke="#FFFFFF"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 4 H16 M12 4 V20 M8 20 H16"
                      stroke={c.color}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : c.shape === 'cross' ? (
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
