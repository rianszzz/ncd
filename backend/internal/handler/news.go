package handler

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"time"
)

// PostDTO represents a public news or announcement entry for NCD.
type PostDTO struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Summary     string    `json:"summary"`
	ContentMD   string    `json:"content_md"`
	Category    string    `json:"category"`
	Tags        []string  `json:"tags"`
	AuthorName  string    `json:"author_name"`
	IsPinned    bool      `json:"is_pinned"`
	PublishedAt time.Time `json:"published_at"`
}

var defaultPosts = []PostDTO{
	{
		ID:         "post-1",
		Title:      "Pembukaan Pendaftaran Rekrutmen Calon Anggota NCD Batch 2026",
		Slug:       "pembukaan-rekrutmen-batch-2026",
		Summary:    "Nusantara Code Division (NCD) resmi membuka pendaftaran rekrutmen terbuka untuk angkatan 2026. Bergabunglah dengan barisan pengembang, periset, dan inovator sistem digital masa depan Indonesia.",
		Category:   "Pengumuman",
		Tags:       []string{"Rekrutmen", "Batch 2026", "Onboarding", "Talenta"},
		AuthorName: "Mirza Danisywar Noor Wahyu",
		IsPinned:   true,
		PublishedAt: time.Date(2026, 10, 20, 9, 0, 0, 0, time.UTC),
		ContentMD: `### Selamat Datang di Gelombang Perekrutan NCD Batch 2026

Nusantara Code Division (NCD) dengan bangga mengumumkan pembukaan pendaftaran rekrutmen terbuka bagi mahasiswa dan talenta muda berbakat yang ingin mengasah keahlian rekayasa perangkat lunak, riset keamanan siber, dan pengembangan ekosistem teknologi berstandar industri.

---

### Divisi yang Dibuka

Kami mencari individu dengan dedikasi tinggi dan semangat eksplorasi di bidang:

1. **Core Software Engineering**: Frontend (React/TypeScript), Backend (Go/Rust/PostgreSQL), dan Cloud Architecture.
2. **Cyber Security & Cryptography**: Analisis kerentanan, reverse engineering, implementasi kriptografi modern, dan audit keamanan kode.
3. **Product & Operations**: UI/UX design system, manajemen siklus produk digital, dan koordinasi riset publik.
4. **Administration & Finance**: Manajemen tata kelola komunitas berlandaskan akuntabilitas dan keterbukaan publik.

---

### Jadwal & Tahapan Seleksi

- **20 Okt - 05 Nov 2026**: Pengisian Formulir Aplikasi & Pengunggahan Portofolio Teknis.
- **08 Nov - 12 Nov 2026**: Penilaian Berkas Portofolio & Uji Coba Koding Asinkron.
- **15 Nov - 20 Nov 2026**: Sesi Wawancara Budaya & Kolaborasi Teknis (Culture & Technical Deep Dive).
- **25 Nov 2026**: Pengumuman Resmi Calon Anggota Batch 2026 & Orientasi Perdana.

---

### Persyaratan Utama

- Memiliki komitmen tinggi untuk aktif berkolaborasi dan berkontribusi dalam proyek open-source komunitas.
- Terbiasa menggunakan Git, Linux/Unix environment, serta mengedepankan penulisan kode bersih (*clean code*).
- Menjunjung tinggi kode etik profesional dan integritas kolektif.

Segera daftarkan diri Anda melalui portal pendaftaran resmi pada menu **Gabung NCD** atau hubungi pengurus divisi untuk konsultasi teknis lebih lanjut.`,
	},
	{
		ID:         "post-2",
		Title:      "Rilis Arsitektur Platform Terintegrasi NCD: Monorepo & Zero-Trust Governance",
		Slug:       "rilis-arsitektur-platform-terintegrasi-ncd",
		Summary:    "Meluncurkan pembaharuan menyeluruh pada infrastruktur NCD: konsolidasi layanan backend Chi & PostgreSQL, frontend modern React 19, serta modul audit keuangan transparan.",
		Category:   "Rilis Produk",
		Tags:       []string{"Arsitektur", "Monorepo", "Go", "React", "Zero Trust"},
		AuthorName: "Rian (Lead Software Engineer)",
		IsPinned:   false,
		PublishedAt: time.Date(2026, 10, 18, 14, 30, 0, 0, time.UTC),
		ContentMD: `### Konsolidasi Infrastruktur NCD v2.0

Sebagai wujud komitmen NCD terhadap standar rekayasa modern, tim engineering telah menyelesaikan migrasi arsitektur monorepo terpadu yang memadukan performa tinggi, keandalan sistem, dan keamanan berstandar enterprise.

---

### Pilar Utama Pembaharuan

#### 1. Backend Ultra-Ringan Berbasis Go & Chi Router
Dengan mengganti kerangka kerja tradisional menggunakan pustaka standar Go yang dipadukan bersama router Chi v5 dan koneksi pool PostgreSQL pgx/v5, rata-rata latensi respons API berkurang sebesar **64%** dengan alokasi memori yang sangat hemat.

#### 2. Antarmuka React 19 & Tailwind Engine
Frontend kini dibangun di atas React 19 dan Vite, menerapkan prinsip desain Apple Fluid Interface:
- Spacing modular 4/8pt konsisten.
- Skema palet warna kontras tinggi (#111215 dan #525660 dengan aksen #6456EB).
- Tipografi SF Pro dengan keterbacaan tajam dan rendering optimal.

#### 3. Zero-Trust & Protokol Maker-Checker Kas
Modul Buku Kas Terbuka NCD dirancang dengan sistem otorisasi berlapis. Setiap pengeluaran kas harus dibuat oleh Bendahara I (*Maker*), diverifikasi oleh Bendahara II (*Checker*), dan dapat diaudit secara *read-only* oleh seluruh publik tanpa batasan.

---

### Akses Kode Sumber

Arsitektur ini didesain agar mudah diinspeksi oleh seluruh anggota komunitas untuk tujuan edukasi dan peningkatan mutu rekayasa kolektif.`,
	},
	{
		ID:         "post-3",
		Title:      "Workshop Riset Keamanan Siber & Kriptografi Komputasi Pasca-Kuantum",
		Slug:       "workshop-riset-keamanan-siber-kriptografi",
		Summary:    "Divisi riset NCD menyelenggarakan sesi kajian intensif mengenai implementasi algoritma kriptografi tahan-kuantum (PQC) serta praktik pertahanan aplikasi modern.",
		Category:   "Riset & Edukasi",
		Tags:       []string{"Keamanan Siber", "Kriptografi", "Post-Quantum", "Workshop"},
		AuthorName: "Muhamad Fauzan Al Farikhi",
		IsPinned:   false,
		PublishedAt: time.Date(2026, 10, 15, 10, 0, 0, 0, time.UTC),
		ContentMD: `### Kajian Khusus: Kriptografi Pasca-Kuantum (PQC)

Perkembangan pesat komputasi kuantum menimbulkan tantangan eksistensial terhadap algoritma enkripsi asimetris tradisional seperti RSA dan ECC. Divisi Keamanan Siber NCD menyelenggarakan workshop teknis interaktif untuk membedah standar baru NIST PQC.

---

### Topik Kajian Utama

1. **Lattice-Based Cryptography**: Pendalaman matematis di balik algoritma *CRYSTALS-Kyber* (KEM) dan *CRYSTALS-Dilithium* (Digital Signature).
2. **Hybrid TLS Handshake**: Eksperimen penggabungan kunci klasik X25519 dengan Kyber768 untuk proteksi backward-compatible.
3. **Memory Safety & Hardware Vulnerabilities**: Analisis mitigasi serangan side-channel pada implementasi bahasa pemrograman tingkat rendah.

---

### Catatan Hasil Praktikum

Seluruh peserta workshop mempraktikkan benchmarking langsung implementasi modul PQC dalam bahasa pemrograman Go dan Rust. Hasil pengujian menunjukkan bahwa overhead enkripsi post-quantum dapat ditekan di bawah 1.5ms pada lingkungan cloud komersial.

Materi presentasi, dokumentasi referensi, dan repositori studi kasus telah diarsipkan di repositori riset internal NCD.`,
	},
	{
		ID:         "post-4",
		Title:      "Standar Tata Kelola Transparansi Kas & Finansial Terbuka NCD",
		Slug:       "standar-tata-kelola-transparansi-kas-ncd",
		Summary:    "NCD mengadopsi prinsip akuntabilitas radikal: setiap rupiah donasi, iuran, dan belanja operasional tercatat secara real-time dan dapat diaudit oleh publik.",
		Category:   "Pengumuman",
		Tags:       []string{"Transparansi", "Tata Kelola", "Buku Kas", "Good Governance"},
		AuthorName: "Putri Aura Wening",
		IsPinned:   false,
		PublishedAt: time.Date(2026, 10, 10, 8, 0, 0, 0, time.UTC),
		ContentMD: `### Menegakkan Integritas Finansial Kolektif

Kepercayaan adalah mata uang paling berharga dalam organisasi berbasis komunitas teknologi. Melalui perilisan buku kas terbuka, NCD menetapkan tolok ukur baru bagi tata kelola organisasi mahasiswa dan komunitas pengembang di Indonesia.

---

### Mekanisme Pengamanan Finansial

- **Auditability**: Seluruh transaksi memiliki bukti struk/kwitansi sah yang dapat dilihat langsung oleh publik.
- **Pemisahan Kewenangan**: Bendahara I bertindak sebagai pembuat draft pengeluaran, sedangkan Bendahara II melakukan verifikasi validitas sebelum saldo kas resmi terpotong.
- **Immutable Log**: Rekam jejak pembatalan transaksi (*void*) wajib menyertakan alasan tertulis dan tercatat permanen di basis data.

---

### Laporan Ringkas Kas Terakhir

Dengan saldo berjalan yang stabil dan cadangan kas operasional server yang tercukupi, NCD siap mendukung seluruh agenda riset dan workshop anggota tanpa kendala pendanaan.`,
	},
	{
		ID:         "post-5",
		Title:      "Eksplorasi Runtime WebAssembly (WASM) untuk Komputasi Edge Latensi Rendah",
		Slug:       "eksplorasi-runtime-wasm-edge",
		Summary:    "Hasil komparasi performa eksekusi fungsi terisolasi WebAssembly di Cloudflare Workers vs containerized microservices untuk pemrosesan data real-time.",
		Category:   "Riset & Edukasi",
		Tags:       []string{"Edge Computing", "WebAssembly", "Cloudflare", "Performance"},
		AuthorName: "Rayyan Fathan Addani",
		IsPinned:   false,
		PublishedAt: time.Date(2026, 10, 5, 16, 0, 0, 0, time.UTC),
		ContentMD: `### Mengapa Edge & WebAssembly?

Dalam arsitektur terdistribusi modern, memproses data sedekat mungkin dengan pengguna akhir menjadi kunci utama mencapai responsivitas di bawah 50 milidetik di seluruh penjuru kepulauan Indonesia.

---

### Metodologi Pengujian

Kami menguji skenario validasi payload JSON dan verifikasi kriptografi token JWT dengan 3 pendekatan:
1. Docker Container di Cloud VM (Singapura).
2. Serverless Function Node.js.
3. WebAssembly Module terkompilasi dari Go & Rust pada edge network.

---

### Hasil & Kesimpulan

Runtime WASM menunjukkan keunggulan mutlak pada waktu pemanasan (*cold start*) kurang dari 2 milidetik dan isolasi memori sandbox yang sangat aman. Riset ini akan menjadi dasar implementasi middleware gerbang API generasi berikutnya untuk platform NCD.`,
	},
	{
		ID:         "post-6",
		Title:      "Rilis NCD CLI v1.2: Otomasi Scaffolding Layanan & Linting Konvensi Kode",
		Slug:       "rilis-ncd-cli-v1-2",
		Summary:    "Alat bantu CLI resmi bagi kontributor NCD untuk mempercepat bootstrap modul handler, sinkronisasi skema SQL, dan validasi standar kode otomatis.",
		Category:   "Rilis Produk",
		Tags:       []string{"Developer Tooling", "CLI", "Golang", "Productivity"},
		AuthorName: "Muhamad Fauzan Al Farikhi",
		IsPinned:   false,
		PublishedAt: time.Date(2026, 9, 28, 11, 15, 0, 0, time.UTC),
		ContentMD: `### Meningkatkan Produktivitas Pengembang Komunitas

Untuk menjaga keseragaman format kode dan mempercepat proses onboarding pengembang baru, kami merilis NCD CLI versi 1.2 dengan serangkaian kapabilitas otomatisasi baru.

---

### Fitur Baru di Versi 1.2

- **Scaffold Handler Otomatis**: Perintah 'ncd gen handler <name>' untuk men-generate boilerplate HTTP handler dengan pattern Chi dan DTO terstruktur.
- **Pre-commit Linter**: Pemeriksa ketaatan konvensi penamaan variabel, penanganan error eksplisit, dan sanitasi query SQL.
- **Diagnostic Helper**: Memeriksa konektivitas PostgreSQL lokal dan variabel lingkungan dalam satu ketukan perintah.

---

### Cara Instalasi

Anggota dapat mengunduh dan memasang biner rilis melalui perintah terminal:

> curl -sSL https://get.ncd.dev/cli | bash

Dokumentasi lengkap dan panduan kontribusi telah tersedia di repositori publik tooling NCD.`,
	},
}

// GetPublicPosts returns the list of public announcements and news articles.
// It supports filtering by category via query parameter ?category=... (e.g. Pengumuman, Rilis Produk, Riset & Edukasi).
// Pinned posts are prioritized at the top, followed by reverse chronological order.
func GetPublicPosts(w http.ResponseWriter, r *http.Request) {
	category := strings.TrimSpace(r.URL.Query().Get("category"))

	// Create working copy of posts
	posts := make([]PostDTO, 0, len(defaultPosts))
	for _, p := range defaultPosts {
		if category != "" && !strings.EqualFold(category, "ALL") {
			if !strings.EqualFold(p.Category, category) {
				continue
			}
		}
		posts = append(posts, p)
	}

	// Sort: Pinned first, then PublishedAt descending
	sort.SliceStable(posts, func(i, j int) bool {
		if posts[i].IsPinned != posts[j].IsPinned {
			return posts[i].IsPinned
		}
		return posts[i].PublishedAt.After(posts[j].PublishedAt)
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(posts)
}
