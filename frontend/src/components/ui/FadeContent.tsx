import React, { useEffect, useRef, useState, CSSProperties, ReactNode } from 'react'

export interface FadeContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  blur?: boolean | number
  duration?: number
  delay?: number
  threshold?: number
  initialOpacity?: number
  className?: string
  style?: CSSProperties
  effect?: string
  ease?: string
  stagger?: number
  staggerFrom?: string
  trigger?: string
  once?: boolean
  exit?: boolean
  scrub?: boolean | number
  disappearAfter?: number
  disappearDuration?: number
  disappearEase?: string
}

export default function FadeContent({
  children,
  blur = false,
  duration = 0.8,
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  className = '',
  style,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // If reduced motion is preferred or IntersectionObserver is unavailable, reveal instantly
    if (
      typeof IntersectionObserver === 'undefined' ||
      (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    ) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: Math.min(Math.max(threshold, 0), 1) }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : initialOpacity,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
        filter: isVisible ? 'blur(0px)' : blur ? (typeof blur === 'number' ? `blur(${blur}px)` : 'blur(8px)') : 'none',
        transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, filter ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
