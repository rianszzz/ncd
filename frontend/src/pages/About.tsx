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
    <div className="w-full flex flex-col items-center">
      {/* Top Section */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-20 pb-16 text-left">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
            Visi, Integritas & Jejak NCD
          </h1>
          <p className="text-sm md:text-base text-[#525660] mt-3.5 leading-relaxed">
            NEXA Community Development (NCD) adalah badan inkubasi teknologi mahasiswa di bawah naungan NEXA Tech Labs.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-5">
              <Target className="w-5 h-5 text-[#6456EB]" />
            </div>
            <h2 className="text-lg font-semibold text-[#111215] mb-2.5">Visi Utama</h2>
            <p className="text-xs md:text-sm text-[#525660] leading-relaxed flex-1">
              Menjadi komunitas rekayasa teknologi mahasiswa terdepan dan tepercaya yang melahirkan inovasi digital berdampak nyata, berintegritas tata kelola kas terbuka, dan diakui di kancah nasional maupun internasional.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center text-[#111215] mb-5">
              <Compass className="w-5 h-5 text-[#6456EB]" />
            </div>
            <h2 className="text-lg font-semibold text-[#111215] mb-2.5">Misi Strategis</h2>
            <ul className="text-xs md:text-sm text-[#525660] space-y-2 leading-relaxed flex-1 list-disc pl-4">
              <li>Menyediakan ekosistem pembelajaran teknologi terarah bagi talenta mahasiswa.</li>
              <li>Mengembangkan produk perangkat lunak mandiri yang dapat digunakan oleh publik dan mitra industri.</li>
              <li>Menerapkan transparansi finansial 100% dengan prinsip Maker-Checker tanpa kompromi.</li>
              <li>Mengirim delegasi berprestasi pada kejuaraan kompetisi teknologi bergengsi.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Naungan NEXA Tech Labs (Full-width banner dari ujung kiri ke ujung kanan) */}
      <section className="w-full bg-[#111215] text-white border-y border-white/10 shadow-md py-16 md:py-20 my-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-left">
            <div className="text-[11px] font-semibold text-[#7A6EFF] uppercase tracking-wider mb-2">
              Hubungan Kelembagaan
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F4F1EB]">
              Di Bawah Naungan Resmi NEXA Tech Labs
            </h3>
            <p className="text-xs md:text-sm text-[#9FA5B5] mt-3 leading-relaxed">
              NCD beroperasi di bawah bimbingan riset dan standarisasi kualitas NEXA Tech Labs. Sinergi ini memastikan setiap arsitektur kode, kepatuhan data privasi, dan alur kerja keorganisasian memenuhi standar profesional industri.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center min-w-[220px]">
            <Award className="w-8 h-8 text-[#7A6EFF] mx-auto mb-2" />
            <div className="text-sm font-semibold text-[#F4F1EB]">NEXA Tech Labs</div>
            <div className="text-[10px] text-[#9FA5B5] mt-1">Innovation & Research Entity</div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-10 pb-24 text-left">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-[#111215]">Perjalanan & Milestone Organisasi</h2>
            <p className="text-xs text-[#525660] mt-1">Jejak pembentukan NCD dari awal pendirian hingga sekarang</p>
          </div>

          <div className="relative border-l border-[#111215]/15 ml-6 pl-8 space-y-10">
            {history?.map((item) => (
              <div key={item.id} className="relative group">
                <div className="absolute -left-[38px] top-1.5 w-4 h-4 rounded-full bg-[#F4F1EB] border-3 border-[#6456EB] shadow-2xs"></div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-[#6456EB] mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.month} {item.year}</span>
                </div>
                <h3 className="text-base font-semibold text-[#111215]">{item.title}</h3>
                <p className="text-xs text-[#525660] mt-1.5 leading-relaxed bg-white p-4 rounded-xl border border-[#111215]/8 shadow-2xs">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
