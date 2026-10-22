# REQUIREMENTS SPECIFICATION — Website NCD (NEXA Community Development)

| Dokumen | Spesifikasi Kebutuhan Sistem (SRS) |
| :--- | :--- |
| **Versi** | 2.0.0 (Decoupled Go + React Architecture) |
| **Status** | Disetujui Berdasarkan PRD v0.1 & Pembaruan Tech Stack |
| **Arsitektur** | Decoupled Monorepo: Frontend React (Vite) + Backend Go (Chi/Gin + pgx/sqlc) + Supabase Postgres |

---

## 1. Pendahuluan & Lingkup Sistem

Website NCD adalah platform terpadu dengan arsitektur **"Satu Platform, Dua Wajah"**:
1. **Public Showcase (Sisi Publik)**: Etalase organisasi modern untuk membangun kredibilitas, memamerkan portofolio, mempublikasikan prestasi, dan menyaring pendaftar anggota baru.
2. **Member Portal (Sisi Internal - `/app/*`)**: Workspace terproteksi untuk kolaborasi 35 anggota NCD, manajemen proyek/lomba, transparansi kas dengan tata kelola *Maker-Checker*, serta repositori aset organisasi.

### Batasan Sistem (Non-Goals V1)
- Tidak melayani e-commerce/penjualan merchandise langsung.
- Tidak menyediakan payment gateway otomatis pada V1 (iuran dan kas murni pencatatan berbasis bukti transfer/nota; integrasi gateway dijadwalkan pada roadmap masa depan).
- Tidak membangun aplikasi mobile native terpisah (web dibuat responsif penuh / Progressive Web App).
- Tidak menyediakan live chat instan mandiri (komunikasi real-time diarahkan melalui tautan Discord/WhatsApp resmi).

---

## 2. Kebutuhan Fungsional (Functional Requirements)

Prioritas implementasi:
- **P0 (Critical / Launch Blocker)**: Harus selesai dan lulus UAT sebelum peluncuran resmi.
- **P1 (High / Post-Launch Sprint 1)**: Dituntaskan segera setelah peluncuran V1.
- **P2 (Medium / Nice-to-Have)**: Diselesaikan pada siklus iterasi berikutnya.

### 2.1 Modul Autentikasi, Akun & Otorisasi (FR-AUTH)

| Kode FR | Prioritas | Deskripsi & Aturan Bisnis | Kriteria Penerimaan (Acceptance Criteria) |
| :--- | :---: | :--- | :--- |
| **FR-AUTH-01** | P0 | **Metode Login Multi-Faktor**: Login menggunakan email + password dengan opsi Google SSO. Backend Go memvalidasi kredensial langsung terhadap tabel pengguna di Supabase PostgreSQL. | - Login gagal jika email belum terdaftar di database.<br>- Password diverifikasi menggunakan hashing aman (`bcrypt` / `argon2id`). |
| **FR-AUTH-02** | P0 | **Invite-Only Registration**: Tidak ada halaman registrasi publik mandiri. Akun anggota dibuat oleh Super Admin via link token undangan berbatas waktu (48 jam). | - URL pendaftaran unik per token: `/register?token=...`.<br>- Token kadaluarsa otomatis setelah 48 jam atau sekali pakai. |
| **FR-AUTH-03** | P0 | **Manajemen Sesi & Pemulihan Akun**: Sesi dikelola via Go JWT terenkripsi yang disimpan dalam cookie `httpOnly`, `Secure`, `SameSite=Strict`. Reset password via email bertoken. | - Percobaan login dibatasi oleh rate-limiter di Go middleware (maksimal 5x gagal per 15 menit per IP).<br>- Token reset password kedaluwarsa setelah 1 jam. |
| **FR-AUTH-04** | P0 | **Role-Based Access Control (RBAC)**: Validasi otorisasi di sisi server Go melalui middleware handler untuk 6 role inti (Visitor, Member, Sekretaris, Bendahara I, Bendahara II, Super Admin). | - Request ditolak dengan kode status HTTP `403 Forbidden` jika pengguna tidak memiliki wewenang role.<br>- Frontend React menyelaraskan visibilitas tombol/menu berdasarkan role. |
| **FR-AUTH-05** | P1 | **Two-Factor Authentication (2FA / TOTP)**: 2FA berbasis TOTP (Google Authenticator) wajib diaktifkan bagi role Super Admin, Bendahara I, dan Bendahara II. | - Prompt TOTP divalidasi di Go setelah verifikasi password utama bagi admin.<br>- Kunci pemulihan cadangan disediakan saat aktivasi 2FA. |
| **FR-AUTH-06** | P0 | **Audit Trail Sesi & Aksi Kritis**: Setiap sesi masuk, mutasi data kas, dan pergantian role wajib dicatat oleh Go Service ke tabel `audit_logs` di Postgres. | - Data log mencakup: `user_id`, `ip_address`, `action`, `target_table`, `previous_state`, `new_state`, `timestamp`. |
| **FR-AUTH-07** | P0 | **Offboarding Aman (Soft-Deactivation)**: Admin dapat menonaktifkan status anggota tanpa menghapus riwayat proyek, kontribusi, atau catatan transaksi masa lalunya. | - Pengguna dengan `is_active = false` ditolak oleh middleware auth Go.<br>- Seluruh data histori anggota tetap utuh di database. |

---

### 2.2 Modul Publik (FR-PUB)

| Kode FR | Prioritas | Deskripsi & Aturan Bisnis | Kriteria Penerimaan |
| :--- | :---: | :--- | :--- |
| **FR-PUB-01** | P0 | **Beranda Dinamis**: Menampilkan hero section, tagline NCD, badge naungan NEXA Tech Labs, ringkasan statistik agregat dari endpoint `GET /api/v1/public/stats`, highlight proyek pilihan, dan CTA rekrutmen. | - Angka statistik sinkron real-time dengan data Postgres aktual.<br>- Banner naungan NEXA Tech Labs memuat logo resmi dan tautan keluar. |
| **FR-PUB-02** | P0 | **Tentang NCD & Timeline Sejarah**: Halaman narasi visi, misi, nilai organisasi, dan timeline interaktif perjalanan NCD dari waktu ke waktu (`/about`, `/history`). | - Item timeline tersortir kronologis (tahun/bulan), memiliki foto, judul, dan penjelasan dari database. |
| **FR-PUB-03** | P0 | **Struktur Organisasi & Direktori Anggota**: Diagram hierarki pengurus (Chairman hingga Bendahara) dan galeri 35 anggota dengan fitur pencarian dan filter keahlian/angkatan. | - Kontrol Privasi: Hanya nama, foto, jabatan, divisi, dan tautan sosial publik yang tampil. Kontak pribadi (telepon/email pribadi) dirahasiakan.<br>- Gambar teroptimasi otomatis dalam format WebP/AVIF. |
| **FR-PUB-04** | P0 | **Katalog Proyek Publik**: Daftar karya teknologi NCD yang telah diberi flag `is_public = true`, lengkap dengan tech stack badge, screenshot, dan link repositori/demo. | - Proyek internal yang belum di-flag publik tidak boleh bocor ke API publik.<br>- Halaman detail memuat deskripsi lengkap dan kontributor anggota. |
| **FR-PUB-05** | P0 | **Hall of Fame Kompetisi & Prestasi**: Showcase riwayat keikutsertaan kompetisi teknologi dan pencapaian juara (kampus, nasional, internasional). | - Menampilkan nama tim, tahun perolehan, badge juara/finalis, dan dokumentasi foto/sertifikat. |
| **FR-PUB-06** | P0 | **Warta & Artikel Publik**: Artikel blog teknologi dan berita kegiatan NCD yang diatur oleh tim Sekretaris dengan dukungan rich-text Markdown, kategori, dan SEO metadata. | - Slug URL yang bersih (`/news/[slug]`), meta tag OpenGraph dan Twitter Card valid. |
| **FR-PUB-07** | P0 | **Formulir Pendaftaran Terbuka (Join Us)**: Form rekrutmen calon anggota dengan proteksi spam (honeypot + captcha), validasi skema frontend (Zod), dan pengiriman ke `POST /api/v1/public/apply`. | - Data tersimpan di antrean pendaftar portal internal.<br>- Pengirim menerima konfirmasi email otomatis bahwa formulir telah diterima. |
| **FR-PUB-08** | P0 | **Ringkasan Kode Etik & Regulasi Publik**: Halaman ringkas yang merangkum nilai dan tata tertib umum komunitas yang dapat diakses publik. | - Menyediakan tombol unduh ringkasan dokumen resmi dalam format PDF. |

---

### 2.3 Modul Portal Internal / Member Hub (FR-PORTAL)

| Kode FR | Prioritas | Deskripsi & Aturan Bisnis | Kriteria Penerimaan |
| :--- | :---: | :--- | :--- |
| **FR-PORTAL-01**| P0 | **Dashboard Personal**: Dashboard individual per anggota berisi widget pengumuman internal terbaru (pinned), daftar tugas dan deadline terdekat, riwayat kas ringkas, dan agenda mendatang. | - Pengurus mendapatkan widget tambahan: pendaftar baru yang butuh review, transaksi kas pending verifikasi, dan proyek berisiko. |
| **FR-PORTAL-02**| P0 | **Manajemen Proyek Internal**: Pelacakan status proyek multi-tahap (*Ide → Aktif → Review → Selesai → Arsip*), penunjukan PIC, anggota pelaksana, dan persentase progres. | - Tersedia tampilan Kanban Board dan List View.<br>- Fitur P1: Komentar aktivitas pada kartu proyek. |
| **FR-PORTAL-03**| P0 | **Tracker Kompetisi Internal**: Pencatatan keikutsertaan lomba, jadwal deadline pendaftaran dan submisi berkas, anggota delegasi, dan status keikutsertaan. | - Notifikasi pengingat H-7 dan H-3 deadline via email/dashboard (P1). |
| **FR-PORTAL-04**| P0 | **Pusat Regulasi Organisasi**: Dokumen lengkap AD/ART, aturan sanksi, dan pedoman divisi dengan sistem penomoran versi (versioning) dan tanggal berlaku. | - Dilengkapi viewer PDF terintegrasi dan opsi unduh offline. |
| **FR-PORTAL-05**| P0 | **Pengumuman Internal**: Publikasi warta khusus anggota oleh Sekretaris atau Super Admin dengan penandaan prioritas (*pinned*). | - Fitur P1: Tracking "sudah dibaca" per akun anggota. |
| **FR-PORTAL-06**| P1 | **Agenda & Kalender Terpusat**: Kalender kegiatan (rapat, workshop, sprint, deadline lomba) yang mendukung ekspor feed format iCalendar (`.ics`). | - Kompatibel disinkronkan ke Google Calendar / Apple Calendar. |
| **FR-PORTAL-07**| P1 | **Arsip Dokumen Terstruktur**: Tempat penyimpanan terpusat untuk notulen rapat, LPJ acara, proposal sponsorship, dan template surat dengan hak akses berbasis role. | - Berkas tersimpan di penyimpanan cloud terproteksi (Supabase Storage bucket privat). |

---

### 2.4 Modul Transparansi Kas & Finansial (FR-FIN) — Fitur Kunci

| Kode FR | Prioritas | Deskripsi & Aturan Bisnis | Kriteria Penerimaan |
| :--- | :---: | :--- | :--- |
| **FR-FIN-01** | P0 | **Prinsip Maker-Checker Transaksi Kas**: Pemisahan wewenang bendahara: Bendahara I bertindak sebagai pembuat draft transaksi (*maker*), Bendahara II bertindak sebagai verifikator/penyetuju (*checker*). | - Transaksi kas tidak mempengaruhi saldo resmi sebelum diubah statusnya menjadi `VERIFIED` oleh Bendahara II.<br>- Backend Go memvalidasi bahwa `maker_id != verifier_id`. |
| **FR-FIN-02** | P0 | **Audit Trail Mutasi (Anti-Delete / Immutability)**: Transaksi kas yang sudah tersimpan dilarang dihapus permanen. Endpoint `DELETE` tidak disediakan. Pembatalan transaksi wajib via `POST /api/v1/finance/transactions/{id}/void` dengan menyertakan alasan. | - Data mutasi yang di-void tetap tampil di riwayat dengan coretan status merah dan alasan pembatalan tercatat.<br>- Saldo kas terkoreksi otomatis dalam satu transaksi SQL atomik. |
| **FR-FIN-03** | P0 | **Bukti Digital Transaksi Wajib**: Setiap pengeluaran atau pemasukan wajib melampirkan berkas bukti sah (struk belanja, nota, bukti transfer bank) yang diunggah ke Supabase Storage. | - Go Handler menolak request pembuatan mutasi jika URL bukti nota kosong. |
| **FR-FIN-04** | P0 | **Transparansi Buku Kas untuk Seluruh Anggota**: Semua 35 anggota NCD memiliki hak melihat (*read-only*) rekapitulasi saldo, arus kas masuk/keluar, rincian kategori, dan bukti nota. | - Data kas terbuka secara jujur untuk seluruh anggota aktif guna mencegah manipulasi internal. |
| **FR-FIN-05** | P0 | **Buku Iuran Anggota & Proteksi Privasi**: Pelacakan status iuran per anggota per periode.<br>*Privasi*: Anggota hanya dapat melihat histori iuran miliknya sendiri; hanya bendahara dan Super Admin yang dapat melihat matriks iuran seluruh anggota. | - Query database Go menyaring data iuran: jika bukan pengurus keuangan/super admin, query otomatis membatasi `WHERE member_id = current_user_member_id`. |
| **FR-FIN-06** | P0 | **Pelaporan Keuangan & Ekspor**: Ringkasan visual arus kas bulanan menggunakan grafik (Recharts di React), serta fungsi ekspor rekapan transaksi ke format PDF dan CSV. | - Format PDF menyertakan kop resmi NCD, tanggal cetak, dan status verifikasi bendahara. |
| **FR-FIN-07** | P1 | **Alur Pengajuan Dana / Reimbursement**: Anggota dapat mengajukan proposal pengeluaran dana kegiatan melalui sistem. Approval diberikan oleh Chairman/Vice Chairman, dilanjutkan pencairan oleh Bendahara. | - Siklus status: `SUBMITTED` → `APPROVED` → `DISBURSED` → `RECONCILED`. |

---

### 2.5 Modul Manajemen Pengurus & Rekrutmen (FR-ADMIN)

| Kode FR | Prioritas | Deskripsi & Aturan Bisnis | Kriteria Penerimaan |
| :--- | :---: | :--- | :--- |
| **FR-ADMIN-01**| P0 | **Pipa Seleksi Calon Anggota**: Dashboard pengurus untuk meninjau data pelamar rekrutmen dengan alur status: *Baru → Review Berkas → Wawancara → Diterima / Ditolak*. | - Dilengkapi kolom catatan penilaian internal antar pewawancara.<br>- Opsi pemicu email otomatis ke pelamar berdasarkan perubahan status. |
| **FR-ADMIN-02**| P0 | **Kontrol Periode Rekrutmen**: Super Admin dapat mengaktifkan atau menonaktifkan form pendaftaran publik dengan tombol toggle toggleable. | - Bila ditutup, form pendaftaran berganti menjadi banner informasi jadwal pembukaan berikutnya. |
| **FR-ADMIN-03**| P0 | **Manajemen Peran & Akses Pengguna**: Pengalihan jabatan (misal pergantian periode kepengurusan tahunan) dapat diubah langsung oleh Super Admin tanpa merusak data histori aktivitas. | - Penugasan role baru langsung merefleksikan izin akses pengguna seketika pada sesi berikutnya. |

---

## 3. Matriks Otorisasi & Hak Akses (RBAC Matrix)

| Entitas Data / Modul | Visitor (Publik) | Member Biasa | Sekretaris | Bendahara I | Bendahara II | Super Admin / God Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Halaman Web Publik** | Baca | Baca | Baca | Baca | Baca | Baca |
| **Profil & Pengaturan Diri** | — | Baca & Edit Sendiri | Baca & Edit Sendiri | Baca & Edit Sendiri | Baca & Edit Sendiri | Baca & Edit Sendiri |
| **Berita & Pengumuman** | Baca (Publik) | Baca (Publik + Internal) | **CRUD** Penuh | Baca | Baca | **CRUD** Penuh |
| **Peraturan & AD/ART** | Baca (Publik) | Baca (Publik + Internal) | **CRUD** Penuh | Baca | Baca | **CRUD** Penuh |
| **Arsip Dokumen (LPJ/Notulen)** | — | Baca Sesuai Akses | **CRUD** Penuh | Baca | Baca | **CRUD** Penuh |
| **Sejarah & Pencapaian** | Baca | Baca | **CRUD** Penuh | Baca | Baca | **CRUD** Penuh |
| **Proyek & Tugas** | Baca (Publik) | Baca + Update Tugas Sendiri | Baca | Baca | Baca | **CRUD** Penuh |
| **Kompetisi & Lomba** | Baca (Publik) | Baca + Update Tim Sendiri | Baca | Baca | Baca | **CRUD** Penuh |
| **Buku Kas & Transaksi** | — | Baca Ringkasan & Mutasi | Baca Ringkasan | **Create & Draft Edit** | **Review & Verifikasi** | Baca + Void Otorisasi |
| **Buku Iuran Anggota** | — | Baca Milik Pribadi | — | Baca & Catat Bayar | Baca & Verifikasi | Baca & Kelola Penuh |
| **Pendaftar Rekrutmen** | Submit Form | — | Review & Wawancara | — | — | Keputusan Akhir & Undangan |
| **Manajemen User & Role** | — | — | — | — | — | **CRUD** Penuh |
| **System Audit Logs** | — | — | — | — | — | Baca (Read-Only) |

---

## 4. Kebutuhan Non-Fungsional (Non-Functional Requirements)

### 4.1 Kinerja (Performance - NFR-PERF)
- **NFR-PERF-01**: Nilai Google Lighthouse untuk sisi publik wajib mencapai target: **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95**.
- **NFR-PERF-02**: Core Web Vitals: Largest Contentful Paint (LCP) < 2.5 detik, Cumulative Layout Shift (CLS) < 0.1, First Input Delay (FID/INP) < 100 ms.
- **NFR-PERF-03**: Backend Go memberikan latensi respon API rata-rata < 50ms untuk endpoint data read-only berkat driver `pgx/v5` dengan *connection pooling* efisien.
- **NFR-PERF-04**: React SPA menggunakan code-splitting dinamis via `React.lazy` dan bundle Vite teroptimasi < 200KB initial chunk.

### 4.2 Keamanan & Integritas Data (Security - NFR-SEC)
- **NFR-SEC-01**: Seluruh komunikasi HTTP terenkripsi TLS 1.3 dengan header keamanan HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY.
- **NFR-SEC-02**: Proteksi autentikasi menggunakan JWT bertanda tangan HMAC-SHA256/RSA dengan masa berlaku singkat dan disimpan dalam cookie `httpOnly`, `SameSite=Strict`, `Secure`.
- **NFR-SEC-03**: Seluruh query SQL ke PostgreSQL di-generate melalui `sqlc` yang secara mandatory menggunakan parameterized queries untuk mencegah serangan SQL Injection 100%.
- **NFR-SEC-04**: Proteksi CORS di Go middleware dikonfigurasi ketat hanya mengizinkan origin domain resmi frontend.
- **NFR-SEC-05**: Proteksi form rekrutmen dari spam bot dengan honeypot tersembunyi dan verifikasi captcha token.

### 4.3 Privasi Data Sesuai Regulasi (Privacy - NFR-PRIV / UU PDP)
- **NFR-PRIV-01**: Mengakomodasi kepatuhan Undang-Undang Perlindungan Data Pribadi (UU PDP): Nomor ponsel, alamat tempat tinggal, dan status pembayaran iuran individual anggota dilarang terekspos ke publik maupun anggota umum lainnya.
- **NFR-PRIV-02**: Tersedia mekanisme persetujuan eksplisit (*opt-in consent*) bagi anggota mengenai pemajangan nama, foto, dan profil keahlian di sisi publik website.
- **NFR-PRIV-03**: Fitur ekspor data pribadi dan penghapusan token jika anggota menghendaki penarikan data publik (*right to privacy*).

### 4.4 Aksesibilitas & Responsivitas Desain (Accessibility - NFR-A11Y)
- **NFR-A11Y-01**: Memenuhi standar aksesibilitas web **WCAG 2.1 Level AA**.
- **NFR-A11Y-02**: Desain menganut prinsip *Mobile-First*, tetap proporsional dan berfungsi prima pada rentang layar terkecil 360px hingga layar desktop 4K.
- **NFR-A11Y-03**: Seluruh komponen interaktif dapat dioperasikan penuh melalui navigasi keyboard dengan penanda fokus (*focus outline*) yang jelas.
- **NFR-A11Y-04**: Format angka nominal uang pada modul kas menggunakan font dengan fitur `tabular-nums` agar sejajar dan mudah diaudit.

---

## 5. Kriteria Penerimaan Rilis V1 (Definition of Done)

Peluncuran Website NCD V1 dinyatakan selesai apabila:
1. Seluruh Kebutuhan Fungsional berprioritas **P0** beroperasi 100% tanpa celah fungsional mayor pada API Go dan React frontend.
2. Telah melalui sesi User Acceptance Testing (UAT) resmi dan disetujui bersama oleh Chairman, Vice Chairman I, serta Developer Lead.
3. Basis data PostgreSQL di Supabase telah di-seed dengan data 8 pengurus dan 27 anggota biasa (total 35 profil terverifikasi).
4. Modul kas berhasil dieksekusi oleh Bendahara I & II untuk minimal 1 siklus transaksi uji coba dan pencatatan saldo awal melalui antarmuka React dan API Go.
5. Audit keamanan mandiri menyatakan tidak ada kerentanan tingkat kritis atau tinggi (*zero critical vulnerabilities*).
6. Buku panduan singkat administrasi portal (*Admin Handbook*) telah diserahkan kepada Sekretaris dan Bendahara.
