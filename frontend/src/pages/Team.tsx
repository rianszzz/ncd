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
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-4 border border-[#6C4DF6]/20 apple-caption">
          <span>Struktur Kepengurusan &amp; Direktori</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold apple-display text-[#101216] dark:text-white">
          Struktur Pengurus &amp; Talenta NCD
        </h1>
        <p className="text-sm text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed apple-body">
          Struktur organisasi kepemimpinan dan 35 anggota aktif di bawah naungan NEXA Tech Labs. Dilindungi kontrol privasi sesuai UU Perlindungan Data Pribadi (UU PDP).
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-4 rounded-3xl apple-surface">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#585E6C] dark:text-[#949BA8]" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau keahlian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-black/5 dark:bg-white/5 border border-transparent focus:bg-white dark:focus:bg-[#101216] focus:border-[#6C4DF6] dark:focus:border-[#8267FF] outline-none text-[#101216] dark:text-white transition-all placeholder:text-[#585E6C]/60 dark:placeholder:text-[#949BA8]/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Executive', 'Product', 'Engineering', 'Administration', 'Treasury'].map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedDivision === div
                  ? 'bg-[#6C4DF6] text-white shadow-xs font-semibold'
                  : 'bg-black/5 dark:bg-white/5 text-[#585E6C] dark:text-[#949BA8] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {div === 'ALL' ? 'Semua Divisi' : div}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-sm text-[#585E6C] dark:text-[#949BA8]">
          Memuat data pengurus dan direktori anggota...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered?.map((m) => (
            <div
              key={m.id}
              className="rounded-3xl apple-surface p-5 flex flex-col items-center text-center group hover:shadow-md transition-shadow duration-200"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/5 dark:bg-white/5 mb-4 p-0.5 border border-[#6C4DF6]/20">
                <img
                  src={m.avatar_url}
                  alt={m.full_name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-1.5 uppercase tracking-wider">
                {m.position_title}
              </div>

              <h3 className="font-bold text-base text-[#101216] dark:text-white leading-snug">
                {m.full_name}
              </h3>
              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-0.5">{m.major} • {m.generation}</p>

              <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed flex-1 italic apple-body">
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
                    title="LinkedIn"
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
                    title="GitHub"
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
