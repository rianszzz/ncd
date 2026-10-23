import { useQuery } from '@tanstack/react-query'
import { Github, ExternalLink } from 'lucide-react'
import { api, Project } from '../services/api'

export function Projects() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['publicProjects'],
    queryFn: async () => {
      const res = await api.get('/public/projects')
      return res.data
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-left">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Proyek Komunitas
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Katalog perangkat lunak dan riset teknis yang dikembangkan secara kolaboratif oleh anggota NCD.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#525660]">Memuat daftar proyek...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects?.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs hover:border-[#111215]/20 transition-all flex flex-col group"
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

                <h3 className="font-semibold text-base text-[#111215] mb-2 group-hover:text-[#6456EB] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-[#525660] leading-relaxed flex-1">
                  {p.summary}
                </p>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-[#111215]/8">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#525660] mb-1.5">
                    <span>Tahap Pengerjaan</span>
                    <span className="font-tabular font-semibold text-[#111215]">{p.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#111215]/5 overflow-hidden">
                    <div
                      className="h-full bg-[#6456EB] rounded-full"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action links */}
                <div className="mt-4 pt-3 border-t border-[#111215]/8 flex items-center justify-between text-xs text-[#525660]">
                  <span>Lead: <strong className="text-[#111215] font-medium">{p.team_leader}</strong></span>
                  <div className="flex items-center space-x-3">
                    {p.repo_url && (
                      <a
                        href={p.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#111215] transition-colors"
                        title="Repositori"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6456EB] hover:underline flex items-center space-x-1 font-medium"
                      >
                        <span>Tautan</span>
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
