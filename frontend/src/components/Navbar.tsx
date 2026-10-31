import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, Menu, X, ShieldCheck, LogOut } from 'lucide-react'
import { api } from '../services/api'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('ncd_jwt')
      localStorage.removeItem('ncd_user')
      setIsLoggedIn(false)
      setIsOpen(false)
      navigate('/login')
    }
  }

  // Close mobile menu & update auth state on route change
  useEffect(() => {
    setIsOpen(false)
    setIsLoggedIn(Boolean(localStorage.getItem('ncd_jwt') && localStorage.getItem('ncd_user')))
  }, [location.pathname])

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Struktur & Tim', path: '/team' },
    { name: 'Proyek', path: '/projects' },
    { name: 'Prestasi', path: '/achievements' },
    { name: 'Berita', path: '/news' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#F4F1EB]/95 backdrop-blur-xl border-b border-[#111215]/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 group">
          <img
            src="/logo.svg"
            alt="NCD Logo"
            width={24}
            height={24}
            className="h-6 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col text-left pl-2.5 border-l border-[#111215]/10 shrink-0">
            <span className="font-semibold text-xs tracking-tight text-[#111215] leading-none whitespace-nowrap">NEXA Community</span>
            <span className="text-[9px] text-[#7E8492] font-medium tracking-wider uppercase mt-0.5 whitespace-nowrap">Development</span>
          </div>
        </Link>

        {/* Desktop Navigation Links (>= 1024px to prevent tablet/split-screen collision) */}
        <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 text-xs xl:text-[13px] shrink-0">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors whitespace-nowrap ${
                isActive(item.path) ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions (>= 1024px) */}
        <div className="hidden lg:flex items-center space-x-2 shrink-0">
          {isLoggedIn ? (
            <>
              <Link
                to="/app"
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors flex items-center space-x-1.5 whitespace-nowrap"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dasbor Portal</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 hover:bg-red-100 text-[#D83B01] border border-red-200/60 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
                title="Keluar dari sesi portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#111215] hover:bg-[#111215]/5 transition-colors flex items-center space-x-1.5 whitespace-nowrap"
              >
                <Lock className="w-3.5 h-3.5 text-[#7E8492]" />
                <span>Portal Member</span>
              </Link>
              <Link
                to="/join"
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111215] text-[#F4F1EB] hover:bg-[#252830] transition-all shadow-2xs whitespace-nowrap"
              >
                Gabung NCD
              </Link>
            </>
          )}
        </div>

        {/* Mobile & Tablet Hamburger Button (< 1024px) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#111215] hover:bg-[#111215]/5 transition-colors cursor-pointer border border-transparent focus-visible:border-[#111215]"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile & Tablet Hamburger Dropdown Menu (< 1024px) */}
      {isOpen && (
        <div
          id="mobile-nav-menu"
          role="region"
          aria-label="Menu navigasi mobile"
          className="lg:hidden bg-[#F4F1EB]/98 backdrop-blur-2xl border-b border-[#111215]/15 px-4 sm:px-6 pt-3 pb-6 flex flex-col space-y-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`px-3.5 py-3 min-h-[44px] text-sm font-medium transition-colors text-left flex items-center justify-between border ${
                isActive(item.path)
                  ? 'bg-[#111215] text-[#F4F1EB] border-black'
                  : 'text-[#111215] hover:bg-[#111215]/5 border-transparent'
              }`}
            >
              <span>{item.name}</span>
              {isActive(item.path) && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-[#111215]/8 flex flex-col sm:flex-row gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  to="/app"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] text-xs font-medium rounded-xl text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dasbor Portal</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] text-xs font-medium rounded-xl bg-red-50 hover:bg-red-100 text-[#D83B01] border border-red-200/60 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] text-xs font-medium rounded-xl text-[#111215] bg-white border border-[#111215]/10 hover:bg-[#111215]/5 transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#7E8492]" />
                  <span>Portal Member</span>
                </Link>
                <Link
                  to="/join"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:flex-1 px-4 py-3 min-h-[44px] text-xs font-medium rounded-xl bg-[#111215] text-[#F4F1EB] hover:bg-[#252830] transition-all flex items-center justify-center shadow-2xs"
                >
                  Gabung NCD
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
