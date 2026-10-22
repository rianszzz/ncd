# USER JOURNEY & SYSTEM WORKFLOW — Website NCD (FLOW.md)

| Metadata | Nilai |
| :--- | :--- |
| **Versi** | 1.0.0 |
| **Tujuan** | Standarisasi peta navigasi, alur interaksi pengguna, dan transisi status sistem agar alur aplikasi terstruktur, terprediksi, dan tidak tumpang-tindih. |
| **Target Pengguna** | Pengunjung Umum (Visitor), Calon Anggota (Applicant), Anggota (Member), Sekretaris, Bendahara I & II, Super Admin |

---

## 1. Peta Navigasi Global (Global Sitemap & Routing Map)

Platform dibagi menjadi 2 zona utama dengan batas autentikasi yang tegas:

```mermaid
flowchart TD
    User["Pengguna Web"] --> Choice{"Status Sesi"}
    
    %% Public Zone
    Choice -->|"Tanpa Login (Publik)"| PublicZone["Zona Publik (Unauthenticated)"]
    PublicZone --> P_Home["/ (Beranda)"]
    PublicZone --> P_About["/about (Tentang & Visi-Misi)"]
    PublicZone --> P_Team["/team (Struktur & Galeri 35 Anggota)"]
    PublicZone --> P_Projects["/projects (Katalog Portofolio Proyek)"]
    PublicZone --> P_ProjDetail["/projects/:slug (Detail Proyek)"]
    PublicZone --> P_Competitions["/competitions (Prestasi & Lomba)"]
    PublicZone --> P_History["/history (Timeline Jejak Sejarah)"]
    PublicZone --> P_News["/news (Warta & Artikel Publik)"]
    PublicZone --> P_Join["/join (Formulir Pendaftaran Terbuka)"]
    PublicZone --> P_Rules["/rules (Ringkasan Kode Etik Publik)"]
    PublicZone --> P_Login["/login (Portal Masuk Anggota)"]
    PublicZone --> P_Register["/register?token=... (Aktivasi Undangan)"]

    %% Portal Zone
    Choice -->|"Terotentikasi (Cookie httpOnly)"| PortalZone["Zona Portal Member (/app/*)"]
    PortalZone --> M_Dashboard["/app (Dashboard Personal)"]
    PortalZone --> M_Projects["/app/projects (Manajemen Proyek Kanban)"]
    PortalZone --> M_Competitions["/app/competitions (Tracker Deadline Lomba)"]
    PortalZone --> M_Finance["/app/finance (Transparansi Kas & Iuran)"]
    PortalZone --> M_News["/app/news (Pengumuman Internal)"]
    PortalZone --> M_Documents["/app/documents (Arsip Berkas & AD/ART)"]
    PortalZone --> M_Profile["/app/profile (Profil & Pengaturan Privasi)"]
    
    %% Admin Only
    PortalZone -->|"Role: SUPER_ADMIN"| A_Admin["/app/admin (Manajemen Anggota, Role, Audit)"]
```

---

## 2. Alur Pengunjung Publik & Rekrutmen (Visitor & Application Flow)

Alur calon pendaftar mulai dari mempelajari kredibilitas NCD hingga mengirim formulir seleksi:

```mermaid
sequenceDiagram
    autonumber
    actor V as Calon Anggota (Visitor)
    participant FE as Frontend React (/join)
    participant BE as Backend Go (/api/v1/public)
    participant DB as PostgreSQL (Supabase)
    actor AD as Tim Pengurus (Sekretaris / Super Admin)

    V->>FE: Akses halaman /join
    FE->>BE: GET /api/v1/public/recruitment-status
    BE->>DB: Query pengaturan periode pendaftaran
    DB-->>BE: Status aktif / non-aktif
    BE-->>FE: Response status periode

    alt Periode Ditutup
        FE-->>V: Tampilkan banner "Rekrutmen Sedang Ditutup" + jadwal berikutnya
    else Periode Dibuka
        V->>FE: Mengisi formulir (data diri, portofolio, minat divisi, motivasi)
        V->>FE: Menyetujui syarat persetujuan privasi data (UU PDP)
        V->>FE: Klik tombol "Kirim Pendaftaran"
        FE->>BE: POST /api/v1/public/apply (Payload form + token anti-spam)
        Note over BE: Validasi anti-spam (honeypot/captcha), sanitasi input
        BE->>DB: INSERT INTO applications (status: 'NEW')
        BE-->>FE: Status 201 Created (ID Pendaftaran)
        FE-->>V: Tampilkan notifikasi sukses & kirim email konfirmasi otomatis
        
        %% Admin Review
        AD->>BE: GET /api/v1/admin/applications
        BE-->>AD: Daftar antrean pendaftar baru
        AD->>BE: UPDATE status ('IN_REVIEW' -> 'INTERVIEW' -> 'ACCEPTED'/'REJECTED')
        BE->>DB: Simpan catatan wawancara & status seleksi
    end
```

---

## 3. Alur Autentikasi & Aktivasi Akun (Auth & Onboarding Flow)

Sistem pendaftaran anggota **tidak terbuka untuk publik**, melainkan berbasis undangan (*invite-only*):

```mermaid
flowchart TD
    StartInv["Super Admin membuat Undangan"] --> GenToken["POST /api/v1/admin/invites"]
    GenToken --> StoreToken["Simpan invite_token (TTL 48 Jam) di DB"]
    StoreToken --> SendLink["Kirim Tautan Unik: /register?token=UUID ke Calon Anggota"]
    
    SendLink --> OpenLink["Anggota membuka /register?token=UUID"]
    OpenLink --> ValidateToken{"Token Valid & Belum Expired?"}
    
    ValidateToken -- "Tidak" --> ErrPage["Tampilkan Error: Tautan Tidak Valid / Kadaluarsa"]
    ValidateToken -- "Ya" --> FormPass["Tampilkan Form Buat Kata Sandi Pertama"]
    
    FormPass --> SubmitPass["Kirim Password Baru ke BE"]
    SubmitPass --> HashPass["Backend Go hash password (bcrypt/argon2id)"]
    HashPass --> ActivateUser["Set is_active = TRUE, hapus invite_token"]
    ActivateUser --> AutoLogin["Terbitkan JWT & Set Cookie httpOnly"]
    AutoLogin --> RedirectDash["Arahkan langsung ke /app (Dashboard)"]
```

### Alur Login Reguler:
```
[Halaman /login] ──> Input Email + Password ──> POST /api/v1/auth/login
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
      [Kredensial Valid]         [Kredensial Salah]
             │                           │
  Akun Aktif (is_active)?         Tolak: 401 Unauthorized
   ├── Tidak ──> 403 Deactivated  (Tampilkan pesan error)
   └── Ya ──> Terbitkan JWT
             Set Cookie: access_token
             Redirect ke /app
```

---

## 4. Alur Transparansi Kas: Tata Kelola Maker-Checker (FR-FIN)

Modul keuangan menerapkan prinsip pemisahan wewenang yang tidak dapat dilanggar (*anti-fraud*):

```mermaid
sequenceDiagram
    autonumber
    actor B1 as Bendahara I (Maker)
    actor B2 as Bendahara II (Checker)
    actor SA as Super Admin
    actor M as Anggota Biasa (Member)
    participant FE as Frontend React (/app/finance)
    participant BE as Backend Go API
    participant ST as Supabase Object Storage
    participant DB as PostgreSQL Database

    %% Step 1: Input Mutasi
    B1->>FE: Buka modal "Catat Transaksi Baru"
    B1->>FE: Unggah foto struk/nota belanja
    FE->>ST: Upload file bukti ke bucket 'receipts-kas'
    ST-->>FE: Kembalikan public/signed receipt_url
    B1->>FE: Input nominal, tanggal, kategori, dan deskripsi
    B1->>FE: Klik "Simpan Draft Mutasi"
    FE->>BE: POST /api/v1/finance/transactions
    Note over BE: Validasi: status otomatis 'DRAFT_PENDING', maker_id = B1.ID
    BE->>DB: INSERT INTO finance_transactions
    BE-->>FE: 201 Created (Transaksi berstatus DRAFT_PENDING)

    %% Step 2: Kondisi Saldo
    Note over DB,BE: Transaksi DRAFT_PENDING BELUM memotong/menambah saldo kas resmi!

    %% Step 3: Verifikasi Checker
    B2->>FE: Buka tab "Menunggu Verifikasi"
    FE->>BE: GET /api/v1/finance/transactions?status=DRAFT_PENDING
    BE-->>FE: Daftar transaksi pending
    B2->>FE: Buka modal pratinjau bukti nota & detail nominal
    
    alt Bendahara II Setuju (Approve)
        B2->>FE: Klik "Sahkan & Verifikasi"
        FE->>BE: POST /api/v1/finance/transactions/:id/verify
        Note over BE: Invariant Check: B2.ID != maker_id (B1)
        BE->>DB: UPDATE status = 'VERIFIED', verifier_id = B2.ID, verified_at = NOW()
        BE->>DB: INSERT INTO audit_logs ('VERIFY_TRANSACTION')
        BE-->>FE: 200 OK (Saldo kas resmi ter-update)
    else Terjadi Kesalahan Input oleh B1
        B2-->>B1: Minta B1 batalkan atau revisi via catatan
    end

    %% Step 4: Void Darurat (Bila terjadi kesalahan fatal pada transaksi verified)
    opt Pembatalan Mutasi Terverifikasi (Hanya Super Admin)
        SA->>FE: Klik "Batalkan Transaksi (Void)"
        FE->>SA: Tampilkan modal wajib isi alasan pembatalan
        SA->>FE: Input alasan: "Nota salah upload oleh vendor"
        FE->>BE: POST /api/v1/finance/transactions/:id/void
        BE->>DB: UPDATE status = 'VOID', void_reason = ..., void_at = NOW()
        BE->>DB: INSERT INTO audit_logs ('VOID_TRANSACTION')
        Note over DB: Data TIDAK DIHAPUS (Immutability). Saldo terkoreksi otomatis!
    end

    %% Step 5: Akses Anggota Biasa (Transparansi Penuh)
    M->>FE: Anggota biasa membuka /app/finance
    FE->>BE: GET /api/v1/finance/summary & GET /api/v1/finance/transactions
    BE-->>FE: Rekap saldo, grafik arus kas, riwayat mutasi + link bukti nota
    Note over M,FE: Anggota dapat mengunduh rekapan PDF/CSV dan mengaudit bukti.
```

---

## 5. Alur Buku Iuran Anggota & Proteksi Privasi (UU PDP)

Menjaga transparansi tanpa melanggar privasi individual antar anggota:

```mermaid
flowchart TD
    UserReq["User membuka Tab Iuran di /app/finance/dues"] --> RoleCheck{"Peran Pengguna?"}
    
    RoleCheck -- "Member Biasa" --> UserOnly["Query: WHERE member_id = current_user_id"]
    UserOnly --> ViewSelf["Hanya melihat kartu riwayat iuran miliknya sendiri:
    - Bulan Lunas / Belum Lunas
    - Bukti Pembayaran Pribadi"]
    
    RoleCheck -- "Bendahara / Super Admin" --> FullView["Query: Seluruh 35 Anggota"]
    FullView --> ViewMatrix["Melihat Matriks 35 Anggota:
    - Rekap Lunas per Periode Bulan
    - Tombol Konfirmasi Pembayaran
    - Filter berdasarkan angkatan / divisi"]
```

---

## 6. Siklus Hidup Proyek & Prestasi (Project & Competition Lifecycle)

Alur manajemen karya internal hingga dipamerkan ke etalase publik:

```mermaid
stateDiagram-v2
    [*] --> IDEA: Anggota Mengusulkan Ide Proyek
    IDEA --> ACTIVE: Disetujui Pengurus & Ditunjuk PIC
    
    state ACTIVE {
        [*] --> Sprint
        Sprint --> Development
        Development --> Testing
    }
    
    ACTIVE --> IN_REVIEW: Fitur Selesai & Review Tim Teknis
    IN_REVIEW --> COMPLETED: Lolos UAT & Rilis
    
    state COMPLETED {
        [*] --> InternalArchive
        InternalArchive --> PublicShowcase: Toggle is_public = TRUE
    }
    
    COMPLETED --> ARCHIVED: Masa Aktif Berakhir / Tidak Dirawat
    ARCHIVED --> [*]
```

### Transisi Prestasi Kompetisi (Competition to Hall of Fame):
```
[Rencana Ikut Lomba] ──> Status: PLANNING
          │
          ▼
[Pendaftaran & Submisi Berkas] ──> Status: REGISTERED / ONGOING
          │
          ▼
[Pengumuman Hasil Lomba] ──> Status: COMPLETED
          │
     ┌────┴────────────────────────┐
     ▼                             ▼
[Meraih Juara / Finalis]     [Belum Juara]
     │                             │
Terbitkan ke Hall of Fame     Tersimpan sebagai arsip internal
(achievement_level dicatat)
Muncul di /achievements
```

---

## 7. Penanganan Kondisi Error & Status Khusus (Error Handling States)

Untuk menjaga keandalan antarmuka dan kepuasan pengguna, setiap halaman menerapkan 4 status standar:

| Kondisi Sistem | Tampilan Antarmuka (UI State) | Tindakan Pengguna (Recovery Action) |
| :--- | :--- | :--- |
| **Data Sedang Dimuat (Loading)** | Skeleton placeholder halus beranimasi pulsa (sesuai tata letak kartu). | Otomatis berganti saat request selesai. |
| **Data Kosong (Empty State)** | Ilustrasi minimalis + teks informatif: *"Belum ada proyek aktif pada kategori ini"*. | Tombol CTA relevan (misal: "Buat Proyek Baru" bagi pengurus). |
| **Sesi Habis (401 Unauthorized)** | Modal pemberitahuan: *"Sesi Anda telah berakhir"* + redirect halus ke `/login`. | Pengguna masuk kembali; form input terakhir dicadangkan di memory. |
| **Akses Ditolak (403 Forbidden)** | Tampilan halaman khusus: *"Anda tidak memiliki wewenang untuk mengakses modul ini"*. | Tombol *"Kembali ke Dashboard Utama"*. |
| **Server Gangguan (500 Internal)** | Alert peringatan dengan tombol coba lagi: *"Gagal menghubungi server Go API"*. | Tombol *"Muat Ulang Data (Retry)"* memicu invalidasi query TanStack. |
| **Halaman Tidak Ditemukan (404)** | Halaman ramah bertema NCD dengan tautan kembali ke Beranda publik. | Link navigasi cepat ke Beranda, Proyek, dan Kontak. |

---

## 8. Ringkasan Guard & Middleware Aturan Rute

```
HTTP Request
     │
     ▼
[Next / React Router]
     │
     ├── Path: / (Publik) ───────────────> Buka Langsung (Tanpa Guard)
     ├── Path: /login ───────────────────> Jika sudah ber-login, alihkan ke /app
     ├── Path: /register?token=... ──────> Validasi token di Backend Go
     │
     └── Path: /app/* (Portal Internal) ──> Cek Cookie 'access_token'
              │
              ├── Tidak Ada Token ───────> Redirect ke /login?redirect=/app/...
              ├── Token Tidak Valid ─────> Hapus Cookie & Redirect ke /login
              │
              └── Token Valid:
                   │
                   ├── Path: /app/admin ──> Cek Role: SUPER_ADMIN / GOD_ADMIN
                   │                         ├── Tidak -> 403 Forbidden
                   │                         └── Ya    -> Render Admin Hub
                   │
                   ├── Path: /app/finance -> Cek Role:
                   │                         ├── B1 -> Hak Input Mutasi
                   │                         ├── B2 -> Hak Verifikasi Mutasi
                   │                         └── Member -> Hak Baca Kas & Iuran Pribadi
                   │
                   └── Path: Modul Lain ──> Render Sesuai Hak Akses Modul
```
