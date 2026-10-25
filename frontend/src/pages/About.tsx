import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { api, HistoryItem } from '../services/api'
import { CheckCircle2, BookOpen, Code2, ShieldCheck, ArrowRight } from 'lucide-react'
import { HistorySkeleton } from '../components/Skeletons'

const CORE_PILLARS = [
  {
    icon: BookOpen,
    title: 'Ekosistem Pembelajaran Mandiri',
    desc: 'Mengakselerasi kurikulum rekayasa terarah bagi talenta mahasiswa lintas disiplin teknologi serta membina kesiapan kompetisi di kancah nasional maupun global.',
    action: 'Struktur tim & divisi',
    href: '/structure',
  },
  {
    icon: Code2,
    title: 'Produk Digital Berdampak',
    desc: 'Membangun dan merilis perangkat lunak mandiri berstandar industri yang dapat diadopsi publik serta mitra industri secara terukur dan nyata.',
    action: 'Jelajahi karya proyek',
    href: '/projects',
  },
  {
    icon: ShieldCheck,
    title: 'Transparansi Finansial Radikal',
    desc: 'Menerapkan tata kelola kas 100% terbuka untuk publik dengan pengawasan berjenjang tanpa kompromi demi integritas organisasi yang terpercaya.',
    action: 'Periksa transparansi kas',
    href: '/dashboard',
  },
]

export function About() {
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const

  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get<HistoryItem[]>('/public/history')
      return res.data
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-left">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Tentang Organisasi NCD
        </h1>
        <p className="text-xs sm:text-sm text-[#525660] mt-2.5 leading-relaxed max-w-2xl">
          Mengenal visi, mandat operasional, kemitraan strategis di bawah naungan NEXA Tech Labs, serta lini masa perkembangan komunitas.
        </p>
      </motion.div>

      {/* Features 11 Block: Split Headline with Three Indexed Cards */}
      <section className="mb-14 sm:mb-16">
        {/* Split Headline */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end mb-8 sm:mb-10"
        >
          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-[#111215] leading-[1.2]">
              Inkubasi rekayasa teknologi mahasiswa{' '}
              <span className="italic font-serif font-normal text-[#6456EB]">berdaya saing global</span>{' '}
              dan berintegritas radikal.
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-[#525660] leading-relaxed">
              Menjadi wadah rekayasa teknologi mahasiswa terdepan yang melahirkan inovasi digital berdampak nyata, berlandaskan prinsip tata kelola kas terbuka, dan diakui di kancah nasional maupun internasional.
            </p>
            <div className="mt-3.5 flex items-center gap-2 text-xs text-[#525660]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Fokus pada kualitas rekayasa, tata kelola kas, dan etika profesional</span>
            </div>
          </div>
        </motion.div>

        {/* Three Indexed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {CORE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <motion.article
                key={pillar.title}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : idx * 0.08,
                  ease,
                }}
                className="group bg-white rounded-none border border-[#111215]/15 p-6 sm:p-7 flex flex-col justify-between hover:border-[#111215] transition-colors relative shadow-2xs"
              >
                <div>
                  <div className="w-10 h-10 rounded-none border border-[#111215]/15 bg-[#F4F1EB] flex items-center justify-center text-[#111215] group-hover:bg-[#111215] group-hover:text-[#F4F1EB] transition-colors mb-6">
                    <Icon className="w-4 h-4" />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#111215] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525660] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#111215]/10">
                  <Link
                    to={pillar.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors"
                  >
                    <span>{pillar.action}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* Naungan & Kemitraan NEXA Tech Labs */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="bg-white rounded-none border border-[#111215]/15 p-6 sm:p-8 mb-14 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="max-w-2xl text-left">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111215]">
            Di Bawah Bimbingan Riset NEXA Tech Labs
          </h2>
          <p className="text-xs sm:text-sm text-[#525660] mt-2 leading-relaxed">
            NCD beroperasi di bawah supervisi riset dan standarisasi rekayasa NEXA Tech Labs. Kolaborasi ini menjamin setiap arsitektur kode, kepatuhan keamanan data privasi, dan alur kerja keorganisasian memenuhi standar profesional industri.
          </p>
        </div>

        <div className="shrink-0 flex items-center justify-start md:justify-center">
          <img
            src="/nexa-tech-labs.svg"
            alt="NEXA Tech Labs"
            className="h-12 sm:h-14 w-auto object-contain"
            loading="lazy"
          />
        </div>
      </motion.div>

      {/* Perjalanan Organisasi (Timeline) */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="text-left"
      >
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111215]">
            Perjalanan & Rekam Jejak Organisasi
          </h2>
          <p className="text-xs sm:text-sm text-[#525660] mt-1">
            Tahapan penting perkembangan NCD dari awal inisiasi hingga konsolidasi platform modern.
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <HistorySkeleton key={i} />
            ))
          ) : (
            history?.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-none border border-[#111215]/15 p-5 sm:p-6 shadow-2xs hover:border-[#111215] transition-all flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6"
              >
                <div className="sm:w-36 shrink-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6456EB] font-tabular">
                    {item.month} {item.year}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-[#111215] leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525660] mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
export default About