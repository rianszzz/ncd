import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import { Github, Linkedin } from 'lucide-react'
import { api, Member } from '../services/api'
import { MemberSkeleton } from '../components/Skeletons'
import FlipCard from '../components/ui/FlipCard'

import annisaPhoto from '../assets/member/annisa.webp'
import fauzanPhoto from '../assets/member/fauzan.webp'
import iqbalPhoto from '../assets/member/iqbal.webp'
import mirzaPhoto from '../assets/member/mirza.webp'
import putriPhoto from '../assets/member/putri.webp'
import rayyanPhoto from '../assets/member/rayyan.webp'
import sriPhoto from '../assets/member/sri.webp'
import rianszzzPhoto from '../assets/member/rianszzz.webp'

const MEMBER_PHOTOS: Record<string, string> = {
  mirza: mirzaPhoto,
  fauzan: fauzanPhoto,
  rayyan: rayyanPhoto,
  annisa: annisaPhoto,
  putri: putriPhoto,
  iqbal: iqbalPhoto,
  sri: sriPhoto,
  rian: rianszzzPhoto,
  rianszzz: rianszzzPhoto,
}

function getMemberPhoto(m: Member): string {
  if (m.avatar_url && m.avatar_url.trim().length > 0) return m.avatar_url
  const nick = m.nickname?.toLowerCase() || ''
  const name = m.full_name?.toLowerCase() || ''
  for (const [key, url] of Object.entries(MEMBER_PHOTOS)) {
    if (nick.includes(key) || name.includes(key)) return url
  }
  return rianszzzPhoto
}

interface DivisionOption {
  key: string
  short: string
  full: string
  dbDivisions?: string[]
}

const DIVISIONS: DivisionOption[] = [
  { key: 'ALL', short: 'Semua', full: 'Semua Divisi' },
  { key: 'executive', short: 'Eksekutif', full: 'Executive Committee', dbDivisions: ['Executive Committee'] },
  { key: 'product', short: 'Produk & Ops', full: 'Product & Operations', dbDivisions: ['Product & Operations'] },
  { key: 'content', short: 'Konten & Proyek', full: 'Content & Projects', dbDivisions: ['Content & Projects'] },
  {
    key: 'admin',
    short: 'Administrasi',
    full: 'Administration & Records + Correspondence',
    dbDivisions: ['Administration & Records', 'Administration & Correspondence'],
  },
  { key: 'treasury', short: 'Treasury', full: 'Treasury & Kas Maker', dbDivisions: ['Treasury & Kas Maker'] },
  { key: 'audit', short: 'Audit', full: 'Audit & Kas Checker', dbDivisions: ['Audit & Kas Checker'] },
]

export function Team() {
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const [searchParams, setSearchParams] = useSearchParams()

  const activeDivision = searchParams.get('div') || 'ALL'

  const { data: rawMembers, isLoading } = useQuery<Member[]>({
    queryKey: ['publicMembers'],
    queryFn: async () => {
      const res = await api.get('/public/members')
      return res.data
    },
  })

  const isRianszzz = (m: Member) =>
    m.full_name.toLowerCase().includes('rianszzz') || m.nickname?.toLowerCase() === 'rian'

  const members = (rawMembers || [])
    .map((m) =>
      isRianszzz(m)
        ? {
            ...m,
            position_title: 'Solo Dev',
            bio: '',
            skills: [],
          }
        : m
    )
    .sort((a, b) => {
      if (isRianszzz(a)) return 1
      if (isRianszzz(b)) return -1
      return 0
    })

  const filtered = members?.filter((m) => {
    if (activeDivision === 'ALL') return true
    const selected = DIVISIONS.find((d) => d.key === activeDivision)
    if (selected?.dbDivisions) {
      return selected.dbDivisions.includes(m.division)
    }
    return m.division === activeDivision
  })

  const setDivision = (divKey: string) => {
    const next = new URLSearchParams(searchParams)
    if (divKey === 'ALL') next.delete('div')
    else next.set('div', divKey)
    setSearchParams(next, { replace: true })
  }

  const isDropdown = DIVISIONS.filter((d) => d.key !== 'ALL').length >= 8

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-left">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="mb-8 md:mb-10"
      >
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Pengurus dan Kontributor
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Struktur organisasi Nusantara Cyber Developer beranggotakan mahasiswa yang aktif mengembangkan sistem dan menjalankan tata kelola komunitas.
        </p>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease }}
        className="mb-8 md:mb-10 flex flex-col gap-3"
      >
        {/* Primary Filter: Chips (<=7) or Dropdown (>=8) with mobile scroll + fade */}
        <div className="relative w-full">
          {isDropdown ? (
            <div className="max-w-xs">
              <label htmlFor="division-select" className="sr-only">Pilih Divisi</label>
              <select
                id="division-select"
                value={activeDivision}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-medium bg-white text-[#111215] border border-[#111215]/10 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#111215]/20"
              >
                {DIVISIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.short} — {d.full}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              role="tablist"
              aria-label="Filter Divisi Organisasi"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] sm:[mask-image:none]"
            >
              {DIVISIONS.map((div) => {
                const isActive = activeDivision === div.key
                return (
                  <button
                    key={div.key}
                    role="tab"
                    aria-selected={isActive}
                    title={div.full}
                    onClick={() => setDivision(div.key)}
                    className={`px-3.5 py-2 min-h-[38px] rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer text-xs ${
                      isActive
                        ? 'bg-[#111215] text-[#F4F1EB] shadow-2xs'
                        : 'bg-white text-[#525660] hover:text-[#111215] border border-[#111215]/8 hover:border-[#111215]/20 active:scale-[0.98]'
                    }`}
                  >
                    {div.short}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <MemberSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered?.map((m, idx) => {
            const photo = getMemberPhoto(m)
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : (idx % 8) * 0.05,
                  ease,
                }}
                className="w-full flex justify-center"
              >
                <FlipCard
                  width="100%"
                  height={420}
                  radius={20}
                  background="#111215"
                  color="#F4F1EB"
                  tilt
                  tiltMax={10}
                  glare
                  glareOpacity={0.18}
                  hoverScale={1.02}
                  perspective={1100}
                  shadow
                  shadowColor="#000000"
                  shadowOpacity={0.25}
                  flipOnClick
                  draggable
                  front={
                    <div className="relative w-full h-full overflow-hidden flex flex-col justify-end select-none">
                      <img
                        src={photo}
                        alt={m.full_name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                      />
                      <div className="relative z-10 p-5 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col items-start gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F4F1EB] drop-shadow-sm">
                          {m.position_title}
                        </span>
                        <span className="text-[11px] text-[#F4F1EB]/75 font-medium tracking-tight">
                          Klik / geser profil →
                        </span>
                      </div>
                    </div>
                  }
                  back={
                    <div className="relative w-full h-full overflow-hidden flex flex-col justify-between p-6 text-left select-none">
                      <img
                        src={photo}
                        alt={m.full_name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top grayscale contrast-125 brightness-50"
                      />
                      <div className="absolute inset-0 bg-black/75" />

                      <div className="relative z-10 flex flex-col items-start">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F4F1EB]/80">
                          {m.position_title}
                        </span>
                        <h2 className="font-bold text-lg text-white leading-tight mt-1 tracking-tight">
                          {m.full_name}
                        </h2>
                        <p className="text-xs text-[#F4F1EB]/70 mt-1">
                          {m.major} • {m.generation}
                        </p>

                        {m.bio && (
                          <p className="text-xs text-[#F4F1EB]/90 mt-3 leading-relaxed line-clamp-3">
                            {m.bio}
                          </p>
                        )}
                      </div>

                      <div className="relative z-10 pt-3 border-t border-white/15 flex flex-col gap-2.5">
                        {m.skills && m.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {m.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/15 text-[#F4F1EB] border border-white/10"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-1 text-[#F4F1EB]/80">
                          <div className="flex items-center space-x-2">
                            {m.github_url && (
                              <a
                                href={m.github_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-[#F4F1EB] hover:text-white transition-colors"
                                title="GitHub"
                              >
                                <Github className="w-4 h-4" />
                              </a>
                            )}
                            {m.linkedin_url && (
                              <a
                                href={m.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 text-[#F4F1EB] hover:text-white transition-colors"
                                title="LinkedIn"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-[#F4F1EB]/60">Balik ↺</span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
