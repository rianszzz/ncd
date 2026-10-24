import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { Github, ExternalLink } from 'lucide-react'
import { api, Project } from '../services/api'
import { ProjectSkeleton } from '../components/Skeletons'
import FadeContent from '../components/ui/FadeContent'

export function Projects() {
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['publicProjects'],
    queryFn: async () => {
      const res = await api.get('/public/projects')
      return res.data
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-left">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Proyek Komunitas
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Katalog perangkat lunak dan riset teknis yang dikembangkan secara kolaboratif oleh anggota NCD.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectSkeleton />
          <ProjectSkeleton />
          <ProjectSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((p, idx) => {
            const projectCover =
              p.thumbnail_url ||
              (p.slug === 'ncd-integrated-platform'
                ? '/projects/cover-platform.webp'
                : p.slug === 'nexa-smart-attendance'
                ? '/projects/cover-attendance.webp'
                : '/projects/cover-cphub.webp')

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : idx * 0.06,
                  ease,
                }}
                className="group relative min-h-[380px] sm:min-h-[410px] w-full overflow-hidden rounded-none border border-[#111215]/20 bg-[#111215] shadow-xs hover:border-[#111215] transition-all flex flex-col justify-between"
              >
                {/* Full Card Image Background with FadeContent */}
                <div className="absolute inset-0 w-full h-full">
                  <FadeContent
                    effect="fade"
                    blur={true}
                    duration={1.2}
                    delay={idx * 0.08}
                    threshold={0.15}
                    className="w-full h-full"
                  >
                    <img
                      src={projectCover}
                      alt={p.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </FadeContent>
                </div>

                {/* Dark Vignette / Gradient Overlay inside image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111215] via-[#111215]/50 to-[#111215]/20 pointer-events-none" />

                {/* Top Bar: Technical Metadata (Inside Image, Zero Rounded) */}
                <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111215]/90 text-[#F4F1EB] border border-white/20 backdrop-blur-xs">
                    0{idx + 1} // R&amp;D
                  </span>
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-[#111215] border border-[#111215] shadow-xs">
                    {p.status}
                  </span>
                </div>

                {/* Bottom Area: Tech stack, Title, Summary, Progress & Action Links inside image */}
                <div className="relative z-10 p-5 sm:p-6 text-left">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {p.tech_stack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 py-0.5 rounded-none text-[9px] font-mono font-medium bg-[#111215]/80 text-[#F4F1EB] border border-white/15 uppercase tracking-wide backdrop-blur-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-white uppercase tracking-tight group-hover:text-[#A78BFA] transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#E5DFD5] leading-relaxed line-clamp-2 mt-1.5 text-balance">
                    {p.summary}
                  </p>

                  {/* Technical Progress Bar inside image */}
                  <div className="mt-4 pt-3 border-t border-white/15">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#E5DFD5]/80 mb-1">
                      <span className="uppercase">Tahap Pengerjaan</span>
                      <span className="font-bold text-white">{p.progress}%</span>
                    </div>
                    <div className="w-full h-1 rounded-none bg-white/15 overflow-hidden">
                      <div
                        className="h-full bg-[#A78BFA] rounded-none transition-all duration-300"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Info & Actions inside image */}
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#9CA3AF] text-[11px]">
                      LEAD: <strong className="text-white font-medium">{p.team_leader}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      {p.repo_url && (
                        <a
                          href={p.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#E5DFD5] hover:text-white flex items-center gap-1 text-[11px] font-bold"
                          title="Repositori Kode"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>REPO</span>
                        </a>
                      )}
                      {p.demo_url ? (
                        <a
                          href={p.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A78BFA] hover:underline flex items-center gap-1 text-[11px] font-bold"
                        >
                          <span>DEMO</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[#9CA3AF] text-[11px]">INTERNAL</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
