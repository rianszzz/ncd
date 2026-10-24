import { useQuery } from '@tanstack/react-query'
import { api, HistoryItem } from '../services/api'
import { CheckCircle2 } from 'lucide-react'

const MISSIONS = [
  {
    title: 'Ekosistem Pembelajaran Mandiri',
    desc: 'Mengakselerasi kurikulum rekayasa terarah bagi talenta mahasiswa lintas disiplin teknologi.',
  },
  {
    title: 'Produk Digital Berdampak',
    desc: 'Membangun perangkat lunak mandiri yang dapat diadopsi publik dan mitra industri secara nyata.',
  },
  {
    title: 'Transparansi Finansial Radikal',
    desc: 'Menerapkan tata kelola kas 100% terbuka dengan mekanisme maker-checker tanpa kompromi.',
  },
  {
    title: 'Reputasi Kompetitif Nasional & Global',
    desc: 'Mengirimkan delegasi talenta berprestasi untuk bersaing di pagelaran kejuaraan teknologi bergengsi.',
  },
]

export function About() {
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
      <div className="mb-10 md:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Tentang Organisasi NCD
        </h1>
        <p className="text-xs sm:text-sm text-[#525660] mt-2.5 leading-relaxed max-w-2xl">
          Mengenal visi, mandat operasional, kemitraan strategis di bawah naungan NEXA Tech Labs, serta lini masa perkembangan komunitas.
        </p>
      </div>

      {/* Vision & Mission Segmented Block */}
      <div className="bg-white rounded-2xl border border-[#111215]/8 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#111215]/8 mb-12 overflow-hidden shadow-2xs">
        {/* Visi (5 cols) */}
        <div className="p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB] block mb-2">
              Visi Utama
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111215] leading-snug">
              Inkubasi rekayasa teknologi mahasiswa berdaya saing global dan berintegritas radikal.
            </h2>
            <p className="text-xs sm:text-sm text-[#525660] mt-3 leading-relaxed">
              Menjadi wadah rekayasa teknologi mahasiswa terdepan yang melahirkan inovasi digital berdampak nyata, berlandaskan prinsip tata kelola kas terbuka, dan diakui di kancah nasional maupun internasional.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[#111215]/6 flex items-center gap-2 text-xs text-[#525660]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Fokus pada kualitas rekayasa, tata kelola, dan etika profesional</span>
          </div>
        </div>

        {/* Misi (7 cols) */}
        <div className="p-6 sm:p-8 lg:col-span-7">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB] block mb-4">
            Pilar Misi Strategis
          </span>
          <div className="space-y-4">
            {MISSIONS.map((m, idx) => (
              <div key={idx} className="flex items-start gap-3.5 text-xs sm:text-sm">
                <span className="font-semibold text-[#6456EB] font-tabular shrink-0 text-xs mt-0.5">
                  0{idx + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-[#111215]">{m.title}</h3>
                  <p className="text-xs text-[#525660] mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Naungan & Kemitraan NEXA Tech Labs */}
      <div className="bg-white rounded-2xl border border-[#111215]/8 p-6 sm:p-8 mb-14 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl text-left">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB] block mb-1.5">
            Naungan & Standarisasi Resmi
          </span>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111215]">
            Di Bawah Bimbingan Riset NEXA Tech Labs
          </h2>
          <p className="text-xs sm:text-sm text-[#525660] mt-2 leading-relaxed">
            NCD beroperasi di bawah supervisi riset dan standarisasi rekayasa NEXA Tech Labs. Kolaborasi ini menjamin setiap arsitektur kode, kepatuhan keamanan data privasi, dan alur kerja keorganisasian memenuhi standar profesional industri.
          </p>
        </div>

        <div className="shrink-0 p-5 rounded-xl bg-[#F4F1EB]/60 border border-[#111215]/6 text-left sm:text-center min-w-[220px]">
          <div className="text-xs font-semibold text-[#111215]">NEXA Tech Labs</div>
          <div className="text-[11px] text-[#525660] mt-0.5">R&D & Incubation Entity</div>
          <div className="mt-3 pt-2.5 border-t border-[#111215]/6 text-[10px] text-[#6456EB] font-semibold tracking-wider uppercase">
            Afiliasi Terverifikasi
          </div>
        </div>
      </div>

      {/* Perjalanan Organisasi (Timeline) */}
      <div className="text-left">
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
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-6 shadow-2xs animate-pulse flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <div className="w-28 h-4 rounded bg-[#111215]/8" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-5 rounded bg-[#111215]/10" />
                  <div className="w-full h-4 rounded bg-[#111215]/6" />
                </div>
              </div>
            ))
          ) : (
            history?.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-6 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6"
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
      </div>
    </div>
  )
}
export default About