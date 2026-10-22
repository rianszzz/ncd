import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, Member } from '../services/api'
import { Search, Linkedin, Github } from 'lucide-react'

export function Team() {
  const [search, setSearch] = useState('')
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL')

  const { data: members, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get<Member[]>('/public/members')
      return res.data
    },
  })

  const filtered = members?.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.position_title.toLowerCase().includes(search.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    const matchDiv = selectedDivision === 'ALL' || m.division.includes(selectedDivision)
    return matchSearch && matchDiv
  })

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-4">
          <span>Struktur Kepengurusan &amp; Direktori</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#101216] dark:text-white">
          Struktur Pengurus &amp; Talenta NCD
        </h1>
        <p className="text-sm text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed">
          Struktur organisasi kepemimpinan dan 35 anggota aktif di bawah naungan NEXA Tech Labs. Dilindungi kontrol privasi sesuai UU Perlindungan Data Pribadi (UU PDP).
        </p>
      </div>

      {/* Filter and Search Bar (Apple Segmented Bar) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-3 rounded-2xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#585E6C] dark:text-[#949BA8]" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau keahlian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#181B22] focus:border-[#6C4DF6] dark:focus:border-[#8267FF] text-[#101216] dark:text-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Executive', 'Product', 'Engineering', 'Administration', 'Treasury'].map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDivision === div
                  ? 'bg-[#101216] dark:bg-white text-white dark:text-[#101216] shadow-xs'
                  : 'text-[#585E6C] dark:text-[#949BA8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {div === 'ALL' ? 'Semua Divisi' : div}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#585E6C] dark:text-[#949BA8]">
          Memuat direktori talenta...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered?.map((m) => (
            <div
              key={m.id}
              className="bg-white dark:bg-[#101216]/80 rounded-3xl border border-[#101216]/8 dark:border-white/10 p-6 shadow-xs hover:border-[#6C4DF6]/40 dark:hover:border-[#8267FF]/40 transition-all flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden bg-black/5 mb-4 p-0.5 border-2 border-[#6C4DF6]/20 dark:border-[#8267FF]/20 group-hover:border-[#6C4DF6] dark:group-hover:border-[#8267FF] transition-colors">
                <img
                  src={m.avatar_url}
                  alt={m.full_name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-1.5 uppercase tracking-wider">
                {m.position_title}
              </div>

              <h3 className="font-bold text-base text-[#101216] dark:text-white leading-snug">
                {m.full_name}
              </h3>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-0.5 font-medium">
                {m.major} • {m.generation}
              </p>

              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed flex-1 italic">
                "{m.bio}"
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap justify-center gap-1 mt-4 mb-4">
                {m.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#101216]/5 dark:bg-white/5 text-[#101216] dark:text-white"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-3 border-t border-[#101216]/6 dark:border-white/10 w-full flex items-center justify-center space-x-3 text-[#585E6C] dark:text-[#949BA8]">
                {m.linkedin_url && (
                  <a
                    href={m.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#6C4DF6] dark:hover:text-[#8267FF] transition-colors p-1"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {m.github_url && (
                  <a
                    href={m.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#101216] dark:hover:text-white transition-colors p-1"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
