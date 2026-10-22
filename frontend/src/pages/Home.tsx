import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, Project } from '../services/api'
import {
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react'

export function Home() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/public/stats')
      return res.data
    },
  })

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<Project[]>('/public/projects')
      return res.data
    },
  })

  return (
    <div className="flex flex-col bg-[#F4F1EA] text-[#101216] overflow-hidden">
      {/* =========================================================================
          HERO SECTION (Swiss / Apple Asymmetric Editorial)
          Inspired by the bold, graphic poster aesthetic of the reference.
         ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-6 pt-12 pb-20 w-full">
        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-between border-b border-[#101216]/10 pb-4 mb-8 text-xs font-bold uppercase tracking-wider text-[#585E6C]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#6C4DF6]"></span>
            <span className="text-[#101216]">NEXA Community Development</span>
            <span>/</span>
            <span>Tech Talent Hub</span>
          </div>
          <div className="hidden md:block">
            BASED IN UNIVERSITAS GUNADARMA • INDONESIA
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Giant Grotesque Headline & Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="text-5xl sm:text-7xl xl:text-[88px] font-black tracking-tighter leading-[0.92] text-[#101216] uppercase">
              SOFTWARE<br />
              <span className="relative inline-block">
                EXCELLENCE.
                {/* Graphic Accent Slash */}
                <span className="absolute -bottom-2 left-0 w-2/3 h-1.5 bg-[#6C4DF6]"></span>
              </span>
            </h1>

            <p className="mt-8 text-base md:text-lg text-[#585E6C] max-w-xl font-normal leading-relaxed">
              Komunitas rekayasa perangkat lunak berstandar industri di bawah naungan NEXA Tech Labs. 35 talenta mahasiswa membangun ekosistem teknologi mandiri, portofolio nyata, dan transparansi tata kelola kas terbuka.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/projects"
                className="px-6 py-3.5 rounded-xl bg-[#101216] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#6C4DF6] transition-all flex items-center space-x-2 shadow-sm group"
              >
                <span>Lihat Portofolio</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>

              <Link
                to="/app/finance"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#101216]/15 text-[#101216] font-bold text-xs uppercase tracking-wider hover:bg-black/5 transition-all flex items-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#6C4DF6]" />
                <span>Buku Kas Terbuka</span>
              </Link>
            </div>

            {/* Mini Signature Roster */}
            <div className="mt-12 pt-6 border-t border-[#101216]/10 w-full flex items-center space-x-8 text-xs text-[#585E6C]">
              <div>
                <span className="block font-bold text-[#101216] uppercase text-[11px]">Rianszzz</span>
                <span className="text-[10px]">Developer Lead & Architect</span>
              </div>
              <div className="h-6 w-px bg-[#101216]/10"></div>
              <div>
                <span className="block font-bold text-[#101216] uppercase text-[11px]">Mirza Danisywar</span>
                <span className="text-[10px]">Chairman of NCD</span>
              </div>
            </div>
          </div>

          {/* Right Column: Layered Graphic Composition (Subject + Solid Accent Block) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-[#101216]">
              {/* Vibrant Accent Color Block Layer */}
              <div className="absolute top-8 right-0 w-3/4 h-3/4 bg-[#6C4DF6] rounded-2xl transform rotate-3 -z-0 opacity-90"></div>

              {/* Developer Subject Image */}
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85"
                alt="NCD Engineer"
                className="relative z-10 w-full h-full object-cover filter contrast-105"
              />

              {/* In-Image Tag */}
              <div className="absolute bottom-4 left-4 right-4 z-20 p-4 rounded-2xl bg-[#101216]/85 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-[#8267FF] uppercase tracking-wider">Inkubasi Mandiri</div>
                  <div className="text-xs font-bold mt-0.5">NEXA Tech Labs</div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#107C41] animate-ping"></div>
              </div>
            </div>

            {/* Vertical Badge on Edge */}
            <div className="hidden xl:flex absolute -right-10 top-1/2 -translate-y-1/2 rotate-90 origin-center items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#585E6C]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
              <span>ENGINEERED IN GUNADARMA</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY NUMBERS / METRICS SECTION (Inspired by "12+ YEARS" in reference)
         ========================================================================= */}
      <section className="border-y border-[#101216]/10 bg-white py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-[#101216]/10">
            <div className="pt-4 lg:pt-0 lg:px-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C4DF6] uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
                <span>Talenta Mahasiswa</span>
              </div>
              <div className="text-5xl lg:text-6xl font-black text-[#101216] font-tabular">
                {stats?.total_members || '35'}+
              </div>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Anggota terkurasi aktif lintas divisi Web, Mobile, AI, dan Infrastruktur.
              </p>
            </div>

            <div className="pt-4 lg:pt-0 lg:px-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C4DF6] uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
                <span>Tata Kelola Kas</span>
              </div>
              <div className="text-5xl lg:text-6xl font-black text-[#101216] font-tabular">
                100%
              </div>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Transparansi penuh sistem Maker-Checker (Bendahara I & II) dengan audit trail.
              </p>
            </div>

            <div className="pt-4 lg:pt-0 lg:px-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C4DF6] uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
                <span>Proyek Inkubasi</span>
              </div>
              <div className="text-5xl lg:text-6xl font-black text-[#101216] font-tabular">
                {stats?.active_projects || '5'}+
              </div>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Aplikasi produksi yang dibangun dengan standar rekayasa perangkat lunak modern.
              </p>
            </div>

            <div className="pt-4 lg:pt-0 lg:px-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C4DF6] uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
                <span>Pencapaian Juara</span>
              </div>
              <div className="text-5xl lg:text-6xl font-black text-[#101216] font-tabular">
                {stats?.competitions_won || '8'}+
              </div>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Prestasi kompetisi teknologi pada tingkat kampus, nasional, dan regional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PILLARS / CAPABILITIES SECTION (Inspired by "SERVICES" in reference)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex items-center justify-between border-b border-[#101216]/10 pb-4 mb-12">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#101216]">
            <span className="w-2 h-2 rounded-full bg-[#6C4DF6]"></span>
            <span>Pilar & Kapabilitas Organisasi</span>
          </div>
          <span className="text-xs text-[#585E6C] font-mono">01 — CORE CAPABILITIES</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs flex flex-col text-left group hover:border-[#6C4DF6] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#101216] mb-4 font-mono font-bold text-xs group-hover:bg-[#6C4DF6] group-hover:text-white transition-colors">
              [ ]
            </div>
            <h3 className="font-bold text-sm text-[#101216] uppercase tracking-wide mb-2">
              Fullstack Engineering
            </h3>
            <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
              Pengembangan web dan sistem terdistribusi dengan Go, React, PostgreSQL, dan arsitektur microservices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs flex flex-col text-left group hover:border-[#6C4DF6] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#101216] mb-4 font-mono font-bold text-xs group-hover:bg-[#6C4DF6] group-hover:text-white transition-colors">
              *
            </div>
            <h3 className="font-bold text-sm text-[#101216] uppercase tracking-wide mb-2">
              Maker-Checker Kas
            </h3>
            <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
              Transparansi anggaran tanpa cela: Bendahara I mencatat, Bendahara II mengesahkan, dan seluruh anggota mengaudit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs flex flex-col text-left group hover:border-[#6C4DF6] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#101216] mb-4 font-mono font-bold text-xs group-hover:bg-[#6C4DF6] group-hover:text-white transition-colors">
              ⌘
            </div>
            <h3 className="font-bold text-sm text-[#101216] uppercase tracking-wide mb-2">
              Product & Design
            </h3>
            <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
              Desain antarmuka berstandar Apple HIG: tipografi disiplin, rasio kontras tinggi, dan tanpa template murahan.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs flex flex-col text-left group hover:border-[#6C4DF6] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#101216] mb-4 font-mono font-bold text-xs group-hover:bg-[#6C4DF6] group-hover:text-white transition-colors">
              ↗
            </div>
            <h3 className="font-bold text-sm text-[#101216] uppercase tracking-wide mb-2">
              Competitive Coding
            </h3>
            <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
              Pelatihan pemecahan algoritma intensif dan pengiriman delegasi untuk hackathon dan kejuaraan nasional.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs flex flex-col text-left group hover:border-[#6C4DF6] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-[#101216] mb-4 font-mono font-bold text-xs group-hover:bg-[#6C4DF6] group-hover:text-white transition-colors">
              //
            </div>
            <h3 className="font-bold text-sm text-[#101216] uppercase tracking-wide mb-2">
              Cloud & Security
            </h3>
            <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
              Penerapan proteksi data pribadi (UU PDP), tokenisasi JWT aman, dan hosting performa tinggi dengan Cloudflare CDN.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED WORK SECTION (Inspired by "FEATURED WORK" in reference)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex items-center justify-between border-b border-[#101216]/10 pb-4 mb-12">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#101216]">
            <span className="w-2 h-2 rounded-full bg-[#6C4DF6]"></span>
            <span>Portofolio & Inkubasi Pilihan</span>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-[#6C4DF6] hover:text-[#101216] uppercase tracking-wider flex items-center space-x-1"
          >
            <span>Semua Proyek</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects?.map((p, idx) => (
            <div
              key={p.id}
              className="group flex flex-col text-left"
            >
              {/* Image Frame with Minimalist Hover */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/5 border border-[#101216]/10 mb-4">
                <img
                  src={p.thumbnail_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#101216]/80 text-white backdrop-blur-md">
                  {p.status}
                </div>
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white/90 text-[#101216] font-mono text-[10px] font-bold flex items-center justify-center">
                  0{idx + 1}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="flex items-baseline justify-between mb-1">
                <h3 className="font-extrabold text-lg text-[#101216] tracking-tight group-hover:text-[#6C4DF6] transition-colors">
                  {p.title}
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5 my-2">
                {p.tech_stack.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold font-mono text-[#585E6C] uppercase tracking-wider"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <p className="text-xs text-[#585E6C] line-clamp-2 leading-relaxed mt-1">
                {p.summary}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          ECOSYSTEM & TECH LOGO WALL (Inspired by "TRUSTED BY" in reference)
         ========================================================================= */}
      <section className="border-y border-[#101216]/10 bg-white py-14">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-[11px] font-bold text-[#585E6C] uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6]"></span>
            <span>Teknologi & Ekosistem Pendukung</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all text-xs font-black tracking-widest text-[#101216]">
            <span className="hover:text-[#6C4DF6] transition-colors">GO / GOLANG</span>
            <span className="hover:text-[#6C4DF6] transition-colors">REACT 19</span>
            <span className="hover:text-[#6C4DF6] transition-colors">POSTGRESQL</span>
            <span className="hover:text-[#6C4DF6] transition-colors">SUPABASE</span>
            <span className="hover:text-[#6C4DF6] transition-colors">TAILWIND CSS</span>
            <span className="hover:text-[#6C4DF6] transition-colors">NEXA TECH LABS</span>
            <span className="hover:text-[#6C4DF6] transition-colors">GUNADARMA</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EXTRAORDINARY CLOSING CALL TO ACTION
          Matching the massive typographic punchline of the reference.
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="rounded-3xl bg-[#101216] text-[#F4F1EA] p-10 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl text-left">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]">
              LET'S BUILD SOMETHING<br />
              <span className="text-[#8267FF]">EXTRAORDINARY.</span>
            </h2>
            <p className="mt-6 text-sm text-[#949BA8] leading-relaxed max-w-lg">
              Pendaftaran anggota dibuka untuk mahasiswa yang ingin memperdalam rekayasa perangkat lunak, kolaborasi proyek nyata, dan integritas organisasi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              to="/join"
              className="px-8 py-4 rounded-xl bg-[#6C4DF6] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#583BD9] transition-all flex items-center space-x-2 shadow-lg"
            >
              <span>Kirim Formulir Seleksi</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="px-6 py-4 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/15 transition-all"
            >
              Pelajari Alur
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
