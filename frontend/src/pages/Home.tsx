import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ShieldCheck,
  Users,
  FolderGit2,
  Trophy,
  ExternalLink,
} from 'lucide-react'
import { api, Project } from '../services/api'
import { ProjectSkeleton } from '../components/Skeletons'

export function Home() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['publicProjects'],
    queryFn: async () => {
      const res = await api.get('/public/projects')
      return res.data
    },
  })

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl mx-auto px-6 py-12 md:py-20 text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] text-[#111215] leading-[1.1] max-w-3xl">
          Komunitas Mahasiswa Teknologi & Riset Terbuka
        </h1>

        <p className="mt-5 text-sm sm:text-base md:text-lg text-[#525660] max-w-2xl font-normal leading-relaxed">
          Wadah kolaborasi independen mahasiswa untuk rekayasa perangkat lunak, riset keamanan siber, dan transparansi organisasi.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to="/projects"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-sm hover:bg-[#252830] transition-all flex items-center justify-center space-x-2 shadow-2xs min-h-[44px]"
          >
            <span>Daftar Proyek</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/team"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#111215]/12 text-[#111215] font-medium text-sm hover:bg-[#111215]/5 transition-all shadow-2xs text-center min-h-[44px] flex items-center justify-center"
          >
            Struktur Tim
          </Link>
          <Link
            to="/app/finance"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#111215]/12 text-[#111215] font-medium text-sm hover:bg-[#111215]/5 transition-all shadow-2xs text-center min-h-[44px] flex items-center justify-center"
          >
            Buku Kas Terbuka
          </Link>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-14 md:py-20 border-t border-[#111215]/6 bg-white/60 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111215]">
              Prinsip Tata Kelola Organisasi
            </h2>
            <p className="text-sm text-[#525660] mt-2.5">
              Dibangun dengan standar rekayasa modern dan keterbukaan penuh kepada seluruh anggota.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs hover:border-[#111215]/20 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-4">
                <ShieldCheck className="w-5 h-5 text-[#6456EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111215]">Transparansi Kas</h3>
              <p className="text-xs text-[#525660] mt-2 leading-relaxed">
                Prinsip Maker-Checker (Bendahara I & II), bukti transaksi fisik, dan catatan mutasi yang dapat diaudit publik.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs hover:border-[#111215]/20 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-4">
                <Users className="w-5 h-5 text-[#6456EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111215]">Direktori Talenta</h3>
              <p className="text-xs text-[#525660] mt-2 leading-relaxed">
                Struktur pengurus dan anggota lintas bidang: Rekayasa Web, Sistem Terdistribusi, dan Riset Teknis.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs hover:border-[#111215]/20 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-4">
                <FolderGit2 className="w-5 h-5 text-[#6456EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111215]">Proyek Rekayasa Nyata</h3>
              <p className="text-xs text-[#525660] mt-2 leading-relaxed">
                Aplikasi internal dan riset open-source yang dikembangkan dan diuji secara berkala oleh anggota.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs hover:border-[#111215]/20 transition-all text-left">
              <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-4">
                <Trophy className="w-5 h-5 text-[#6456EB]" />
              </div>
              <h3 className="text-sm font-semibold text-[#111215]">Dukungan Kompetisi</h3>
              <p className="text-xs text-[#525660] mt-2 leading-relaxed">
                Fasilitasi delegasi lomba pemrograman, hackathon, dan publikasi riset ilmiah bagi mahasiswa berprestasi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Highlight */}
      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20 w-full text-left">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#111215]">Proyek Komunitas</h2>
            <p className="text-xs text-[#525660] mt-1">Rekayasa perangkat lunak dan riset mandiri anggota NCD</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-medium text-[#6456EB] hover:underline flex items-center space-x-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ProjectSkeleton />
              <ProjectSkeleton />
              <ProjectSkeleton />
            </>
          ) : (
            projects?.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs hover:border-[#111215]/20 transition-all flex flex-col"
            >
              <div className="p-5 border-b border-[#111215]/8 flex items-center justify-between bg-[#F4F1EB]/40">
                <div className="w-10 h-10 rounded-xl bg-[#111215] text-[#F4F1EB] flex items-center justify-center font-bold text-xs tracking-wider">
                  {p.title.slice(0, 2).toUpperCase()}
                </div>
                <div className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-white text-[#111215] border border-[#111215]/8 uppercase tracking-wider">
                  {p.status}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F4F1EB] text-[#525660] border border-[#111215]/6"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3 className="font-semibold text-base text-[#111215] mb-1.5">
                  {p.title}
                </h3>
                <p className="text-xs text-[#525660] leading-relaxed flex-1">
                  {p.summary}
                </p>

                <div className="mt-4 pt-4 border-t border-[#111215]/8 flex items-center justify-between text-xs text-[#525660]">
                  <span>Lead: <strong className="text-[#111215] font-medium">{p.team_leader}</strong></span>
                  {p.demo_url && (
                    <a
                      href={p.demo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#6456EB] hover:underline flex items-center space-x-1 font-medium"
                    >
                      <span>Tautan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center w-full border-t border-[#111215]/6">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[#111215]">
          Tertarik Berkolaborasi di NCD?
        </h2>
        <p className="text-sm md:text-base text-[#525660] mt-3.5 max-w-2xl mx-auto leading-relaxed">
          Pendaftaran terbuka untuk mahasiswa yang berminat berkontribusi pada pengembangan aplikasi, riset terbuka, dan tata kelola komunitas.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <Link
            to="/join"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-sm hover:bg-[#252830] transition-all flex items-center justify-center space-x-2 shadow-2xs min-h-[44px]"
          >
            <span>Formulir Pendaftaran</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#111215]/12 text-[#111215] font-medium text-sm hover:bg-[#111215]/5 transition-all shadow-2xs text-center min-h-[44px] flex items-center justify-center"
          >
            Tentang Komunitas
          </Link>
        </div>
      </section>
    </div>
  )
}
