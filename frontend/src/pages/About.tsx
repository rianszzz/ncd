import { useQuery } from '@tanstack/react-query'
import { api, HistoryItem } from '../services/api'
import { Target, Compass, Award, Calendar } from 'lucide-react'

export function About() {
  const { data: history } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await api.get<HistoryItem[]>('/public/history')
      return res.data
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] mb-4">
          <span>Tentang Komunitas</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#101216]">
          Visi, Integritas & Jejak NCD
        </h1>
        <p className="text-sm text-[#585E6C] mt-3 leading-relaxed">
          NEXA Community Development (NCD) adalah badan inkubasi teknologi mahasiswa di bawah naungan NEXA Tech Labs.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="p-8 rounded-3xl bg-white border border-[#101216]/10 shadow-xs flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-5">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#101216] mb-3">Visi Utama</h2>
          <p className="text-sm text-[#585E6C] leading-relaxed flex-1">
            Menjadi komunitas rekayasa teknologi mahasiswa terdepan dan tepercaya yang melahirkan inovasi digital berdampak nyata, berintegritas tata kelola kas terbuka, dan diakui di kancah nasional maupun internasional.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-[#101216]/10 shadow-xs flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6]/10 flex items-center justify-center text-[#6C4DF6] mb-5">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#101216] mb-3">Misi Strategis</h2>
          <ul className="text-xs text-[#585E6C] space-y-2.5 leading-relaxed flex-1 list-disc pl-4">
            <li>Menyediakan ekosistem pembelajaran teknologi terarah bagi 35 talenta mahasiswa.</li>
            <li>Mengembangkan produk perangkat lunak mandiri yang dapat digunakan oleh publik dan mitra industri.</li>
            <li>Menerapkan transparansi finansial 100% dengan prinsip Maker-Checker tanpa kompromi.</li>
            <li>Mengirim delegasi berprestasi pada kejuaraan kompetisi teknologi bergengsi.</li>
          </ul>
        </div>
      </div>

      {/* Naungan NEXA Tech Labs */}
      <div className="rounded-3xl bg-[#101216] text-[#F4F1EA] p-8 md:p-12 mb-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <div className="text-xs font-semibold text-[#8267FF] uppercase tracking-wider mb-2">
            Hubungan Kelembagaan
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Di Bawah Naungan Resmi NEXA Tech Labs
          </h3>
          <p className="text-xs text-[#949BA8] mt-3 leading-relaxed">
            NCD beroperasi di bawah bimbingan riset dan standarisasi kualitas NEXA Tech Labs. Sinergi ini memastikan setiap arsitektur kode, kepatuhan data privasi, dan alur kerja keorganisasian memenuhi standar profesional industri.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[220px]">
          <Award className="w-8 h-8 text-[#8267FF] mx-auto mb-2" />
          <div className="text-sm font-bold text-white">NEXA Tech Labs</div>
          <div className="text-[10px] text-[#949BA8] mt-1">Innovation & Research Entity</div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[#101216]">Perjalanan & Milestone Organisasi</h2>
          <p className="text-xs text-[#585E6C] mt-1">Jejak pembentukan NCD dari awal pendirian hingga sekarang</p>
        </div>

        <div className="relative border-l-2 border-[#6C4DF6]/20 ml-6 pl-8 space-y-12">
          {history?.map((item) => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#6C4DF6] group-hover:scale-125 transition-transform"></div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#6C4DF6] mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.month} {item.year}</span>
              </div>
              <h3 className="text-base font-bold text-[#101216]">{item.title}</h3>
              <p className="text-xs text-[#585E6C] mt-2 leading-relaxed bg-white p-4 rounded-xl border border-[#101216]/10 shadow-2xs">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
