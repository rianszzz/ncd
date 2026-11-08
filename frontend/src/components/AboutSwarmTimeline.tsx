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
  shape: 'arrow' | 'cross' | 'pen'
  box?: { x: number; y: number; w: number; h: number; badge?: string }
}

interface AnchorPoint {
  x: number
  y: number
}

interface AboutSwarmTimelineProps {
  children: (props: {
    itemsRef: React.RefObject<(HTMLDivElement | null)[]>
    revealedIndexes: Set<number>
  }) => React.ReactNode
}

export function AboutSwarmTimeline({ children }: AboutSwarmTimelineProps) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [revealedIndexes, setRevealedIndexes] = useState<Set<number>>(() => {
    if (shouldReduceMotion) {
      return new Set([0, 1, 2, 3, 4, 5, 6, 7])
    }
    return new Set()
  })

  const [cursors, setCursors] = useState<Record<string, CursorData>>({})
  const [anchorNodes, setAnchorNodes] = useState<AnchorPoint[]>([])
  const [timelineSpineY, setTimelineSpineY] = useState<number>(0)

  useEffect(() => {
    if (shouldReduceMotion) {
      setRevealedIndexes(new Set([0, 1, 2, 3, 4, 5, 6, 7]))
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
    const DURATION = 2800 // Crisp 2.8s

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

      const newCursors: Record<string, CursorData> = {}
      const newRevealed = new Set<number>()
      const newAnchors: AnchorPoint[] = []

      const count = itemsRef.current.length || 4
      const firstItem = getRect(itemsRef.current[0])
      const lastItem = getRect(itemsRef.current[count - 1])

      // 1. Pen tool spine line by Security (#10B981)
      if (firstItem && lastItem && progress < 0.88) {
        const spineX = firstItem.x + 28
        const totalHeight = lastItem.y + lastItem.h - firstItem.y
        const pSpine = clamp(progress / 0.75, 0, 1)
        const curY = firstItem.y + totalHeight * easeInOutCubic(pSpine)

        setTimelineSpineY(curY)

        newCursors['sec'] = {
          x: spineX,
          y: curY,
          color: '#10B981',
          label: 'Security',
          shape: 'pen',
        }

        // Plot anchors as the pen passes each item
        for (let i = 0; i < count; i++) {
          const itemBox = getRect(itemsRef.current[i])
          if (itemBox && curY >= itemBox.y + 12) {
            newAnchors.push({ x: spineX, y: itemBox.y + 12 })
          }
        }
      }

      // 2. Dragging milestone card bounding boxes
      for (let i = 0; i < count; i++) {
        const itemBox = getRect(itemsRef.current[i])
        if (!itemBox) continue

        const itemStart = 0.15 + i * 0.14
        const itemEnd = itemStart + 0.22

        if (progress >= itemStart) {
          const pItem = clamp((progress - itemStart) / 0.22, 0, 1)
          if (pItem >= 0.75) {
            newRevealed.add(i)
          }

          if (progress < itemEnd && progress < 0.88) {
            const isEven = i % 2 === 0
            const agentKey = isEven ? 'plat' : 'fe'
            const agentColor = isEven ? '#EC4899' : '#6456EB'
            const agentLabel = isEven ? 'Platform' : 'Frontend'

            const eW = itemBox.w * easeOutCubic(pItem)
            const eH = itemBox.h * easeOutCubic(pItem)

            newCursors[agentKey] = {
              x: itemBox.x + eW,
              y: itemBox.y + eH,
              color: agentColor,
              label: agentLabel,
              shape: pItem < 0.9 ? 'cross' : 'arrow',
              box: {
                x: itemBox.x,
                y: itemBox.y,
                w: eW,
                h: eH,
                badge: `Milestone #${i + 1}: ${Math.round(eW)} × ${Math.round(eH)}`,
              },
            }
          }
        }
      }

      setRevealedIndexes((prev) => {
        const merged = new Set(prev)
        for (const idx of newRevealed) merged.add(idx)
        return merged
      })
      setAnchorNodes(newAnchors)

      // Dispersal Stage (0.80 - 1.0)
      if (progress >= 0.8) {
        setRevealedIndexes(new Set([0, 1, 2, 3, 4, 5, 6, 7]))

        const disp = clamp((progress - 0.8) / 0.2, 0, 1)
        const dispEase = easeInOutCubic(disp)

        for (const [id, c] of Object.entries(newCursors)) {
          c.x += (id === 'sec' ? -180 : 180) * dispEase
          c.y += (id === 'plat' ? 120 : -90) * dispEase
          delete c.box
        }
      }

      setCursors(newCursors)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      } else {
        setIsAnimating(false)
        setRevealedIndexes(new Set([0, 1, 2, 3, 4, 5, 6, 7]))
        setCursors({})
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isAnimating])

  return (
    <div ref={containerRef} className="relative">
      {children({
        itemsRef,
        revealedIndexes,
      })}

      {/* Live Overlay Layer */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {/* SVG Canvas for Pen Tool spine and anchor points */}
          <svg className="absolute inset-0 w-full h-full">
            {anchorNodes.length > 0 && (
              <line
                x1={anchorNodes[0].x}
                y1={anchorNodes[0].y}
                x2={anchorNodes[0].x}
                y2={timelineSpineY}
                stroke="#10B981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}
            {anchorNodes.map((pt, i) => (
              <g key={i}>
                <rect
                  x={pt.x - 3.5}
                  y={pt.y - 3.5}
                  width="7"
                  height="7"
                  fill="#FFFFFF"
                  stroke="#10B981"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>

          {/* Cursors and active Bounding Boxes */}
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
                {c.shape === 'pen' ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" className="drop-shadow-sm">
                    <path
                      d="M17.4 10.6 L20.6 13.8 L13.8 20.6 L10.6 17.4 Z"
                      fill={c.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 3 L13.1 6.3 L17.4 10.6 L10.6 17.4 L6.3 13.1 Z"
                      fill={c.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="10.2"
                      cy="10.2"
                      r="1.5"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
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
