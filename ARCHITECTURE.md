# ARCHITECTURE & SYSTEM DESIGN — Website NCD

| Metadata | Spesifikasi Arsitektur Sistem |
| :--- | :--- |
| **Versi** | 2.0.0 (Decoupled Monorepo) |
| **Frontend Stack** | React 19 / Vite + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons + TanStack Query |
| **Backend Stack** | Go (Golang 1.23+) + Chi / Gin Router + pgx/v5 + sqlc (Type-safe SQL) + JWT Auth |
| **Database & Storage** | PostgreSQL 16 (Hosted on Supabase) + Supabase Object Storage (Receipts/Assets) |
| **Struktur Repositori** | Monorepo (`/frontend` & `/backend`) |

---

## 1. Diagram Arsitektur Tingkat Tinggi (Decoupled Monorepo)

```
                       [ Pengunjung Publik ]           [ Anggota & Pengurus NCD ]
                                │                                  │
                                ▼                                  ▼
                   ┌────────────────────────────────────────────────────────┐
                   │             Cloudflare CDN / Vercel Edge               │
                   │             (WAF, DDoS, SSL/TLS 1.3, Static SPA)       │
                   └────────────────────────────────────────────────────────┘
                                                │
                                                ▼
                   ┌────────────────────────────────────────────────────────┐
                   │           Frontend: React SPA (Vite + TypeScript)      │
                   │           - Sisi Publik: Beranda, Proyek, Tim, Join    │
                   │           - Sisi Portal (/app/*): Dashboard, Kas, Lomba │
                   │           - TanStack Query (Server State & Cache)      │
                   │           - Axios / Fetch Client (Interceptors JWT)    │
                   └────────────────────────────────────────────────────────┘
                                                │
                                                │ REST API (JSON / HTTPS)
                                                │ Sesi: Secure httpOnly Cookie
                                                ▼
                   ┌────────────────────────────────────────────────────────┐
                   │           Backend: Go REST API Service (/backend)      │
                   │           - Chi / Gin High-Performance Router          │
                   │           - Auth & RBAC Middleware (JWT & Refresh)     │
                   │           - Maker-Checker Financial Engine             │
                   │           - Audit Trail & Immutability Logic           │
                   │           - sqlc Generated Type-Safe Repositories      │
                   └────────────────────────────┬───────────────────────────┘
                                                │ pgx/v5 Connection Pool
                                                ▼
                   ┌────────────────────────────────────────────────────────┐
                   │                 Supabase Cloud Platform                │
                   ├────────────────────────────┬───────────────────────────┤
                   │  PostgreSQL 16 Managed DB  │  Supabase S3 Object Store │
                   │  - 20 Relational Tables    │  - Bucket: receipts-kas   │
                   │  - pgx Pooler (Port 6543)  │  - Bucket: avatars        │
                   │  - ACID Transactions       │  - Bucket: documents      │
                   └────────────────────────────┴───────────────────────────┘
```

---

## 2. Struktur Direktori Monorepo

```
/Users/rian/Documents/NCD/
├── frontend/                     # React Single Page Application (Vite)
│   ├── src/
│   │   ├── assets/               # Logo NCD & NEXA Tech Labs
│   │   ├── components/           # UI Primitives (shadcn/ui), Navbar, Footer
│   │   │   ├── ui/               # Button, Card, Dialog, Table, Badge, dll
│   │   │   ├── public/           # Hero, Directory, ProjectCard, JoinForm
│   │   │   └── portal/           # CashTable, Kanban, StatsWidget, Sidebar
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── hooks/                # useAuth, useTransactions, useProjects
│   │   ├── layouts/              # PublicLayout, PortalLayout, AdminLayout
│   │   ├── pages/                # Public & Portal Route Pages
│   │   ├── services/             # Axios API Client & Endpoints Definition
│   │   ├── types/                # TypeScript Interfaces (mirroring Go types)
│   │   ├── App.tsx               # React Router DOM Configuration
│   │   └── main.tsx              # React Entrypoint & Providers
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                      # Go Backend Service
│   ├── cmd/
│   │   └── api/                  # main.go (Server bootstrap & graceful shutdown)
│   ├── internal/
│   │   ├── config/               # App configuration (.env parsing)
│   │   ├── database/             # Postgres connection pool (pgxpool)
│   │   ├── handler/              # HTTP Handlers (Auth, Kas, Projects, Members)
│   │   ├── middleware/           # Auth JWT, RBAC Guard, Logger, CORS, RateLimit
│   │   ├── model/                # Domain models & DTOs
│   │   ├── repository/           # sqlc generated queries & custom db transactions
│   │   ├── service/              # Core Business Logic (Maker-Checker, Void)
│   │   └── storage/              # Supabase S3 client (receipt upload/download)
│   ├── migrations/               # SQL Migration Files (000001_init.sql)
│   ├── sqlc.yaml                 # sqlc codegen configuration
│   ├── queries/                  # Raw SQL queries for sqlc
│   ├── go.mod
│   └── go.sum
│
├── ARCHITECTURE.md
├── DESIGN.md
├── MEMORY.md
├── PRD.md
├── REQUIREMENTS.md
└── TASKS.md
```

---

## 3. Skema Basis Data Relasional (PostgreSQL di Supabase)

Skema database PostgreSQL dirancang secara relasional ketat, diakses oleh Go menggunakan driver `pgx/v5` dan di-generate menjadi kode Go type-safe menggunakan `sqlc`.

### 3.1 Skema Identitas, Pengguna & Organisasi

```sql
-- Role enumerasi pengguna
CREATE TYPE user_role AS ENUM (
  'GOD_ADMIN',
  'SUPER_ADMIN',
  'ADMIN_KONTEN_PROYEK',
  'SEKRETARIS',
  'BENDAHARA_I',
  'BENDAHARA_II',
  'MEMBER'
);

CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE', 'ALUMNI');

-- 1. Tabel Users (Kredensial Login & RBAC)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- Di-hash menggunakan bcrypt / argon2id dari Go
  role user_role NOT NULL DEFAULT 'MEMBER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by UUID REFERENCES users(id),
  invite_token VARCHAR(255),
  invite_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Members (Profil Detail Anggota)
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  full_name VARCHAR(150) NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  generation VARCHAR(20) NOT NULL, -- Contoh: "Angkatan 2024"
  major VARCHAR(100),              -- Jurusan kuliah
  university VARCHAR(100) DEFAULT 'Universitas Gunadarma',
  position_id UUID REFERENCES positions(id),
  division VARCHAR(50),            -- Divisi teknis (Web, Mobile, AI, Cloud)
  skills TEXT[] DEFAULT '{}',      -- Array skill tags
  bio TEXT,
  phone_number VARCHAR(30),        -- PRIVAT (hanya internal/pengurus)
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  show_in_public BOOLEAN NOT NULL DEFAULT TRUE, -- Izin UU PDP
  status member_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Jabatan Struktur Organisasi (Positions)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,     -- "Chairman", "Vice Chairman I", "Bendahara I"
  level INT NOT NULL,              -- 1 = Inti, 2 = Pengurus Harian, 3 = Anggota
  order_priority INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.2 Skema Modul Kas Transparan (Maker-Checker Ledger)

```sql
-- Enumerasi Keuangan
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE transaction_status AS ENUM ('DRAFT_PENDING', 'VERIFIED', 'VOID');
CREATE TYPE dues_status AS ENUM ('UNPAID', 'PENDING_CONFIRMATION', 'PAID');

-- 4. Kategori Keuangan
CREATE TABLE finance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- "Iuran Anggota", "Operasional Event", "Sponsor"
  type transaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabel Mutasi Kas Utama (Immutability Enforced via Go Service & DB Rules)
CREATE TABLE finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number VARCHAR(50) NOT NULL UNIQUE, -- Format: NCD-TRX-YYYYMM-XXXX
  type transaction_type NOT NULL,
  category_id UUID NOT NULL REFERENCES finance_categories(id),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  person_in_charge VARCHAR(150) NOT NULL,
  receipt_url TEXT NOT NULL, -- URL bukti nota di Supabase Storage
  status transaction_status NOT NULL DEFAULT 'DRAFT_PENDING',
  transaction_date DATE NOT NULL,
  
  -- Maker-Checker Trackers
  maker_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  verifier_id UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  
  -- Void Mechanism (Anti Delete)
  void_by_id UUID REFERENCES users(id),
  void_reason TEXT,
  void_at TIMESTAMPTZ,
  
  -- Constraint: Pembuat dan Verifikator TIDAK BOLEH akun yang sama
  CONSTRAINT chk_maker_not_verifier CHECK (maker_id != verifier_id)
);

-- 6. Tabel Rekapitulasi Iuran Anggota
CREATE TABLE dues_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  period_month INT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year INT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  status dues_status NOT NULL DEFAULT 'UNPAID',
  paid_at TIMESTAMPTZ,
  transaction_id UUID REFERENCES finance_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, period_month, period_year)
);
```

---

### 3.3 Skema Proyek, Kompetisi & Prestasi

```sql
CREATE TYPE project_status AS ENUM ('IDEA', 'ACTIVE', 'IN_REVIEW', 'COMPLETED', 'ARCHIVED');
CREATE TYPE competition_status AS ENUM ('PLANNING', 'REGISTERED', 'ONGOING', 'COMPLETED');

-- 7. Tabel Proyek
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  description_md TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  repo_url TEXT,
  demo_url TEXT,
  status project_status NOT NULL DEFAULT 'ACTIVE',
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  pic_member_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Relasi Anggota Proyek
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role_in_project VARCHAR(100) DEFAULT 'Developer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, member_id)
);

-- 9. Tabel Kompetisi / Lomba
CREATE TABLE competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  organizer VARCHAR(150) NOT NULL,
  registration_deadline TIMESTAMPTZ,
  submission_deadline TIMESTAMPTZ,
  status competition_status NOT NULL DEFAULT 'PLANNING',
  achievement_level VARCHAR(50),
  result_notes TEXT,
  file_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Tabel Prestasi (Hall of Fame)
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  event_name VARCHAR(200) NOT NULL,
  tier VARCHAR(50) NOT NULL, -- 'KAMPUS', 'NASIONAL', 'INTERNASIONAL'
  award_date DATE NOT NULL,
  certificate_url TEXT,
  photo_url TEXT,
  competition_id UUID REFERENCES competitions(id),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.4 Skema Warta, Regulasi, Dokumen, Rekrutmen & Audit

```sql
-- 11. Tabel Warta & Berita (Posts)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(250) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  summary TEXT,
  content_md TEXT NOT NULL,
  cover_image_url TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id UUID NOT NULL REFERENCES users(id),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  is_internal_only BOOLEAN NOT NULL DEFAULT FALSE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Tabel Sejarah (History Events)
CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  month INT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Tabel Regulasi & AD/ART Organisasi (Rules)
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'AD_ART', 'TATA_TERTIB', 'SANKSI'
  version VARCHAR(20) NOT NULL,   -- 'v1.0', 'v1.1'
  effective_date DATE NOT NULL,
  summary TEXT,
  document_url TEXT NOT NULL,
  is_public_summary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Tabel Repositori Dokumen Internal
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'NOTULEN', 'PROPOSAL', 'LPJ', 'TEMPLATE'
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  access_role user_role[] DEFAULT '{MEMBER}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Tabel Pendaftar Calon Anggota (Applications)
CREATE TYPE application_status AS ENUM ('NEW', 'IN_REVIEW', 'INTERVIEW', 'ACCEPTED', 'REJECTED');

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_whatsapp VARCHAR(30) NOT NULL,
  university VARCHAR(100) NOT NULL,
  major VARCHAR(100) NOT NULL,
  generation VARCHAR(20) NOT NULL,
  skills_interest TEXT NOT NULL,
  motivation TEXT NOT NULL,
  portfolio_links TEXT,
  status application_status NOT NULL DEFAULT 'NEW',
  internal_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Tabel Audit Trail Sistem (Anti-Tamper Logs)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(50) NOT NULL,
  target_id UUID,
  previous_state JSONB,
  new_state JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Pengaturan Sistem (Settings)
CREATE TABLE settings (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Arsitektur Backend Go & Pola Desain (Clean Architecture)

Backend Go menerapkan arsitektur berlapis (*layered architecture*) yang bersih, modular, dan teruji:

```
[ HTTP Requests ]
       │
       ▼
[ Middleware Layer ] ──> CORS, Rate Limiter, Logger, JWT Auth Guard, RBAC Check
       │
       ▼
[ Handler Layer ]    ──> Parse JSON DTO, validasi input, serialize response
       │
       ▼
[ Service Layer ]    ──> Aturan bisnis inti: Maker-Checker, Void transaction, Invite token
       │
       ▼
[ Repository Layer ] ──> sqlc generated type-safe database queries via pgxpool
       │
       ▼
[ PostgreSQL (Supabase) ]
```

### 4.1 Logika Bisnis Maker-Checker di Go Service Layer
```go
// internal/service/finance_service.go
func (s *FinanceService) VerifyTransaction(ctx context.Context, verifierID uuid.UUID, txID uuid.UUID) error {
    tx, err := s.repo.GetTransactionByID(ctx, txID)
    if err != nil {
        return err
    }
    
    // Maker-Checker Invariant: Pembuat dilarang memverifikasi transaksinya sendiri
    if tx.MakerID == verifierID {
        return errors.New("maker-checker violation: pembuat dilarang memverifikasi transaksinya sendiri")
    }
    
    if tx.Status != model.StatusDraftPending {
        return errors.New("hanya transaksi DRAFT_PENDING yang dapat diverifikasi")
    }

    return s.repo.ExecTx(ctx, func(q *repository.Queries) error {
        if err := q.UpdateTransactionStatus(ctx, repository.UpdateStatusParams{
            ID:         txID,
            Status:     model.StatusVerified,
            VerifierID: &verifierID,
            VerifiedAt: time.Now(),
        }); err != nil {
            return err
        }
        
        // Catat ke Audit Log
        return q.InsertAuditLog(ctx, repository.AuditLogParams{
            UserID:      verifierID,
            Action:      "VERIFY_TRANSACTION",
            TargetTable: "finance_transactions",
            TargetID:    txID,
        })
    })
}
```

---

## 5. Alur Autentikasi & Otorisasi (Go JWT + httpOnly Cookie)

1. **Penerbitan Sesi**:
   - Pengguna mengirim email dan kata sandi ke `POST /api/v1/auth/login`.
   - Go handler mencocokkan hash kata sandi via `bcrypt.CompareHashAndPassword`.
   - Jika valid dan akun aktif (`is_active == true`), Go menerbitkan sepasang token:
     - `access_token` (JWT berumur pendek, misal 15 menit, berisi `user_id`, `role`, `email`).
     - `refresh_token` (UUID unik berumur 7 hari, tersimpan aman di database).
   - Token disuntikkan ke respon klien melalui cookie HTTP yang aman:
     `Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict; Path=/`

2. **Middleware RBAC di Go**:
   - Middleware `RequireAuth` mengekstrak JWT dari cookie, memverifikasi tanda tangan digital HS256/RS256, dan menyuntikkan user context ke `r.Context()`.
   - Middleware `RequireRole(roles ...user_role)` memblokir request dengan status `403 Forbidden` apabila role pengguna tidak memiliki izin akses pada rute tersebut.

---

## 6. Endpoints REST API Utama (`/api/v1`)

| Method | Endpoint | Akses Minimum | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Publik | Otentikasi email/password & set cookie sesi |
| `POST` | `/api/v1/auth/logout` | Terotentikasi | Hapus cookie sesi & revoke token |
| `GET` | `/api/v1/auth/me` | Terotentikasi | Ambil profil anggota yang sedang login |
| `POST` | `/api/v1/auth/register-invite` | Publik (Token) | Daftarkan password via token undangan |
| `GET` | `/api/v1/public/stats` | Publik | Statistik agregat beranda publik |
| `GET` | `/api/v1/public/members` | Publik | Direktori 35 anggota (`show_in_public = true`) |
| `GET` | `/api/v1/public/projects` | Publik | Katalog proyek publik |
| `POST` | `/api/v1/public/apply` | Publik | Submit formulir pendaftaran rekrutmen |
| `GET` | `/api/v1/portal/dashboard` | `MEMBER` | Ringkasan dashboard personal anggota |
| `GET` | `/api/v1/finance/summary` | `MEMBER` | Saldo bersih, tren arus kas bulanan |
| `GET` | `/api/v1/finance/transactions` | `MEMBER` | Riwayat mutasi kas lengkap + tautan bukti nota |
| `POST` | `/api/v1/finance/transactions` | `BENDAHARA_I` | Input draft transaksi mutasi kas (Maker) |
| `POST` | `/api/v1/finance/transactions/{id}/verify`| `BENDAHARA_II`| Verifikasi dan sahkan transaksi (Checker) |
| `POST` | `/api/v1/finance/transactions/{id}/void` | `SUPER_ADMIN` | Batalkan transaksi kas dengan alasan |
| `GET` | `/api/v1/finance/dues` | `MEMBER` | Cek iuran pribadi (Bendahara dapat melihat semua) |
| `POST` | `/api/v1/admin/invites` | `SUPER_ADMIN` | Buat token undangan anggota baru |
| `GET` | `/api/v1/admin/audit-logs` | `SUPER_ADMIN` | Lihat riwayat aktivitas audit sistem |
