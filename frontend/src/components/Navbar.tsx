import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Lock, Menu, X } from 'lucide-react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Struktur & Tim', path: '/team' },
    { name: 'Proyek', path: '/projects' },
    { name: 'Transparansi Kas', path: '/app/finance' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#F4F1EB]/90 backdrop-blur-xl border-b border-[#111215]/8">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.svg"
            alt="NCD Logo"
            className="h-6 w-auto object-contain"
          />
          <div className="hidden sm:flex flex-col text-left pl-1 border-l border-[#111215]/10">
            <span className="font-semibold text-xs tracking-tight text-[#111215] leading-none">NEXA Community</span>
            <span className="text-[9px] text-[#7E8492] font-medium tracking-wider uppercase mt-0.5">Development</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-7 text-[13px]">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors ${isActive(item.path) ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/login"
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#111215] hover:bg-[#111215]/5 transition-colors flex items-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#7E8492]" />
            <span>Portal Member</span>
          </Link>
          <Link
            to="/join"
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-[#111215] text-[#F4F1EB] hover:bg-[#252830] transition-all shadow-2xs"
          >
            Gabung NCD
          </Link>
        </div>

        {/* Mobile Hamburger Button (Only element on mobile right side) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          className="md:hidden p-2 rounded-xl text-[#111215] hover:bg-[#111215]/5 transition-colors focus:outline-none"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Hamburger Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#F4F1EB]/98 backdrop-blur-2xl border-b border-[#111215]/8 px-6 pt-3 pb-6 flex flex-col space-y-1.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left flex items-center justify-between ${
                isActive(item.path)
                  ? 'bg-[#111215] text-[#F4F1EB]'
                  : 'text-[#111215] hover:bg-[#111215]/5'
              }`}
            >
              <span>{item.name}</span>
              {isActive(item.path) && <span className="w-1.5 h-1.5 rounded-full bg-[#6456EB]"></span>}
            </Link>
          ))}

          <div className="pt-3 mt-2 border-t border-[#111215]/8 flex flex-col gap-2">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl text-[#111215] bg-white border border-[#111215]/10 hover:bg-[#111215]/5 transition-colors flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5 text-[#7E8492]" />
              <span>Portal Member</span>
            </Link>
            <Link
              to="/join"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2.5 text-xs font-medium rounded-xl bg-[#111215] text-[#F4F1EB] hover:bg-[#252830] transition-all text-center shadow-2xs"
            >
              Gabung NCD
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
