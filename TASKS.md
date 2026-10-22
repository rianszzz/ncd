# TASKS & EXECUTION ROADMAP — Website NCD (NEXA Community Development)

| Metadata | Nilai |
| :--- | :--- |
| **Status Proyek** | Fase 0: Persiapan Arsitektur & Pelaksanaan |
| **Arsitektur Stack** | Monorepo: Frontend React (Vite) + Backend Go (Chi/Gin + pgx/sqlc) + Supabase Postgres |
| **Target Utama** | V1 Launch Ready (Fitur P0 Lulus UAT 100%) |

---

## Ringkasan Progres & Milestone

```
[Fase 0: Inisiasi] ──> [Fase 1: Desain] ──> [Fase 2: Publik MVP] ──> [Fase 3: Portal Inti] ──> [Fase 4: Modul Kas] ──> [Fase 5: QA & Launch] ──> [Fase 6: P1/P2]
      (1 Minggu)            (2 Minggu)             (2-3 Minggu)             (3 Minggu)              (2 Minggu)              (1-2 Minggu)           (Berkelanjutan)
```

---

## Fase 0: Setup Monorepo, Database Supabase & Tooling (Minggu 1)

> **Tujuan**: Menyiapkan struktur monorepo `/frontend` (React/Vite) dan `/backend` (Go), skema database PostgreSQL di Supabase, dan tooling dasar.

- [x] **TASK-001** `[P0]` **Setup Monorepo & Tooling Dasar**
  - Inisialisasi root monorepo dengan folder `/frontend` dan `/backend`.
  - Inisialisasi frontend: Vite + React 19 + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query + React Router.
  - Inisialisasi backend: Go 1.23+ module (`go mod init github.com/ncd/backend`), pasang router (Chi / Gin), `pgx/v5`, dan `sqlc`.
  - Setup Makefile atau task runner untuk menjalankan frontend dan backend secara paralel.
  - *Estimasi*: 1 Hari | *Assignee*: Developer (Rianszzz)

- [x] **TASK-002** `[P0]` **Migrasi PostgreSQL Supabase & sqlc Codegen**
  - Buat berkas migrasi SQL (`000001_init.sql`) untuk 20 tabel relasional di Supabase PostgreSQL.
  - Konfigurasi `sqlc.yaml` dan tulis query dasar (`queries/*.sql`) untuk entitas Users, Members, Kas, dan Proyek.
  - Jalankan `sqlc generate` untuk menghasilkan model dan repository Go yang type-safe.
  - *Estimasi*: 2 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-003** `[P0]` **Database Seeder Data Awal Organisasi (Go CLI)**
  - Buat perintah seed di Go (`go run cmd/seed/main.go`) untuk 8 akun pengurus inti:
    - Rianszzz (Developer / God Admin)
    - Mirza Danisywar Noor Wahyu (Chairman / Super Admin)
    - Muhamad Fauzan Al Farikhi (Vice Chairman I / Super Admin)
    - Rayyan Fathan Addani (Vice Chairman II / Admin Konten & Proyek)
    - Annisa Saskia (Sekretaris I / Admin Konten)
    - Putri Aura Wening (Sekretaris II / Admin Konten)
    - Muhammad Iqbal Fajri (Bendahara I / Maker Kas)
    - Sri Gunarti Wijiastuti (Bendahara II / Verifikator Kas)
  - Masukkan data awal dummy untuk 27 anggota biasa (total 35 profil anggota).
  - *Estimasi*: 1 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-004** `[P0]` **Sinkronisasi Aset & Resolusi Pertanyaan Terbuka**
  - Kumpulkan aset SVG resmi logo NCD dan NEXA Tech Labs ke `/frontend/src/assets/`.
  - Kumpulkan foto profil 35 anggota NCD serta persetujuan privasi (*consent*).
  - Review dan finalisasi 20 pertanyaan terbuka pada [MEMORY.md](file:///Users/rian/Documents/NCD/MEMORY.md).
  - *Estimasi*: 3 Hari | *Assignee*: PO (Fauzan), Sekretaris (Annisa, Putri)

---

## Fase 1: Design Tokens, Primitives & Shell Layout (Minggu 2–3)

> **Tujuan**: Menerapkan design system resmi NCD pada Tailwind CSS dan membangun komponen shell publik maupun portal di React.

- [ ] **TASK-101** `[P0]` **Setup Design Tokens & Theme Engine (React/Tailwind)**
  - Konfigurasi variabel CSS warna resmi NCD:
    - Primary Accent: `#6C4DF6` (Ungu NCD)
    - Light Background: `#F4F1EA` (Off-white hangat)
    - Dark Background: `#101216` (Slate black)
  - Atur konfigurasi font tegas (Geist / Satoshi / Inter Tight) untuk headline dan sans netral untuk body.
  - Konfigurasi kelas utilitas `font-mono tabular-nums` untuk angka kas.
  - Implementasikan Dark/Light mode switcher dengan penyimpanan di `localStorage`.
  - *Estimasi*: 2 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-102** `[P0]` **Global Navigation & Layout Shells**
  - Komponen `PublicLayout`: Sticky navbar, logo NCD + strip *"Under the umbrella of NEXA Tech Labs"*, navigasi links, CTA "Masuk / Join", dan footer informatif.
  - Komponen `PortalLayout`: Sidebar navigasi collapsible, topbar dengan user avatar dropdown & status role badge, serta breadcrumb.
  - Setup Axios interceptor untuk menyertakan token otentikasi otomatis dan penanganan error 401/403.
  - *Estimasi*: 3 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-103** `[P0]` **Design Review & Approval Pengurus**
  - Presentasi prototipe antarmuka React kepada Chairman dan Pengurus.
  - Penyesuaian feedback sebelum implementasi logika bisnis Go API.
  - *Estimasi*: 2 Hari | *Assignee*: PO (Fauzan), Chairman (Mirza)

---

## Fase 2: Implementasi Modul Publik / Etalase Brand (Minggu 4–6)

> **Tujuan**: Menyelesaikan endpoint publik di backend Go dan halaman sisi publik di frontend React.

- [ ] **TASK-201** `[P0]` **Beranda Publik (`/`) & API Stats**
  - Backend: Endpoint `GET /api/v1/public/stats` (menghitung total anggota aktif, proyek publik, prestasi, kompetisi).
  - Frontend: Hero section dinamis, strip logo NEXA Tech Labs, statistik counter teranimasi, showcase 3 proyek highlight, dan CTA rekrutmen.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-202** `[P0]` **Halaman Tentang NCD & Timeline Sejarah (`/about`, `/history`)**
  - Backend: Endpoint `GET /api/v1/public/history` (mengambil data sejarah kronologis).
  - Frontend: Narasi visi-misi, nilai organisasi, dan komponen timeline interaktif berbasis tahun/bulan dengan foto dokumentasi.
  - *Estimasi*: 2 Hari | *Assignee*: Developer & Sekretaris

- [ ] **TASK-203** `[P0]` **Struktur Organisasi & Direktori 35 Anggota (`/team`)**
  - Backend: Endpoint `GET /api/v1/public/members` (hanya mengembalikan anggota dengan `show_in_public = true` dan tanpa mengekspos nomor telepon).
  - Frontend: Bagan struktur pengurus hierarki dan grid galeri 35 anggota dengan pencarian nama instan serta filter multi-tag divisi/keahlian.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-204** `[P0]` **Katalog Portofolio Proyek Publik (`/projects`, `/projects/:slug`)**
  - Backend: Endpoint `GET /api/v1/public/projects` dan `GET /api/v1/public/projects/:slug` (hanya proyek dengan `is_public = true`).
  - Frontend: Card grid proyek, badge teknologi, halaman detail proyek lengkap dengan screenshot, deskripsi markdown, dan anggota kontributor.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-205** `[P0]` **Hall of Fame Lomba & Prestasi (`/competitions`, `/achievements`)**
  - Backend: Endpoint `GET /api/v1/public/achievements` dan `GET /api/v1/public/competitions`.
  - Frontend: Tampilan daftar rekapitulasi penghargaan, tingkatan lomba (kampus/nasional/internasional), dan galeri sertifikat/foto kemenangan.
  - *Estimasi*: 2 Hari | *Assignee*: Developer

- [ ] **TASK-206** `[P0]` **Portal Warta & Artikel Komunitas (`/news`, `/news/:slug`)**
  - Backend: Endpoint `GET /api/v1/public/posts` (hanya artikel publik `is_published = true AND is_internal_only = false`).
  - Frontend: Daftar artikel dengan cover image, pembagian tag, dan halaman baca artikel dengan renderer Markdown aman.
  - *Estimasi*: 2 Hari | *Assignee*: Developer & Sekretaris

- [ ] **TASK-207** `[P0]` **Formulir Pendaftaran Terbuka / Rekrutmen (`/join`)**
  - Backend: Endpoint `POST /api/v1/public/apply` dengan proteksi rate limit, validasi spam honeypot, dan notifikasi email konfirmasi.
  - Frontend: Landing info alur rekrutmen + FAQ, multi-field form terintegrasi validasi Zod, dan toggle otomatis bila periode rekrutmen ditutup.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-208** `[P0]` **Ringkasan Kode Etik & Regulasi Publik (`/rules`)**
  - Ringkasan tata tertib komunitas dan tombol unduh dokumen PDF ringkas.
  - *Estimasi*: 1 Hari | *Assignee*: Developer & Sekretaris

---

## Fase 3: Portal Anggota, Autentikasi Go & RBAC (Minggu 7–9)

> **Tujuan**: Membangun backend authentication engine di Go dan protected workspace `/app/*` di React.

- [ ] **TASK-301** `[P0]` **Autentikasi Go JWT & Route Guarding di React**
  - Backend: Endpoint `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
  - Backend: Middleware `RequireAuth` dan `RequireRole` di router Chi/Gin; pengesahan cookie sesi `httpOnly`.
  - Frontend: `AuthContext`, hook `useAuth`, dan komponen `<ProtectedRoute roles={...}>` untuk melindungi rute `/app/*`.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-302** `[P0]` **Sistem Undangan Anggota (Invite-Only System)**
  - Backend: Endpoint `POST /api/v1/admin/invites` (generate link bertoken 48 jam) dan `POST /api/v1/auth/register-invite` (pembuatan password pertama).
  - Frontend: Halaman `/register?token=...` dan modal manajemen undangan di panel admin.
  - Fitur nonaktifkan anggota (*soft-deactivation*) tanpa menghapus histori data.
  - *Estimasi*: 2 Hari | *Assignee*: Developer

- [ ] **TASK-303** `[P0]` **Dashboard Personal Anggota (`/app`)**
  - Backend: Endpoint `GET /api/v1/portal/dashboard` (agregasi pengumuman pinned, tugas proyek user, saldo kas terkini, dan alert).
  - Frontend: Widget selamat datang, widget tugas terdekat, ringkasan saldo kas, dan widget alert khusus pengurus (transaksi pending verifikasi).
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-304** `[P0]` **Manajemen Proyek Internal (`/app/projects`)**
  - Backend: CRUD REST endpoints untuk proyek, milestone, status alur (*Ide → Aktif → Review → Selesai → Arsip*), dan penugasan anggota.
  - Frontend: Tampilan Board Kanban interaktif dan List View dengan filter status serta toggle *"Tampilkan di Publik"*.
  - *Estimasi*: 4 Hari | *Assignee*: Developer & Vice Chairman II (Rayyan)

- [ ] **TASK-305** `[P0]` **Tracker Lomba & Kompetisi Internal (`/app/competitions`)**
  - Backend: CRUD endpoints pemantauan lomba, deadline, dan delegasi tim.
  - Frontend: Tabel monitoring jadwal deadline pendaftaran dan berkas karya lomba.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

- [ ] **TASK-306** `[P0]` **Pusat Regulasi & Dokumen Internal (`/app/rules`, `/app/documents`)**
  - Backend: Endpoint berkas AD/ART, versioning, dan penyimpanan dokumen ke Supabase Storage privat.
  - Frontend: Viewer PDF terintegrasi dan modul arsip dokumen (notulen, template, LPJ).
  - *Estimasi*: 3 Hari | *Assignee*: Developer & Sekretaris

- [ ] **TASK-307** `[P0]` **Pusat Berita & Pengumuman Internal (`/app/news`)**
  - Backend: CRUD berita khusus internal dengan fitur sematkan (*pin to top*).
  - Frontend: Editor Markdown untuk penyusunan warta oleh Sekretaris.
  - *Estimasi*: 2 Hari | *Assignee*: Developer & Sekretaris

- [ ] **TASK-308** `[P0]` **Pengaturan Profil Anggota (`/app/profile`)**
  - Backend: Endpoint `PUT /api/v1/portal/profile` dan `PUT /api/v1/portal/change-password`.
  - Frontend: Form edit data diri, toggle izin tampil publik (*UU PDP*), dan upload avatar baru ke Supabase Storage.
  - *Estimasi*: 2 Hari | *Assignee*: Developer

---

## Fase 4: Modul Transparansi Kas & Finansial (Minggu 10–11)

> **Tujuan**: Membangun modul buku kas dengan validasi Maker-Checker ketat di Go Service dan visualisasi di React.

- [ ] **TASK-401** `[P0]` **Engine Maker-Checker di Go Service**
  - Backend Service: Logika status mutasi:
    - Bendahara I input draft (`status: DRAFT_PENDING`).
    - Bendahara II verifikasi (`status: VERIFIED`).
    - Validasi invariant: `maker_id != verifier_id` diuji di level Go Service dan DB constraint.
  - Backend: Saldo kas berjalan hanya mengakumulasi transaksi dengan status `VERIFIED`.
  - *Estimasi*: 3 Hari | *Assignee*: Developer, Bendahara I (Iqbal), Bendahara II (Sri)

- [ ] **TASK-402** `[P0]` **Anti-Delete & Mekanisme Void Audit Trail**
  - Backend: Blokir aksi `DELETE` pada mutasi kas. Buat endpoint `POST /api/v1/finance/transactions/:id/void` khusus Super Admin.
  - Pencatatan otomatis ke tabel `audit_logs` (user pembatal, tanggal, dan alasan tertulis).
  - *Estimasi*: 2 Hari | *Assignee*: Developer

- [ ] **TASK-403** `[P0]` **Input Mutasi & Unggah Bukti Nota ke Supabase Storage**
  - Backend: Integrasi upload bukti nota ke Supabase Storage bucket `receipts-kas`.
  - Frontend: Modal input transaksi bagi Bendahara I dengan upload file, serta Lightbox preview nota bagi seluruh anggota.
  - *Estimasi*: 3 Hari | *Assignee*: Developer & Bendahara I

- [ ] **TASK-404** `[P0]` **Buku Iuran Anggota & Kebijakan Privasi (UU PDP)**
  - Backend: Endpoint `GET /api/v1/finance/dues` membatasi data hanya milik user login jika bukan pengurus keuangan/super admin.
  - Frontend: Tab status iuran pribadi untuk member; matriks kontrol 35 anggota untuk Bendahara I & II.
  - *Estimasi*: 2 Hari | *Assignee*: Developer & Bendahara

- [ ] **TASK-405** `[P0]` **Visualisasi Grafik Arus Kas & Ekspor Rekapan**
  - Frontend: Visualisasi grafik Recharts (arus kas bulanan masuk vs keluar, komposisi per kategori).
  - Frontend/Backend: Ekspor laporan mutasi ke format CSV dan PDF resmi ber-kop NCD.
  - *Estimasi*: 3 Hari | *Assignee*: Developer

---

## Fase 5: QA, Audit Keamanan, UAT & Peluncuran V1 (Minggu 12–13)

> **Tujuan**: Pengujian penetrasi mandiri, audit performa, UAT bersama 8 pengurus, dan deployment produksi.

- [ ] **TASK-501** `[P0]` **Audit Keamanan & Penetrasi Mandiri API Go**
  - Pengujian IDOR pada endpoint mutasi kas, iuran, dan update profil anggota.
  - Verifikasi parameterized query `sqlc` (bebas injeksi SQL).
  - Uji validasi Maker-Checker agar Bendahara I tidak dapat memverifikasi transaksinya sendiri.
  - *Estimasi*: 2 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-502** `[P0]` **Optimasi Performa & Audit Lighthouse React SPA**
  - Uji skor Lighthouse di Google Chrome.
  - Code-splitting bundle React via `React.lazy`, kompresi aset WebP.
  - Memastikan tercapainya target: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95.
  - *Estimasi*: 2 Hari | *Assignee*: Developer

- [ ] **TASK-503** `[P0]` **Migrasi Data Asli 35 Anggota & Saldo Awal**
  - Input data profil lengkap 35 anggota asli NCD via seeder.
  - Input saldo kas awal periode berjalan yang telah diaudit bendahara.
  - Unggah berkas resmi AD/ART NCD.
  - *Estimasi*: 2 Hari | *Assignee*: Pengurus & Developer

- [ ] **TASK-504** `[P0]` **User Acceptance Testing (UAT) Resmi**
  - Skenario pengujian lengkap bersama Chairman, Wakil, Sekretaris, dan Bendahara.
  - Uji siklus input mutasi kas hingga verifikasi nota oleh bendahara.
  - Uji siklus pendaftaran rekrutmen hingga review di portal admin.
  - *Estimasi*: 2 Hari | *Assignee*: Seluruh Pengurus & Developer

- [ ] **TASK-505** `[P0]` **Admin Handbook Singkat**
  - Dokumen ringkas cara kelola warta bagi Sekretaris, panduan kas bagi Bendahara, dan panduan user bagi Super Admin.
  - *Estimasi*: 1 Hari | *Assignee*: Developer (Rianszzz)

- [ ] **TASK-506** `[P0]` **Deployment Produksi & Go-Live**
  - Deploy Frontend React ke Vercel / Cloudflare Pages.
  - Deploy Backend Go binary ke Cloud Container / VPS / Railway.
  - Konfigurasi DNS domain resmi (misal: `ncd.nexatechlabs.my.id`).
  - Verifikasi SSL HTTPS dan monitoring endpoint health check `/healthz`.
  - *Estimasi*: 1 Hari | *Assignee*: Developer (Rianszzz)

---

## Fase 6: Iterasi Fitur P1 & P2 (Pasca Peluncuran V1)

- [ ] **TASK-601** `[P1]` Two-Factor Authentication (2FA TOTP) untuk akun admin di Go.
- [ ] **TASK-602** `[P1]` Generator feed kalender (.ics) untuk jadwal kegiatan & deadline lomba.
- [ ] **TASK-603** `[P1]` Pipeline pengajuan dana / reimbursement online.
- [ ] **TASK-604** `[P1]` Modal navigasi pencarian global (`Command/Ctrl + K`) di React.
- [ ] **TASK-605** `[P1]` Worker pengingat deadline lomba otomatis via email.
- [ ] **TASK-606** `[P1]` Halaman media kit & aset brand NCD resolusi tinggi.
- [ ] **TASK-607** `[P2]` Sistem absensi kehadiran rapat berbasis QR Code.
- [ ] **TASK-608** `[P2]` Internasionalisasi antarmuka publik (Bilingual ID/EN).
- [ ] **TASK-609** `[P2]` Direktori jejak karir alumni NCD.
