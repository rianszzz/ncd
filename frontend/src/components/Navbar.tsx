import { Link, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'

export function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-[#F4F1EB]/90 backdrop-blur-xl border-b border-[#111215]/8">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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

        <nav className="hidden md:flex items-center space-x-7 text-[13px]">
          <Link
            to="/"
            className={`transition-colors ${isActive('/') ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
          >
            Beranda
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${isActive('/about') ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
          >
            Tentang
          </Link>
          <Link
            to="/team"
            className={`transition-colors ${isActive('/team') ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
          >
            Struktur & Tim
          </Link>
          <Link
            to="/projects"
            className={`transition-colors ${isActive('/projects') ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
          >
            Proyek
          </Link>
          <Link
            to="/app/finance"
            className={`transition-colors ${isActive('/app/finance') ? 'text-[#111215] font-semibold' : 'text-[#525660] hover:text-[#111215]'}`}
          >
            Transparansi Kas
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
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
      </div>
    </header>
  )
}
