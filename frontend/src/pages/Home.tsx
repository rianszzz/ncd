import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, Project } from '../services/api'
import {
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Flame,
  Lock,
  Layers,
  Sparkles,
  ArrowDown
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
    <div className="flex flex-col bg-[#F6F5F2] dark:bg-[#07080A] text-[#101216] dark:text-[#F4F1EA] transition-colors duration-300">
      {/* =========================================================================
          HERO SECTION (Apple Typographic Tension & Deep Ambient Glow)
         ========================================================================= */}
      <section className="relative hero-ambient-light dark:hero-ambient-glow pt-16 pb-24 px-6 border-b border-[#101216]/8 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-start text-left">
          
          {/* Top Heritage Badge */}
          <div className="w-full flex items-center justify-between border-b border-[#101216]/8 dark:border-white/10 pb-4 mb-12 text-xs font-semibold uppercase tracking-wider text-[#585E6C] dark:text-[#949BA8]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#6C4DF6] dark:bg-[#8267FF] animate-pulse"></span>
              <span className="text-[#101216] dark:text-white font-bold">NCD CREATIVE LAB</span>
              <span>/</span>
              <span>35 TALENTS</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="hidden sm:inline">NEXA TECH LABS INCUBATION</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#6C4DF6] dark:text-[#8267FF]" />
            </div>
          </div>

          {/* Dual Typographic Headline */}
          <div className="relative w-full">
            <h1 className="text-5xl sm:text-7xl lg:text-[104px] font-black tracking-tight leading-[0.88] uppercase text-[#101216] dark:text-white">
              WE ARE<br />
              FULL-STACK<br />
              <span className="font-display-serif lowercase tracking-normal text-[#6C4DF6] dark:text-[#8267FF] italic font-normal">
                community.
              </span>
            </h1>

            {/* Lockup beside headline */}
            <div className="mt-8 lg:mt-0 lg:absolute lg:right-0 lg:bottom-4 max-w-sm">
              <p className="text-xs sm:text-sm text-[#585E6C] dark:text-[#949BA8] leading-relaxed">
                Inkubasi rekayasa perangkat lunak mandiri di bawah naungan NEXA Tech Labs. 35 talenta teknologi membangun karya berstandar industri, transparansi kas terbuka (<em>Maker-Checker</em>), dan pencapaian kejuaraan.
              </p>

              <div className="mt-5 flex items-center space-x-3">
                <Link
                  to="/join"
                  className="px-5 py-2.5 rounded-full bg-[#101216] dark:bg-white text-white dark:text-[#101216] font-semibold text-xs tracking-wider hover:bg-[#6C4DF6] dark:hover:bg-[#8267FF] dark:hover:text-white transition-all flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Gabung NCD</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/projects"
                  className="px-5 py-2.5 rounded-full border border-[#101216]/15 dark:border-white/15 text-[#101216] dark:text-white font-semibold text-xs tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Lihat Karya
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Metric Strip */}
          <div className="mt-16 pt-8 w-full flex items-center justify-between border-t border-[#101216]/6 dark:border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full border border-[#101216]/15 dark:border-white/20 flex items-center justify-center text-[#6C4DF6] dark:text-[#8267FF]">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#585E6C] dark:text-[#949BA8]">
                Scroll untuk jelajahi ekosistem
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-xs text-[#585E6C] dark:text-[#949BA8]">
              <div><strong className="text-[#101216] dark:text-white font-tabular">{stats?.total_members || 35}</strong> Talenta Aktif</div>
              <div>•</div>
              <div><strong className="text-[#101216] dark:text-white font-tabular">100%</strong> Kas Terbuka</div>
              <div>•</div>
              <div><strong className="text-[#101216] dark:text-white font-tabular">8 Pengurus</strong> Terpilih</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES SECTION (Apple Continuous Curvature Bento Grid)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Section Title */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-[#6C4DF6] dark:text-[#8267FF] uppercase tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DF6] dark:bg-[#8267FF]"></span>
                <span>CORE ADVANTAGES</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-[#101216] dark:text-white leading-[0.95]">
                FEATURES
              </h2>
            </div>

            <div className="mt-12 lg:mt-0 pt-6 border-t border-[#101216]/8 dark:border-white/10 text-left">
              <div className="text-sm font-bold text-[#101216] dark:text-white">
                Platform Terpadu
              </div>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1.5 leading-relaxed">
                Satu pintu untuk seluruh operasional, keuangan, dan portofolio teknologi komunitas mahasiswa berintegritas tinggi.
              </p>
              <div className="mt-4">
                <ArrowUpRight className="w-5 h-5 text-[#6C4DF6] dark:text-[#8267FF]" />
              </div>
            </div>
          </div>

          {/* Right Column: 3x2 Squircle Bento Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {/* Bento Card 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  Transparansi Kas 100%
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Prinsip Maker-Checker (Bendahara I input, Bendahara II verifikasi) dengan foto nota sah dan riwayat anti-delete.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  Go + React Architecture
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Arsitektur decoupled monorepo biner Go berkecepatan tinggi dengan frontend React modern dan Supabase PostgreSQL.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  Launch Fast &amp; Reliable
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Setiap karya teknologi melalui review kode ketat sebelum diterbitkan ke etalase publik resmi NCD.
                </p>
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  Privasi Terjamin (UU PDP)
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Nomor telepon dan status iuran personal anggota terisolasi aman dari publik, mematuhi regulasi perlindungan data.
                </p>
              </div>
            </div>

            {/* Bento Card 5 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  Kolaborasi 35 Anggota
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Penyelarasan pembagian tugas proyek berbasis Kanban board dan pemantauan deadline lomba terpadu.
                </p>
              </div>
            </div>

            {/* Bento Card 6 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-[#101216] dark:text-white leading-snug">
                  NEXA Tech Ecosystem
                </h3>
                <p className="text-[11px] text-[#585E6C] dark:text-[#949BA8] mt-2 leading-relaxed">
                  Bimbingan teknis dan dukungan riset berkelanjutan dari NEXA Tech Labs untuk melahirkan talenta siap industri.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          OUR WORKS SECTION (High-Contrast Apple Showcase)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full text-center">
        <div className="mb-12">
          <h2 className="text-4xl sm:text-6xl font-normal font-display-serif italic text-[#101216] dark:text-white tracking-wide">
            Our Works
          </h2>
          <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-2 uppercase tracking-widest font-semibold">
            Katalog Proyek &amp; Inkubasi Pilihan
          </p>
        </div>

        {/* 1. Flagship Artwork Squircle Card */}
        {projects && projects.length > 0 && (
          <div className="relative w-full rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] border border-[#101216]/10 dark:border-white/10 shadow-xl mb-6 bg-black">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=85"
              alt="Flagship Artwork"
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-left text-white">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-[#6C4DF6] uppercase tracking-wider mb-2">
                  Flagship Platform
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                  {projects[0].title}
                </h3>
                <p className="text-xs text-white/80 max-w-lg mt-1 hidden sm:block">
                  {projects[0].summary}
                </p>
              </div>

              <Link
                to="/projects"
                className="p-3.5 rounded-full bg-white text-[#101216] hover:bg-[#8267FF] hover:text-white transition-all shadow-md shrink-0"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}

        {/* 2. 2-Column Bento Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {projects?.slice(1, 3).map((p, idx) => (
            <div
              key={p.id}
              className="relative rounded-3xl overflow-hidden aspect-[16/10] border border-[#101216]/10 dark:border-white/10 shadow-lg bg-black"
            >
              <img
                src={
                  idx === 0
                    ? 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=85'
                    : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=85'
                }
                alt={p.title}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <div className="text-[10px] font-bold text-[#8267FF] uppercase tracking-wider mb-1">
                    {p.status} • PROGRES {p.progress}%
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold uppercase tracking-tight">
                    {p.title}
                  </h4>
                  <div className="flex gap-1.5 mt-2">
                    {p.tech_stack.map((t) => (
                      <span key={t} className="text-[9px] font-mono font-bold text-white/70">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to="/projects"
                  className="p-3 rounded-full bg-white/15 backdrop-blur-md text-white hover:bg-white hover:text-[#101216] transition-all shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          PARTNERS & ECOSYSTEM STRIP
         ========================================================================= */}
      <section className="border-y border-[#101216]/8 dark:border-white/10 py-10 px-6 bg-white/60 dark:bg-[#0A0C10] text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-14 text-xs font-bold uppercase tracking-widest text-[#585E6C] dark:text-[#949BA8]">
          <span>GOLANG 1.23</span>
          <span>•</span>
          <span>REACT 19</span>
          <span>•</span>
          <span>POSTGRESQL 16</span>
          <span>•</span>
          <span>SUPABASE</span>
          <span>•</span>
          <span className="text-[#6C4DF6] dark:text-[#8267FF]">NEXA TECH LABS</span>
          <span>•</span>
          <span>GUNADARMA</span>
        </div>
      </section>

      {/* =========================================================================
          CLOSING CALL TO ACTION
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="rounded-3xl bg-[#101216] dark:bg-[#12141C] text-white p-10 md:p-16 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none">
              READY TO BUILD<br />
              <span className="font-display-serif lowercase italic text-[#8267FF]">
                extraordinary?
              </span>
            </h2>
            <p className="mt-4 text-xs text-[#949BA8] leading-relaxed">
              Bergabung bersama 35 talenta NCD dalam pengembangan proyek mandiri dan transparansi tata kelola kas terbuka di bawah naungan NEXA Tech Labs.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              to="/join"
              className="px-6 py-3.5 rounded-full bg-[#6C4DF6] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#583BD9] transition-all flex items-center space-x-1.5 shadow-lg"
            >
              <span>Daftar Seleksi</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
