import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api, Project } from '../services/api'
import { ShieldCheck, Users, FolderGit2, Trophy, ArrowRight, ExternalLink } from 'lucide-react'

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
    <div className="flex flex-col">
      {/* =========================================================================
          HERO SECTION (Apple Optical Tracking & Tactile Direct Response)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-6 border border-[#6C4DF6]/20 apple-caption">
          <span className="w-2 h-2 rounded-full bg-[#6C4DF6] dark:bg-[#8267FF] animate-pulse"></span>
          <span>NEXA Community Development • V1 Release</span>
        </div>

        {/* Display Headline with Apple Optical Sizing */}
        <h1 className="text-4xl md:text-6xl font-extrabold apple-display text-[#101216] dark:text-white max-w-4xl">
          Membangun Karya Nyata, Transparan &amp; Berstandar Tinggi.
        </h1>

        {/* Subhead with comfortable Apple line leading */}
        <p className="mt-6 text-base md:text-lg text-[#585E6C] dark:text-[#949BA8] max-w-xl apple-body leading-relaxed">
          Inkubasi 35 talenta rekayasa perangkat lunak mandiri. Menghadirkan tata kelola kas terbuka Maker-Checker dan portofolio berstandar industri.
        </p>

        {/* Tactile Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/projects"
            className="px-6 py-3 rounded-full bg-[#6C4DF6] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#583BD9] transition-all flex items-center space-x-2 shadow-xs"
          >
            <span>Eksplorasi Proyek</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/team"
            className="px-6 py-3 rounded-full bg-white dark:bg-[#101216] border border-[#101216]/10 dark:border-white/10 text-[#101216] dark:text-white font-semibold text-xs uppercase tracking-wider hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Kenali Struktur Tim
          </Link>
        </div>

        {/* Live Aggregate Stats Strip (Apple Squircle Translucent Surface) */}
        <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl apple-surface text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#101216] dark:text-white font-tabular apple-title">
              {stats?.total_members || '35'}
            </div>
            <div className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1 font-medium flex items-center justify-center space-x-1">
              <Users className="w-3.5 h-3.5 mr-1 text-[#6C4DF6] dark:text-[#8267FF]" />
              <span>Talenta Aktif</span>
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-[#101216] dark:text-white font-tabular apple-title">
              {stats?.total_projects || '3'}
            </div>
            <div className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1 font-medium flex items-center justify-center space-x-1">
              <FolderGit2 className="w-3.5 h-3.5 mr-1 text-[#6C4DF6] dark:text-[#8267FF]" />
              <span>Karya Rekayasa</span>
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-tabular apple-title">
              100%
            </div>
            <div className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1 font-medium flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              <span>Kas Transparan</span>
            </div>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-amber-500 font-tabular apple-title">
              8
            </div>
            <div className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1 font-medium flex items-center justify-center space-x-1">
              <Trophy className="w-3.5 h-3.5 mr-1 text-amber-500" />
              <span>Pilar Kepengurusan</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE PILLARS (Apple Continuous Curvature Bento Grid)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold apple-title text-[#101216] dark:text-white">
            Pilar Integritas &amp; Keunggulan NCD
          </h2>
          <p className="text-sm text-[#585E6C] dark:text-[#949BA8] mt-2 apple-body">
            Fondasi tata kelola dan budaya rekayasa yang kami junjung tinggi bersama
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-8 rounded-3xl apple-surface flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] dark:text-white mb-2">
                Tata Kelola Kas Maker-Checker
              </h3>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed apple-body">
                Setiap mutasi kas dicatat oleh Bendahara I (Maker), diverifikasi dengan bukti nota oleh Bendahara II (Checker), dan dapat diaudit oleh seluruh anggota secara terbuka.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101216]/6 dark:border-white/10">
              <Link
                to="/app/finance"
                className="text-xs font-semibold text-[#6C4DF6] dark:text-[#8267FF] hover:underline flex items-center space-x-1"
              >
                <span>Lihat Buku Kas Terbuka</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl apple-surface flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-6">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] dark:text-white mb-2">
                Rekayasa Perangkat Lunak Mandiri
              </h3>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed apple-body">
                Membangun platform teknologi nyata berstandar produksi industri mulai dari arsitektur Go backend hingga antarmuka React modern dan PostgreSQL Supabase.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101216]/6 dark:border-white/10">
              <Link
                to="/projects"
                className="text-xs font-semibold text-[#6C4DF6] dark:text-[#8267FF] hover:underline flex items-center space-x-1"
              >
                <span>Jelajahi Repositori Karya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl apple-surface flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 dark:bg-[#8267FF]/10 text-[#6C4DF6] dark:text-[#8267FF] flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] dark:text-white mb-2">
                Perlindungan Privasi UU PDP
              </h3>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed apple-body">
                Menerapkan prinsip perlindungan data pribadi mahasiswa (UU No. 27/2022). Nomor telepon dan status iuran personal anggota terlindungi ketat tanpa kompromi.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#101216]/6 dark:border-white/10">
              <Link
                to="/team"
                className="text-xs font-semibold text-[#6C4DF6] dark:text-[#8267FF] hover:underline flex items-center space-x-1"
              >
                <span>Lihat Direktori Anggota</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SELECTED WORKS PREVIEW (Apple Card Presentation)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full text-left">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold apple-title text-[#101216] dark:text-white">
              Karya Rekayasa Unggulan
            </h2>
            <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1 apple-body">
              Proyek teknologi riset dan inkubasi mandiri talenta NCD
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#6C4DF6] dark:text-[#8267FF] hover:underline flex items-center space-x-1"
          >
            <span>Semua Proyek</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects?.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="rounded-3xl apple-surface overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full overflow-hidden bg-black/5 relative">
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#101216]/80 backdrop-blur-md text-white uppercase tracking-wider">
                    {p.status}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {p.tech_stack.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#101216]/5 dark:bg-white/5 text-[#101216] dark:text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-base text-[#101216] dark:text-white mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed line-clamp-2">
                    {p.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-[#101216]/6 dark:border-white/10 flex items-center justify-between text-xs text-[#585E6C] dark:text-[#949BA8]">
                  <span>Progres: <strong className="text-[#101216] dark:text-white font-tabular">{p.progress}%</strong></span>
                  <Link
                    to="/projects"
                    className="text-[#6C4DF6] dark:text-[#8267FF] font-semibold hover:underline flex items-center space-x-1"
                  >
                    <span>Detail</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CLOSING CALL TO ACTION (Apple Squircle Container)
         ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="rounded-3xl bg-[#101216] text-[#F4F1EA] p-8 md:p-14 text-center flex flex-col items-center border border-white/10 shadow-lg">
          <h2 className="text-2xl md:text-4xl font-extrabold apple-display tracking-tight text-white max-w-xl">
            Siap Berkolaborasi &amp; Menciptakan Dampak Bersama?
          </h2>
          <p className="text-xs md:text-sm text-[#949BA8] max-w-lg mt-3 leading-relaxed apple-body">
            Pintu terbuka bagi talenta mahasiswa yang memiliki integritas, semangat belajar teknologi berstandar industri, dan siap berkarya.
          </p>
          <div className="mt-8 flex items-center space-x-3">
            <Link
              to="/join"
              className="px-6 py-3 rounded-full bg-[#6C4DF6] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#583BD9] transition-all shadow-md"
            >
              Daftar Seleksi Anggota
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
            >
              Tentang Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
