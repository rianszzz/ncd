import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
} from 'lucide-react'
import { api, Project } from '../services/api'
import { ProjectSkeleton } from '../components/Skeletons'
import { VariableProximity } from '../components/ui/VariableProximity'
import { Magnet } from '../components/ui/Magnet'
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button'
import { GovernanceHorizontalScroll } from '../components/ui/GovernanceHorizontalScroll'
import FadeContent from '../components/ui/FadeContent'

export function Home() {
  const heroContainerRef = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['publicProjects'],
    queryFn: async () => {
      const res = await api.get('/public/projects')
      return res.data
    },
  })

  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="min-h-[calc(100dvh-3.5rem)] w-full max-w-4xl mx-auto px-5 sm:px-6 py-8 md:py-16 text-center flex flex-col items-center justify-center"
      >
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-[#111215] leading-[1.18] sm:leading-[1.14] max-w-2xl mx-auto">
          <div ref={heroContainerRef} className="relative inline-block">
            <VariableProximity
              label={"Komunitas Mahasiswa\nTeknologi &\nRiset Terbuka"}
              className="cursor-default"
              fromFontVariationSettings="'wght' 600, 'opsz' 14"
              toFontVariationSettings="'wght' 950, 'opsz' 40"
              containerRef={heroContainerRef}
              radius={100}
              falloff="linear"
              smoothing={0.2}
              scale={1}
              lift={0}
              idleWave={false}
            />
          </div>
        </h1>

        <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base text-[#525660] max-w-lg font-normal leading-relaxed text-balance px-2">
          Wadah kolaborasi independen mahasiswa untuk rekayasa perangkat lunak, riset keamanan siber, dan transparansi organisasi.
        </p>

        <div className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none">
          <Magnet
            padding={60}
            magnetStrength={3}
            wrapperClassName="flex-1 sm:flex-initial"
            innerClassName="w-full"
          >
            <Link
              to="/projects"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs sm:text-sm hover:bg-[#252830] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px]"
            >
              <span>Daftar Proyek</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F4F1EB]/80" />
            </Link>
          </Magnet>
          <InteractiveHoverButton
            to="/team"
            text="Struktur Tim"
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 min-w-[130px]"
          />
        </div>
      </motion.section>

      {/* Pillars / Governance Horizontal Scroll Section (Webflow Product Cards Flow) */}
      <GovernanceHorizontalScroll />

      {/* Featured Projects Highlight */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="max-w-6xl mx-auto px-6 py-14 md:py-20 w-full"
      >
        <FadeContent
          effect="mist"
          duration={1.8}
          ease="power2.out"
          stagger={0.15}
          threshold={0.1}
          className="text-center mb-10 md:mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111215]">
            Projek Komunitas
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#525660] mt-3 max-w-xl mx-auto leading-relaxed text-balance">
            Rekayasa perangkat lunak dan riset mandiri anggota NCD
          </p>
        </FadeContent>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <>
              <ProjectSkeleton />
              <ProjectSkeleton />
              <ProjectSkeleton />
            </>
          ) : (
            projects?.slice(0, 3).map((p, idx) => {
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
                    delay: shouldReduceMotion ? 0 : idx * 0.08,
                    ease,
                  }}
                  className="group relative min-h-[360px] sm:min-h-[390px] w-full overflow-hidden rounded-none border border-[#111215]/20 bg-[#111215] shadow-xs hover:border-[#111215] transition-all flex flex-col justify-between"
                >
                  {/* Full Card Image Background with FadeContent Transition */}
                  <div className="absolute inset-0 w-full h-full">
                    <FadeContent
                      effect="fade"
                      blur={true}
                      duration={1.2}
                      delay={idx * 0.1}
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

                  {/* Bottom Area: Title & Deskripsi Singkat inside Image */}
                  <div className="relative z-10 p-5 sm:p-6 text-left">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {p.tech_stack.slice(0, 3).map((tech) => (
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

                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9CA3AF] text-[11px]">
                        LEAD: <strong className="text-white font-medium">{p.team_leader}</strong>
                      </span>
                      <Link
                        to="/projects"
                        className="text-[#A78BFA] group-hover:text-white flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition-colors"
                      >
                        <span>DETAIL</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-none text-xs font-mono font-bold uppercase tracking-wider bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] transition-colors border border-[#111215] shadow-xs"
          >
            <span>Lihat Semua Projek Komunitas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.section>

      {/* Call to Action Section */}
      <motion.section
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="max-w-4xl mx-auto px-5 sm:px-6 py-12 sm:py-16 md:py-20 text-center w-full border-t border-[#111215]/6"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[#111215]">
          Tertarik Berkolaborasi di NCD?
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-[#525660] mt-3 max-w-xl mx-auto leading-relaxed text-balance">
          Pendaftaran terbuka untuk mahasiswa yang berminat berkontribusi pada pengembangan aplikasi, riset terbuka, dan tata kelola komunitas.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-none mx-auto">
          <Magnet
            padding={60}
            magnetStrength={3}
            wrapperClassName="flex-1 sm:flex-initial"
            innerClassName="w-full"
          >
            <Link
              to="/join"
              className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs sm:text-sm hover:bg-[#252830] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px]"
            >
              <span>Formulir Pendaftaran</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F4F1EB]/80" />
            </Link>
          </Magnet>
          <InteractiveHoverButton
            to="/about"
            text="Tentang Kami"
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 sm:py-3 min-w-[130px]"
          />
        </div>
      </motion.section>
    </div>
  )
}
