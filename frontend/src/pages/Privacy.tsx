import { Lock, Database, Eye, UserCheck, Mail } from 'lucide-react'

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-left">
      <div className="mb-12 text-center md:text-left border-b border-[#111215]/8 pb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#111215]">
          Kebijakan Privasi (Privacy Policy)
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed">
          Terakhir diperbarui: 23 Oktober 2026 • Komitmen perlindungan hak privasi dan kerahasiaan data seluruh anggota serta pendaftar NCD.
        </p>
      </div>

      <div className="space-y-10 text-xs md:text-sm text-[#525660] leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Database className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">1. Data Pribadi yang Kami Kumpulkan</h2>
          </div>
          <p className="mb-2">
            Kami hanya mengumpulkan data yang relevan, spesifik, dan benar-benar diperlukan untuk operasional komunitas:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li><strong>Data Pendaftaran:</strong> Nama lengkap, email universitas/pribadi, nomor telepon (WhatsApp), jurusan, angkatan, tautan portofolio/GitHub, dan surat motivasi.</li>
            <li><strong>Data Profil Anggota:</strong> Nama panggilan, jabatan organisasi, foto profil, dan spesialisasi keahlian teknis untuk direktori internal.</li>
            <li><strong>Data Finansial Kas:</strong> Nama penanggung jawab transaksi (Maker / Checker / PIC kegiatan) dan bukti struk transfer sah untuk keperluan akuntabilitas audit kas terbuka.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Eye className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">2. Tujuan Pemrosesan Data</h2>
          </div>
          <p className="mb-2">
            Pemrosesan data pribadi dilakukan semata-mata atas dasar persetujuan eksplisit (*explicit consent*) untuk:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Menjalankan proses seleksi dan verifikasi calon anggota baru NCD.</li>
            <li>Menghubungkan talenta rekayasa perangkat lunak ke dalam tim proyek inkubasi yang sesuai.</li>
            <li>Menjalankan transparansi tata kelola kas internal berbasis audit trail tanpa manipulasi.</li>
            <li>Kami <strong>tidak pernah</strong> menjual, menyewakan, atau mendistribusikan data pribadi kepada pihak ketiga untuk kepentingan komersial atau periklanan.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Lock className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">3. Pengamanan & Retensi Data</h2>
          </div>
          <p className="mb-2">
            Data pribadi disimpan dalam infrastruktur terenkripsi dengan protokol keamanan standar industri:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Kredensial akun anggota di-hash secara aman menggunakan algoritma bcrypt terstandar.</li>
            <li>Akses database dibatasi secara ketat dengan prinsip *Least Privilege* dan sistem otorisasi berbasis peran (RBAC).</li>
            <li>Data pelamar yang tidak lolos seleksi akan dianonimkan atau dihapus dalam jangka waktu wajar setelah siklus rekrutmen selesai.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-white p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <UserCheck className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">4. Hak Pemilik Data Pribadi</h2>
          </div>
          <p className="mb-2">
            Sesuai UU Perlindungan Data Pribadi (UU PDP), Anda memiliki hak penuh untuk:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#525660]">
            <li>Meminta akses dan salinan atas data pribadi yang tersimpan dalam sistem NCD.</li>
            <li>Memperbarui atau mengoreksi ketidakakuratan data profil Anda.</li>
            <li>Menarik persetujuan atau meminta penghapusan (*right to erasure*) data diri Anda, sepanjang tidak bertentangan dengan kewajiban pencatatan audit organisasi.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white p-7 rounded-2xl border border-[#111215]/8 shadow-2xs">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#111215]/5 flex items-center justify-center text-[#111215]">
              <Mail className="w-4 h-4 text-[#6456EB]" />
            </div>
            <h2 className="text-base font-semibold text-[#111215]">5. Kontak Petugas Perlindungan Data</h2>
          </div>
          <p>
            Apabila Anda memiliki pertanyaan, keluhan, atau ingin melaksanakan hak perlindungan data pribadi Anda, hubungi tim tata kelola privasi kami di:
            <br />
            <strong>Email:</strong> <span className="text-[#6456EB] font-medium">privacy@nexatechlabs.my.id</span>
            <br />
            <strong>Alamat:</strong> NEXA Tech Labs Ecosystem, Universitas Gunadarma, Indonesia.
          </p>
        </section>
      </div>
    </div>
  )
}
