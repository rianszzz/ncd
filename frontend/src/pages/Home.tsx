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
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#101216] max-w-4xl leading-tight md:leading-[1.12]">
          Membangun Karya Nyata, Transparan & Berstandar Tinggi.
        </h1>

        <p className="mt-6 text-base md:text-lg text-[#585E6C] max-w-2xl leading-relaxed">
          Wadah inkubasi 35 talenta rekayasa perangkat lunak di bawah naungan NEXA Tech Labs. Menghadirkan tata kelola kas terbuka dengan sistem Maker-Checker dan portofolio teknologi berdaya guna.
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
            to="/team"
            className="px-6 py-3 rounded-xl bg-white border border-[#101216]/10 text-[#101216] font-semibold text-sm hover:bg-black/5 transition-all"
          >
            Kenali Struktur Tim
          </Link>
        </div>

        {/* Live Aggregate Stats Strip */}
        <div className="mt-16 w-full grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs text-center">
          <div>
            <div className="text-3xl font-extrabold text-[#101216] font-tabular">
              {stats?.total_members || '35'}
            </div>
            <div className="text-xs text-[#585E6C] mt-1 font-medium">Anggota Terpilih</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#6C4DF6] font-tabular">
              {stats?.core_leaders || '8'}
            </div>
            <div className="text-xs text-[#585E6C] mt-1 font-medium">Pengurus Inti</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#101216] font-tabular">
              {stats?.active_projects || '5'}
            </div>
            <div className="text-xs text-[#585E6C] mt-1 font-medium">Proyek Inkubasi</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-[#107C41] font-tabular">
              {stats?.competitions_won || '8'}
            </div>
            <div className="text-xs text-[#585E6C] mt-1 font-medium">Juara Kompetisi</div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-white/60 border-y border-[#101216]/5 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-[#101216] tracking-tight">
              Bukan Sekadar Komunitas Biasa
            </h2>
            <p className="text-sm text-[#585E6C] mt-3">
              Didirikan dengan integritas engineering, tata kelola finansial transparan, dan orientasi prestasi kompetitif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#101216]">Transparansi Kas 100%</h3>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Prinsip Maker-Checker (Bendahara I & II), bukti transfer wajib, dan catatan audit anti-delete untuk semua anggota.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#101216]">Direktori 35 Talenta</h3>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Penyelarasan keahlian lintas divisi: Web, Mobile, AI, Cloud, dan Algoritma Kompetitif dengan proteksi privasi UU PDP.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#101216]">Katalog Proyek Nyata</h3>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Karya perangkat lunak yang diuji dan dirilis dengan standar industri modern, bukan sekadar tugas kuliah template.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#101216]/8 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-4">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-[#101216]">Track Record Juara</h3>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed">
                Fasilitas delegasi lomba hackathon dan competitive programming untuk mengukir prestasi nasional dan global.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Highlight */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#101216] tracking-tight">Karya & Proyek Terkini</h2>
            <p className="text-xs text-[#585E6C] mt-1">Eksplorasi rekayasa perangkat lunak yang dikembangkan oleh anggota NCD</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#6C4DF6] hover:text-[#583BD9] flex items-center space-x-1"
          >
            <span>Lihat Semua ({projects?.length || 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects?.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl border border-[#101216]/10 overflow-hidden shadow-xs hover:border-[#6C4DF6]/40 transition-all flex flex-col"
            >
              <div className="h-44 w-full overflow-hidden bg-black/5 relative">
                <img
                  src={p.thumbnail_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#101216]/80 backdrop-blur-md text-white uppercase tracking-wider">
                  {p.status}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#101216]/5 text-[#101216]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3 className="font-bold text-base text-[#101216] mb-1.5 group-hover:text-[#6C4DF6] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
                  {p.summary}
                </p>

                <div className="mt-4 pt-4 border-t border-[#101216]/5 flex items-center justify-between text-xs text-[#585E6C]">
                  <span>Lead: <strong className="text-[#101216]">{p.team_leader}</strong></span>
                  {p.demo_url && (
                    <a
                      href={p.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6C4DF6] hover:underline flex items-center space-x-1"
                    >
                      <span>Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <div className="rounded-3xl bg-[#101216] text-[#F4F1EA] p-10 md:p-14 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ingin Bergabung dalam Ekosistem NCD?
            </h2>
            <p className="text-sm text-[#949BA8] mt-4 leading-relaxed">
              Kami menyambut mahasiswa teknologi yang memiliki dedikasi untuk bertumbuh, berkolaborasi dalam proyek berdampak nyata, dan menjunjung tinggi transparansi organisasi.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/join"
                className="px-6 py-3 rounded-xl bg-[#6C4DF6] text-white font-semibold text-sm hover:bg-[#583BD9] transition-all shadow-md"
              >
                Kirim Formulir Pendaftaran
              </Link>
              <Link
                to="/about"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
              >
                Pelajari Syarat & Alur
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
