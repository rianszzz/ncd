import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-[#111215]/8 py-10 md:py-14 px-6 bg-[#F4F1EB] text-[#525660] text-xs">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-10 text-left">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <img
              src="/logo.svg"
              alt="NCD Logo"
              width={20}
              height={20}
              loading="lazy"
              decoding="async"
              className="h-5 w-auto object-contain"
            />
          </div>
          <p className="text-xs leading-relaxed text-[#525660]">
            NEXA Community Development (NCD) adalah komunitas riset dan inkubasi rekayasa perangkat lunak mandiri mahasiswa di bawah naungan resmi NEXA Tech Labs.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-[11px] tracking-wider text-[#111215] uppercase mb-3">Navigasi</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-[#111215] transition-colors">Beranda</Link></li>
            <li><Link to="/about" className="hover:text-[#111215] transition-colors">Tentang NCD & Visi</Link></li>
            <li><Link to="/team" className="hover:text-[#111215] transition-colors">Struktur 8 Pengurus</Link></li>
            <li><Link to="/projects" className="hover:text-[#111215] transition-colors">Katalog Portofolio</Link></li>
            <li><Link to="/achievements" className="hover:text-[#111215] transition-colors">Prestasi & Kompetisi</Link></li>
            <li><Link to="/news" className="hover:text-[#111215] transition-colors">Berita & Pengumuman</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[11px] tracking-wider text-[#111215] uppercase mb-3">Transparansi & Hukum</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/terms" className="hover:text-[#111215] transition-colors">Syarat & Ketentuan (T&C)</Link></li>
            <li><Link to="/privacy" className="hover:text-[#111215] transition-colors">Kebijakan Privasi (UU PDP)</Link></li>
            <li><span className="text-[#525660]">Audit Trail & Immutability</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-[11px] tracking-wider text-[#111215] uppercase mb-3">Naungan & Kontak</h4>
          <p className="text-xs text-[#525660] leading-relaxed">
            NEXA Tech Labs Ecosystem<br />
            Universitas Gunadarma, Indonesia<br />
            Email: <span className="text-[#111215] font-medium">ncd@nexatechlabs.my.id</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-[#111215]/6 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#525660]">
        <p>© 2026 NEXA Community Development. Seluruh hak cipta dilindungi undang-undang.</p>
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <Link to="/terms" className="hover:text-[#111215] transition-colors">Terms</Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-[#111215] transition-colors">Privacy</Link>
          <span>•</span>
          <span>NEXA Tech Labs</span>
        </div>
      </div>
    </footer>
  )
}
