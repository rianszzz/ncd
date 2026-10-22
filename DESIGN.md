# DESIGN SYSTEM & UI/UX SPECIFICATION — Website NCD

| Metadata | Spesifikasi Desain & Antarmuka |
| :--- | :--- |
| **Versi** | 1.0.0 |
| **Filosofi** | Premium, Tech-Forward, Minimalis, Disiplin Grid |
| **Karakter Brand** | Bukan website komunitas template; berkesan organisasi teknologi modern setara tech company tier-1. |

---

## 1. Filosofi & Prinsip Desain

1. **Premium & Minimalis**: Penggunaan ruang negatif (*whitespace*) yang lega dan lapang. Menghindari dekorasi visual murahan (*anti-slop*), gradien berlebihan, atau elemen berdesakan.
2. **Tech-Forward**: Menampilkan identitas kuat sebuah komunitas rekayasa perangkat lunak dan teknologi. Struktur teratur, garis batas tegas, dan fungsional.
3. **Kesatuan Ekosistem (Satu Design System)**: Menghubungkan etalase publik yang anggun dengan portal internal yang produktif dan padat informasi tanpa disparitas visual yang timpang.
4. **Kejelasan Informasi Finansial**: Transparansi kas disajikan dengan tipografi angka yang presisi (*tabular figures*), kontras tinggi, dan kode warna status yang intuitif.

---

## 2. Palet Warna & Design Tokens

### 2.1 Mode Terang (Default Public & Portal)

| Token Nama | Nilai HEX / HSL | Penggunaan & Konteks |
| :--- | :--- | :--- |
| `--bg-primary` | `#F4F1EA` | Latar belakang canvas utama website (off-white hangat khas logo NCD). |
| `--bg-surface` | `#FFFFFF` | Latar kartu (*card*), modal dialog, dan dropdown menu. |
| `--bg-subtle` | `#EBE7DE` | Latar seksi sekunder, hover item daftar, border tipis. |
| `--text-primary` | `#101216` | Warna teks utama, judul seksi, dan penekanan tinggi (kontras WCAG AAA). |
| `--text-muted` | `#585E6C` | Teks pendukung, label metadata, placeholder, timestamp. |
| `--border-subtle` | `rgba(16, 18, 22, 0.08)` | Garis pemisah komponen (*subtle border*) dan card outlines. |
| `--accent-ncd` | `#6C4DF6` | Warna aksen utama (Ungu khas lingkaran logo NCD); tombol aksi utama, link aktif. |
| `--accent-hover` | `#583BD9` | Status hover dan focus state untuk elemen bertema aksen ungu. |
| `--accent-subtle`| `rgba(108, 77, 246, 0.10)` | Badge highlight, tag keahlian, status aktif menu. |

### 2.2 Mode Gelap (Dark Mode Support)

| Token Nama | Nilai HEX / HSL | Penggunaan & Konteks |
| :--- | :--- | :--- |
| `--bg-primary-dark` | `#0B0C0E` | Latar canvas utama gelap (deep charcoal black). |
| `--bg-surface-dark` | `#14161B` | Latar kartu dashboard dan panel portal. |
| `--bg-subtle-dark` | `#1B1E26` | Latar table header, hover item list pada mode gelap. |
| `--text-primary-dark` | `#F4F1EA` | Teks utama pada latar gelap. |
| `--text-muted-dark` | `#949BA8` | Teks sekunder pada latar gelap. |
| `--border-dark` | `rgba(244, 241, 234, 0.10)` | Garis pemisah tipis pada mode gelap. |
| `--accent-ncd-dark` | `#8267FF` | Varian ungu sedikit lebih cerah agar terbaca jelas di latar gelap. |

### 2.3 Status Finansial & Operasional (Semantic Colors)

| Status | Warna Light | Warna Dark | Makna Semantik |
| :--- | :--- | :--- | :--- |
| **Kas Masuk (Income)** | `#107C41` (Emerald) | `#22C55E` | Pemasukan kas, iuran lunas, transaksi kredit. |
| **Kas Keluar (Expense)** | `#D83B01` (Crimson) | `#EF4444` | Pengeluaran, void transaksi, status belum bayar. |
| **Draft / Pending** | `#D97706` (Amber) | `#F59E0B` | Menunggu verifikasi Bendahara II, status review. |
| **Verified / Active** | `#0284C7` (Sky) | `#38BDF8` | Transaksi terverifikasi, proyek aktif. |

---

## 3. Tipografi & Hierarki Teks

### 3.1 Pilihan Font
- **Headline / Display Font**: Sans geometris tegas dan terstruktur modern seperti `Inter Tight`, `Geist Sans`, atau `Satoshi`.
- **Body / Content Font**: Sans netral dengan legibilitas tinggi pada paragraf panjang seperti `Inter` atau `Geist Sans`.
- **Monospace & Numerical Font**: `Geist Mono` atau `JetBrains Mono` dengan atribut CSS mandatory `font-feature-settings: "tnum" 1, "zero" 1` untuk tabel mutasi uang kas.

### 3.2 Skala Tipografi (Modular Scale)

| Level | Ukuran (Desktop) | Ukuran (Mobile) | Bobot (Weight) | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `56px (3.5rem)` | `36px (2.25rem)` | SemiBold (600) | 1.1 | `-0.03em` |
| **H1 (Page Title)** | `40px (2.5rem)` | `28px (1.75rem)` | SemiBold (600) | 1.2 | `-0.025em` |
| **H2 (Section Header)** | `28px (1.75rem)` | `22px (1.375rem)`| Medium (500) | 1.25 | `-0.02em` |
| **H3 (Card Title)** | `20px (1.25rem)` | `18px (1.125rem)`| SemiBold (600) | 1.3 | `-0.01em` |
| **Body Large** | `18px (1.125rem)`| `16px (1.0rem)` | Regular (400) | 1.6 | normal |
| **Body Default** | `15px (0.9375rem)`| `14px (0.875rem)` | Regular (400) | 1.55 | normal |
| **Caption / Meta** | `13px (0.8125rem)`| `12px (0.75rem)` | Medium (500) | 1.4 | `+0.01em` |
| **Financial Digits** | `15px / 24px` | `14px / 20px` | Medium (500) | 1.2 | `tabular-nums` |

---

## 4. Sistem Grid, Radius & Elevasi

### 4.1 Grid & Spasi
- **Grid Kontainer Publik**: Maksimal lebar kontainer `1200px` (atau `1280px`), terpusat di tengah dengan margin horizontal `24px` (mobile: `16px`).
- **Portal Internal Grid**: Fluid dashboard grid dengan lebar sidebar tetap `260px` pada layar desktop, collapsible menjadi icon menu atau bottom sheet pada mobile.
- **Rhythm Spasi**: Kelipatan 4px / 8px:
  - Micro: `4px`, `8px`, `12px`, `16px` (gap elemen, padding tombol)
  - Layout: `24px`, `32px`, `48px`, `64px`, `96px` (margin seksi)

### 4.2 Border Radius
- **Kecil (`rounded-md` - 6px)**: Input form, badge status, tombol kecil.
- **Sedang (`rounded-xl` - 12px)**: Kartu konten, card anggota, tabel kontainer.
- **Besar (`rounded-2xl` - 16px)**: Modal dialog, alert card, hero banners.
- **Penuh (`rounded-full`)**: Tag keahlian, avatar bulat, pill status.

### 4.3 Elevasi & Bayangan (Shadows)
- Menganut gaya modern datar (*flat & crisp*). Tidak menggunakan drop-shadow tebal yang kusam.
- Border tipis `1px solid var(--border-subtle)` menjadi batas utama definisi visual elemen.
- Elevasi ringan saat melayang (*hover*): `box-shadow: 0 4px 20px -2px rgba(16, 18, 22, 0.05)`.
- Modal Overlay: `backdrop-filter: blur(8px); background: rgba(16, 18, 22, 0.4)`.

---

## 5. Komponen Utama & Pola Interaksi

### 5.1 Banner & Hierarki Brand (NCD vs NEXA Tech Labs)
- **Wordmark NCD**: Menjadi logo utama di navigasi kiri atas.
- **Attribution Bar**: Pita subtil di atas navbar atau di bawah logo yang bertuliskan:
  > *"Under the umbrella of NEXA Tech Labs"* dengan logo monokrom NEXA Tech Labs berukuran tinggi 16px–18px.
- **Footer**: Memuat deskripsi singkat bahwa NCD adalah badan inkubasi komunitas di bawah naungan resmi NEXA Tech Labs.

### 5.2 Kartu Anggota & Galeri (35 Member Directory)
- **Rasio Foto**: Persegi 1:1 atau rasio potret 4:5 yang konsisten dengan sudut melengkung halus.
- **Crop Otomatis & Optimasi**: Memusatkan wajah secara konsisten; fallback dengan avatar inisial berlatar aksen ungu bila foto belum tersedia.
- **Informasi Kartu**: Nama lengkap, jabatan resmi, angkatan, tag keahlian utama (maksimal 3 tag terlihat, sisanya `+n`).
- **Aturan Privasi**: Tombol salin email atau nomor kontak langsung ditiadakan di kartu publik. Hanya tautan publik yang diizinkan (LinkedIn, GitHub, Portfolio).

### 5.3 Modul Tabel Kas & Tampilan Keuangan
- **Header Ringkasan**:
  - Kartu Saldo Kas Bersih (angka besar dengan font tabular).
  - Kartu Total Pemasukan Periode Ini (hijau lembut).
  - Kartu Total Pengeluaran Periode Ini (merah lembut).
  - Kartu Transaksi Menunggu Verifikasi (amber).
- **Tabel Transaksi**:
  - Kolom: Tanggal, Tipe (In/Out), Kategori, Keterangan, Nominal, Pembuat (Maker), Status (Draft/Verified/Void), Aksi Nota.
  - Hover baris menampilkan opsi pratinjau struk/nota instan dalam modal tanpa perlu berpindah halaman.
  - Transaksi berstatus `DRAFT` diberi badge warna kuning *"Menunggu Verifikasi Bendahara II"*.
  - Transaksi berstatus `VOID` diberi coretan strikethrough dan badge merah *"Dibatalkan"*.

### 5.4 Formulir Pendaftaran Terbuka (Join Us)
- Tata letak satu kolom yang fokus dan bebas distraksi.
- Validasi seketika (*inline validation*) saat pengguna keluar dari field input (*onBlur*).
- Indikator progres atau pembagian seksi logis: *Identitas Diri → Akademik & Portofolio → Minat & Komitmen*.
- Pesan persetujuan privasi data (UU PDP) dengan checkbox eksplisit sebelum tombol submit aktif.

---

## 6. Prinsip Gerak & Animasi (Motion Design)

- **Durasi & Easing**: Animasi fungsional dan singkat (durasi ≤ 300ms) menggunakan kurva easing standar `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Tujuan Gerak**: Gerakan hanya digunakan untuk memberikan umpan balik hierarki dan konteks spasial (misal: accordion buka-tutup, transisi tab, atau modal popup).
- **Aksesibilitas Preferensi Gerak**: Menghormati pengaturan pengguna via query CSS:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
