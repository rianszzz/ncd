import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-6 py-20 text-center">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* Subtle 404 Watermark */}
        <div className="text-8xl sm:text-9xl font-bold tracking-tighter text-[#111215]/10 font-tabular select-none leading-none mb-2">
          404
        </div>

        <div className="w-12 h-12 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex items-center justify-center text-[#6456EB] mb-5">
          <Compass className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111215]">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-xs sm:text-sm text-[#525660] mt-3 leading-relaxed max-w-sm">
          Tautan yang Anda tuju mungkin telah berpindah alamat, dinonaktifkan, atau salah pengetikan URL.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-[#111215] text-[#F4F1EB] text-xs font-medium hover:bg-[#252830] transition-all flex items-center space-x-2 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-xl bg-white border border-[#111215]/12 text-[#111215] text-xs font-medium hover:bg-[#111215]/5 transition-all shadow-2xs"
          >
            Katalog Proyek
          </Link>
        </div>
      </div>
    </div>
  )
}
