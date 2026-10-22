# PROJECT MEMORY & DECISION LOG — Website NCD

| Metadata | Nilai |
| :--- | :--- |
| **Proyek** | Platform Resmi NEXA Community Development (NCD) |
| **Organisasi Induk** | NEXA Tech Labs |
| **Status Dokumen** | Living Knowledge Base & Decision Records |
| **Terakhir Diperbarui** | 22 Oktober 2026 |

---

## 1. Konteks Proyek & Visi

NCD (NEXA Community Development) adalah komunitas teknologi mahasiswa di bawah naungan NEXA Tech Labs yang beranggotakan 35 orang (8 pengurus inti + 27 anggota biasa). 

Tujuan pembangunan website ini adalah menghadirkan platform **"Satu Platform, Dua Wajah"**:
- **Sisi Publik**: Etalase brand yang premium, cepat, dan kredibel untuk mitra industri, calon pendaftar, dan publik luas.
- **Sisi Internal (Member Portal)**: Workspace terproteksi bagi 35 anggota untuk akuntabilitas kas terbuka (sistem *Maker-Checker*), pengelolaan proyek kolaborasi, pemantauan lomba, dan arsip keorganisasian.

---

## 2. Roster Pengurus Awal (Initial Seed Data)

| Nama | Jabatan Organisasi | Peran Sistem (System Role) | Wewenang Utama |
| :--- | :--- | :--- | :--- |
| **Rianszzz** | Lead Developer | `GOD_ADMIN` | Kendali sistem menyeluruh, arsitektur, dan bypass pemulihan darurat. |
| **Mirza Danisywar Noor Wahyu** | Chairman | `SUPER_ADMIN` | Otoritas organisasi tertinggi, persetujuan strategis, manajemen user & peran. |
| **Muhamad Fauzan Al Farikhi** | Vice Chairman I (PO) | `SUPER_ADMIN` | Product Owner website, pengarah fitur, manajemen user & peran. |
| **Rayyan Fathan Addani** | Vice Chairman II | `ADMIN_KONTEN_PROYEK` | Manajemen proyek internal, kurasi portofolio publik, pemantauan lomba. |
| **Annisa Saskia** | Sekretaris I | `SEKRETARIS` (Admin Konten) | Pengelolaan warta, arsip dokumen, notulen, regulasi AD/ART, dan sejarah. |
| **Putri Aura Wening** | Sekretaris II | `SEKRETARIS` (Admin Konten) | Pendamping pengelolaan warta, dokumen, dan korespondensi rekrutmen. |
| **Muhammad Iqbal Fajri** | Bendahara I | `BENDAHARA_I` (Maker Kas) | Input transaksi pengeluaran/pemasukan kas, unggah bukti nota, kelola iuran. |
| **Sri Gunarti Wijiastuti** | Bendahara II | `BENDAHARA_II` (Verifikator Kas)| Verifikasi & persetujuan bukti transaksi (Checker), validasi laporan periodik. |

---

## 3. Keputusan Desain & Arsitektur Utama (Architecture Decision Records)

1. **ADR-01: Decoupled Monorepo Architecture (`/frontend` & `/backend`)**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Menggunakan monorepo yang memisahkan frontend React SPA (`/frontend`) dan backend Go REST API (`/backend`).
   - *Justifikasi*: Performa maksimal dari biner Go terkompilasi, kebebasan skalabilitas independen antara frontend dan backend, serta isolasi dependensi yang bersih.

2. **ADR-02: Backend Go (Golang 1.23+) dengan Chi / Gin & sqlc**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Backend dibangun dengan Go menggunakan router ringan (Chi/Gin), driver `pgx/v5`, dan generator query `sqlc`.
   - *Justifikasi*: Eksekusi query berlatensi sub-milidetik, type-safety mutlak dari SQL ke kode Go tanpa overhead ORM berat, dan proteksi SQL injection bawaan.

3. **ADR-03: Frontend React 19 (Vite) + Tailwind CSS + shadcn/ui**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Frontend dibangun sebagai Single Page Application (SPA) berbasis Vite dengan manajemen state server via TanStack Query.
   - *Justifikasi*: Pengalaman developer yang sangat cepat, waktu build instan, ekosistem komponen kaya, dan rendering UI yang responsif.

4. **ADR-04: Database PostgreSQL dari Supabase & Supabase Storage**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Menggunakan PostgreSQL yang di-host di Supabase (dihubungkan via pgx connection pooling) dan Supabase S3 Object Storage untuk penyimpanan file nota kas dan aset.
   - *Justifikasi*: Relasional penuh, skalabel, backup otomatis, dan storage terkelola tanpa perlu mengelola server MinIO/S3 mandiri.

5. **ADR-05: Autentikasi Mandiri di Go (JWT + httpOnly Secure Cookie)**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Go mengelola pendaftaran via token undangan (*invite-only*), enkripsi password (`bcrypt`), penerbitan token JWT, dan validasi RBAC pada setiap endpoint.
   - *Justifikasi*: Kendali penuh atas sesi, proteksi XSS via cookie httpOnly, dan independensi dari vendor autentikasi pihak ketiga.

6. **ADR-06: Tata Kelola Kas Maker-Checker & Larangan Hard Delete (Immutability)**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Bendahara I mencatat draft (`DRAFT_PENDING`), Bendahara II memverifikasi (`VERIFIED`). Tidak ada endpoint `DELETE` untuk mutasi kas; pembatalan transaksi wajib melalui mekanisme `VOID` dengan mencantumkan alasan.
   - *Justifikasi*: Menghilangkan risiko manipulasi finansial sepihak dan memenuhi standar audit organisasi mahasiswa profesional.

7. **ADR-07: Kepatuhan Privasi Data Pribadi (UU PDP)**
   - *Status*: **Disetujui User (22 Okt 2026)**
   - *Keputusan*: Status pembayaran iuran per anggota hanya dapat diakses oleh bendahara dan anggota bersangkutan. Nomor telepon dan email pribadi tidak ditampilkan di direktori publik.
   - *Justifikasi*: Menghormati privasi anggota dan mencegah kebocoran data sensitif komunitas.

---

## 4. Asumsi Sementara yang Berlaku (PRD Section 16)

- **Bahasa**: Website menggunakan Bahasa Indonesia penuh untuk versi V1.
- **Transparansi Finansial**: Seluruh 35 anggota berhak melihat rekap saldo dan daftar mutasi kas umum; rincian riwayat iuran individu terisolasi per anggota.
- **Pendaftaran Akun Portal**: Murni berbasis undangan (*invite-only*) oleh Super Admin, tidak ada pendaftaran terbuka untuk akun portal internal.
- **Palet Warna**: Konsisten mengadopsi identitas logo NCD (Off-white `#F4F1EA`, Slate Black `#101216`, Accent Purple `#6C4DF6`).
- **Data Pengurus**: Nama dan struktur kepengurusan saat ini diperlakukan sebagai data awal yang dapat diperbarui secara dinamis dari dashboard admin.

---

## 5. Log & Pelacakan 20 Pertanyaan Terbuka (Open Questions Tracking)

| No | Pertanyaan Terbuka dari PRD | Asumsi / Status Saat Ini | Dampak Arsitektur & Tindakan Lanjutan |
| :-: | :--- | :--- | :--- |
| **1** | Visi, misi, nilai, dan tagline resmi NCD? | Menggunakan teks draft sementara. | Perlu diserahkan naskah final sebelum copywriting halaman About difinalisasi. |
| **2** | Kapan NCD berdiri dan pembagian divisi teknis? | Estimasi pembagian: Web, Mobile, AI, Cloud. | Ditampung dalam field array `division` dan tabel `history_events`. |
| **3** | Kelengkapan data 35 anggota & foto resmi? | Dialokasikan avatar inisial (*fallback*). | Batch pengumpulan foto formal oleh tim Sekretaris. |
| **4** | Daftar proyek & prestasi yang diizinkan tampil publik? | Menggunakan filter boolean `is_public = false` sebagai default aman. | Kurasi proyek yang layak pamer oleh Vice Chairman II (Rayyan). |
| **5** | Kelengkapan dokumen AD/ART dan tata tertib tertulis? | Template PDF sementara disediakan di storage. | Sekretaris mengunggah berkas PDF final sebelum UAT V1. |
| **6** | Besaran iuran kas bulanan dan sumber pemasukan? | Disediakan pengaturan nominal fleksibel di tabel `finance_categories`. | Ditentukan besaran nominal pasti saat rapat kerja pengurus. |
| **7** | Apakah kas terbuka penuh atau ada pos rahasia pengurus? | Terbuka penuh untuk seluruh 35 anggota (default PRD). | Seluruh anggota terotentikasi berhak membaca mutasi kas umum. |
| **8** | Visibilitas status iuran per anggota? | Diputuskan PRIVAT (hanya terlihat oleh ybs dan bendahara). | Query Go membatasi iuran berdasarkan `member_id = current_user_id`. |
| **9** | Approval berjenjang untuk pengeluaran nominal besar? | Belum diaktifkan di V1 (cukup Maker-Checker 2 Bendahara). | Disiapkan field `threshold_approval` untuk fase lanjutan jika dibutuhkan. |
| **10**| Apakah saldo kas periode sebelumnya perlu diimpor? | Ya, dibuat 1 transaksi awal kategori *Saldo Awal / Migrasi*. | Bendahara menyiapkan angka saldo pembuka saat inisialisasi. |
| **11**| Kesepakatan mapping role & Super Admin? | Disepakati: Rianszzz (God Admin), Mirza & Fauzan (Super Admin). | Divalidasi dan di-seed otomatis pada skrip inisialisasi database Go. |
| **12**| Domain email anggota (Gunadarma vs Gmail pribadi)? | Mendukung sembarang email valid via whitelist undangan admin. | Validasi regex email universal dengan whitelist akun aktif. |
| **13**| Apakah foto dan nama seluruh 35 anggota boleh tampil publik? | Boleh, dengan kontrol toggle `show_in_public` per anggota. | Komponen direktori memfilter anggota yang menyalakan opsi publik. |
| **14**| Periode rekrutmen buka-tutup atau sepanjang tahun? | Disediakan toggle *Open/Closed* di pengaturan admin. | Form `/join` merespons dinamis status periode aktif. |
| **15**| Penampilan logo mitra / sponsor di V1? | Ditangguhkan ke Fase 6 (P2). | Diprioritaskan banner naungan utama NEXA Tech Labs. |
| **16**| Brand guideline resmi selain palet logo? | Menggunakan palet `#F4F1EA`, `#101216`, `#6C4DF6`. | Telah diformalkan ke dalam dokumen `DESIGN.md`. |
| **17**| Domain / subdomain resmi? | Diusulkan di bawah ekosistem NEXA (`ncd.nexatechlabs.my.id`). | Menunggu pendelegasian DNS / CNAME dari admin domain NEXA. |
| **18**| Persetujuan tech stack? | **SELESAI (RESOLVED)**: React (Vite) + Go + Supabase Postgres. | Telah diperbarui di seluruh dokumen arsitektur dan roadmap. |
| **19**| Kebutuhan bilingual (ID/EN) di V1? | Ditunda ke Fase 6 (P2); V1 fokus Bahasa Indonesia. | Struktur teks dipisahkan rapi agar mudah dipasang i18n di masa depan. |
| **20**| Target tanggal peluncuran resmi? | 6–8 minggu setelah Fase 0 dimulai. | Mengikuti milestone sprint pada `TASKS.md`. |
