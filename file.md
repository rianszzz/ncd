# PRD — Website NCD (NEXA Community Development)

> **Catatan**: Berkas ini adalah konversi markdown dari `PRD NCD.pdf`. Salinan identik juga tersedia di [PRD.md](file:///Users/rian/Documents/NCD/PRD.md).

| Metadata | Nilai |
| :--- | :--- |
| **Versi** | 0.1 (Draft) |
| **Tanggal** | 22 Oktober 2026 |
| **Product Owner** | Muhamad Fauzan Al Farikhi (Vice Chairman I) |
| **Sponsor** | Mirza Danisywar Noor Wahyu (Chairman) |
| **Naungan** | NEXA Tech Labs |
| **Status** | Draft — ada Open Questions di Bagian 15 |

---

## 1. Ringkasan

NCD (NEXA Community Development) adalah komunitas di bawah naungan NEXA Tech Labs dengan 35 anggota, termasuk 8 pengurus. Website NCD adalah satu platform dengan dua wajah:

1. **Sisi Publik** — etalase brand NCD untuk calon anggota, mitra, dan pengunjung umum.
2. **Sisi Internal (Member Portal)** — area ber-login untuk transparansi kas, dashboard tim, manajemen proyek, berita internal, dan dokumen organisasi.

**Target kesan**: brand besar — rapi, konsisten, premium, cepat, dan tepercaya. Bukan website komunitas template.

---

## 2. Latar Belakang & Masalah

| Masalah | Dampak |
| :--- | :--- |
| Informasi NCD tersebar (Instagram, grup chat, dokumen terpisah) | Calon anggota sulit menilai kredibilitas NCD |
| Kas dicatat manual / tidak terbuka | Anggota ragu, rawan miskomunikasi |
| Tidak ada satu tempat untuk status proyek, tim, dan pengumuman | Koordinasi lambat, info hilang di chat |
| Pencapaian & sejarah tidak terdokumentasi rapi | Sulit dipakai untuk rekrutmen, proposal, dan sponsor |

---

## 3. Tujuan & Success Metrics

### Tujuan
- **G1**: Memperkuat citra NCD sebagai komunitas teknologi mahasiswa yang profesional di bawah NEXA Tech Labs.
- **G2**: Menaikkan jumlah dan kualitas pendaftar calon anggota.
- **G3**: Membuat keuangan NCD transparan dan dapat diaudit anggota.
- **G4**: Memusatkan operasional: tim, proyek, kompetisi, berita, dokumen.

### Metrics (usulan, perlu disepakati)

| Metrik | Target 3 bulan pertama |
| :--- | :--- |
| Aktivasi akun anggota (dari 35) | ≥ 90% |
| Transaksi kas ter-input dengan bukti | 100% transaksi baru |
| Pengunjung publik bulanan | ≥ 1.000 |
| Konversi halaman Join → form terkirim | ≥ 5% |
| Lighthouse (Performance / Accessibility / SEO) | ≥ 90 / 95 / 95 |
| Waktu muat halaman publik (LCP) | < 2,5 detik |

---

## 4. Non-Goals (V1)

- Bukan marketplace atau e-commerce.
- Bukan sistem pembayaran iuran otomatis (V1 hanya pencatatan; payment gateway masuk roadmap).
- Bukan aplikasi mobile native (cukup responsive web / PWA).
- Bukan chat realtime (tetap pakai WhatsApp/Discord; website hanya memberi link).

---

## 5. Target Pengguna & Peran

| Peran | Deskripsi | Akses |
| :--- | :--- | :--- |
| **Visitor** | Publik / calon anggota, tanpa login | Halaman publik, form Join, kontak |
| **Member** | 28 anggota non-pengurus | Portal: dashboard, tim, proyek, kas (read-only), berita, peraturan, dokumen, profil sendiri |
| **Pengurus** | 8 pengurus | Semua akses Member + hak kelola sesuai jabatan |
| **Super Admin** | Chairman + Vice Chairman I (usulan) | Semua akses, manajemen user & role, audit log, pengaturan sistem |

### Struktur Pengurus (data awal / seed)

| Jabatan | Nama | Role sistem (usulan) |
| :--- | :--- | :--- |
| **Developer** | Rianszzz | God admin |
| **Chairman** | Mirza Danisywar Noor Wahyu | Super Admin |
| **Vice Chairman I** | Muhamad Fauzan Al Farikhi | Super Admin |
| **Vice Chairman II** | Rayyan Fathan Addani | Admin Konten & Proyek |
| **Sekretaris I** | Annisa Saskia | Admin Konten (berita, dokumen, peraturan, history) |
| **Sekretaris II** | Putri Aura Wening | Admin Konten (berita, dokumen, peraturan, history) |
| **Bendahara I** | Muhammad Iqbal Fajri | Admin Keuangan (input & edit transaksi) |
| **Bendahara II** | Sri Gunarti Wijiastuti | Admin Keuangan (verifikator / approval) |

*Catatan: 8 pengurus ini termasuk dalam total 35 anggota. Sisanya 27–28 anggota biasa.*

---

## 6. Identitas Brand & Desain

### Prinsip
- **Premium & minimalis**: ruang putih lega, tipografi tegas, grid disiplin.
- **Konsisten**: satu design system untuk publik dan portal.
- **Tech-forward**: terasa seperti produk teknologi, bukan brosur.

### Logo
- **Logo NCD** (wordmark "NCD" + simbol 3 kotak & 1 lingkaran ungu) — logo utama website.
- **Logo NEXA Tech Labs** — ditampilkan sebagai *"Under the umbrella of / Di bawah naungan NEXA Tech Labs"* di header kecil, footer, dan section About.
- **Aturan penggunaan**: clear space, ukuran minimum, versi terang/gelap, tidak boleh diubah proporsi.

### Design Tokens (usulan, mengikuti logo)

| Token | Nilai |
| :--- | :--- |
| Background utama | Off-white hangat `#F4F1EA` (sesuai latar logo) |
| Teks / hitam | `#101216` |
| Aksen | Ungu `#6C4DF6` (sesuai lingkaran logo NCD) |
| Mode gelap | Didukung (portal & publik), dengan token terpisah |
| Tipografi | Sans geometris tegas untuk heading (mis. Inter Tight / Geist / Satoshi) + sans netral untuk body; angka kas pakai tabular figures |
| Radius & elevasi | Radius kecil-sedang, shadow minimal, border tipis |
| Motion | Halus dan fungsional (fade/slide ≤ 300 ms), hormati `prefers-reduced-motion` |

### Komponen Desain
Navbar sticky, hero, kartu anggota, timeline, kartu proyek, tabel data, chart, badge status, empty/loading/error states, toast, modal, form dengan validasi inline. Semua didokumentasikan di Figma + kode (Storybook opsional).

---

## 7. Arsitektur Informasi

### 7.1 Area Publik
- `/` : Beranda
- `/about` : Tentang NCD (visi, misi, nilai, naungan NEXA Tech Labs)
- `/team` : Struktur organisasi + 7/8 pengurus + galeri 35 anggota
- `/projects` : Daftar proyek publik
- `/projects/[slug]` : Detail proyek
- `/competitions` : Kompetisi & hasil
- `/achievements` : Pencapaian
- `/history` : Sejarah / timeline
- `/news` : Berita & artikel
- `/news/[slug]` : Detail berita
- `/join` : Info & form pendaftaran calon anggota
- `/contact` : Kontak, sosial media, lokasi
- `/rules` : Ringkasan peraturan publik (kode etik)
- `/login` : Masuk anggota

### 7.2 Portal Internal (`/app/*`, wajib login)
- `/app` : Dashboard utama
- `/app/team` : Direktori tim & profil anggota
- `/app/projects` : Manajemen proyek (board/list)
- `/app/competitions` : Tracker kompetisi (daftar, deadline, hasil)
- `/app/finance` : Transparansi kas
- `/app/finance/transactions` : Riwayat transaksi
- `/app/finance/reports` : Laporan bulanan / periodik
- `/app/news` : Pengumuman & berita internal
- `/app/rules` : Peraturan lengkap (AD/ART, tata tertib, sanksi)
- `/app/documents` : Arsip dokumen (notulen, proposal, LPJ, template)
- `/app/calendar` : Agenda & kalender
- `/app/attendance` : Absensi kegiatan (fase 2)
- `/app/profile` : Profil & pengaturan akun
- `/app/admin` : Manajemen user, role, konten, audit log

---

## 8. Fitur & Kebutuhan Fungsional

Prioritas:
- **P0** = wajib launch
- **P1** = penting, segera setelah launch
- **P2** = nice-to-have

### 8.1 Autentikasi & Otorisasi (P0)
- **FR-A1**: Login email + password; opsi login Google (SSO) untuk email yang terdaftar.
- **FR-A2**: Invite-only — akun anggota dibuat/diundang oleh admin (tidak ada sign-up bebas).
- **FR-A3**: Reset password via email, verifikasi email, session aman (`httpOnly` cookie), rate-limit login.
- **FR-A4**: RBAC sesuai tabel peran (Bagian 5) dan matriks izin (Bagian 9).
- **FR-A5**: 2FA (TOTP) wajib untuk Super Admin dan Admin Keuangan (P1).
- **FR-A6**: Audit log login dan aksi sensitif.
- **FR-A7**: Offboarding — admin bisa menonaktifkan akun tanpa menghapus riwayat.

### 8.2 Beranda Publik (P0)
- Hero: tagline NCD, CTA "Gabung NCD" dan "Lihat Proyek".
- Strip "Di bawah naungan NEXA Tech Labs" (logo + link).
- Statistik ringkas (anggota, proyek, kompetisi, pencapaian) — diambil dari data, bukan hardcode.
- Highlight proyek, pencapaian terbaru, berita terbaru, sorotan anggota.
- CTA Join di bagian bawah.

### 8.3 Tentang, Sejarah & Peraturan (P0)
- **About**: visi, misi, nilai, cerita berdiri, hubungan dengan NEXA Tech Labs.
- **History**: timeline interaktif (tahun/bulan, judul, deskripsi, foto), dikelola dari admin.
- **Peraturan**: versi publik (kode etik ringkas) dan versi lengkap internal (AD/ART, tata tertib, hak & kewajiban, sistem sanksi) dengan versioning dan tanggal berlaku, bisa diunduh PDF.

### 8.4 Struktur Organisasi & Anggota (P0)
- Bagan struktur organisasi (Chairman → Vice Chairman I/II → Sekretaris I/II, Bendahara I/II → anggota/divisi bila ada).
- Kartu 7/8 pengurus: foto, nama, jabatan, bio singkat, tautan sosial.
- Galeri/direktori 35 anggota: foto, nama, jabatan/divisi, angkatan, keahlian/tag; filter & pencarian.
- Anggota mengatur sendiri apa yang tampil publik (nama + foto + peran minimum; kontak pribadi hanya internal).
- Foto: rasio seragam, crop otomatis, lazy-load, format WebP/AVIF.

### 8.5 Proyek (P0)
- **Publik**: katalog proyek (nama, deskripsi, tech stack, status, tim, tautan demo/repo, gambar).
- **Internal**: manajemen proyek — status (Ide → Aktif → Review → Selesai → Arsip), PIC, anggota, milestone, deadline, tautan repo/dokumen, progres %.
- Tampilan board (Kanban) dan list; komentar & aktivitas per proyek (P1).
- Flag "tampilkan ke publik" per proyek.

### 8.6 Kompetisi (P0)
- **Publik**: daftar kompetisi yang diikuti, tim, hasil (juara/finalis), tahun, dokumentasi.
- **Internal**: tracker — nama lomba, penyelenggara, deadline pendaftaran/submisi, tim, status (Rencana / Mendaftar / Berjalan / Selesai), hasil, link berkas.
- Pengingat deadline via email/notifikasi (P1).

### 8.7 Pencapaian (P0)
- Daftar & galeri pencapaian: judul, tingkat (kampus/nasional/internasional), tanggal, penerima (anggota/tim), bukti (foto/sertifikat), tautan ke kompetisi/proyek terkait.
- Counter otomatis di beranda.

### 8.8 Berita & Pengumuman (P0)
- **Publik**: berita/artikel dengan kategori, tag, penulis, gambar sampul, SEO, share link.
- **Internal**: pengumuman khusus anggota, dapat disematkan (pinned), dengan tanda "sudah dibaca" (P1).
- Editor rich-text/Markdown, draft → review → publish, jadwal terbit (P1).

### 8.9 Transparansi Kas (P0) — Fitur Kunci Internal
- **Prinsip**: semua anggota bisa melihat, hanya bendahara yang bisa mengubah, setiap perubahan tercatat.
- **Ringkasan**: saldo saat ini, total pemasukan, total pengeluaran, per periode.
- **Riwayat transaksi**: tanggal, tipe (masuk/keluar), kategori, nominal, deskripsi, penanggung jawab, bukti (foto nota/transfer), status (Draft / Terverifikasi).
- **Dua bendahara**: Bendahara I input → Bendahara II verifikasi (maker-checker). Transaksi belum terverifikasi diberi label jelas.
- **Kategori**: iuran, sponsor/donasi, hadiah lomba, operasional, event, konsumsi, perlengkapan, dll (dapat dikonfigurasi).
- Grafik arus kas bulanan, komposisi pengeluaran per kategori.
- Laporan bulanan otomatis + ekspor PDF/CSV.
- Pencatatan iuran per anggota (sudah/belum bayar) — dengan kebijakan privasi (lihat Open Questions).
- Transaksi tidak bisa dihapus, hanya dibatalkan dengan alasan (void) → riwayat perubahan terlihat (audit trail).
- Pengajuan dana / reimbursement (P1): anggota ajukan, pengurus approve, bendahara cairkan.
- Anggaran per proyek/event vs realisasi (P2).

### 8.10 Dashboard Tim (P0)
Dashboard personal per anggota, dengan widget:
- Pengumuman terbaru & pinned.
- Proyek yang saya ikuti + tugas dan deadline terdekat.
- Agenda & kompetisi mendatang.
- Ringkasan kas (saldo & tren).
- Pintasan: dokumen, peraturan, profil.
- *Dashboard pengurus tambah*: anggota aktif/nonaktif, proyek berisiko telat, transaksi menunggu verifikasi, pendaftar baru.

### 8.11 Rekrutmen / Join (P0)
- Halaman info: siapa kami, benefit, syarat, alur seleksi, FAQ.
- Form pendaftaran: nama, kampus, jurusan/angkatan, minat/keahlian, motivasi, portofolio/link, kontak.
- Antrean pendaftar di admin: status (Baru → Review → Wawancara → Diterima/Ditolak), catatan internal, email otomatis.
- Proteksi spam (captcha/honeypot) dan persetujuan data pribadi.
- Pembukaan/penutupan periode rekrutmen dapat diatur.

### 8.12 Fitur Tambahan yang Direkomendasikan

| Fitur | Prioritas | Alasan |
| :--- | :--- | :--- |
| Agenda & Kalender (rapat, event, deadline) + ekspor ICS | P1 | Satu sumber jadwal |
| Arsip Dokumen (notulen, proposal, LPJ, template) dengan kontrol akses | P1 | Memori organisasi |
| Absensi kegiatan (QR/klik) + rekap kehadiran | P2 | Evaluasi keaktifan |
| Galeri dokumentasi kegiatan | P1 | Bukti & konten brand |
| Direktori keahlian (siapa ahli apa) | P1 | Membentuk tim lomba cepat |
| Mitra & Sponsor (logo, kerja sama) | P2 | Kredibilitas, bahan sponsorship |
| Media Kit / Brand Assets (logo, warna, template) | P1 | Konsistensi brand |
| Pencarian global (Ctrl/⌘+K) | P1 | UX setara produk besar |
| Notifikasi (in-app + email) | P1 | Pengingat & pengumuman |
| Feedback / Saran anggota | P2 | Aspirasi terstruktur |
| Poin keaktifan / leaderboard | P2 | Motivasi anggota |
| Bilingual ID/EN | P2 | Jangkauan lebih luas |
| Alumni NCD | P2 | Jejaring jangka panjang |

---

## 9. Matriks Izin (Ringkas)

| Modul | Visitor | Member | Sekretaris | Bendahara I | Bendahara II | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Halaman publik** | R | R | R | R | R | R |
| **Profil sendiri** | — | RW | RW | RW | RW | RW |
| **Berita / pengumuman** | R (publik) | R | CRUD | R | R | CRUD |
| **Peraturan & dokumen** | R (publik) | R | CRUD | R | R | CRUD |
| **History & pencapaian** | R | R | CRUD | R | R | CRUD |
| **Proyek & kompetisi** | R (publik) | R + update tugas sendiri | R | R | R | CRUD |
| **Kas** | — | R | R | CR (Input) | R + Verify | R + Void |
| **User & role** | — | — | — | — | — | CRUD |
| **Audit log** | — | — | — | — | — | R |

*Keterangan: R = Read, C = Create, U = Update, D = Delete, W = Write. Matriks final dikonfirmasi bersama pengurus.*

---

## 10. Kebutuhan Non-Fungsional

| Area | Persyaratan |
| :--- | :--- |
| **Performa** | LCP < 2,5 s, CLS < 0,1, gambar dioptimasi, CDN, caching |
| **Keamanan** | HTTPS, hashing password (argon2/bcrypt), CSRF/XSS protection, rate-limit, RBAC di server (bukan hanya UI), Row-Level Security pada data, validasi input, backup harian |
| **Privasi** | Persetujuan anggota untuk foto & data publik, minimisasi data, tidak menampilkan kontak pribadi ke publik, sesuai UU PDP |
| **Keandalan** | Uptime ≥ 99,5%, backup & prosedur pemulihan |
| **Aksesibilitas** | WCAG 2.1 AA, navigasi keyboard, kontras cukup, alt text |
| **SEO** | Meta/OG tags, sitemap, schema.org (Organization), URL bersih |
| **Responsif** | Mobile-first (≥ 360 px), diuji pada Chrome/Safari/Firefox terbaru |
| **Audit** | Semua mutasi kas dan perubahan role dicatat (siapa, kapan, sebelum/sesudah) |
| **Maintainability** | Konten dikelola lewat admin panel tanpa perlu deploy ulang |

---

## 11. Rekomendasi Tech Stack (Telah Disepakati)

| Lapisan | Pilihan |
| :--- | :--- |
| **Frontend** | React (Vite) + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query |
| **Backend** | Go (Golang 1.23+) + Chi / Gin Router + pgx/v5 + sqlc (Type-safe SQL) |
| **Database & Storage**| PostgreSQL 16 (dari Supabase) + Supabase Object Storage (Nota Kas & Aset) |
| **Auth** | Go JWT Engine (httpOnly Cookie, invite-only, bcrypt) + opsi Google SSO |
| **Chart** | Recharts (React) |
| **Konten** | Admin panel internal (CRUD) + Markdown untuk artikel & pengumuman |
| **Email** | Resend / SMTP |
| **Hosting** | Vercel / Cloudflare Pages (Frontend) + Cloud Container / VPS (Backend Go) + Supabase; domain di bawah ekosistem NEXA (mis. `ncd.nexatechlabs.my.id`) |
| **Observability** | Sentry + Prometheus / Health metrics + Analytics privasi-friendly |
| **CI/CD** | GitHub Actions (Lint, Test Go & React, Build Container) |

---

## 12. Model Data (Ringkas)

- `User(role, status)`
- `Member(profil, foto, jabatan, divisi, angkatan, keahlian, visibilitas publik)`
- `Position`
- `Project`
- `ProjectMember`
- `Task`
- `Competition`
- `CompetitionTeam`
- `Achievement`
- `Post(berita/pengumuman)`
- `HistoryEvent`
- `Rule(versi)`
- `Document`
- `Transaction(status, bukti, maker, verifier)`
- `FinanceCategory`
- `DuesRecord`
- `Application(pendaftar)`
- `Event`
- `Notification`
- `AuditLog`
- `Setting`

---

## 13. Roadmap & Milestone (Usulan)

| Fase | Cakupan | Estimasi |
| :--- | :--- | :--- |
| **0. Discovery** | Finalisasi PRD, jawab Open Questions, kumpulkan data & aset (foto 35 anggota, konten) | 1 minggu |
| **1. Desain** | Design system, wireframe, UI publik & portal di Figma, review pengurus | 2 minggu |
| **2. MVP Publik** | Beranda, About, Team, Projects, Competitions, Achievements, History, News, Join, Contact | 2–3 minggu |
| **3. Portal Inti** | Auth, RBAC, dashboard, tim, proyek, kompetisi, berita internal, peraturan | 3 minggu |
| **4. Kas** | Modul transparansi kas + verifikasi + laporan | 2 minggu |
| **5. QA & Launch** | Uji keamanan, performa, UAT dengan pengurus, migrasi data, launch | 1–2 minggu |
| **6. Iterasi (P1/P2)** | Kalender, dokumen, absensi, notifikasi, pencarian global, dll | Berkelanjutan |

---

## 14. Risiko & Mitigasi

| Risiko | Mitigasi |
| :--- | :--- |
| Data kas sensitif bocor | RLS, RBAC server-side, 2FA bendahara, audit log |
| Konten tidak diperbarui (website "mati") | Admin panel mudah, PIC konten jelas (Sekretaris), jadwal review bulanan |
| Anggota enggan memberi foto/data | Consent jelas, kontrol visibilitas per anggota |
| Scope terlalu besar | Disiplin prioritas P0/P1/P2, rilis bertahap |
| Ketergantungan pada satu developer | Dokumentasi, repo rapi, minimal 2 admin teknis |
| Desain tidak konsisten | Design system dan token tunggal sejak awal |

---

## 15. Open Questions (Perlu dijawab sebelum desain final)

### Identitas & Konten
1. Visi, misi, nilai, dan tagline resmi NCD? Apakah sudah ada teks final?
2. Kapan NCD berdiri dan bagaimana ceritanya? (untuk History) Apakah ada divisi atau bidang di dalam NCD?
3. Daftar nama & foto 35 anggota, dan 28 anggota lainnya apakah punya jabatan/divisi/keahlian?
4. Daftar proyek, kompetisi, dan pencapaian yang sudah ada, yang boleh tampil publik?
5. Apakah peraturan NCD sudah tertulis (AD/ART, tata tertib, sanksi)? Atau perlu dirumuskan dulu?

### Keuangan
6. Sumber kas apa saja (iuran, sponsor, hadiah lomba, dana NEXA)? Besaran dan periode iuran?
7. Apakah kas seluruhnya terbuka untuk semua anggota, atau ada bagian yang hanya pengurus?
8. Apakah status bayar iuran per anggota boleh terlihat anggota lain, atau hanya bendahara dan yang bersangkutan?
9. Apakah perlu approval berjenjang untuk pengeluaran di atas nominal tertentu?
10. Apakah saldo kas dari periode sebelumnya perlu diimpor (saldo awal)?

### Akses & Operasional
11. Setuju mapping role di Bagian 5 dan 9? Siapa yang memegang hak Super Admin?
12. Login anggota pakai email kampus (Gunadarma), email pribadi, atau Google?
13. Apakah publik boleh melihat nama dan foto semua 35 anggota, atau hanya pengurus?
14. Apakah rekrutmen dibuka berkala (periode) atau sepanjang waktu?
15. Apakah ada sponsor/mitra yang ingin ditampilkan?

### Brand & Teknis
16. Ada brand guideline NCD (font, warna resmi) selain dari logo? Mengikuti palet logo (off-white, hitam, ungu) sudah sesuai?
17. Domain/subdomain yang dipakai? Boleh di bawah `nexatechlabs.my.id`?
18. Tech stack di Bagian 11 sesuai, atau ada preferensi lain (budget hosting, dsb.)?
19. Perlu bilingual (ID/EN) sejak V1?
20. Target tanggal launch?

---

## 16. Asumsi Sementara (Sampai Open Questions Dijawab)

- Website berbahasa Indonesia untuk V1.
- Seluruh anggota boleh melihat total kas dan riwayat transaksi; status iuran per orang hanya terlihat oleh bendahara dan anggota tersebut.
- Pendaftaran akun hanya lewat undangan admin.
- Palet warna mengikuti logo NCD (off-white, hitam, ungu).
- Nama pengurus dan jabatan sesuai Bagian 5 adalah data awal dan bisa diubah dari admin saat pergantian kepengurusan.

---

## 17. Definition of Done (V1)

- Semua fitur P0 selesai dan lolos UAT dengan pengurus.
- 35 profil anggota terisi (foto + data) dengan persetujuan.
- Modul kas dipakai Bendahara untuk pencatatan nyata minimal 1 periode.
- Skor Lighthouse sesuai target; tidak ada isu keamanan kritikal terbuka.
- Dokumentasi admin singkat (cara kelola konten, user, kas) tersedia.

*Dokumen ini hidup — diperbarui setiap Open Question terjawab dan keputusan baru disepakati.*
