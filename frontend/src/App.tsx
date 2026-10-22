import { Routes, Route, Link } from 'react-router-dom'
import { ShieldCheck, Users, FolderGit2, Trophy, ArrowRight, Lock } from 'lucide-react'

function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Banner: NEXA Tech Labs */}
      <div className="bg-[#101216] text-[#F4F1EA] py-1.5 px-4 text-xs font-medium text-center border-b border-white/10 tracking-wide">
        Di bawah naungan <span className="font-semibold text-[#8267FF]">NEXA Tech Labs</span> • Komunitas Teknologi Mahasiswa
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F4F1EA]/90 border-b border-[#101216]/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#6C4DF6] flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
              NCD
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#101216]">NEXA Community</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-[#585E6C]">
            <Link to="/" className="text-[#101216] transition-colors">Beranda</Link>
            <Link to="/about" className="hover:text-[#101216] transition-colors">Tentang</Link>
            <Link to="/team" className="hover:text-[#101216] transition-colors">Struktur & Tim</Link>
            <Link to="/projects" className="hover:text-[#101216] transition-colors">Proyek</Link>
            <Link to="/competitions" className="hover:text-[#101216] transition-colors">Kompetisi</Link>
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

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#6C4DF6] animate-pulse"></span>
          <span>NEXA Community Development • V1 Platform</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#101216] max-w-3xl leading-tight md:leading-[1.15]">
          Membangun Karya Nyata, Transparan & Berdampak.
        </h1>

        <p className="mt-6 text-base md:text-lg text-[#585E6C] max-w-2xl leading-relaxed">
          Wadah kolaborasi 35 talenta teknologi di bawah naungan NEXA Tech Labs. Menghadirkan transparansi tata kelola kas terbuka, inkubasi karya rekayasa perangkat lunak, dan prestasi kompetisi.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="px-6 py-3 rounded-xl bg-[#6C4DF6] text-white font-semibold text-sm hover:bg-[#583BD9] transition-all flex items-center space-x-2 shadow-sm"
          >
            <span>Eksplorasi Proyek</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 rounded-xl bg-white border border-[#101216]/10 text-[#101216] font-semibold text-sm hover:bg-black/5 transition-all"
          >
            Tentang Organisasi
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-20 w-full text-left">
          <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#101216]">35 Talenta Terpilih</h3>
            <p className="text-xs text-[#585E6C] mt-1.5 leading-relaxed">
              Direktori pengurus dan anggota dengan spesialisasi rekayasa perangkat lunak modern.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#101216]">Kas Terbuka & Diaudit</h3>
            <p className="text-xs text-[#585E6C] mt-1.5 leading-relaxed">
              Tata kelola Maker-Checker (Bendahara I & II) dengan bukti transfer digital dan audit trail abadi.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#101216]">Inkubasi Proyek</h3>
            <p className="text-xs text-[#585E6C] mt-1.5 leading-relaxed">
              Manajemen alur kerja karya tim dari ide, review arsitektur, hingga peluncuran publik.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[#101216]">Hall of Fame Prestasi</h3>
            <p className="text-xs text-[#585E6C] mt-1.5 leading-relaxed">
              Dokumentasi pencapaian juara kompetisi tingkat kampus, nasional, dan internasional.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#101216]/10 py-8 px-6 bg-white/50 text-center text-xs text-[#585E6C]">
        <p>© 2026 NEXA Community Development (NCD). Under the umbrella of NEXA Tech Labs.</p>
      </footer>
    </div>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold text-[#101216]">{title}</h1>
      <p className="text-sm text-[#585E6C] mt-2">Halaman ini sedang dalam tahap pengembangan sesuai roadmap sprint.</p>
      <Link to="/" className="mt-4 px-4 py-2 rounded-lg bg-[#6C4DF6] text-white text-xs font-semibold">
        Kembali ke Beranda
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<PlaceholderPage title="Tentang NCD & Visi" />} />
      <Route path="/team" element={<PlaceholderPage title="Struktur Organisasi & Direktori 35 Anggota" />} />
      <Route path="/projects" element={<PlaceholderPage title="Katalog Proyek Publik" />} />
      <Route path="/competitions" element={<PlaceholderPage title="Tracker & Hall of Fame Kompetisi" />} />
      <Route path="/login" element={<PlaceholderPage title="Portal Autentikasi Anggota" />} />
      <Route path="/join" element={<PlaceholderPage title="Formulir Rekrutmen Anggota NCD" />} />
    </Routes>
  )
}
