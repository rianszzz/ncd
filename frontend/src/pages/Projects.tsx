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
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] mb-4">
          <span>Portofolio & Inkubasi</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#101216]">
          Karya Rekayasa Perangkat Lunak
        </h1>
        <p className="text-sm text-[#585E6C] mt-3 leading-relaxed">
          Katalog proyek teknologi hasil riset dan kolaborasi mandiri anggota NCD. Setiap proyek melalui tahapan review arsitektur dan standar implementasi produksi.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-sm text-[#585E6C]">Memuat katalog proyek...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects?.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#101216]/10 overflow-hidden shadow-xs hover:border-[#6C4DF6]/40 transition-all flex flex-col group"
            >
              <div className="h-48 w-full overflow-hidden bg-black/5 relative">
                <img
                  src={p.thumbnail_url}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#101216]/80 backdrop-blur-md text-white uppercase tracking-wider">
                  {p.status}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
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

                <h3 className="font-bold text-lg text-[#101216] mb-2 group-hover:text-[#6C4DF6] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-[#585E6C] leading-relaxed flex-1">
                  {p.summary}
                </p>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-[#101216]/5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#585E6C] mb-1.5">
                    <span>Progres Pengerjaan</span>
                    <span className="font-tabular font-bold text-[#101216]">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-[#6C4DF6] rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action links */}
                <div className="mt-4 pt-3 border-t border-[#101216]/5 flex items-center justify-between text-xs text-[#585E6C]">
                  <span>Lead: <strong className="text-[#101216]">{p.team_leader}</strong></span>
                  <div className="flex items-center space-x-3">
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#101216] transition-colors"
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
                        className="text-[#6C4DF6] hover:underline flex items-center space-x-1 font-semibold"
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
