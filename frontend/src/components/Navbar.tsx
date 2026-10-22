import { Link, useLocation } from 'react-router-dom'
import { Lock, ArrowUpRight } from 'lucide-react'

export function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Struktur & Tim', path: '/team' },
    { name: 'Proyek', path: '/projects' },
    { name: 'Transparansi Kas', path: '/app/finance' },
  ]

  return (
    <header className="sticky top-0 z-50 apple-nav transition-colors">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-xl bg-[#6C4DF6] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform duration-200">
            NCD
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-base tracking-tight text-[#101216] dark:text-white leading-none">
              NEXA Community
            </span>
            <span className="text-[10px] text-[#585E6C] dark:text-[#949BA8] font-semibold tracking-wider uppercase mt-0.5">
              Development
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                isActive(link.path)
                  ? 'bg-[#101216]/6 dark:bg-white/10 text-[#6C4DF6] dark:text-[#8267FF] font-bold'
                  : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full text-[#101216] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 flex items-center space-x-1"
          >
            <Lock className="w-3.5 h-3.5 mr-1 text-[#585E6C] dark:text-[#949BA8]" />
            <span>Portal</span>
          </Link>

          <Link
            to="/join"
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-[#101216] dark:bg-white text-white dark:text-[#101216] hover:bg-[#6C4DF6] dark:hover:bg-[#8267FF] dark:hover:text-white transition-all duration-150 flex items-center space-x-1 shadow-xs"
          >
            <span>Gabung NCD</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
