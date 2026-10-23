import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Github, Linkedin } from 'lucide-react'
import { api, Member } from '../services/api'

export function Team() {
  const [activeDivision, setActiveDivision] = useState<string>('ALL')

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

  const divisions = [
    'ALL',
    'Executive Committee',
    'Engineering & Infrastructure',
    'Product & Operations',
    'Content & Projects',
    'Administration & Records',
    'Administration & Correspondence',
    'Treasury & Kas Maker',
    'Audit & Kas Checker',
  ]

  const filtered = members?.filter((m) =>
    activeDivision === 'ALL' ? true : m.division === activeDivision
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-left">
      {/* Title */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Pengurus dan Kontributor
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Struktur organisasi Nusantara Cyber Developer beranggotakan mahasiswa yang aktif mengembangkan sistem dan menjalankan tata kelola komunitas.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-4 mb-10 text-xs no-scrollbar">
        {divisions.map((div) => (
          <button
            key={div}
            onClick={() => setActiveDivision(div)}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeDivision === div
                ? 'bg-[#111215] text-[#F4F1EB] shadow-2xs'
                : 'bg-white text-[#525660] hover:text-[#111215] border border-[#111215]/8'
            }`}
          >
            {div === 'ALL' ? 'Semua Divisi' : div}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#525660]">Memuat daftar anggota...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered?.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-[#111215]/8 p-6 shadow-2xs hover:border-[#111215]/20 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#111215] text-[#F4F1EB] mb-4 flex items-center justify-center font-bold text-base tracking-tight border border-[#111215]/10 shadow-2xs">
                {m.nickname.slice(0, 2).toUpperCase()}
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#111215]/5 text-[#111215] mb-2 uppercase tracking-wider">
                {m.position_title}
              </div>

              <h3 className="font-semibold text-base text-[#111215] leading-snug">
                {m.full_name}
              </h3>
              <p className="text-xs text-[#7E8492] mt-0.5">{m.major} • {m.generation}</p>

              {m.bio ? (
                <p className="text-xs text-[#525660] mt-3 leading-relaxed flex-1">
                  {m.bio}
                </p>
              ) : (
                <div className="flex-1" />
              )}

              <div className="w-full pt-4 mt-4 border-t border-[#111215]/8 flex flex-col gap-2">
                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {m.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F4F1EB] text-[#525660] border border-[#111215]/6"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-center space-x-3 mt-1 text-[#7E8492]">
                  {m.github_url && (
                    <a
                      href={m.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#111215] transition-colors"
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
                      className="hover:text-[#111215] transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
