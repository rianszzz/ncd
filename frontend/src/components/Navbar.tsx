import { Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Lock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function Navbar() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Top Heritage Strip */}
      <div className="bg-[#101216] text-[#F4F1EA] py-1.5 px-6 text-[11px] font-medium tracking-wider flex items-center justify-between border-b border-white/10 uppercase">
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

      {/* Main Apple/Swiss Minimalist Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#F4F1EA]/85 dark:bg-[#07080A]/85 border-b border-[#101216]/10 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="font-extrabold text-xl tracking-tighter text-[#101216] dark:text-white">
              NCD
            </span>
            <span className="w-2 h-2 rounded-full bg-[#6C4DF6] group-hover:scale-125 transition-transform"></span>
            <span className="hidden sm:inline-block text-xs font-bold tracking-widest text-[#585E6C] dark:text-[#949BA8] uppercase ml-2 border-l border-[#101216]/10 dark:border-white/10 pl-3">
              Community Dev
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-[#6C4DF6] dark:text-[#8267FF]' : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'}`}
            >
              Beranda
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${isActive('/about') ? 'text-[#6C4DF6] dark:text-[#8267FF]' : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'}`}
            >
              Tentang
            </Link>
            <Link
              to="/team"
              className={`transition-colors ${isActive('/team') ? 'text-[#6C4DF6] dark:text-[#8267FF]' : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'}`}
            >
              Struktur & Tim
            </Link>
            <Link
              to="/projects"
              className={`transition-colors ${isActive('/projects') ? 'text-[#6C4DF6] dark:text-[#8267FF]' : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'}`}
            >
              Proyek
            </Link>
            <Link
              to="/app/finance"
              className={`transition-colors ${isActive('/app/finance') ? 'text-[#6C4DF6] dark:text-[#8267FF]' : 'text-[#585E6C] dark:text-[#949BA8] hover:text-[#101216] dark:hover:text-white'}`}
            >
              Transparansi Kas
            </Link>
          </nav>

          {/* Action CTAs & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#585E6C] dark:text-[#949BA8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap Pro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg text-[#101216] dark:text-[#F4F1EA] hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center space-x-1"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              <span>Portal</span>
            </Link>

            <Link
              to="/join"
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#101216] dark:bg-white text-white dark:text-[#101216] hover:bg-[#6C4DF6] dark:hover:bg-[#8267FF] dark:hover:text-white transition-all flex items-center space-x-1 shadow-sm"
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
