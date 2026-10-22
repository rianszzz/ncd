import { useQuery } from '@tanstack/react-query'
import { api, Project } from '../services/api'
import { Github, ExternalLink } from 'lucide-react'

export function Projects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get<Project[]>('/public/projects')
      return res.data
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-4">
          <span>Portofolio &amp; Inkubasi</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#101216] dark:text-white">
          Karya Rekayasa Perangkat Lunak
        </h1>
        <p className="text-sm text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed">
          Katalog proyek teknologi hasil riset dan kolaborasi mandiri anggota NCD. Setiap proyek melalui tahapan review arsitektur dan standar implementasi produksi.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#585E6C] dark:text-[#949BA8]">
          Memuat katalog proyek...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {projects?.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-[#101216]/80 rounded-3xl border border-[#101216]/8 dark:border-white/10 overflow-hidden shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 w-full overflow-hidden bg-black/5 relative">
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#101216]/80 backdrop-blur-md text-white uppercase tracking-wider">
                    {p.status}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#101216]/5 dark:bg-white/5 text-[#101216] dark:text-white"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-lg text-[#101216] dark:text-white mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed">
                    {p.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                {/* Progress Bar */}
                <div className="pt-4 border-t border-[#101216]/6 dark:border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#585E6C] dark:text-[#949BA8] mb-1.5">
                    <span>Progres Pengerjaan</span>
                    <span className="font-tabular font-bold text-[#101216] dark:text-white">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#6C4DF6] dark:bg-[#8267FF] rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Lead and Actions */}
                <div className="mt-4 pt-3 border-t border-[#101216]/6 dark:border-white/10 flex items-center justify-between text-xs text-[#585E6C] dark:text-[#949BA8]">
                  <span>Lead: <strong className="text-[#101216] dark:text-white">{p.team_leader}</strong></span>
                  <div className="flex items-center space-x-3">
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#101216] dark:hover:text-white transition-colors"
                        title="Lihat Repositori"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6C4DF6] dark:text-[#8267FF] hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>Demo Live</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
