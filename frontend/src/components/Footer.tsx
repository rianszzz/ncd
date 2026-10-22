import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-[#101216]/10 py-12 px-6 bg-white/60 text-[#585E6C] text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#6C4DF6] flex items-center justify-center text-white font-bold text-xs">
              NCD
            </div>
            <span className="font-bold text-[#101216]">NEXA Community</span>
          </div>
          <p className="text-xs leading-relaxed text-[#585E6C]">
            Komunitas teknologi mahasiswa di bawah naungan resmi NEXA Tech Labs. Berfokus pada rekayasa perangkat lunak mandiri, integritas tata kelola, dan penciptaan dampak.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-xs tracking-wider text-[#101216] uppercase mb-3">Navigasi</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-[#101216] transition-colors">Beranda</Link></li>
            <li><Link to="/about" className="hover:text-[#101216] transition-colors">Tentang NCD & Visi</Link></li>
            <li><Link to="/team" className="hover:text-[#101216] transition-colors">Struktur 8 Pengurus</Link></li>
            <li><Link to="/projects" className="hover:text-[#101216] transition-colors">Katalog Portofolio</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs tracking-wider text-[#101216] uppercase mb-3">Transparansi</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/app/finance" className="hover:text-[#101216] transition-colors">Buku Kas Terbuka</Link></li>
            <li><span className="text-[#585E6C]">Maker-Checker Engine</span></li>
            <li><span className="text-[#585E6C]">Audit Trail & Immutability</span></li>
            <li><span className="text-[#585E6C]">Kepatuhan UU PDP</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-xs tracking-wider text-[#101216] uppercase mb-3">Naungan & Kontak</h4>
          <p className="text-xs text-[#585E6C] leading-relaxed">
            NEXA Tech Labs Ecosystem<br />
            Universitas Gunadarma, Indonesia<br />
            Email: <span className="text-[#6C4DF6]">ncd@nexatechlabs.my.id</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-[#101216]/5 flex flex-col md:flex-row items-center justify-between text-xs text-[#585E6C]">
        <p>© 2026 NEXA Community Development. Seluruh hak cipta dilindungi undang-undang.</p>
        <p className="mt-2 md:mt-0 font-medium">Under the umbrella of NEXA Tech Labs</p>
      </div>
    </footer>
  )
}
