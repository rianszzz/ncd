import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'

export function ScrollToTop() {
  const { pathname } = useLocation()
  const [showButton, setShowButton] = useState(false)

  // 1. Reset scroll position immediately on every route transition
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    })
  }, [pathname])

  // 2. Monitor scroll distance to show floating Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!showButton) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke bagian atas halaman (Scroll to top)"
      className="fixed bottom-6 right-6 z-40 p-2.5 sm:p-3 bg-[#111215] text-[#F4F1EB] border-2 border-[#111215] shadow-[3px_3px_0px_#6456EB] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#6456EB] focus-visible:ring-offset-2 transition-all cursor-pointer flex items-center gap-1.5 font-mono text-[11px] font-bold"
    >
      <ArrowUp className="w-4 h-4 text-[#E6FF55]" />
      <span className="hidden sm:inline">KE ATAS</span>
    </button>
  )
}
