import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-[#101216]/8 dark:border-white/10 py-14 px-6 bg-[#F6F5F2] dark:bg-[#07080A] text-[#585E6C] dark:text-[#949BA8] text-xs transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
        {/* Col 1: Identity */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="font-extrabold text-base tracking-tight text-[#101216] dark:text-white">
              NCD
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6] dark:bg-[#8267FF]"></span>
            <span className="text-[11px] font-semibold text-[#585E6C] dark:text-[#949BA8] uppercase tracking-wider">
              Community Development
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#585E6C] dark:text-[#949BA8]">
            Komunitas teknologi mahasiswa di bawah naungan resmi NEXA Tech Labs. Berfokus pada inkubasi rekayasa perangkat lunak mandiri, integritas tata kelola kas terbuka, dan pencapaian kompetisi.
          </p>
        </div>

        {/* Col 2: Navigation */}
        <div>
          <h4 className="font-semibold text-xs text-[#101216] dark:text-white uppercase tracking-wider mb-3">
            Navigasi
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-[#101216] dark:hover:text-white transition-colors">Beranda</Link></li>
            <li><Link to="/about" className="hover:text-[#101216] dark:hover:text-white transition-colors">Tentang NCD & Visi</Link></li>
            <li><Link to="/team" className="hover:text-[#101216] dark:hover:text-white transition-colors">Struktur 8 Pengurus</Link></li>
            <li><Link to="/projects" className="hover:text-[#101216] dark:hover:text-white transition-colors">Katalog Portofolio</Link></li>
          </ul>
        </div>

        {/* Col 3: Governance */}
        <div>
          <h4 className="font-semibold text-xs text-[#101216] dark:text-white uppercase tracking-wider mb-3">
            Transparansi
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/app/finance" className="hover:text-[#101216] dark:hover:text-white transition-colors">Buku Kas Terbuka</Link></li>
            <li><span>Maker-Checker Verification</span></li>
            <li><span>Audit Trail Kekal (No Delete)</span></li>
            <li><span>Kepatuhan UU PDP (Privasi Terjamin)</span></li>
          </ul>
        </div>

        {/* Col 4: Naungan */}
        <div>
          <h4 className="font-semibold text-xs text-[#101216] dark:text-white uppercase tracking-wider mb-3">
            Naungan & Kontak
          </h4>
          <p className="text-xs leading-relaxed text-[#585E6C] dark:text-[#949BA8]">
            NEXA Tech Labs Ecosystem<br />
            Universitas Gunadarma, Indonesia<br />
            Kontak: <span className="text-[#6C4DF6] dark:text-[#8267FF]">ncd@nexatechlabs.my.id</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#101216]/6 dark:border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#585E6C] dark:text-[#949BA8]">
        <p>© 2026 NEXA Community Development. Seluruh hak cipta dilindungi.</p>
        <p className="mt-2 md:mt-0 font-medium text-[#101216] dark:text-white">
          Under the umbrella of NEXA Tech Labs
        </p>
      </div>
    </footer>
  )
}
