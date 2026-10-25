import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import {
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { api, Achievement, Competition } from '../services/api'
import { AchievementSkeleton } from '../components/Skeletons'

type TierFilter = 'ALL' | 'Internasional' | 'Nasional' | 'Regional / Kampus'

export function Achievements() {
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const [activeTier, setActiveTier] = useState<TierFilter>('ALL')
  const [activeTab, setActiveTab] = useState<'hall-of-fame' | 'agenda'>('hall-of-fame')

  // Fetch Achievements
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery<Achievement[]>({
    queryKey: ['publicAchievements'],
    queryFn: async () => {
      const res = await api.get('/public/achievements')
      return res.data
    },
  })

  // Fetch Competitions
  const { data: competitions, isLoading: isLoadingCompetitions } = useQuery<Competition[]>({
    queryKey: ['publicCompetitions'],
    queryFn: async () => {
      const res = await api.get('/public/competitions')
      return res.data
    },
  })

  // Filter achievements by tier
  const filteredAchievements = useMemo(() => {
    if (!achievements) return []
    if (activeTier === 'ALL') return achievements
    return achievements.filter(
      (item) => item.tier?.toLowerCase() === activeTier.toLowerCase()
    )
  }, [achievements, activeTier])

  // Calculated Stats
  const stats = useMemo(() => {
    const total = achievements?.length || 0
    const goldCount = achievements?.filter(
      (a) =>
        a.rank.toLowerCase().includes('juara 1') ||
        a.rank.toLowerCase().includes('gold') ||
        a.rank.toLowerCase().includes('champion')
    ).length || 0
    const internationalCount = achievements?.filter(
      (a) => a.tier === 'Internasional'
    ).length || 0
    const nationalCount = achievements?.filter(
      (a) => a.tier === 'Nasional'
    ).length || 0

    return { total, goldCount, internationalCount, nationalCount }
  }, [achievements])

  const tiers: TierFilter[] = ['ALL', 'Internasional', 'Nasional', 'Regional / Kampus']

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
          Pencapaian & Kompetisi NCD
        </h1>
        <p className="text-xs sm:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Eksplorasi rekam jejak kejuaraan, inovasi karya teknologi, dan agenda kompetitif talenta mahasiswa Nusantara Cyber Developer.
        </p>
      </motion.div>

      {/* Metrics Strip */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease }}
        className="bg-white rounded-none border border-[#111215]/8 grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#111215]/8 mb-10 overflow-hidden shadow-2xs"
      >
        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-[#525660] block mb-1">Total Prestasi</span>
          <div className="text-2xl sm:text-3xl font-bold font-tabular text-[#111215]">
            {isLoadingAchievements ? '—' : stats.total}
          </div>
          <p className="text-[11px] text-[#525660] mt-1">Kejuaraan resmi tercatat</p>
        </div>

        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-[#525660] block mb-1">Juara 1 / Emas</span>
          <div className="text-2xl sm:text-3xl font-bold font-tabular text-[#111215]">
            {isLoadingAchievements ? '—' : stats.goldCount}
          </div>
          <p className="text-[11px] text-[#525660] mt-1">Podium tertinggi</p>
        </div>

        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-[#525660] block mb-1">Internasional</span>
          <div className="text-2xl sm:text-3xl font-bold font-tabular text-[#111215]">
            {isLoadingAchievements ? '—' : stats.internationalCount}
          </div>
          <p className="text-[11px] text-[#525660] mt-1">Kejuaraan global & SEA</p>
        </div>

        <div className="p-5 sm:p-6">
          <span className="text-xs font-medium text-[#525660] block mb-1">Nasional</span>
          <div className="text-2xl sm:text-3xl font-bold font-tabular text-[#111215]">
            {isLoadingAchievements ? '—' : stats.nationalCount}
          </div>
          <p className="text-[11px] text-[#525660] mt-1">Puspresnas & Techfest</p>
        </div>
      </motion.div>

      {/* Mode Tabs and Tier Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#111215]/8 pb-4 mb-8">
        {/* Segmented Control for Mode Switch */}
        <div
          role="tablist"
          aria-label="Mode navigasi prestasi"
          className="inline-flex p-1 bg-[#111215]/4 rounded-none border border-[#111215]/6 self-start"
        >
          <button
            id="tab-hall-of-fame"
            role="tab"
            aria-selected={activeTab === 'hall-of-fame'}
            aria-controls="panel-hall-of-fame"
            type="button"
            onClick={() => setActiveTab('hall-of-fame')}
            className={`px-4 py-2 text-xs font-semibold rounded-none transition-all cursor-pointer ${
              activeTab === 'hall-of-fame'
                ? 'bg-white text-[#111215] shadow-2xs'
                : 'text-[#525660] hover:text-[#111215]'
            }`}
          >
            Hall of Fame ({achievements?.length || 0})
          </button>
          <button
            id="tab-agenda"
            role="tab"
            aria-selected={activeTab === 'agenda'}
            aria-controls="panel-agenda"
            type="button"
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2 text-xs font-semibold rounded-none transition-all cursor-pointer ${
              activeTab === 'agenda'
                ? 'bg-white text-[#111215] shadow-2xs'
                : 'text-[#525660] hover:text-[#111215]'
            }`}
          >
            Agenda Kompetisi ({competitions?.length || 0})
          </button>
        </div>

        {/* Tier Filters for Hall of Fame */}
        {activeTab === 'hall-of-fame' && (
          <div role="group" aria-label="Filter tingkat kejuaraan" className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {tiers.map((tier) => {
              const isActive = activeTier === tier
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveTier(tier)}
                  className={`px-3 py-1.5 rounded-none text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#111215] text-[#F4F1EB]'
                      : 'text-[#525660] hover:text-[#111215] hover:bg-[#111215]/4'
                  }`}
                >
                  {tier === 'ALL' ? 'Semua Tingkat' : tier}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* TAB 1: Hall of Fame */}
      {activeTab === 'hall-of-fame' && (
        <div id="panel-hall-of-fame" role="tabpanel" aria-labelledby="tab-hall-of-fame">
          {/* Cards Grid / Skeletons */}
          {isLoadingAchievements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <AchievementSkeleton key={i} />
              ))}
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="bg-white rounded-none border border-[#111215]/8 p-12 text-center shadow-2xs">
              <h3 className="text-base font-semibold text-[#111215] mb-1">
                {achievements && achievements.length === 0
                  ? 'Belum ada prestasi terdaftar'
                  : 'Belum ada prestasi pada kategori ini'}
              </h3>
              <p className="text-xs text-[#525660] mb-4">
                {achievements && achievements.length === 0
                  ? 'Informasi rekam jejak prestasi resmi NCD akan ditambahkan dan dikelola oleh administrator.'
                  : 'Pilih filter tingkat lain atau kembali ke Semua Tingkat untuk melihat seluruh rekaman kejuaraan.'}
              </p>
              {achievements && achievements.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTier('ALL')}
                  className="px-4 py-2 rounded-none text-xs font-semibold bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] transition-colors cursor-pointer"
                >
                  Tampilkan Semua Prestasi
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((item) => {
                const membersList = item.members || item.team_members || []
                const eventDisplayName = item.event_name || item.competition || ''
                const dateDisplay = item.award_date || item.date || (item.year ? String(item.year) : '')

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-none border border-[#111215]/15 p-6 shadow-2xs hover:border-[#111215] transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top: Tier & Date */}
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-[#111215]/10">
                        <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB] font-mono">
                          {item.tier}
                        </span>
                        {dateDisplay && (
                          <span className="text-[11px] font-mono text-[#525660]">
                            {dateDisplay}
                          </span>
                        )}
                      </div>

                      {/* Title & Event */}
                      <div className="mt-4">
                        <h2 className="text-base font-semibold text-[#111215] leading-snug group-hover:text-[#6456EB] transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-xs font-medium text-[#525660] mt-1">
                          {eventDisplayName}
                        </p>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-xs text-[#525660] leading-relaxed mt-3">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Team / Peraih Footer */}
                    {(item.team_name || membersList.length > 0) && (
                      <div className="mt-5 pt-3 border-t border-[#111215]/10 flex items-baseline justify-between text-xs gap-2">
                        <span className="text-[11px] text-[#525660] shrink-0 font-medium">Peraih:</span>
                        <span className="text-xs font-medium text-[#111215] text-right truncate">
                          {item.team_name || membersList.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Agenda Kompetisi */}
      {activeTab === 'agenda' && (
        <div id="panel-agenda" role="tabpanel" aria-labelledby="tab-agenda">
          {isLoadingCompetitions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <AchievementSkeleton key={i} />
              ))}
            </div>
          ) : competitions && competitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {competitions.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-white rounded-none border border-[#111215]/8 p-6 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tier & Status */}
                    <div className="flex items-center justify-between text-xs pb-3 border-b border-[#111215]/6 gap-2">
                      <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB]">
                        {comp.tier} · {comp.category}
                      </span>

                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-none tracking-tight ${
                          comp.status === 'Open Registration'
                            ? 'text-emerald-800 bg-emerald-500/10'
                            : 'text-[#525660] bg-[#111215]/6'
                        }`}
                      >
                        {comp.status}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h2 className="text-lg font-semibold text-[#111215] mb-1">
                        {comp.name}
                      </h2>
                      <p className="text-xs text-[#525660] font-medium leading-relaxed">
                        {comp.organizer}
                      </p>
                    </div>

                    <p className="text-xs text-[#525660] leading-relaxed mt-3 mb-4">
                      {comp.description}
                    </p>

                    <div className="p-3.5 bg-[#F4F1EB]/50 rounded-none border border-[#111215]/6 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#525660]">Batas Pendaftaran</span>
                        <span className="font-semibold text-rose-700 font-tabular">
                          {comp.registration_deadline}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#525660]">Jadwal Pelaksanaan</span>
                        <span className="font-medium text-[#111215] font-tabular">
                          {comp.event_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-[#111215]/8 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#525660] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#6456EB]" />
                      <span>Delegasi NCD Didukung</span>
                    </span>
                    {comp.url && (
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-[#6456EB] hover:text-[#4d3ecc] transition-colors gap-1 group/link cursor-pointer"
                      >
                        <span>Portal Resmi</span>
                        <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-none border border-[#111215]/8 p-12 text-center shadow-2xs">
              <h3 className="text-base font-semibold text-[#111215] mb-1">
                Belum ada agenda kompetisi aktif
              </h3>
              <p className="text-xs text-[#525660]">
                Jadwal kompetisi dan agenda lomba mendatang akan dikelola dan ditambahkan oleh administrator.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default Achievements
