# DESIGN SYSTEM SPECIFICATION — NEXA Community Development
## Gaya Desain: Apple Craft & Brand Integrity Edition

| Metadata | Spesifikasi Desain & Antarmuka |
| :--- | :--- |
| **Versi Dokumen** | 3.1.0 (NCD Authentic Brand & Apple Craft Edition) |
| **Gaya Desain** | **Apple Craft Foundations with Authentic NCD Canvas** |
| **Warna Utama** | **NCD Canvas `#F4F1EB`** (presisi diambil dari background resmi logo NCD), **Stark Ink `#111215`**, dan **System Accent `#6456EB`** (dari lingkaran aksen logo). |
| **Bentuk Tombol** | **Rounded Rectangle (`rounded-xl` / `rounded-lg`)**, BUKAN pill-shape (`rounded-full` ditiadakan sesuai arahan). |
| **Integritas Konten** | *Zero Fake Metrics*, *Zero Fake Reviews*, *Zero AI Slop / AI Copy*, *Zero Purple Gradient*, dan *Zero Cursor Animation*. |
| **Kepatuhan Hukum** | Dilengkapi halaman resmi **Syarat & Ketentuan (`/terms`)** dan **Kebijakan Privasi UU PDP (`/privacy`)**. |

---

## 1. Palet Warna Resmi (Berdasarkan Aset Asli Logo NCD)

| Token Nama | Nilai HEX / CSS | Peran & Penggunaan |
| :--- | :--- | :--- |
| `--bg-primary` | `#F4F1EB` | Kanvas utama (warna latar asli logo NCD, RGB 244, 241, 235). |
| `--bg-surface` | `#FFFFFF` | Latar kartu modul, form box, dan tabel transaksi kas. |
| `--bg-subtle` | `#EDE9E1` | Latar chip metadata dan area sekunder. |
| `--text-primary` | `#111215` | Teks utama, judul display, nominal kas resmi. |
| `--text-secondary`| `#525660` | Teks deskripsi paragraf, keterangan fitur. |
| `--text-muted` | `#7E8492` | Label metadata, timestamp, placeholder form. |
| `--accent-ncd` | `#6456EB` | Aksen lingkaran ungu resmi logo NCD (Solid, tanpa gradien). |
| `--border-hairline`| `rgba(17, 18, 21, 0.08)` | Garis pembatas kartu dan modul. |
| `--btn-dark` | `#111215` | Tombol aksi utama dengan teks `#F4F1EB`. |

---

## 2. Aturan & Standar Disiplin Visual

1. **Bentuk Tombol (No Pill Shape)**: Seluruh tombol interaktif, tabs, filter, dan search bar menggunakan radius `rounded-xl` (12px) atau `rounded-lg` (8px). Tidak menggunakan `rounded-full`.
2. **Tanpa Gradien Ungu (No Purple Gradients)**: Seluruh elemen warna ungu menggunakan warna solid `#6456EB` murni. Tidak ada efek gradien, glow semu, atau background gradient.
3. **Tanpa Fake Reviews & Testimoni Palsu**: Direktori talenta menampilkan bio ringkas dan keahlian teknis nyata tanpa tanda kutip ulasan atau testimoni fabrikasi.
4. **Tanpa Fake Counters**: Statistik komunitas menampilkan data riil dari API (`/public/stats`) secara langsung tanpa efek tick/counter animasi buatan.
5. **Logo Resmi & Favicon**:
   - `frontend/public/logo.png` (PNG transparan)
   - `frontend/public/logo.svg` (Vektor SVG presisi)
   - `frontend/public/favicon.ico` (Multi-size: 16x16, 32x32, 48x48, 64x64)
6. **Halaman Hukum & Kepatuhan**:
   - `/terms` (Syarat & Ketentuan Umum Organisasi & Open Source)
   - `/privacy` (Kebijakan Perlindungan Data Pribadi sesuai UU PDP No. 27 Tahun 2022)
