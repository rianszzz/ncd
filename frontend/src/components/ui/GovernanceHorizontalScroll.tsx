import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'motion/react'
import {
  ShieldCheck,
  Users,
  FolderGit2,
  Trophy,
  type LucideIcon,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'

interface PillarItem {
  id: string
  num: string
  icon: LucideIcon
  tag: string
  titleLine1: string
  titleLine2: string
  desc: string
  subtext: string
  bg: string
  border: string
  text: string
  tagText: string
  descText: string
  divider: string
  footerText: string
  iconColor: string
}

const PILLARS: PillarItem[] = [
  {
    id: 'kas',
    num: '01',
    icon: ShieldCheck,
    tag: 'Akuntabilitas & Audit',
    titleLine1: 'Transparansi',
    titleLine2: 'Kas',
    desc: 'Prinsip Maker-Checker (Bendahara I & II), bukti transaksi fisik, dan catatan mutasi yang dapat diaudit publik secara berkala.',
    subtext: 'Maker-Checker Protocol',
    bg: 'bg-white',
    border: 'border-[#111215]/15',
    text: 'text-[#111215]',
    tagText: 'text-[#5042D9]',
    descText: 'text-[#3D404A]',
    divider: 'border-[#111215]/10',
    footerText: 'text-[#111215]/80',
    iconColor: 'text-[#5042D9]',
  },
  {
    id: 'talenta',
    num: '02',
    icon: Users,
    tag: 'Struktur Organisasi',
    titleLine1: 'Direktori',
    titleLine2: 'Talenta',
    desc: 'Struktur pengurus dan anggota lintas bidang kompetensi: Rekayasa Web, Sistem Terdistribusi, dan Riset Teknis.',
    subtext: 'Cross-Domain Engineering',
    bg: 'bg-[#5042D9]',
    border: 'border-[#5042D9]',
    text: 'text-[#FFFFFF]',
    tagText: 'text-[#FFFFFF]',
    descText: 'text-[#FFFFFF]',
    divider: 'border-white/30',
    footerText: 'text-[#FFFFFF]',
    iconColor: 'text-[#FFFFFF]',
  },
  {
    id: 'rekayasa',
    num: '03',
    icon: FolderGit2,
    tag: 'Riset & Pengembangan',
    titleLine1: 'Proyek',
    titleLine2: 'Rekayasa Nyata',
    desc: 'Aplikasi internal komunitas dan riset open-source yang dikembangkan, diuji, dan dirilis secara berkala oleh anggota.',
    subtext: 'Open-Source & Peer-Reviewed',
    bg: 'bg-[#191B22]',
    border: 'border-[#191B22]',
    text: 'text-[#FFFFFF]',
    tagText: 'text-[#C4B5FD]',
    descText: 'text-[#E5DFD5]',
    divider: 'border-white/20',
    footerText: 'text-[#E5DFD5]',
    iconColor: 'text-[#C4B5FD]',
  },
  {
    id: 'kompetisi',
    num: '04',
    icon: Trophy,
    tag: 'Hibah & Prestasi',
    titleLine1: 'Dukungan',
    titleLine2: 'Kompetisi',
    desc: 'Fasilitasi delegasi lomba pemrograman kompetitif, hackathon nasional, dan publikasi riset ilmiah bagi mahasiswa berprestasi.',
    subtext: 'Research & Competitive Grants',
    bg: 'bg-[#EDE9E1]',
    border: 'border-[#111215]/15',
    text: 'text-[#111215]',
    tagText: 'text-[#5042D9]',
    descText: 'text-[#2D3039]',
    divider: 'border-[#111215]/15',
    footerText: 'text-[#111215]/80',
    iconColor: 'text-[#5042D9]',
  },
]

export function GovernanceHorizontalScroll() {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollRange, setScrollRange] = useState(0)

  // Measure dynamic horizontal scroll range across mobile, tablet, and desktop:
  // Stops precisely when Card 04 (Dukungan Kompetisi) aligns with center of viewport,
  // then unpins immediately so vertical page scroll continues cleanly.
  useEffect(() => {
    const calculateRange = () => {
      if (trackRef.current) {
        const children = trackRef.current.children
        const lastCard = children[children.length - 1] as HTMLElement | undefined
        if (lastCard) {
          const cardCenter = lastCard.offsetLeft + lastCard.offsetWidth / 2
          const viewportCenter = window.innerWidth / 2
          setScrollRange(Math.max(0, cardCenter - viewportCenter))
        } else {
          setScrollRange(Math.max(0, trackRef.current.scrollWidth - window.innerWidth))
        }
      }
    }

    calculateRange()
    const timer = setTimeout(calculateRange, 150)
    window.addEventListener('resize', calculateRange, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateRange)
    }
  }, [])

  // Dynamic scroll height: tailored per viewport height
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Direct transform (zero spring lag / zero physics calculation overhead on scroll ticks)
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  if (shouldReduceMotion) {
    return (
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto bg-[#F4F1EB] w-full">
        <div className="mb-8 sm:mb-10 text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#6456EB] font-bold">
            Tata Kelola
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111215] mt-2 uppercase">
            Prinsip Tata Kelola Organisasi
          </h2>
          <p className="text-xs sm:text-sm text-[#525660] mt-2">
            Dibangun dengan standar rekayasa modern dan keterbukaan penuh kepada seluruh anggota.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((item) => (
            <div
              key={item.id}
              className={`p-6 sm:p-7 rounded-none ${item.bg} ${item.text} border ${item.border} shadow-sm text-left flex flex-col justify-between min-h-[320px] sm:min-h-[360px]`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${item.tagText} font-bold`}>
                    {item.tag}
                  </span>
                  <span className="font-mono text-xs font-bold opacity-75">#{item.num}</span>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold tracking-tight ${item.text} mt-3 uppercase leading-tight`}>
                  {item.titleLine1} <br />
                  {item.titleLine2}
                </h3>
                <p className={`text-xs ${item.descText} leading-relaxed mt-4`}>{item.desc}</p>
              </div>
              <div className={`mt-6 pt-3 border-t ${item.divider} flex items-center justify-between text-xs ${item.footerText}`}>
                <span className="font-mono text-[10px] uppercase tracking-wider">{item.subtext}</span>
                <ChevronRight className={`w-4 h-4 ${item.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[220vh] sm:h-[240vh] md:h-[260vh] lg:h-[280vh] bg-[#F4F1EB] w-full select-none"
    >
      {/* Pinned Sticky Viewport (100vh lock on all devices) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center">
        {/* Horizontal Moving Track */}
        <div className="w-full overflow-visible">
          <motion.div
            ref={trackRef}
            style={{ x, willChange: 'transform' }}
            className="flex items-center gap-5 sm:gap-12 lg:gap-20 pl-4 sm:pl-10 lg:pl-20 pr-4 sm:pr-10 lg:pr-20 w-max py-4 sm:py-8"
          >
            {/* Lead Block: PRINSIP ORGANISASI (Black Theme) */}
            <div className="w-[260px] xs:w-[280px] sm:w-[290px] lg:w-[310px] shrink-0 p-6 sm:p-8 lg:p-9 rounded-none bg-[#111215] text-[#F4F1EB] border border-[#111215] shadow-lg flex flex-col justify-between min-h-[360px] sm:min-h-[400px] lg:min-h-[430px] text-left">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] lg:text-[11px] font-mono uppercase tracking-widest text-[#A78BFA] font-bold">
                    Tata Kelola Komunitas
                  </span>
                  <span className="font-mono text-xs font-bold text-[#A78BFA]/80">
                    #NCD
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[#F4F1EB] mt-3 uppercase leading-tight">
                  Prinsip <br />
                  Organisasi
                </h2>
                <p className="text-xs sm:text-sm text-[#F4F1EB]/75 leading-relaxed mt-3 sm:mt-4">
                  Dibangun dengan standar rekayasa perangkat lunak modern, keterbukaan penuh, dan akuntabilitas tata kelola bagi seluruh anggota NCD.
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#F4F1EB]/60">
                <span className="font-mono text-[10px] lg:text-[11px] uppercase tracking-wider">
                  Scroll untuk melihat
                </span>
                <ArrowRight className="w-4 h-4 text-[#A78BFA] animate-pulse" />
              </div>
            </div>

            {/* Alternating Staggered Cards (stagger only on sm+ to prevent clipping on mobile heights) */}
            {PILLARS.map((item, idx) => {
              const isEven = idx % 2 === 1

              return (
                <div
                  key={item.id}
                  className={`shrink-0 transition-transform duration-300 ${
                    isEven
                      ? 'sm:translate-y-6 lg:translate-y-12'
                      : 'sm:-translate-y-6 lg:-translate-y-10'
                  }`}
                >
                  <div
                    className={`group w-[260px] xs:w-[280px] sm:w-[290px] lg:w-[310px] shrink-0 p-6 sm:p-8 lg:p-9 rounded-none ${item.bg} ${item.text} border ${item.border} shadow-lg hover:shadow-xl flex flex-col justify-between min-h-[360px] sm:min-h-[400px] lg:min-h-[430px] transition-shadow duration-300 text-left`}
                  >
                    <div>
                      {/* Top Tag & Number */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] lg:text-[11px] font-mono uppercase tracking-widest ${item.tagText} font-bold`}
                        >
                          {item.tag}
                        </span>
                        <span className="font-mono text-xs font-bold opacity-75">
                          #{item.num}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className={`text-lg sm:text-xl lg:text-3xl font-bold tracking-tight ${item.text} mt-2.5 sm:mt-3 uppercase leading-tight`}
                      >
                        {item.titleLine1} <br />
                        {item.titleLine2}
                      </h2>

                      {/* Description */}
                      <p
                        className={`text-xs sm:text-sm ${item.descText} leading-relaxed mt-3 sm:mt-4`}
                      >
                        {item.desc}
                      </p>
                    </div>

                    {/* Bottom Metadata & Arrow */}
                    <div
                      className={`mt-6 sm:mt-8 pt-3 sm:pt-4 border-t ${item.divider} flex items-center justify-between text-xs ${item.footerText}`}
                    >
                      <span className="font-mono text-[10px] lg:text-[11px] uppercase tracking-wider">
                        {item.subtext}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${item.iconColor} group-hover:translate-x-1 transition-transform`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Minimal Scroll Progress Bar Indicator at Bottom */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-10 lg:left-20 right-4 sm:right-10 lg:right-20 flex items-center justify-start">
          <div className="h-0.5 w-full max-w-xs bg-[#111215]/10 rounded-none overflow-hidden">
            <motion.div
              style={{ width: progressWidth }}
              className="h-full bg-[#111215] rounded-none"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
