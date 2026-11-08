import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'

export interface TourStep {
  id: string
  targetSelector: string
  mobileTargetSelector?: string
  title: string
  description: string
  badgeText: string
}

interface DashboardTourProps {
  isOpen: boolean
  onClose: () => void
  currentUserRole: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'identity',
    targetSelector: '[data-tour="member-identity"]',
    title: 'Profil & Kunci Akses Anggota',
    description:
      'Selamat datang di dasbor NCD! Di sini Anda dapat memverifikasi status anggota, posisi divisi, dan Kunci Akses resmi Anda. Jaga kerahasiaan kunci akses Anda untuk keamanan data.',
    badgeText: 'Langkah 1 dari 5',
  },
  {
    id: 'navigation',
    targetSelector: '[data-tour="nav-tabs"]',
    mobileTargetSelector: '[data-tour="nav-tabs-mobile"]',
    title: 'Bilah Navigasi Menu Dasbor',
    description:
      'Bilah navigasi ini memudahkan Anda berpindah cepat ke berbagai modul dasbor—mulai dari ringkasan, berkas dokumen, kompetisi, hingga status kas komunitas.',
    badgeText: 'Langkah 2 dari 5',
  },
  {
    id: 'onboarding',
    targetSelector: '[data-tour="tab-onboarding"]',
    mobileTargetSelector: '[data-tour="tab-onboarding-mobile"]',
    title: 'Formulir Onboarding Komunitas',
    description:
      'Lengkapi data diri, profil keahlian teknis, dan verifikasi pakta integritas anggota pada menu ini agar seluruh hak akses keorganisasian Anda aktif sepenuhnya.',
    badgeText: 'Langkah 3 dari 5',
  },
  {
    id: 'learning',
    targetSelector: '[data-tour="tab-learning-session"]',
    mobileTargetSelector: '[data-tour="tab-learning-session-mobile"]',
    title: 'NCD Learning Session 2026',
    description:
      'Jelajahi kelas workshop teknologi, silabus rekayasa perangkat lunak mandiri, dan materi riset keamanan siber yang diselenggarakan berkala oleh NCD.',
    badgeText: 'Langkah 4 dari 5',
  },
  {
    id: 'tutorial-help',
    targetSelector: '[data-tour="tutorial-btn"]',
    title: 'Bantuan & Tutorial Kapan Saja',
    description:
      'Butuh panduan ini kembali di masa mendatang? Cukup klik tombol "Tutorial" di pojok kanan atas kartu profil Anda kapan pun Anda membutuhkannya.',
    badgeText: 'Langkah 5 dari 5',
  },
]

export function DashboardTour({ isOpen, onClose, currentUserRole }: DashboardTourProps) {
  // GOD_ADMIN is strictly exempted from the product tour
  if (currentUserRole === 'GOD_ADMIN') {
    return null
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update target rect with throttling
  const updateRect = useCallback(() => {
    if (!isOpen) return
    const step = TOUR_STEPS[currentStepIndex]
    if (!step) return

    const selector = (isMobile && step.mobileTargetSelector) ? step.mobileTargetSelector : step.targetSelector
    let el = document.querySelector(selector)
    if (!el && step.targetSelector) {
      el = document.querySelector(step.targetSelector)
    }

    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
    } else {
      setTargetRect(null)
    }
  }, [isOpen, currentStepIndex, isMobile])

  // Scroll target into view & update rect on step change
  useEffect(() => {
    if (!isOpen) return

    const step = TOUR_STEPS[currentStepIndex]
    if (!step) return

    const selector = (isMobile && step.mobileTargetSelector) ? step.mobileTargetSelector : step.targetSelector
    let el = document.querySelector(selector)
    if (!el && step.targetSelector) {
      el = document.querySelector(step.targetSelector)
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const timer = setTimeout(() => {
      updateRect()
    }, 250)

    return () => clearTimeout(timer)
  }, [isOpen, currentStepIndex, isMobile, updateRect])

  // Track window resize and scroll
  useEffect(() => {
    if (!isOpen) return

    const handleScrollOrResize = () => {
      requestAnimationFrame(updateRect)
    }

    window.addEventListener('resize', handleScrollOrResize, { passive: true })
    window.addEventListener('scroll', handleScrollOrResize, { passive: true })

    return () => {
      window.removeEventListener('resize', handleScrollOrResize)
      window.removeEventListener('scroll', handleScrollOrResize)
    }
  }, [isOpen, updateRect])

  // Keyboard navigation: Escape, ArrowRight/Enter, ArrowLeft
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        if (currentStepIndex < TOUR_STEPS.length - 1) {
          setCurrentStepIndex((prev) => prev + 1)
        } else {
          onClose()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentStepIndex, onClose])

  if (!isOpen) return null

  const currentStep = TOUR_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1
  const padding = isMobile ? 6 : 8

  // Calculate popover coordinates for desktop
  let popoverStyle: React.CSSProperties = {}
  if (!isMobile && targetRect) {
    const popoverWidth = 380
    const popoverHeight = 220
    const margin = 16

    // Default: try placing below target
    let top = targetRect.bottom + margin
    let left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2)

    // If overflowing bottom, place above target
    if (top + popoverHeight > window.innerHeight - 20) {
      top = targetRect.top - popoverHeight - margin
    }

    // Horizontal bounds clamp
    if (left < 16) left = 16
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16
    }

    // Top bounds clamp
    if (top < 16) top = 16

    popoverStyle = {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Panduan Interaktif Dasbor Member"
      className="fixed inset-0 z-[9998] select-none"
    >
      {/* 1. Hardware-accelerated SVG Spotlight Overlay */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-[9998]"
        aria-hidden="true"
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.x - padding}
                y={targetRect.y - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx={4}
                ry={4}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(17, 18, 21, 0.72)"
          mask="url(#tour-spotlight-mask)"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* 2. Interactive Spotlight Focus Ring */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            left: `${targetRect.x - padding}px`,
            top: `${targetRect.y - padding}px`,
            width: `${targetRect.width + padding * 2}px`,
            height: `${targetRect.height + padding * 2}px`,
          }}
          className="pointer-events-none z-[9998] border-2 border-[#6456EB] shadow-[0_0_0_2px_#ffffff,0_0_15px_rgba(100,86,235,0.4)] transition-all duration-300"
        />
      )}

      {/* Backdrop click to dismiss */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[9998] cursor-pointer"
        aria-hidden="true"
      />

      {/* 3. Popover Card: Desktop Floating / Mobile Bottom Sheet */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          ref={popoverRef}
          initial={{ opacity: 0, y: isMobile ? 20 : 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMobile ? 20 : 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          style={isMobile ? undefined : popoverStyle}
          className={`z-[9999] bg-white border border-[#111215] p-4 sm:p-5 shadow-2xl text-left ${
            isMobile
              ? 'fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-3.5 right-3.5 max-w-md mx-auto'
              : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Row: Badge, Step Indicator & Close Button */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#111215]/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#6456EB] text-white">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>{currentStep.badgeText}</span>
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 -mr-1 sm:mr-0">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup panduan"
                className="min-w-[44px] min-h-[44px] sm:min-w-[28px] sm:min-h-[28px] sm:w-7 sm:h-7 flex items-center justify-center text-[#525660] hover:text-[#111215] hover:bg-[#111215]/5 transition-colors active:scale-95 touch-manipulation cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <h2 className="text-sm sm:text-base font-bold text-[#111215] tracking-tight leading-snug">
            {currentStep.title}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-[#525660] leading-relaxed text-pretty">
            {currentStep.description}
          </p>

          {/* Progress Dots Indicator */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#111215]/8">
            <div className="flex items-center gap-1" aria-hidden="true">
              {TOUR_STEPS.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 transition-all duration-200 ${
                    idx === currentStepIndex
                      ? 'w-5 bg-[#6456EB]'
                      : idx < currentStepIndex
                      ? 'w-2 bg-[#111215]'
                      : 'w-2 bg-[#111215]/20'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons: Skip, Back, Next / Done */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 sm:px-2 sm:py-1.5 text-xs text-[#7E8492] hover:text-[#111215] font-medium transition-colors min-h-[44px] sm:min-h-0 flex items-center touch-manipulation cursor-pointer active:scale-95"
              >
                Lewati
              </button>

              {!isFirstStep && (
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex((prev) => prev - 1)}
                  className="px-3 py-2 sm:px-2.5 sm:py-1.5 border border-[#111215]/20 hover:border-[#111215] text-[#111215] text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 min-h-[44px] sm:min-h-[34px] touch-manipulation cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali</span>
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 sm:px-3.5 sm:py-1.5 bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 min-h-[44px] sm:min-h-[34px] shadow-2xs touch-manipulation cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Selesai</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                  className="px-4 py-2 sm:px-3 sm:py-1.5 bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 min-h-[44px] sm:min-h-[34px] shadow-2xs touch-manipulation cursor-pointer"
                >
                  <span>Lanjut</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
