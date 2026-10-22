import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Lock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/about' },
    { name: 'Struktur & Tim', path: '/team' },
    { name: 'Proyek', path: '/projects' },
    { name: 'Transparansi Kas', path: '/app/finance' },
  ]

  return (
    <>
      {/* Top Heritage Strip */}
      <div className="bg-[#101216] text-[#F4F1EA] py-1.5 px-6 text-[11px] font-medium tracking-wider flex items-center justify-between border-b border-white/10 uppercase select-none">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8267FF] animate-pulse"></span>
          <span>Under the umbrella of <strong className="text-white">NEXA Tech Labs</strong></span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-[10px] text-[#949BA8]">
          <span>35 ACTIVE MEMBERS</span>
          <span>•</span>
          <span>MAKER-CHECKER GOVERNANCE</span>
        </div>
      </div>

      {/* Main Apple Translucent Header (WWDC Rule #12) */}
      <header className="sticky top-0 z-50 apple-material-nav transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo with Brand Accent Dot */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <span className="font-extrabold text-xl tracking-tight text-[#101216] dark:text-white">
              NCD
            </span>
            <span className="w-2 h-2 rounded-full bg-[#6C4DF6] dark:bg-[#8267FF] group-hover:scale-125 transition-transform duration-200"></span>
            <span className="hidden sm:inline-block text-xs font-semibold tracking-wider text-[#585E6C] dark:text-[#949BA8] uppercase ml-2 border-l border-[#101216]/10 dark:border-white/10 pl-3">
              Community Development
            </span>
          </Link>

          {/* Navigation Links (Apple Minimalist Pills with Direct Mapping) */}
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

          {/* Actions & Theme Switcher */}
          <div className="flex items-center space-x-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[#585E6C] dark:text-[#949BA8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap Pro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Portal Login */}
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-full text-[#101216] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-150 flex items-center space-x-1"
            >
              <Lock className="w-3.5 h-3.5 mr-1 text-[#585E6C] dark:text-[#949BA8]" />
              <span>Portal</span>
            </Link>

            {/* Join CTA Button */}
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
    </>
  )
}
