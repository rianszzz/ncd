import { Shield, FileText, CheckCircle, Award } from 'lucide-react'

export function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-left">
      <div className="mb-10 md:mb-12 text-center md:text-left border-b border-[#111215]/8 pb-6 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111215]">
          Syarat & Ketentuan (Terms & Conditions)
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed">
          Terakhir diperbarui: 23 Oktober 2026 • Berlaku bagi seluruh anggota aktif, pengurus, mitra riset, dan pengguna layanan publik NCD.
        </p>
      </div>

      <div className="space-y-8 md:space-y-10 text-xs md:text-sm text-[#525660] leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-5 sm:p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <FileText className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">1. Ketentuan Umum & Kelembagaan</h2>
          </div>
          <p className="mb-2">
            NEXA Community Development (NCD) adalah entitas inkubasi rekayasa perangkat lunak mandiri mahasiswa di bawah naungan NEXA Tech Labs. Akses dan keikutsertaan dalam seluruh inisiatif NCD diatur oleh ketentuan ini.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Setiap anggota yang terdaftar wajib mematuhi standar keorganisasian dan kode etik rekayasa teknologi.</li>
            <li>Status keanggotaan bersifat non-komersial dan berfokus pada riset, inkubasi karya nyata, dan pembinaan prestasi.</li>
            <li>Pengurus berhak meninjau status keaktifan anggota secara berkala sesuai evaluasi kontribusi proyek.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-5 sm:p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Award className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">2. Hak Kekayaan Intelektual & Lisensi Kode</h2>
          </div>
          <p className="mb-2">
            Karya perangkat lunak yang dikembangkan dalam ekosistem inkubasi NCD menjunjung tinggi transparansi dan prinsip open-source:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Karya riset dan repositori publik dirilis di bawah lisensi terbuka (default: MIT License atau Apache 2.0) kecuali dinyatakan lain dalam perjanjian spesifik proyek.</li>
            <li>Kontributor mempertahankan hak moral atas kode yang mereka ciptakan, dengan atribusi yang jelas pada berkas README dan dokumentasi proyek.</li>
            <li>Dilarang keras melakukan plagiarisme kode, pelanggaran lisensi pihak ketiga, atau penggunaan aset tanpa izin tertulis.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-5 sm:p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Shield className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">3. Tata Kelola Finansial & Kas Terbuka</h2>
          </div>
          <p className="mb-2">
            NCD menerapkan standar transparansi kas tanpa kompromi melalui sistem Maker-Checker berjenjang:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Pencatatan kas dilakukan oleh Bendahara I (Maker) dan wajib disahkan dengan verifikasi faktual oleh Bendahara II (Checker).</li>
            <li>Setiap pengeluaran kas wajib disertai bukti nota / transfer fisik yang sah dan dapat diaudit secara terbuka oleh seluruh anggota aktif.</li>
            <li>Data mutasi buku kas bersifat permanen (*immutable*). Transaksi yang salah tidak dihapus, melainkan ditandai VOID dan dicatat dalam audit trail.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-5 sm:p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <CheckCircle className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">4. Perubahan Ketentuan</h2>
          </div>
          <p>
            NCD berhak memperbarui dokumen Syarat & Ketentuan ini sewaktu-waktu guna menyesuaikan dengan regulasi hukum yang berlaku dan kebijakan NEXA Tech Labs. Perubahan substansial akan diumumkan melalui kanal komunikasi resmi organisasi.
          </p>
        </section>
      </div>
    </div>
  )
}
