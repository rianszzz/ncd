# DESIGN SYSTEM & UI/UX SPECIFICATION — Website NCD
## Gaya Desain: Bauhaus (Geometric Constructivism & Functional Utility)

| Metadata | Spesifikasi Desain & Antarmuka |
| :--- | :--- |
| **Versi Dokumen** | 2.0.0 (Bauhaus Edition) |
| **Gaya Desain** | **Bauhaus Modern (Functionalism, Pure Geometry & Primary Blocking)** |
| **Kaidah Inti** | *Form Follows Function*, Geometri Murni (Lingkaran & Persegi), Blok Warna Primer, Batas Struktural Tegas (*2px Solid Black Border*), dan Bayangan Keras (*Hard Offset Shadow*). |
| **Karakter Brand** | Fungsional, arsitektural, berkarakter rekayasa kuat, anti-ornamen kosong (*anti-slop*), berani (*bold*), dan mencerminkan presisi sains & teknologi tier-1. |

---

## 1. Filosofi & Prinsip Desain Bauhaus

1. **Form Follows Function (Bentuk Mengikuti Fungsi)**  
   Setiap elemen visual harus memiliki kegunaan teknis atau navigasi langsung. Ditiadakan gradien dekoratif semu, *drop-shadow* blur kabur, atau ornamen grafis tanpa fungsi. Keindahan hadir dari struktur dan keteraturan data itu sendiri.
2. **Geometri Murni & Ketegasan Arsitektural**  
   Tata letak dibangun dari interaksi bentuk geometris murni: persegi tegas (`rounded-none` / radius 0px), lingkaran sempurna (`rounded-full`), dan garis orthogonal horizontal/vertikal 90 derajat.
3. **Blok Warna Primer & Kontras Ekstrem**  
   Mengadopsi triad warna khas Bauhaus: **Primary Blue / Cobalt (`#1040C0` / `#6C4DF6`)**, **Primary Vermilion Red (`#D02020`)**, dan **Primary Cadmium Yellow (`#F0C020`)**, berpadu dengan kanvas *Off-White Warm Paper* (`#F4F1EA`) dan tinta hitam pekat *Stark Black* (`#121212`).
4. **Batas Struktural & Bayangan Keras (*Hard Shadows*)**  
   Pemisah modul menggunakan garis tegas `border-2 border-[#121212]`. Elevasi tidak menggunakan blur, melainkan bayangan geser kaku (*hard offset shadow*: `4px 4px 0px #121212`).
5. **Respons Taktil Mekanikal (*Mechanical Tactile Feedback*)**  
   Interaksi tombol menyerupai saklar fisik mesin: saat ditekan (`:active`), elemen berpindah `translate(2px, 2px)` dan bayangannya menyusut instan (0ms / snap), memberi umpan balik nyata seketika.
6. **Transparansi Finansial Kas yang Rasional**  
   Tabel buku kas Maker-Checker mengutamakan angka tabular presisi (*tnum*), pembagian kolom asimetris yang rasional, dan kode warna status fungsional.

---

## 2. Palet Warna & Design Tokens

### 2.1 Mode Terang (Default Bauhaus Canvas)

| Token Nama | Nilai HEX / CSS | Peran & Penggunaan Bauhaus |
| :--- | :--- | :--- |
| `--bg-primary` | `#F4F1EA` | Kanvas utama (Off-White / Warm Paper khas atelier Bauhaus). |
| `--bg-surface` | `#FFFFFF` | Latar blok kartu, form box, dan modul struktural. |
| `--bg-subtle` | `#E8E4DA` | Aksen kisi modular, zebra table header, dan area pendukung. |
| `--text-primary` | `#121212` | Teks utama, judul display, angka penting (Stark Ink Black). |
| `--text-muted` | `#4B5162` | Teks keterangan fungsional, timestamp, label kolom. |
| `--border-bold` | `#121212` | Batas struktural wajib pada setiap blok (`2px solid #121212`). |
| `--shadow-hard` | `4px 4px 0px 0px #121212` | Bayangan tegas tanpa blur untuk kartu dan tombol aksi. |
| `--shadow-hard-sm` | `2px 2px 0px 0px #121212` | Bayangan tegas untuk badge, input field, dan tombol kecil. |

### 2.2 Triad Warna Primer Bauhaus & Semantic Tokens

| Token Nama | Nilai HEX | Makna & Penggunaan |
| :--- | :--- | :--- |
| `--color-blue` / `--accent-ncd` | `#6C4DF6` / `#1040C0` | **Primary Blue / Cobalt**: Simbol kecerdasan, logika, tombol CTA utama, dan status terverifikasi. |
| `--color-red` | `#D02020` | **Primary Vermilion Red**: Simbol ketegasan, transaksi keluar (kredit/expense), status VOID, dan peringatan kritis. |
| `--color-yellow` | `#F0C020` | **Primary Cadmium Yellow**: Simbol aksi proses, draft kas menunggu verifikasi Bendahara II, dan badge pilar organisasi. |
| `--color-green` | `#107C41` | Transaksi kas masuk (debet/income) dan status aktif kas transparan. |

### 2.3 Mode Gelap (Bauhaus Dark Inversion)

| Token Nama | Nilai HEX | Penggunaan Mode Gelap |
| :--- | :--- | :--- |
| `--bg-primary-dark` | `#0C0D10` | Kanvas gelap pekat (Architectural Slate Black). |
| `--bg-surface-dark` | `#16181F` | Latar modul kartu dan panel data. |
| `--text-primary-dark`| `#F4F1EA` | Teks utama terang kontras tinggi. |
| `--border-dark` | `#F4F1EA` atau `#2E3342` | Batas garis tegas putih/abu terang (`2px solid`). |
| `--shadow-hard-dark`| `4px 4px 0px 0px #F4F1EA` | Bayangan keras terang di atas kanvas gelap. |

---

## 3. Tipografi & Hirarki Visual Bauhaus

Tipografi Bauhaus menganut *New Typography* (Jan Tschichold / Herbert Bayer): tanpa serif (*grotesque*), geometris, tegas, skala kontras ekstrem, dan penggunaan huruf kapital terukur (*bold uppercase*).

### 3.1 Pilihan Font
- **Display & Headline**: `Outfit`, `Geist Sans`, `Space Grotesk`, atau `Cabinet Grotesk` dengan bobot `font-black` (800 / 900) dan *tracking-tighter*.
- **Body / Konten**: `Geist Sans` atau `Inter` (bobot 400 & 500) dengan tinggi baris nyaman (*leading-relaxed*).
- **Angka Finansial & Data Teknis**: `Geist Mono` atau `SF Mono` dengan `font-feature-settings: "tnum" 1, "zero" 1` untuk kalkulasi kas terbuka.

### 3.2 Skala Hirarki Tipografi

| Level | Ukuran (Desktop) | Bobot (Weight) | Case & Tracking | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `text-5xl md:text-7xl` | 900 (Black) | UPPERCASE / `-0.03em` | Headline utama beranda, pernyataan misi besar |
| **H1 (Page Title)** | `text-3xl md:text-5xl` | 800 (ExtraBold) | Sentence case / `-0.025em`| Judul halaman portofolio, tim, keuangan |
| **H2 (Section Header)** | `text-2xl md:text-3xl` | 800 (ExtraBold) | UPPERCASE / `-0.02em` | Judul seksi bento & pilar komunitas |
| **H3 (Card Title)** | `text-lg md:text-xl` | 700 (Bold) | Sentence case | Judul proyek, nama anggota pengurus |
| **Body Large** | `text-base md:text-lg` | 400 (Regular) | Normal leading | Paragraf pembuka / lead text |
| **Body Regular** | `text-sm` | 400 (Regular) | `max-w-[65ch]` | Deskripsi proyek, profil anggota |
| **Micro / Eyebrow** | `text-xs (11px)` | 700 (Bold) | UPPERCASE / `tracking-widest` | Label kategori, badge divisi, status nota |
| **Tabular Numbers** | `text-sm / text-2xl` | 700 (Bold) | Mono / `tabular-nums` | Nominal kas Maker-Checker |

---

## 4. Sistem Grid, Radius & Elevasi Bauhaus

### 4.1 Bentuk Geometris Murni (Strict Radius Policy)
- **Kotak Tajam (`rounded-none` / 0px)**:
  - Wajib untuk seluruh kartu fitur, panel modul, tabel, input form, dialog modal, dan kotak bento.
  - Memberi kesan disiplin arsitektur konstruktivis yang kokoh.
- **Lingkaran Sempurna (`rounded-full` / 9999px)**:
  - Digunakan secara eksklusif untuk elemen sirkular murni: lencana logo NCD, avatar pengurus, tombol aksi sirkular (FAB/Icon Button), dan badge bulat.
- **Dilarang keras**: Sudut membulat nanggung (*radius 8px / 12px / 16px* squircle halus). Gaya Bauhaus menolak kompromi: pilih antara **persegi tegas (0px)** atau **lingkaran sempurna**.

### 4.2 Batas & Bayangan Mekanikal
- **Batas Garis**: Wajib menggunakan `border-2 border-[#121212]` (2 piksel hitam tegas) pada semua batas modul dan tombol.
- **Bayangan Keras (*Hard Drop Shadow*)**:
  ```css
  /* Kartu dan tombol default */
  box-shadow: 4px 4px 0px 0px #121212;
  
  /* Badge kecil dan input focus */
  box-shadow: 2px 2px 0px 0px #121212;
  ```
- **Animasi Tekan Tombol Mekanikal**:
  ```css
  button:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px 0px #121212;
  }
  button:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px #121212;
    transition: none; /* Umpan balik instan tanpa lag */
  }
  ```

### 4.3 Asymmetric Grid Layout (Tata Letak Asimetris Terstruktur)
- Menggunakan CSS Grid dengan variasi ukuran sel yang berani (misal: rasio 2:1, pemisahan modular penuh, kolom tebal dengan garis pemisah vertikal).
- Ruang antar modul (*gutter*): `gap-6` atau `gap-8` yang konsisten dengan pembatas garis nyata.

---

## 5. Komponen Spesifik Halaman (Bauhaus Implementation)

### 5.1 Navigasi Utama (Navbar)
- Header kaku dengan garis batas bawah tegas `border-b-2 border-[#121212]`, latar belakang `#F4F1EA`.
- Logo NCD: Lingkaran ungu tegas berbingkai hitam `border-2 border-[#121212]` dengan monogram bold.
- Tautan menu: Teks tebal sans-serif, garis bawah aktif instan (*hard active border*), bukan pill membal.
- Tombol aksi *"Portal"* dan *"Gabung NCD"*: Kotak tajam `rounded-none`, `border-2 border-[#121212]`, bayangan `3px 3px 0px #121212`.

### 5.2 Hero Section Beranda
- **Judul Masif**: Tipografi besar berkontras tinggi, tanpa hiasan bayangan blur.
- **Aksen Geometris Bauhaus**: Pemanfaatan aksen balok warna primer (kotak kuning cerah untuk penanda, lingkaran biru untuk status aktif).
- **Dua Tombol Aksi Kontras**:
  - Tombol Primer: Latar ungu/biru Bauhaus, teks putih, batas 2px hitam, bayangan 4px hitam.
  - Tombol Sekunder: Latar putih/off-white, batas 2px hitam, teks hitam pekat.
- **Statistik Bento Geometris**: Modul grid 4 kotak dengan garis pembatas kaku `border-2 border-[#121212]`, angka tabular hitam tebal dengan label uppercase.

### 5.3 Pilar Komunitas & Repositori Proyek
- Setiap kartu bento memiliki *header band* berwarna primer solid (kartu 1 kuning, kartu 2 biru, kartu 3 merah/hijau).
- Gambar proyek: Rasio persegi atau poster arsitektural tanpa sudut lengkung (`rounded-none`), dibatasi garis hitam 2px.
- Indikator progres pengerjaan: Batang persentase kotak tegas dengan isian warna solid tanpa efek gradien.

### 5.4 Buku Kas Terbuka & Maker-Checker (Finansial)
- **4 Kotak Rekap Finansial**:
  - Saldo Kas Bersih: Bingkai tebal, angka masif, badge status hijau solid.
  - Total Pemasukan: Aksen hijau Bauhaus (`#107C41`).
  - Total Pengeluaran: Aksen merah vermilion (`#D02020`).
  - Pending Checker: Aksen kuning kadmium (`#F0C020`).
- **Tabel Transaksi Mutasi**:
  - Header tabel: Latar `#121212`, teks putih uppercase, garis kolom tegas.
  - Baris tabel: Garis pembatas `border-b-2 border-[#121212]`, font angka tabular.
  - Badge Status Maker-Checker: Kotak persegi tajam `border border-[#121212] font-bold uppercase`.

### 5.5 Formulir Pendaftaran (Join Us) & Kepatuhan UU PDP
- Input text dan textarea berbingkai `border-2 border-[#121212]`, latar putih solid, bayangan fokus `2px 2px 0px #121212`.
- Kotak persetujuan UU PDP menggunakan checkbox persegi kaku berlatar kontras.
- Tombol submit: Balok penuh warna biru/ungu berbayangan keras 4px.

---

## 6. Prinsip Gerak & Animasi Bauhaus

1. **Direct & Mechanical (Mekanikal & Seketika)**  
   Gerakan tidak boleh terasa lambat, mengambang, atau menggelombang. Durasi transisi adalah 0ms (instan) hingga maksimal 150ms dengan kurva linier atau *hard cubic-bezier* (`cubic-bezier(0, 0, 0.2, 1)`).
2. **Translasi Spasial Nyata**  
   Ketika elemen disentuh atau ditekan, ia bergerak 2px ke kanan-bawah secara fisik untuk mensimulasikan penekanan tombol mesin industri.
3. **Kepatuhan Aksesibilitas (`prefers-reduced-motion`)**  
   Saat mode gerak berkurang aktif, seluruh translasi posisi ditiadakan dan digantikan perubahan warna batas kaku instan.

---

## 7. Ringkasan Checklist Implementasi Bauhaus

- [ ] **Geometry**: Kartu dan input menggunakan `rounded-none` (0px); avatar dan mark menggunakan `rounded-full`.
- [ ] **Borders**: Seluruh modul, tombol, dan tabel dibingkai `border-2 border-[#121212]`.
- [ ] **Shadows**: Seluruh bayangan berupa *hard offset shadow* `4px 4px 0px #121212`, tanpa blur filter.
- [ ] **Palette**: Kanvas off-white `#F4F1EA`, teks hitam `#121212`, dan triad warna primer (Blue `#6C4DF6`/`#1040C0`, Red `#D02020`, Yellow `#F0C020`).
- [ ] **Typography**: Headings masif uppercase bold, angka tabular pada data kas.
- [ ] **Anti-Slop**: Nol gradien AI ungu murahan, nol glassmorphism kabur, nol efek hover melayang mengambang tanpa arah.
