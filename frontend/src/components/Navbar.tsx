import { Link, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'

export function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F4F1EA]/95 border-b border-[#101216]/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-[#6C4DF6] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              NCD
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base tracking-tight text-[#101216] leading-none">NEXA Community</span>
              <span className="text-[10px] text-[#585E6C] font-medium tracking-wider uppercase mt-0.5">Development</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-[#6C4DF6] font-semibold' : 'text-[#585E6C] hover:text-[#101216]'}`}
            >
              Beranda
            </Link>
            <Link
              to="/about"
              className={`transition-colors ${isActive('/about') ? 'text-[#6C4DF6] font-semibold' : 'text-[#585E6C] hover:text-[#101216]'}`}
            >
              Tentang
            </Link>
            <Link
              to="/team"
              className={`transition-colors ${isActive('/team') ? 'text-[#6C4DF6] font-semibold' : 'text-[#585E6C] hover:text-[#101216]'}`}
            >
              Struktur & Tim
            </Link>
            <Link
              to="/projects"
              className={`transition-colors ${isActive('/projects') ? 'text-[#6C4DF6] font-semibold' : 'text-[#585E6C] hover:text-[#101216]'}`}
            >
              Proyek
            </Link>
            <Link
              to="/app/finance"
              className={`transition-colors ${isActive('/app/finance') ? 'text-[#6C4DF6] font-semibold' : 'text-[#585E6C] hover:text-[#101216]'}`}
            >
              Transparansi Kas
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[#101216] hover:bg-black/5 transition-colors flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Member</span>
            </Link>
            <Link
              to="/join"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#6C4DF6] text-white hover:bg-[#583BD9] transition-all shadow-sm"
            >
              Gabung NCD
            </Link>
          </div>
        </div>
      </header>
    </>
  )
}
